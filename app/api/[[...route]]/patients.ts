// authors.ts
import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {insertPatientSchema, patient} from "@/db/schema";
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import {createId} from "@paralleldrive/cuid2";
import {and, eq} from "drizzle-orm";

//part of RPC is to create a schema for the validation that is used in the post request
const schema = z.object({
    firstName: z.string(),
})

//all of the routes are chained to the main Hono app
const app = new Hono()

// all the '/' routes are relative to the base path of this file which is /api/patients
    .get(
        '/',
        async (c) => {
            // the get request will return all the patients in the database
        const data = await db
            .select({
                id: patient.id,
                firstName: patient.firstName
            })
            .from(patient)

            return c.json({ data })
})
    // get the patient by id
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

            //data that is returned is the id and first name of the patient from the patient table
            const [data] = await db
                .select({
                    id: patient.id,
                    firstName: patient.firstName
                })
                .from(patient)
                .where(
                    and(
                        eq(patient.id, id)
                    )
                )

            if (!data) {
                return c.json({ error: "Patient not found" }, 404)
            }

            return c.json({data})

        })
    .post(
        '/',
        // validate with zod what type of data is being passed in the post request
        zValidator(
            'json',
            // only allow the first name to be passed in the post request for client to see
            insertPatientSchema.pick({
                firstName: true
            })
        ),
        async (c) => {
            const values = c.req.valid('json')

            // insert patient values using spread which only allows picked values
            const [data] = await db.insert(patient).values({
                id: createId(),
                ...values
            }).returning()
            return c.json({ data })
    })
    //individual patient can be updated by id
    .patch(
        '/:id',
        // validate the id that is being passed in the patch request
        zValidator('param', z.object({
            id: z.string()
        })),
        // this route makes sure that the first name is the only value that can be updated
        zValidator("json", insertPatientSchema.pick({
            firstName: true
        })),
        async (c) => {
            const { id } = c.req.valid('param')
            const values = c.req.valid('json')

            if (!id) {
                return c.json({ error: "Invalid id" }, 400)
            }

            //update the patient values according to drizzle update method. sets the new values and check if the patient id matches the id in the database
            const [data] = await db
                .update(patient)
                .set(values)
                .where(
                    and(
                        eq(patient.id, id)
                )
            ).returning()

            if (!data) {
                return c.json({ error: "Patient not found" }, 404)
            }
            return c.json({ data })
        }
    )

export default app