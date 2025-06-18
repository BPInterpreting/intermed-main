import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {facilities, appointments, patient, insertAppointmentSchema, interpreter} from "@/db/schema";
import {undefined, z} from 'zod'
import { zValidator } from '@hono/zod-validator'
import {createId} from "@paralleldrive/cuid2";
import {and, asc, desc, eq, gte, inArray, lte, SQL, sql} from "drizzle-orm";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import interpreters from "@/app/api/[[...route]]/interpreters";
import {text} from "drizzle-orm/pg-core";

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
                desc(appointments.date),
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
                    desc(appointments.date),
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
        // validate with zod what type of data is being passed in the post request
        zValidator(
            'json',
            // only allow the first name to be passed in the post request for client to see
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

            // insert facility values using spread which only allows picked values
            const [data] = await db.insert(appointments).values({
                id: createId(),
                ...values
            }).returning()
            return c.json({ data })

    })

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
            bookingId: true
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