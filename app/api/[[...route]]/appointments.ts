import {Hono} from 'hono'
import {db} from '@/db/drizzle'
import {appointmentOffers, appointments, facilities, insertAppointmentSchema, interpreter, patient} from "@/db/schema";
import {z} from 'zod'
import {zValidator} from '@hono/zod-validator'
import {createId} from "@paralleldrive/cuid2";
import {and, asc, desc, eq, inArray, isNotNull, isNull, sql} from "drizzle-orm";
import {clerkMiddleware, getAuth} from "@hono/clerk-auth";
import {toast} from "sonner";
import { publishAdminNotification } from '@/lib/ably';
import interpreters from "@/app/api/[[...route]]/interpreters";
import {createAdminNotification} from "@/app/api/[[...route]]/notifications";

//Haversine formula used to calculate the distance between interpreter and the facility location
//all interpreters within the distance of the appointment location get a notification.

// uses radius of the earth
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959 //earth radius
    //conversion of degrees to radians
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    //havsersine formula application
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) + //latitude
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * //adjustment for position on earth
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) //calculate angular distance
    return R * c //converts to miles
}

async function expandOfferRadius(appointmentId: string, expandedByUserId?: string){
    try {
        //get the appointment data, facility and interpreter from the data base
        const [appointment] = await db
            .select({
                id: appointments.id,
                date: appointments.date,
                startTime: appointments.startTime,
                appointmentType: appointments.appointmentType,
                isRushAppointment: appointments.isRushAppointment,
                facilityId: appointments.facilityId,
                searchRadius: appointments.searchRadius,
                interpreterId: appointments.interpreterId
            })
            .from(appointments)
            .where(eq(appointments.id, appointmentId))
            .limit(1)

        if (!appointment) {
            throw new Error("No appointments found.")
        }

        if (appointment.searchRadius >= 50) {
            console.log(`[Appointments] Radius already expanded to ${appointment.searchRadius}`);
            return { success: false, message: 'Radius already expanded' };
        }

        // Check if already assigned
        if (appointment.interpreterId) {
            console.log(`[Appointments] Appointment already assigned`);
            return { success: false, message: 'Appointment already assigned' };  // Fixed: removed toast
        }

        const [facility] = await db
            .select()
            .from(facilities)
            .where(eq(facilities.id, appointment.facilityId!))
            .limit(1)

        if (!facility) {
            throw new Error('Facility not found');
        }

        const interpreters = await db
            .select()
            .from(interpreter)
            .where(
                and(
                    isNotNull(interpreter.latitude),
                    isNotNull(interpreter.longitude),
                    isNotNull(interpreter.expoPushToken)
                )
            )

        //finds interpreters in the expanded range
        const newOfferRecords = [];
        const newInterpretersToNotify = [];

        for (const interp of interpreters) {
            const distance = calculateDistance(
                parseFloat(facility.latitude),
                parseFloat(facility.longitude),
                parseFloat(interp.latitude!),
                parseFloat(interp.longitude!)
            );

            if (distance > 30 && distance <= 50){
                const offerRecord = {
                    id: createId(),
                    appointmentId: appointment.id,
                    interpreterId: interp.id,
                    distanceMiles: distance.toString(),
                    hasFacilityHistory: false
                }

                newOfferRecords.push(offerRecord)
                newInterpretersToNotify.push({
                    ...interp,
                    distance: distance,
                })
            }

        }

        //updates the appointment radius to the new expanded radius
        await db.update(appointments)
            .set({
                searchRadius: 50,
                radiusExpandedAt: new Date(),
                radiusExpandedBy: expandedByUserId || null
            })
            .where(eq(appointments.id, appointmentId))

        if (newOfferRecords.length > 0) {
            await db.insert(appointmentOffers).values(newOfferRecords)

            const { sendOfferNotification } =await import('@/lib/notification-service')
            await sendOfferNotification(appointment, newInterpretersToNotify)

            console.log(`[Appointments] Expanded radius to 50 miles, notified ${newOfferRecords.length} new interpreters`);
        }

        return {
            success: true,
            newInterpretersToNotify: newOfferRecords.length,
        }

        } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`[Appointments] Error expanding radius:`, error)
            toast.error(error.message)
        }
    }
}

//all the routes are chained to the main Hono app
const app = new Hono()

// all the '/' routes are relative to the base path of this file which is /api/facility
    .get(
        '/test/:id',
        clerkMiddleware(),
        zValidator('param', z.object({ id: z.string() })),
        async (c) => {
            const { id } = c.req.valid('param');
            console.log(`[API-TEST] Successfully hit the test route with ID: ${id}`);
            return c.json({ message: `Test successful for ID: ${id}` });
        }
    )
    .get(
        '/',
        clerkMiddleware(),
        zValidator('query', z.object({
            endTime: z.string().optional().nullable(),
            patientId: z.string().optional(),
            interpreterId: z.string().optional()
        })),
        async (c) => {
            const auth = getAuth(c)
            const userId = auth?.userId
            const userRole = (auth?.sessionClaims?.metadata as {role: string})?.role

            const { patientId, interpreterId } = c.req.valid('query')

            if (!userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            if (!userRole) {
                return c.json({ error: "No role found" }, 403);
            }

            //the base condition is that the user is an admin or the interpreter id matches the user id. admin is given permission to see all appointments
            const baseConditions = userRole === 'admin' ? and() : eq(interpreter.clerkUserId, userId);
            // if the patientId is present, filter by it. this is used for querying appointments by patient
            const patientCondition = patientId ? eq(appointments.patientId, patientId) : and();

            const interpreterCondition = interpreterId ? eq(appointments.interpreterId, interpreterId) : and()

            // Combine conditions - this will always be a valid SQL object
            const finalWhereClause = and(baseConditions, patientCondition, interpreterCondition);

            let data = await db
            .select({
                id: appointments.id,
                bookingId: appointments.bookingId,
                date: appointments.date,
                notes: appointments.notes,
                startTime: appointments.startTime,
                endTime: appointments.endTime,
                projectedEndTime: appointments.projectedEndTime,
                duration: appointments.duration,
                projectedDuration: appointments.projectedDuration,
                appointmentType: appointments.appointmentType,
                status: appointments.status,
                isCertified: appointments.isCertified,
                facility: facilities.name,
                facilityAddress: facilities.address,
                facilityLongitude: facilities.longitude,
                facilityLatitude: facilities.latitude,
                facilityId: appointments.facilityId,
                patient: patient.firstName,
                patientLastName: patient.lastName,
                patientId: appointments.patientId,
                interpreterId: appointments.interpreterId,
                interpreterFirstName: interpreter.firstName,
                interpreterLastName: interpreter.lastName,
                createdAt: appointments.createdAt,
                updatedAt: appointments.updatedAt,
                // interpreterSpecialty: interpreter.specialty,
                // interpreterCoverageArea: interpreter.coverageArea,
                // interpreterTargetLanguages: interpreter.targetLanguages
            })
            .from(appointments)
            .innerJoin(patient, eq(appointments.patientId, patient.id))
            .innerJoin(facilities, eq(appointments.facilityId, facilities.id))
            .innerJoin(interpreter, eq(appointments.interpreterId, interpreter.id))
            .where(finalWhereClause)
            .orderBy(
                asc(appointments.date),
                asc(appointments.startTime)
            )

            // console.log("Fetched Appointments Data:", data); // Log full data for debugging
            // console.log("Number of Appointments Fetched:", data.length);

            return c.json({ data })
})
    //this get route is for interpreters to see the offers sent to them
    .get(
        '/offers/available',
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            //gets the interpreter
            const [currentInterpreter] = await db
                .select()
                .from(interpreter)
                .where(eq(interpreter.clerkUserId, auth.userId))
                .limit(1)

            if (!currentInterpreter) {
                return c.json({ error: "Interpreter not found" }, 404)
            }

            //gets the offers for this interpreter
            const offers = await db
                .select({
                    appointmentId: appointments.id,
                    bookingId: appointments.bookingId,
                    date: appointments.date,
                    startTime: appointments.startTime,
                    appointmentType: appointments.appointmentType,
                    isRushAppointment: appointments.isRushAppointment,
                    facilityName: facilities.name,
                    facilityAddress: facilities.address,
                    patientFirstName: patient.firstName,
                    patientLastName: patient.lastName,
                    distanceMiles: appointmentOffers.distanceMiles,
                    notifiedAt: appointmentOffers.notifiedAt,
                })
                .from(appointmentOffers)
                .innerJoin(appointments, eq(appointmentOffers.appointmentId, appointments.id))
                .innerJoin(facilities, eq(appointments.facilityId, facilities.id))
                .innerJoin(patient, eq(appointments.patientId, patient.id))
                .where(
                    and(
                        eq(appointmentOffers.interpreterId, currentInterpreter.id),
                        isNull(appointmentOffers.response),
                        isNull(appointments.interpreterId) // Still unassigned
                    )
                )
                .orderBy(
                    desc(appointments.isRushAppointment),
                    appointments.date,
                    appointments.startTime
                )

            // Viewed At: if the length of offers list for an inpterpreter is greater than 0 thus updates the appointmentOffers viewedAt attribute to the moment the user viewed the appointment
            if (offers.length > 0) {
                const offerIds = offers.map(o => o.appointmentId)

                await db.update(appointmentOffers)
                    .set({ viewedAt: new Date() })
                    .where(
                        and(
                            eq(appointmentOffers.interpreterId, currentInterpreter.id),
                            inArray(appointmentOffers.appointmentId, offerIds),
                            isNull(appointmentOffers.viewedAt) // Only update if not already viewed
                        )
                    )
            }

            return c.json({ data: offers })
        }

    )

    //this route gets the count of interpreters in the 30-mile radius. Used in the appointment form to display
    //how many will be available in the area when offer is triggered
    .get(
        '/offers/interpreter-count',
        clerkMiddleware(),
        zValidator('query', z.object({
            facilityId: z.string()
        })),
        async (c) => {
            const { facilityId } = c.req.valid('query')

            // Get facility location
            const [facility] = await db
                .select()
                .from(facilities)
                .where(eq(facilities.id, facilityId))
                .limit(1)

            if (!facility) {
                return c.json({ count: 0 })
            }

            // Get interpreters with location and push token
            const interpreters = await db
                .select()
                .from(interpreter)
                .where(
                    and(
                        isNotNull(interpreter.latitude),
                        isNotNull(interpreter.longitude),
                        isNotNull(interpreter.expoPushToken)
                    )
                )

            // Count those within 30 miles
            let count = 0
            for (const interp of interpreters) {
                console.log('Facility coords:', facility.latitude, facility.longitude)
                console.log('Interpreter coords:', interp.latitude, interp.longitude)
                const distance = calculateDistance(
                    parseFloat(facility.latitude),
                    parseFloat(facility.longitude),
                    parseFloat(interp.latitude!),
                    parseFloat(interp.longitude!)
                )

                console.log(`Distance calculated for interpreter ${interp.id}:`, distance)

                if (distance <= 30) count++
            }



            return c.json({ count })
        }
    )
    .get(
        '/offers/monitoring',
         clerkMiddleware(),
        async(c) => {

            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as {role: string})?.role

            if (userRole !== 'admin'){
                return c.json({ error: "Admin access required" }, 403)
            }

            const offers = await db
                .select({
                    appointmentId: appointments.id,
                    bookingId: appointments.bookingId,
                    date: appointments.date,
                    startTime: appointments.startTime,
                    status: appointments.status,
                    offerSentAt: appointments.offerSentAt,
                    isRushAppointment: appointments.isRushAppointment,
                    facilityName: facilities.name,
                    patientName: sql`${patient.firstName} || ' ' || ${patient.lastName}`,

                    // computes the offer status
                    offerStatus: sql<string>`
                        CASE
                            WHEN ${appointments.interpreterId} IS NOT NULL THEN 'Accepted'
                            -- this scenario is for when all interpreters decline 
                             WHEN 
                            (SELECT COUNT(*) FROM ${appointmentOffers} WHERE ${appointmentOffers.appointmentId} = ${appointments.id}) > 0 
                            AND 
                            (SELECT COUNT(*) FROM ${appointmentOffers} WHERE ${appointmentOffers.appointmentId} = ${appointments.id}) = 
                            (SELECT COUNT(*) FROM ${appointmentOffers} WHERE ${appointmentOffers.appointmentId} = ${appointments.id} AND ${appointmentOffers.response} = 'decline')
                            THEN 'All Declined'
                            
                            WHEN ${appointments.status} = 'offer_pending' THEN 'Pending'
                            WHEN ${appointments.status} = 'offer_sent' THEN 'Sent'
                            ELSE ${appointments.status}
                        END
                    `,

                //         show who accepted the appointment
                    acceptedBy: sql<string>`
                    CASE
                        WHEN ${appointments.interpreterId} IS NOT NULL
                        THEN (SELECT ${interpreter.firstName} || ' ' || ${interpreter.lastName}
                            FROM ${interpreter}
                            WHERE ${interpreter.id} = ${appointments.interpreterId})
                        ELSE NULL
                    END
                `,

                    // RESPONSE METRICS: these are all the counts of who was notified who decline and viewed
                    notifiedCount: sql`(
                        SELECT COUNT(*)
                        FROM ${appointmentOffers}
                        WHERE ${appointmentOffers.appointmentId} = ${appointments.id}
                    )`,

                    viewedCount: sql<number>`(
                                                 SELECT COUNT(*)
                                                 FROM ${appointmentOffers}
                                                 WHERE ${appointmentOffers.appointmentId} = ${appointments.id}
                                                   AND ${appointmentOffers.viewedAt} IS NOT NULL
                                             )`,
                    declinedCount: sql<number>`(
                                                   SELECT COUNT(*)
                                                   FROM ${appointmentOffers}
                                                   WHERE ${appointmentOffers.appointmentId} = ${appointments.id}
                                                     AND ${appointmentOffers.response} = 'decline'
                                               )`,
                    interpreterId: appointments.interpreterId
                })
                .from(appointments)
                .leftJoin(facilities, eq(appointments.facilityId, facilities.id))
                .leftJoin(patient, eq(appointments.patientId, patient.id))
                .where(eq(appointments.offerMode, true))
                .orderBy(desc(appointments.createdAt))

            return c.json({ data: offers })
        }
    )
    .get(
        '/offers/monitoring/:id',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string(),
        })),
        async(c) => {

            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as {role: string})?.role
            const { id } = c.req.valid('param');
            console.log(`[API] Fetching offer details for ID: ${id}`);

            if (userRole !== 'admin'){
                return c.json({ error: "Admin access required" }, 403)
            }

            const [offer] = await db
                .select({
                    appointmentId: appointments.id,
                    bookingId: appointments.bookingId,
                    date: appointments.date,
                    startTime: appointments.startTime,
                    status: appointments.status,
                    offerSentAt: appointments.offerSentAt,
                    isRushAppointment: appointments.isRushAppointment,
                    isCertified: appointments.isCertified,
                    facilityName: facilities.name,
                    facilityPhoneNumber: facilities.phoneNumber,
                    facilityAddress: facilities.address,
                    createdAt: appointments.createdAt,
                    patientName: sql`${patient.firstName} || ' ' || ${patient.lastName}`,
                    notifiedCount: sql`(SELECT COUNT(*) FROM ${appointmentOffers} WHERE ${appointmentOffers.appointmentId} = ${appointments.id})`,
                    viewedCount: sql`(SELECT COUNT(*) FROM ${appointmentOffers} WHERE ${appointmentOffers.appointmentId} = ${appointments.id} AND ${appointmentOffers.viewedAt} IS NOT NULL)`,
                    declinedCount: sql`(SELECT COUNT(*) FROM ${appointmentOffers} WHERE ${appointmentOffers.appointmentId} = ${appointments.id} AND ${appointmentOffers.response} = 'decline')`,
                    acceptedByInterpreterId: appointments.interpreterId,
                })
                .from(appointments)
                .leftJoin(facilities, eq(appointments.facilityId, facilities.id))
                .leftJoin(patient, eq(appointments.patientId, patient.id))
                .where(
                    eq(appointments.id, id)
                )
                .limit(1)

            console.log('[API] Database query result for offer:', offer);

            if (!offer) {
                return c.json({ error: "Offer not found" }, 404);
            }

            const interpreterResponses = await db
                .select({
                    interpreterId: interpreter.id,
                    firstName: interpreter.firstName,
                    lastName: interpreter.lastName,
                    response: appointmentOffers.response,
                    viewedAt: appointmentOffers.viewedAt,
                    respondedAt: appointmentOffers.respondedAt,
                    distanceMiles: appointmentOffers.distanceMiles,
                })
                .from(appointmentOffers)
                .innerJoin(interpreter, eq(appointmentOffers.interpreterId, interpreter.id))
                .where(eq(appointmentOffers.appointmentId, id))
                .orderBy(asc(interpreter.lastName));

            const data = {
                ...offer,
                interpreters: interpreterResponses,
            };

            return c.json({ data });
        }
    )
    .get(
        '/:id',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string().optional(),
        })),
        zValidator('query', z.object({
            endTime: z.string().optional().nullable(),
        })),
        async (c) => {
            const auth = getAuth(c)
            const userId = auth?.userId
            const userRole = (auth?.sessionClaims?.metadata as {role: string})?.role

            //the param is validated
            const { id } = c.req.valid('param')

            if (!id) {
                return c.json({ error: "Invalid id" }, 400)
            }

            if (!userId) {
                return c.json({error: "Unauthorized"}, 401)
            }

            if (!userRole) {
                return c.json({error: "Role not found"}, 403)
            }

            //data that is returned is the id and first name of the facility from the facility table
            const [data] = await db
                .select({
                    id: appointments.id,
                    bookingId: appointments.bookingId,
                    date: appointments.date,
                    startTime: appointments.startTime,
                    endTime: appointments.endTime,
                    projectedEndTime: appointments.projectedEndTime,
                    duration: appointments.duration,
                    projectedDuration: appointments.projectedDuration,
                    appointmentType: appointments.appointmentType,
                    notes: appointments.notes,
                    status: appointments.status,
                    isCertified: appointments.isCertified,
                    facilityId: appointments.facilityId,
                    facilityName: facilities.name,
                    facilityAddress: facilities.address,
                    patientId: appointments.patientId,
                    patientFirstName: patient.firstName,
                    patientLastName: patient.lastName,
                    interpreterId: appointments.interpreterId,
                    interpreterFirstName: interpreter.firstName,
                    interpreterLastName: interpreter.lastName,
                    createdAt: appointments.createdAt,
                    updatedAt: appointments.updatedAt,
                    // interpreterSpecialty: interpreter.specialty,
                    // interpreterCoverageArea: interpreter.coverageArea,
                    // interpreterTargetLanguages: interpreter.targetLanguages
                })
                .from(appointments)
                .innerJoin(patient, eq(appointments.patientId, patient.id))
                .innerJoin(interpreter, eq(appointments.interpreterId, interpreter.id))
                .innerJoin(facilities, eq(appointments.facilityId, facilities.id))
                .where(userRole === 'admin' ? and(eq(appointments.id, id)) : and(eq(interpreter.clerkUserId, userId), eq(appointments.id, id)))
                .orderBy(
                    asc(appointments.date),
                    asc(appointments.startTime)
                )

            if (!data) {
                return c.json({ error: "Facility not found" }, 404)
            }

            return c.json({data})

        })
    .post(
        '/',
        clerkMiddleware(),
        zValidator(
            'json',
            insertAppointmentSchema.omit({
                id: true,
                bookingId: true,
                createdAt: true,
                updatedAt: true,
            }).extend({
                interpreterId: z.string().optional().nullable(),
                offerMode: z.boolean().optional(),
                isRushAppointment: z.boolean().optional()
            })
        ),
        async (c) => {
            const values = c.req.valid('json')
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            try {
                //isOffer if no interpreter is assigned to the appointment already
                const isOffer = !values.interpreterId

                // Create the appointment
                //along with the value spread
                const [data] = await db.insert(appointments).values({
                    id: createId(),
                    ...values,
                    searchRadius: 30,
                    //value overrides to avoid client setting business rules and let backend enforce them.
                    offerMode: isOffer, // prevents front-end from deciding if appointment is an offer instead this is set by the backend based on whether a interpreterId was selected
                    status: isOffer ? 'offer_pending' : values.status || 'Pending', //offers are set to offer pending status. avoid sending confirmed to an appointment with not interpreter assigned
                    isRushAppointment: values.isRushAppointment || false //always se to false if not active to avoid undefined or null values in database
                }).returning()

                // Check if the newly created appointment has the special status
                if (data.status === 'Interpreter Requested') {
                    // We need to get the interpreter's name if an ID was provided
                    let userName = 'A user';
                    if (data.interpreterId) {
                        const [interpreterData] = await db.select({ firstName: interpreter.firstName }).from(interpreter).where(eq(interpreter.id, data.interpreterId)).limit(1);
                        if (interpreterData) {
                            userName = interpreterData.firstName;
                        }
                    }

                    const bookingId = data.bookingId;
                    const notificationMessage = `${userName} has requested a new follow up from appointment #${bookingId}`;

                    // Create the persistent notification and send the real-time toast
                    await createAdminNotification(notificationMessage, data.id);
                    await publishAdminNotification('appointment-status-changed', {
                        message: notificationMessage,
                        bookingId: bookingId,
                    });
                }

                console.log(`[Appointments] Created ${isOffer ? 'offer' : 'regular'} appointment ${data.id}`);

                // if the appointment turns out to be an offer return the following logic
                if (isOffer) {
                    //1. first is to get the facility details in question
                    if (!data.facilityId) {
                        return c.json({ error: "Cannot create offer without facility" }, 400)
                    }
                    const [facility] = await db
                        .select()
                        .from(facilities)
                        .where(eq(facilities.id, data.facilityId))
                        .limit(1)

                    if (!facility) {
                        return c.json({ error: 'Facility not found' }, 404)
                    }

                    //2. get the interpreters along with the push token and location
                    const interpreters = await db
                        .select()
                        .from(interpreter)
                        .where(
                            and(
                                isNotNull(interpreter.latitude),
                                isNotNull(interpreter.longitude),
                                isNotNull(interpreter.expoPushToken)
                            )
                        )

                    //3. calculate the distance and create offers
                    //these are empty arrays that hold records and interpreters that will be notified of the appointemnt
                    const offerRecords = []
                    const interpretersToNotify = []

                    //for loop that calculates the distance based on the haversinse formula and needs both the lat and lon of facility and interpreter
                    for (const interp of interpreters) {
                        const distance = calculateDistance(
                            parseFloat(facility.latitude),
                            parseFloat(facility.longitude),
                            parseFloat(interp. latitude!),
                            parseFloat(interp.longitude!)
                        )

                        console.log('Distance calculated:', distance);
                        console.log('Distance as string:', distance.toString());

                        //if the distance is within 40miles push into the offer record array. also push into array of interpreters to notify
                        if (distance <= 30) {
                            const offerRecord = {
                                id: createId(),
                                appointmentId: data.id,
                                interpreterId: interp.id,
                                distanceMiles: distance.toString(),
                                hasFacilityHistory: false
                            };

                            console.log('Offer record being saved:', offerRecord);
                            console.log('Distance value type:', typeof distance);
                            console.log('Distance string value:', distance.toString());

                            offerRecords.push(offerRecord);
                            interpretersToNotify.push(interp);
                        }

                    }

                    if (offerRecords.length > 0) {
                        //this inserts the array of offerRecords into the actual data table in database for tracking
                        console.log('About to insert offers:', JSON.stringify(offerRecords, null, 2));
                        await db.insert(appointmentOffers).values(offerRecords)
                        console.log('Offers inserted successfully');

                        //updates the appointment status
                        await  db.update(appointments)
                            .set({
                                status: 'offer_sent',
                                offerSentAt: new Date()
                            })
                            .where(eq(appointments.id, data.id))

                        //send the push notification
                        const { sendOfferNotification } = await import('@/lib/notification-service')
                        await sendOfferNotification(data, interpretersToNotify)

                        console.log(`[Appointments] Sent offer to ${offerRecords.length} interpreters`)
                    }

                    return c.json({
                        data,
                        offerSent: true,
                        interpretersNotified: offerRecords.length
                    })
                }

                // Send notification if interpreter is assigned
                if (data.interpreterId) {
                    console.log(`[Appointments] Sending notification to interpreter: ${data.interpreterId}`);

                    // Get appointment details with related data for notification
                    const [appointmentDetails] = await db
                        .select({
                            id: appointments.id,
                            date: appointments.date,
                            startTime: appointments.startTime,
                            appointmentType: appointments.appointmentType,
                            facilityName: facilities.name,
                            facilityAddress: facilities.address,
                            patientFirstName: patient.firstName,
                            patientLastName: patient.lastName,
                        })
                        .from(appointments)
                        .innerJoin(facilities, eq(appointments.facilityId, facilities.id))
                        .innerJoin(patient, eq(appointments.patientId, patient.id))
                        .where(eq(appointments.id, data.id))
                        .limit(1);

                    if (appointmentDetails) {
                        // Import and use notification service
                        const { sendNotificationtoInterpreter, createAppointmentNotification } = await import('@/lib/notification-service')

                        const notificationContent = createAppointmentNotification('assigned', {
                            id: appointmentDetails.id,
                            date: appointmentDetails.date,
                            startTime: appointmentDetails.startTime,
                            appointmentType: appointmentDetails.appointmentType,
                            facility: {
                                name: appointmentDetails.facilityName,
                                address: appointmentDetails.facilityAddress
                            },
                            patient: {
                                firstName: appointmentDetails.patientFirstName,
                                lastName: appointmentDetails.patientLastName
                            }
                        });

                        const notificationResult = await sendNotificationtoInterpreter(
                            data.interpreterId,
                            {
                                appointmentId: data.id,
                                type: 'appointment_assigned',
                                ...notificationContent
                            }
                        );

                        if (notificationResult.success) {
                            console.log(`[Appointments] Notification sent successfully to interpreter ${data.interpreterId}`);
                        } else {
                            console.error(`[Appointments] Failed to send notification:`, notificationResult.error);
                            // Don't fail the appointment creation if notification fails
                        }
                    } else {
                        console.error(`[Appointments] Could not fetch appointment details for notification`);
                    }
                } else {
                    console.log(`[Appointments] No interpreter assigned, skipping notification`);
                }

                return c.json({ data })

            } catch (error) {
                console.error(`[Appointments] Error creating appointment:`, error);
                return c.json({ error: "Failed to create appointment" }, 500);
            }
        }
    )
    //this is the post route for interpreters to accept offers
    .post(
        '/offers/:appointmentId/accept',
        clerkMiddleware(),
        zValidator('param', z.object({
            appointmentId: z.string()
        })),
        async (c) => {
            const { appointmentId } = c.req.valid('param')
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            // Get interpreter
            const [currentInterpreter] = await db
                .select()
                .from(interpreter)
                .where(eq(interpreter.clerkUserId, auth.userId))
                .limit(1)

            if (!currentInterpreter) {
                return c.json({ error: "Interpreter not found" }, 404)
            }

            try {
                const results = await db.transaction(async (tx) => {
                    //check if the appointment is still available by using a database transaction
                    // looks for the appointment in the database and checks if the interpreterId field is null
                    //does this transaction in one swoop
                    const [appointment] = await tx
                        .select()
                        .from(appointments)
                        .where(and(
                            eq(appointments.id, appointmentId),
                            isNull(appointments.interpreterId)
                        ))
                        .limit(1)

                    if (!appointment) {
                        throw new Error('already-taken')
                    }

                    //this transaction assigns the interpreter to the appointment
                    await tx.update(appointments)
                        .set({
                            interpreterId: currentInterpreter.id,
                            assignedAt: new Date(),
                            status: 'Pending Confirmation'
                        })
                        .where(eq(appointments.id, appointmentId))

                    //gets marked as accepted in the offers table
                    await tx.update(appointmentOffers)
                        .set({
                            response: 'accepted',
                            respondedAt: new Date()
                        })
                        .where(
                            and(
                                eq(appointmentOffers.appointmentId, appointmentId),
                                eq(appointmentOffers.interpreterId, currentInterpreter.id)
                            )
                        )

                    return appointment
                })

                //TODO: notify other interpreters the appointment is taken
                return c.json({
                    success: true,
                    message: "Appointment accepted successfully",
                })
            } catch (error) {
                console.error('[Offers] Accept error details:', error);
                //TODO: Check and see if this is okay
                if (error instanceof Error && error.message === 'already-taken') {

                    return c.json({
                        success: false,
                        error: "This appointment is already taken"
                    }, 409)
                }
                return c.json({ error: "Failed to accept offer" }, 500)
            }
        }
    )
    .post(
        '/offers/:appointmentId/expand',
        clerkMiddleware(),
        zValidator('param', z.object({
            appointmentId: z.string()
        })),
        async (c)=> {
            const { appointmentId } = c.req.valid('param')
            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as {role: string})?.role

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            try {
                const result = await expandOfferRadius(appointmentId, auth.userId)
                return  c.json(result)
            } catch (error) {
                console.error('[Offers] Manual expansion error:', error);
                return c.json({
                    success: false,
                    error: "Failed to expand radius"
                }, 500);

            }
        }
    )
    .post(
        '/offers/:appointmentId/decline',
        clerkMiddleware(),
        zValidator('param', z.object({
            appointmentId: z.string()
        })),
        async (c) => {
            const { appointmentId } = c.req.valid('param')
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: 'Unauthorized' }, 401)
            }

            //get the interpreter based on the clerk id
            const [currentInterpreter] = await db
                .select()
                .from(interpreter)
                .where(eq(interpreter.clerkUserId, auth.userId))
                .limit(1)

            if (!currentInterpreter) {
                return c.json({ error: "Interpreter not found" }, 404)
            }

            //this updates the offer record for when the interpreter declines the appointment.
            await db.update(appointmentOffers)
                .set({
                    response: 'decline',
                    respondedAt: new Date()
                })
                .where(
                    and(
                        eq(appointmentOffers.appointmentId, appointmentId),
                        eq(appointmentOffers.interpreterId, currentInterpreter.id)
                    )
                )

            console.log(`[Appointments] Interpreter ${currentInterpreter.id} declined appointment ${appointmentId}`)

            // TODO: Check if all notified interpreters have declined
            // If so, you might want to notify admin or expand the radius

            const [stats] = await db
                .select({
                    totalNotified: sql<number>`COUNT(*)`,
                    totalDeclined: sql<number>`COUNT(CASE WHEN response = 'decline' THEN 1 END)`,
                    searchRadius: appointments.searchRadius,
                    interpreterId: appointments.interpreterId
                })
                .from(appointmentOffers)
                .innerJoin(appointments, eq(appointmentOffers.appointmentId, appointments.id))
                .where(eq(appointmentOffers.appointmentId, appointmentId));

            if (stats && stats.totalNotified > 0 && stats.totalNotified === stats.totalDeclined){
                if (stats.searchRadius < 50 && !stats.interpreterId){
                    console.log(`[Appointments] All interpreters declined, auto-expanding radius`)
                    try {
                        await expandOfferRadius(appointmentId);
                    } catch (error) {
                        console.error(`[Appointments] Auto-expansion failed:`, error);
                    }

                }
            }

            return c.json({
                success: true,
                message: 'Offer declined'
            })
        }
    )
    //individual facility can be updated by id
    // UPDATED PATCH ROUTE - handles interpreter reassignment
    .patch(
        '/:id',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        zValidator("json", insertAppointmentSchema.omit({
            id: true,
            duration: true,
            bookingId: true,
            createdAt: true,
            updatedAt: true,
        })),
        async (c) => {
            const { id } = c.req.valid('param')
            const values = c.req.valid('json')
            const auth = getAuth(c)

            if (!id) {
                return c.json({ error: "Invalid id" }, 400)
            }

            try {
                // Get the BEFORE state of appointment for comparison
                const [beforeUpdate] = await db
                    .select({
                        id: appointments.id,
                        bookingId: appointments.bookingId,
                        date: appointments.date,
                        startTime: appointments.startTime,
                        status: appointments.status,
                        interpreterId: appointments.interpreterId,
                        appointmentType: appointments.appointmentType,
                        facilityName: facilities.name,
                        facilityAddress: facilities.address,
                        patientFirstName: patient.firstName,
                        patientLastName: patient.lastName,
                        interpreterFirstName: interpreter.firstName,
                        interpreterLastName: interpreter.lastName
                    })
                    .from(appointments)
                    .leftJoin(interpreter, eq(appointments.interpreterId, interpreter.id))
                    .innerJoin(facilities, eq(appointments.facilityId, facilities.id))
                    .innerJoin(patient, eq(appointments.patientId, patient.id))
                    .where(eq(appointments.id, id))
                    .limit(1);

                if (!beforeUpdate) {
                    return c.json({ error: "Appointment not found" }, 404)
                }

                const appointmentsToUpdate = db.$with("appointments_to_update").as(
                    db.select({ id: appointments.id }).from(appointments)
                        .innerJoin(patient, eq(appointments.patientId, patient.id))
                        .where(and(eq(appointments.id, id)))
                )

                // Update the appointment
                const [data] = await db
                    .with(appointmentsToUpdate)
                    .update(appointments)
                    .set(values)
                    .where(
                        inArray(appointments.id, sql`(select id from ${appointmentsToUpdate})`)
                    )
                    .returning()

                if (!data) {
                    return c.json({ error: "Appointment not found" }, 404)
                }

                const statusesToIgnore = [
                    'Pending Confirmation',
                    'No Show',
                    'Late CX',
                    'Pending Authorization'
                ]


                //checks if that status changed
                if (values.status && values.status !== beforeUpdate.status && !statusesToIgnore.includes(values.status)) {
                    const { publishAdminNotification } = await import('@/lib/ably');

                    //readable messages for the toast notification
                    const userName = beforeUpdate.interpreterFirstName
                    const bookingId = beforeUpdate.bookingId
                    const newStatus = values.status
                    let notificationMessage = ''

                    switch (newStatus) {
                        case "Confirmed":
                            notificationMessage = `${userName} confirmed appointment #${bookingId}`
                            break
                        case "Closed":
                            notificationMessage = `Appointment #${bookingId} with ${userName} has been closed`
                            break
                        case "Interpreter Requested":
                            notificationMessage = `${userName} has requested a new follow up from appointment #${bookingId}`
                    }

                    await createAdminNotification(notificationMessage, data.id)

                    // Publish status change notification
                    await publishAdminNotification('appointment-status-changed', {
                        message: notificationMessage,
                        appointmentId: data.id,
                        bookingId: data.bookingId,
                        previousStatus: beforeUpdate.status,
                        newStatus: values.status,
                        // Add interpreter name if assigned
                        interpreterName: data.interpreterId ?
                            `${beforeUpdate.interpreterFirstName} ${beforeUpdate.interpreterLastName}` :
                            null
                    });

                    console.log(`[Appointments] Status changed from ${beforeUpdate.status} to ${values.status}`);
                }

                console.log(`[Appointments] Updated appointment ${data.id}`);

                // Interpreter was REMOVED (reassigned to someone else or unassigned)
                if (beforeUpdate.interpreterId &&
                    values.interpreterId !== undefined &&
                    values.interpreterId !== beforeUpdate.interpreterId) {

                    console.log(`[Appointments] Interpreter changed from ${beforeUpdate.interpreterId} to ${values.interpreterId}`);
                    console.log(`[Appointments] Sending removal notification to previous interpreter: ${beforeUpdate.interpreterId}`);

                    // Send "removed" notification to the OLD interpreter
                    const { sendNotificationtoInterpreter, createAppointmentNotification } = await import('@/lib/notification-service')

                    const removalNotificationContent = createAppointmentNotification('removed', {
                        id: beforeUpdate.id,
                        date: beforeUpdate.date,
                        startTime: beforeUpdate.startTime,
                        appointmentType: beforeUpdate.appointmentType,
                        facility: {
                            name: beforeUpdate.facilityName,
                            address: beforeUpdate.facilityAddress
                        },
                        patient: {
                            firstName: beforeUpdate.patientFirstName,
                            lastName: beforeUpdate.patientLastName
                        }
                    });

                    const removalResult = await sendNotificationtoInterpreter(
                        beforeUpdate.interpreterId,
                        {
                            appointmentId: data.id,
                            type: 'appointment_removed',
                            ...removalNotificationContent
                        }
                    );

                    if (removalResult.success) {
                        console.log(`[Appointments] Removal notification sent to previous interpreter ${beforeUpdate.interpreterId}`);
                    } else {
                        console.error(`[Appointments] Failed to send removal notification:`, removalResult.error);
                    }

                    // If there's a NEW interpreter, send them an assignment notification
                    if (values.interpreterId) {
                        console.log(`[Appointments] Sending assignment notification to new interpreter: ${values.interpreterId}`);

                        // Get updated appointment details for new interpreter
                        const [updatedAppointmentDetails] = await db
                            .select({
                                id: appointments.id,
                                date: appointments.date,
                                startTime: appointments.startTime,
                                appointmentType: appointments.appointmentType,
                                facilityName: facilities.name,
                                facilityAddress: facilities.address,
                                patientFirstName: patient.firstName,
                                patientLastName: patient.lastName,
                            })
                            .from(appointments)
                            .innerJoin(facilities, eq(appointments.facilityId, facilities.id))
                            .innerJoin(patient, eq(appointments.patientId, patient.id))
                            .where(eq(appointments.id, data.id))
                            .limit(1);

                        if (updatedAppointmentDetails) {
                            const assignmentNotificationContent = createAppointmentNotification('assigned', {
                                id: updatedAppointmentDetails.id,
                                date: updatedAppointmentDetails.date,
                                startTime: updatedAppointmentDetails.startTime,
                                appointmentType: updatedAppointmentDetails.appointmentType,
                                facility: {
                                    name: updatedAppointmentDetails.facilityName,
                                    address: updatedAppointmentDetails.facilityAddress
                                },
                                patient: {
                                    firstName: updatedAppointmentDetails.patientFirstName,
                                    lastName: updatedAppointmentDetails.patientLastName
                                }
                            });

                            const assignmentResult = await sendNotificationtoInterpreter(
                                values.interpreterId,
                                {
                                    appointmentId: data.id,
                                    type: 'appointment_assigned',
                                    ...assignmentNotificationContent
                                }
                            );

                            if (assignmentResult.success) {
                                console.log(`[Appointments] Assignment notification sent to new interpreter ${values.interpreterId}`);
                            } else {
                                console.error(`[Appointments] Failed to send assignment notification:`, assignmentResult.error);
                            }
                        }
                    }
                }
                // Regular update notifications (time/date changes for same interpreter)
                else if (data.interpreterId && data.interpreterId === beforeUpdate.interpreterId) {
                    const importantFieldsChanged = (
                        (values.date && values.date !== beforeUpdate.date) ||
                        (values.startTime && values.startTime !== beforeUpdate.startTime)
                    );

                    if (importantFieldsChanged) {
                        console.log(`[Appointments] Important fields changed, sending update notification to interpreter: ${data.interpreterId}`);

                        const [updatedAppointmentDetails] = await db
                            .select({
                                id: appointments.id,
                                date: appointments.date,
                                startTime: appointments.startTime,
                                appointmentType: appointments.appointmentType,
                                facilityName: facilities.name,
                                facilityAddress: facilities.address,
                                patientFirstName: patient.firstName,
                                patientLastName: patient.lastName,
                            })
                            .from(appointments)
                            .innerJoin(facilities, eq(appointments.facilityId, facilities.id))
                            .innerJoin(patient, eq(appointments.patientId, patient.id))
                            .where(eq(appointments.id, data.id))
                            .limit(1);

                        if (updatedAppointmentDetails) {
                            const { sendNotificationtoInterpreter, createAppointmentNotification } = await import('@/lib/notification-service')

                            const notificationContent = createAppointmentNotification('updated', {
                                id: updatedAppointmentDetails.id,
                                date: updatedAppointmentDetails.date,
                                startTime: updatedAppointmentDetails.startTime,
                                appointmentType: updatedAppointmentDetails.appointmentType,
                                facility: {
                                    name: updatedAppointmentDetails.facilityName,
                                    address: updatedAppointmentDetails.facilityAddress
                                },
                                patient: {
                                    firstName: updatedAppointmentDetails.patientFirstName,
                                    lastName: updatedAppointmentDetails.patientLastName
                                }
                            });

                            const notificationResult = await sendNotificationtoInterpreter(
                                data.interpreterId,
                                {
                                    appointmentId: data.id,
                                    type: 'appointment_updated',
                                    ...notificationContent
                                }
                            );

                            if (notificationResult.success) {
                                console.log(`[Appointments] Update notification sent successfully to interpreter ${data.interpreterId}`);
                            } else {
                                console.error(`[Appointments] Failed to send update notification:`, notificationResult.error);
                            }
                        }
                    }
                }

                return c.json({ data })

            } catch (error) {
                console.error(`[Appointments] Error updating appointment:`, error);
                return c.json({ error: "Failed to update appointment" }, 500);
            }
        }
    )
    .delete(
        '/:id',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        async (c) => {
            const { id } = c.req.valid('param')

            if (!id) {
                return c.json({ error: "Invalid id" }, 400)
            }

            try {
                // Get appointment details BEFORE deletion for notification
                const [appointmentToDelete] = await db
                    .select({
                        id: appointments.id,
                        date: appointments.date,
                        startTime: appointments.startTime,
                        interpreterId: appointments.interpreterId,
                        appointmentType: appointments.appointmentType,
                        facilityName: facilities.name,
                        facilityAddress: facilities.address,
                        patientFirstName: patient.firstName,
                        patientLastName: patient.lastName,
                    })
                    .from(appointments)
                    .innerJoin(facilities, eq(appointments.facilityId, facilities.id))
                    .innerJoin(patient, eq(appointments.patientId, patient.id))
                    .where(eq(appointments.id, id))
                    .limit(1);

                if (!appointmentToDelete) {
                    return c.json({ error: "Appointment not found" }, 404)
                }

                const appointmentsToDelete = db.$with("appointments_to_delete").as(
                    db.select({ id: appointments.id }).from(appointments)
                        .innerJoin(patient, eq(appointments.patientId, patient.id))
                        .where(and(eq(appointments.id, id)))
                )

                // Delete the appointment
                const [data] = await db
                    .with(appointmentsToDelete)
                    .delete(appointments)
                    .where(
                        inArray(appointments.id, sql`(select id from ${appointmentsToDelete})`)
                    )
                    .returning()

                if (!data) {
                    return c.json({ error: "Appointment not found" }, 404)
                }

                console.log(`[Appointments] Deleted appointment ${data.id}`);

                //Send "removed" notification to interpreter if one was assigned
                if (appointmentToDelete.interpreterId) {
                    console.log(`[Appointments] Sending deletion notification to interpreter: ${appointmentToDelete.interpreterId}`);

                    const { sendNotificationtoInterpreter, createAppointmentNotification } = await import('@/lib/notification-service')

                    const deletionNotificationContent = createAppointmentNotification('removed', {
                        id: appointmentToDelete.id,
                        date: appointmentToDelete.date,
                        startTime: appointmentToDelete.startTime,
                        appointmentType: appointmentToDelete.appointmentType,
                        facility: {
                            name: appointmentToDelete.facilityName,
                            address: appointmentToDelete.facilityAddress
                        },
                        patient: {
                            firstName: appointmentToDelete.patientFirstName,
                            lastName: appointmentToDelete.patientLastName
                        }
                    });

                    const deletionResult = await sendNotificationtoInterpreter(
                        appointmentToDelete.interpreterId,
                        {
                            appointmentId: appointmentToDelete.id,
                            type: 'appointment_removed',
                            ...deletionNotificationContent
                        }
                    );

                    if (deletionResult.success) {
                        console.log(`[Appointments] Deletion notification sent successfully to interpreter ${appointmentToDelete.interpreterId}`);
                    } else {
                        console.error(`[Appointments] Failed to send deletion notification:`, deletionResult.error);
                    }
                } else {
                    console.log(`[Appointments] No interpreter assigned, skipping deletion notification`);
                }

                return c.json({ data })

            } catch (error) {
                console.error(`[Appointments] Error deleting appointment:`, error);
                return c.json({ error: "Failed to delete appointment" }, 500);
            }
        }
    )

export default app