// authors.ts
import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {insertInterpreterSchema, interpreter, patient} from "@/db/schema";
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import {createId} from "@paralleldrive/cuid2";
import {and, eq} from "drizzle-orm";
import {clerkMiddleware, getAuth} from "@hono/clerk-auth";

//part of RPC is to create a schema for the validation that is used in the post request
const schema = z.object({
    firstName: z.string(),
})

//all  routes are chained to the main Hono app
const app = new Hono()

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
                    id: interpreter.id,
                    firstName: interpreter.firstName,
                    lastName: interpreter.lastName,
                    email: interpreter.email,
                    phoneNumber: interpreter.phoneNumber,
                    isCertified: interpreter.isCertified,
                    clerkUserId: interpreter.clerkUserId,
                    // targetLanguages: interpreter.targetLanguages,
                    // isCertified: interpreter.isCertified,
                    // specialty: interpreter.specialty,
                    // coverageArea: interpreter.coverageArea,
                })
                .from(interpreter)


            return c.json({ data })
        })
    .get(
    '/me', // No /:id here
    clerkMiddleware(),
    // REMOVED: zValidator for ':id' parameter
    async (c) => {
        const auth = getAuth(c);
        const userId = auth?.userId; // Get userId from authentication

        // REMOVED: Code extracting 'id' from params
        // REMOVED: Check for '!id'

        if (!userId) {
            return c.json({ error: "Unauthorized - User ID missing" }, 401);
        }

        console.log(`[API /me] Attempting fetch for userId: ${userId}`);
        const [data] = await db
            .select({
                id: interpreter.id,
                firstName: interpreter.firstName,
                lastName: interpreter.lastName,
                email: interpreter.email,
                phoneNumber: interpreter.phoneNumber,
                isCertified: interpreter.isCertified,
                clerkUserId: interpreter.clerkUserId,
            })
            .from(interpreter)
            // --- CORRECTED where clause ---
            .where(
                // Only filter based on the authenticated user's Clerk ID
                eq(interpreter.clerkUserId, userId)
            )
            // ----------------------------
            .limit(1);

        console.log(`[API /me] Data found in DB for ${userId}:`, JSON.stringify(data));

        if (!data) {
            console.log(`[API /me] No interpreter found for ${userId}, returning 404`);
            // Return the specific error the frontend hook was expecting on failure
            // return c.json({ error: 'Interpreter profile not found' }, 404);
            // OR return empty data with 200? Let's stick to 404 for now.
            return c.json({ error: "Interpreter profile not found" }, 404);
        }

        console.log(`[API /me] Interpreter found for ${userId}, returning 200 with data:`, JSON.stringify(data));
        // Keep the return structure your /:id uses, as requested
        return c.json({ data });
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
                    id: interpreter.id,
                    firstName: interpreter.firstName,
                    lastName: interpreter.lastName,
                    email: interpreter.email,
                    phoneNumber: interpreter.phoneNumber,
                    isCertified: interpreter.isCertified,
                    clerkUserId: interpreter.clerkUserId,
                    // targetLanguages: interpreter.targetLanguages,
                    // isCertified: interpreter.isCertified,
                    // specialty: interpreter.specialty,
                    // coverageArea: interpreter.coverageArea,
                })
                .from(interpreter)
                .where(
                    and(
                        eq(interpreter.id, id)
                    )
                )

            if (!data) {
                return c.json({ error: "Interpreter not found" }, 404)
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
            insertInterpreterSchema.pick({
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                isCertified: true,
                // targetLanguages: true,
                // isCertified: true,
                // specialty: true,
                // coverageArea: true
            })
        ),
        async (c) => {
            console.log("incoming request body", c.req.json())
            const values = c.req.valid('json')
            console.log("validated values", values)
            const auth = getAuth(c)

            if (!auth?.userId) {
                console.error("Unauthorized access attempt");
                return c.json({ error: "Unauthorized" }, 401)
            }

            // insert patient values using spread which only allows picked values
            const [data] = await db.insert(interpreter).values({
                id: createId(),
                clerkUserId: auth.userId,
                ...values
            }).returning()
            console.log("Inserted data:", data);
            if (!data) {
                console.error("Error inserting data into database:", data);
                return c.json({ error: "Interpreter not found" }, 404)
            }
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
        zValidator("json", insertInterpreterSchema.pick({
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            isCertified: true
            // targetLanguages: true,
            // isCertified: true,
            // specialty: true,
            // coverageArea: true
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
                .update(interpreter)
                .set(values)
                .where(
                    and(
                        eq(interpreter.id, id)
                    )
                ).returning()


            if (!data) {
                console.error("Error inserting data into database:", data);
                return c.json({ error: "Interpreter not found" }, 404)
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
                .delete(interpreter)
                .where(
                    and(
                        eq(interpreter.id, id)
                    )
                ).returning()

            if (!data) {
                return c.json({ error: "Patient not found" }, 404)
            }
            return c.json({ data })
        }
    )

export default app