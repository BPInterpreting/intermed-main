// authors.ts
import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import { facilities, appointments, patient, insertAppointmentSchema} from "@/db/schema";
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import {createId} from "@paralleldrive/cuid2";
import {and, desc, eq, gte, inArray, lte, sql} from "drizzle-orm";
import {subDays, parse} from "date-fns";


//all the routes are chained to the main Hono app
const app = new Hono()

// all the '/' routes are relative to the base path of this file which is /api/facility
    .get(
        '/',
        // validate the query that is being passed in the get request
        zValidator('query', z.object({
            // //allows for filtering by date range from to
            from: z.string().optional(),
            to: z.string().optional(),
            patientId: z.string().optional() //allows for filtering by patient id
        })),
        async (c) => {
            const {from, to, patientId } = c.req.valid('query')

            const defaultTo = new Date()
            //TODO: the default date is set to 30 days before the current date change it so it shows all appointments including future
            const defaultFrom = subDays(defaultTo, 0)
            const startDate = from ? parse(from, 'yyyy-MM-dd', new Date()) : defaultFrom
            const endDate = to ? parse(to, 'yyyy-MM-dd', new Date()) : defaultTo

            // the get request will return all the facility in the database
        const data = await db
            .select({
                id: appointments.id,
                date: appointments.date,
                notes: appointments.notes,
                startTime: appointments.startTime,
                endTime: appointments.endTime,
                appointmentType: appointments.appointmentType,
                facility: facilities.name,
                facilityId: appointments.facilityId,
                patient: patient.firstName,
                patientId: appointments.patientId,
            })
            .from(appointments)
            .innerJoin(patient, eq(appointments.patientId, patient.id))
            .innerJoin(facilities, eq(appointments.facilityId, facilities.id))
            .where(
                and(
                    //makes sure patientId matches up the the patientId from the appointments table or else it is undefined
                    patientId ? eq(appointments.patientId, patientId) : undefined,
                    // gte(appointments.date, startDate),
                    // lte(appointments.date, endDate)
                )
            )
            .orderBy(desc(appointments.date))

            return c.json({ data })
})
    // get the facility by id
    .get(
        '/:id',
        zValidator('param', z.object({
            id: z.string().optional()
        })),
        async (c) => {

            //the param is validated
            const { id } = c.req.valid('param')

            if (!id) {
                return c.json({ error: "Invalid id" }, 400)
            }

            //data that is returned is the id and first name of the facility from the facility table
            const [data] = await db
                .select({
                    id: appointments.id,
                    date: appointments.date,
                    startTime: appointments.startTime,
                    endTime: appointments.endTime,
                    appointmentType: appointments.appointmentType,
                    notes: appointments.notes,
                    facilityId: appointments.facilityId,
                    patientId: appointments.patientId,
                })
                .from(appointments)
                .innerJoin(patient, eq(appointments.patientId, patient.id))
                .where(
                    and(
                        eq(appointments.id, id)
                    )
                )

            if (!data) {
                return c.json({ error: "Facility not found" }, 404)
            }

            return c.json({data})

        })
    .post(
        '/',
        // validate with zod what type of data is being passed in the post request
        zValidator(
            'json',
            // only allow the first name to be passed in the post request for client to see
            insertAppointmentSchema.omit({
                id: true
            })
        ),
        async (c) => {
            const values = c.req.valid('json')

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
        // validate the id that is being passed in the patch request
        zValidator('param', z.object({
            id: z.string()
        })),
        // this route makes sure that the first name is the only value that can be updated
        zValidator("json", insertAppointmentSchema.omit({
            id: true
        })),
        async (c) => {
            const { id } = c.req.valid('param')
            const values = c.req.valid('json')

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