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