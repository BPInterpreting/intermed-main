
import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {
    insertInterpreterSchema, 
    interpreter, 
    interpreterRates,          
    insertInterpreterRateSchema
} from "@/db/schema";
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import {createId} from "@paralleldrive/cuid2";
import {and, eq, isNull, desc} from "drizzle-orm";
import {clerkMiddleware, getAuth} from "@hono/clerk-auth";
import {clerkClient} from '@clerk/nextjs/server'


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
                    address: interpreter.address,
                    latitude: interpreter.latitude,
                    longitude: interpreter.longitude,
                    email: interpreter.email,
                    phoneNumber: interpreter.phoneNumber,
                    isCertified: interpreter.isCertified,
                    clerkUserId: interpreter.clerkUserId,
                    createdAt: interpreter.createdAt
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
                    address: interpreter.address,
                    latitude: interpreter.latitude,
                    longitude: interpreter.longitude,
                    email: interpreter.email,
                    phoneNumber: interpreter.phoneNumber,
                    isCertified: interpreter.isCertified,
                    clerkUserId: interpreter.clerkUserId,
                    createdAt: interpreter.createdAt
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
    // this is specificially save the push token in the backend when the user signs in.
    .patch(
        '/me/push-token',
        clerkMiddleware(),
        zValidator('json', z.object({
            token: z.string(),
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid('json');

            if (!auth?.userId) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            console.log(`[API /me/push-token] Updating push token for userId: ${auth.userId}`);

            try {
                //sets the push token to the interpreter makes sure the clerk and auth match up
                const [updatedInterpreter] = await db
                    .update(interpreter)
                    .set({
                        expoPushToken: values.token,
                    })
                    .where(eq(interpreter.clerkUserId, auth.userId))
                    .returning({
                        id: interpreter.id,
                        expoPushToken: interpreter.expoPushToken
                    });

                if (!updatedInterpreter) {
                    console.log(`[API /me/push-token] No interpreter found for userId: ${auth.userId}`);
                    return c.json({ error: 'Interpreter profile not found.' }, 404);
                }

                console.log(`[API /me/push-token] Successfully updated push token for user: ${auth.userId}`);
                return c.json({
                    success: true,
                    data: updatedInterpreter
                });

            } catch (error) {
                console.error('[API /me/push-token] Error updating push token:', error);
                return c.json({ error: 'Failed to update push token' }, 500);
            }
        }
    )
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
                    address: interpreter.address,
                    latitude: interpreter.latitude,
                    longitude: interpreter.longitude,
                    phoneNumber: interpreter.phoneNumber,
                    isCertified: interpreter.isCertified,
                    clerkUserId: interpreter.clerkUserId,
                    createdAt: interpreter.createdAt
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
                address: true,
                latitude: true,
                longitude: true,
                phoneNumber: true,
                isCertified: true,
                // targetLanguages: true,
                // isCertified: true,
                // specialty: true,
                // coverageArea: true
            }).extend({
                latitude: z.number().optional(),
                longitude: z.number().optional(),
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

            const dbValues = {
                ...values,
                latitude: values.latitude?.toString(),
                longitude: values.longitude?.toString(),
            }

            // insert patient values using spread which only allows picked values
            const [data] = await db.insert(interpreter).values({
                id: createId(),
                clerkUserId: auth.userId,
                ...dbValues
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
            address: true,
            latitude: true,
            longitude: true,
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
            const userId = auth?.userId
            const client = await clerkClient()

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (!id) {
                return c.json({ error: "Invalid id" }, 400)
            }

            if (!userId) {
                return c.json({ error: "Unauthorized - User ID missing" }, 401);
            }

            try {
                await client.users.deleteUser(id)
            } catch (error) {
                console.log(error)
            }


            //delete the facility values according to drizzle update method.check if the facility id matches the id in the database
            const [data] = await db
                .delete(interpreter)
                .where(
                    and(
                        eq(interpreter.id, id)
                    )
                ).returning()


            return c.json({ data })
        }
    )

    // ========================================================================
    // GET CURRENT RATE FOR INTERPRETER
    // ========================================================================
    .get(
        '/:id/rates',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        async (c) => {
            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as { role: string })?.role
            const { id } = c.req.valid('param')

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            // Admins can see any interpreter's rate
            // Interpreters can only see their own
            if (userRole !== 'admin') {
                const [currentInterpreter] = await db
                    .select({ id: interpreter.id })
                    .from(interpreter)
                    .where(eq(interpreter.clerkUserId, auth.userId))
                    .limit(1)

                if (!currentInterpreter || currentInterpreter.id !== id) {
                    return c.json({ error: "Unauthorized" }, 403)
                }
            }

            // Get current rate (where endDate is null)
            const [currentRate] = await db
                .select()
                .from(interpreterRates)
                .where(
                    and(
                        eq(interpreterRates.interpreterId, id),
                        isNull(interpreterRates.endDate)
                    )
                )
                .limit(1)

            if (!currentRate) {
                return c.json({ 
                    data: null,
                    message: "No rate configured for this interpreter" 
                })
            }

            return c.json({ data: currentRate })
        }
    )

    // ========================================================================
    // GET RATE HISTORY FOR INTERPRETER
    // ========================================================================
    .get(
        '/:id/rates/history',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        async (c) => {
            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as { role: string })?.role
            const { id } = c.req.valid('param')

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (userRole !== 'admin') {
                return c.json({ error: "Admin access required" }, 403)
            }

            // Get all rates ordered by effective date (newest first)
            const data = await db
                .select()
                .from(interpreterRates)
                .where(eq(interpreterRates.interpreterId, id))
                .orderBy(desc(interpreterRates.effectiveDate))

            return c.json({ data })
        }
    )

    // ========================================================================
    // CREATE NEW RATE FOR INTERPRETER
    // ========================================================================
    .post(
        '/:id/rates',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        zValidator(
            'json',
            insertInterpreterRateSchema.omit({
                id: true,
                interpreterId: true,
                endDate: true,  // New rates don't have an end date
                createdAt: true,
                updatedAt: true,
            })
        ),
        async (c) => {
            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as { role: string })?.role
            const { id } = c.req.valid('param')
            const values = c.req.valid('json')

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (userRole !== 'admin') {
                return c.json({ error: "Admin access required" }, 403)
            }

            // Check if interpreter exists
            const [existingInterpreter] = await db
                .select({ id: interpreter.id })
                .from(interpreter)
                .where(eq(interpreter.id, id))
                .limit(1)

            if (!existingInterpreter) {
                return c.json({ error: "Interpreter not found" }, 404)
            }

            // Use a transaction to close old rate and create new one
            const result = await db.transaction(async (tx) => {
                // Close any existing current rate (set endDate to day before new effectiveDate)
                const [oldRate] = await tx
                    .select()
                    .from(interpreterRates)
                    .where(
                        and(
                            eq(interpreterRates.interpreterId, id),
                            isNull(interpreterRates.endDate)
                        )
                    )
                    .limit(1)

                if (oldRate) {
                    // Set end date to the day before the new rate starts
                    const endDate = new Date(values.effectiveDate)
                    endDate.setDate(endDate.getDate() - 1)

                    await tx
                        .update(interpreterRates)
                        .set({ endDate: endDate })
                        .where(eq(interpreterRates.id, oldRate.id))

                    console.log(`[Interpreters] Closed old rate ${oldRate.id} with end date ${endDate.toISOString()}`)
                }

                // Create new rate
                const [newRate] = await tx
                    .insert(interpreterRates)
                    .values({
                        id: createId(),
                        interpreterId: id,
                        ...values,
                    })
                    .returning()

                return newRate
            })

            console.log(`[Interpreters] Created new rate for interpreter ${id}: $${values.hourlyRate}/hr`)

            return c.json({ data: result })
        }
    )




export default app