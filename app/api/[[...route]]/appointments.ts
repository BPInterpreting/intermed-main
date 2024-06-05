// authors.ts
import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {insertFacilitySchema, facilities, appointments, patient} from "@/db/schema";
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import {createId} from "@paralleldrive/cuid2";
import {and, desc, eq, gte, lte} from "drizzle-orm";
import {subDays, parse} from "date-fns";

//part of RPC is to create a schema for the validation that is used in the post request
const schema = z.object({
    name: z.string(),
})

//all of the routes are chained to the main Hono app
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
            const defaultFrom = subDays(defaultTo, 30)

            const startDate = from ? parse(from, 'yyyy-MM-dd', new Date()) : defaultFrom
            const endDate = to ? parse(to, 'yyyy-MM-dd', new Date()) : defaultTo

            // the get request will return all the facility in the database
        const data = await db
            .select({
                id: appointments.id,
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
                    gte(appointments.date, startDate),
                    lte(appointments.date, endDate)
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
                    id: facilities.id,
                    name: facilities.name
                })
                .from(facilities)
                .where(
                    and(
                        eq(facilities.id, id)
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
            insertFacilitySchema.pick({
                name: true
            })
        ),
        async (c) => {
            const values = c.req.valid('json')

            // insert facility values using spread which only allows picked values
            const [data] = await db.insert(facilities).values({
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
        zValidator("json", insertFacilitySchema.pick({
            name: true
        })),
        async (c) => {
            const { id } = c.req.valid('param')
            const values = c.req.valid('json')

            if (!id) {
                return c.json({ error: "Invalid id" }, 400)
            }

            //update the facility values according to drizzle update method. sets the new values and check if the facility id matches the id in the database
            const [data] = await db
                .update(facilities)
                .set(values)
                .where(
                    and(
                        eq(facilities.id, id)
                )
            ).returning()

            if (!data) {
                return c.json({ error: "Facility not found" }, 404)
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

            //delete the facility values according to drizzle update method.check if the facility id matches the id in the database
            const [data] = await db
                .delete(facilities)
                .where(
                    and(
                        eq(facilities.id, id)
                    )
                ).returning()

            if (!data) {
                return c.json({ error: "Facility not found" }, 404)
            }
            return c.json({ data })
        }
    )

export default app