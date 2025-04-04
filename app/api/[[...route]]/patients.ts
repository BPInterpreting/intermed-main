// authors.ts
import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {facilities, insertPatientSchema, patient} from "@/db/schema";
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import {createId} from "@paralleldrive/cuid2";
import {and, eq, ilike, or, sql} from "drizzle-orm";
import {parseTemplate} from "sucrase/dist/types/parser/traverser/expression";
import {clerkMiddleware, getAuth} from "@hono/clerk-auth";

//part of RPC is to create a schema for the validation that is used in the post request
const schema = z.object({
    firstName: z.string(),
})

//all of the routes are chained to the main Hono app
const app = new Hono()

    .get(
        '/search',
        clerkMiddleware(),
        zValidator('query', z.object({
            q: z.string().min(1, "Search query cannot be empty")
        })),
        async(c) => {
            const auth  = getAuth(c)
            const { q } = c.req.valid('query')

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const searchTerm = `%${ q }%`

            const data = await db
                .select({
                    id: patient.id,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                })
                .from(patient)
                .where(
                    or(
                        ilike(patient.firstName, searchTerm),
                        ilike(patient.lastName, searchTerm)
                    )
                )
            return c.json({ data })
        }
    )
// all the '/' routes are relative to the base path of this file which is /api/patients
    .get(
        '/',
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }
            // the get request will return all the patients in the database
        const data = await db
            .select({
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                email: patient.email,
                phoneNumber: patient.phoneNumber,
                insuranceCarrier: patient.insuranceCarrier,
                preferredLanguage: patient.preferredLanguage
            })
            .from(patient)

            return c.json({ data })
})
    // get the patient by id
    .get(
        '/:id',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string().optional()
        })),
        async (c) => {
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            //the param is validated
            const { id } = c.req.valid('param')

            if (!id) {
                return c.json({ error: "Invalid id" }, 400)
            }

            //data that is returned is the id and first name of the patient from the patient table
            const [data] = await db
                .select({
                    id: patient.id,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    email: patient.email,
                    phoneNumber: patient.phoneNumber,
                    preferredLanguage: patient.preferredLanguage,
                    insuranceCarrier: patient.insuranceCarrier
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
        clerkMiddleware(),
        // validate with zod what type of data is being passed in the post request
        zValidator(
            'json',
            // only allow the first name to be passed in the post request for client to see
            insertPatientSchema.pick({
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                insuranceCarrier: true,
                preferredLanguage: true
            })
        ),
        async (c) => {
            const values = c.req.valid('json')
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

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
        clerkMiddleware(),
        // validate the id that is being passed in the patch request
        zValidator('param', z.object({
            id: z.string()
        })),
        // this route makes sure that the first name is the only value that can be updated
        zValidator("json", insertPatientSchema.pick({
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            insuranceCarrier: true,
            preferredLanguage: true
        })),
        async (c) => {
            const { id } = c.req.valid('param')
            const values = c.req.valid('json')
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

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
    .delete(
        '/:id',
        clerkMiddleware(),
        // validate the id that is being passed in the delete request
        zValidator('param', z.object({
            id: z.string()
        })),
        async (c) => {
            const { id } = c.req.valid('param')
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (!id) {
                return c.json({ error: "Invalid id" }, 400)
            }

            //delete the facility values according to drizzle update method.check if the facility id matches the id in the database
            const [data] = await db
                .delete(patient)
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