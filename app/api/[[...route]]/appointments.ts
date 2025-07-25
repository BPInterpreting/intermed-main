import {Hono} from 'hono'
import {db} from '@/db/drizzle'
import {appointments, facilities, insertAppointmentSchema, interpreter, patient} from "@/db/schema";
import {z} from 'zod'
import {zValidator} from '@hono/zod-validator'
import {createId} from "@paralleldrive/cuid2";
import {and, asc, eq, inArray, sql} from "drizzle-orm";
import {clerkMiddleware, getAuth} from "@hono/clerk-auth";

//all the routes are chained to the main Hono app
const app = new Hono()

// all the '/' routes are relative to the base path of this file which is /api/facility
    .get(
        '/',
        clerkMiddleware(),
        zValidator('query', z.object({
            endTime: z.string().optional().nullable(),
            patientId: z.string().optional(),
        })),
        async (c) => {
            const auth = getAuth(c)
            const userId = auth?.userId
            const userRole = (auth?.sessionClaims?.metadata as {role: string})?.role

            const { patientId } = c.req.valid('query')

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

            // Combine conditions - this will always be a valid SQL object
            const finalWhereClause = and(baseConditions, patientCondition);

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

            console.log("Fetched Appointments Data:", data); // Log full data for debugging
            console.log("Number of Appointments Fetched:", data.length);

            return c.json({ data })
})
    // get the facility by id
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
            })
        ),
        async (c) => {
            const values = c.req.valid('json')
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            try {
                // Create the appointment
                const [data] = await db.insert(appointments).values({
                    id: createId(),
                    ...values
                }).returning()

                console.log(`[Appointments] Created appointment ${data.id}`);

                // ✨ Send notification if interpreter is assigned
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

    //individual facility can be updated by id
    .patch(
        '/:id',
        clerkMiddleware(),
        // validate the id that is being passed in the patch request
        zValidator('param', z.object({
            id: z.string()
        })),
        // this route makes sure that the first name is the only value that can be updated
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

            //helper function that selects the id from the appointments table and joins it with the patient table
            //simplifies complex queries since appointment does not belong to the patient
            const appointmentsToUpdate = db.$with("appointments_to_update").as(
                db.select({ id: appointments.id }).from(appointments)
                    .innerJoin(patient, eq(appointments.patientId, patient.id))
                    .where(and(eq(appointments.id, id)))
            )

            //
            const [data] = await db
                .with(appointmentsToUpdate)
                .update(appointments)
                .set(values)
                .where(
                    //finds individual appointment id and matches it with the id in the database
                    inArray(appointments.id, sql`(select id from ${appointmentsToUpdate})`)
                )
                .returning()

            if (!data) {
                return c.json({ error: "Appointment not found" }, 404)
            }
            return c.json({ data })
        }
    )
    .delete(
        '/:id',
        // validate the id that is being passed in the delete request
        zValidator('param', z.object({
            id: z.string()
        })),
        async (c) => {
            const { id } = c.req.valid('param')

            if (!id) {
                return c.json({ error: "Invalid id" }, 400)
            }


            const appointmentsToDelete = db.$with("appointments_to_delete").as(
                db.select({ id: appointments.id }).from(appointments)
                    .innerJoin(patient, eq(appointments.patientId, patient.id))
                    .where(and(
                        eq(appointments.id, id), //matching transaction id passed from id param above
                    ))
            )

            //delete the facility values according to drizzle update method.check if the facility id matches the id in the database
            const [data] = await db
                .with(appointmentsToDelete)
                .delete(appointments)
                .where(
                    //finds individual appointment id and matches it with the id in the database
                    inArray(appointments.id, sql`(select id from ${appointmentsToDelete})`)
                )
                .returning()

            if (!data) {
                return c.json({ error: "Appointment not found" }, 404)
            }
            return c.json({ data })
        }
    )

export default app