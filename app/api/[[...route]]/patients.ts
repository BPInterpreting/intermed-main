// authors.ts
import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {insertPatientSchema, patient} from "@/db/schema";
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import {createId} from "@paralleldrive/cuid2";

//part of RPC is to create a schema for the validation that is used in the post request
const schema = z.object({
    firstName: z.string(),
})


//all of the routes are chained to the main Hono app
const app = new Hono()

// all the '/' routes are relative to the base path of this file which is /api/patients
    .get('/', async (c) => {
    // the get request will return all the patients in the database
    const data = await db
        .select({
            id: patient.id,
            firstName: patient.firstName
        })
        .from(patient)

        return c.json({ data })
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


export default app