import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {appointments, interpreter, insertPatientSchema, patient} from "@/db/schema";
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import {createId} from "@paralleldrive/cuid2";
import {and, desc, eq, ilike, like, or, sql} from "drizzle-orm";
import {parseTemplate} from "sucrase/dist/types/parser/traverser/expression";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";


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
            const userId = auth?.userId
            const userRole = (auth?.sessionClaims?.metadata as {role: string})?.role
            const { q } = c.req.valid('query')

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (!userRole) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const searchTerm = `%${ q }%`

            let query

            // --- Conditional Query Construction based on Role ---
            if (userRole === 'admin') {
                // --- Admin Query ---
                // Select specified fields directly from the patient table
                // where the name matches the search term.
                console.log(`[API /patients/search] Admin search for: ${q}`);
                query = db
                    .select({
                        id: patient.id,
                        firstName: patient.firstName,
                        lastName: patient.lastName,
                        email: patient.email,
                        phoneNumber: patient.phoneNumber
                    })
                    .from(patient)
                    .where(
                        or(
                            ilike(patient.firstName, searchTerm),
                            ilike(patient.lastName, searchTerm)
                        )
                    )
                    .limit(20); // Optional: limit results

            } else {
                // --- Interpreter Query ---
                // Requires userId for filtering
                if (!userId) {
                    // This check is slightly redundant due to the top-level check,
                    // but confirms intent if logic changes later.
                    console.error("[API /patients/search] Interpreter role missing userId");
                    return c.json({ error: "Interpreter user ID missing" }, 401);
                }
                // Select distinct patient fields by joining through appointments
                // to the interpreter table, filtering by both interpreter's clerkUserId
                // and the patient name search term.
                console.log(`[API /patients/search] Interpreter (${userId}) search for: ${q}`);
                query = db
                    .selectDistinct({ // Use selectDistinct on patient fields
                        id: patient.id,
                        firstName: patient.firstName,
                        lastName: patient.lastName,
                        email: patient.email,
                        phoneNumber: patient.phoneNumber
                    })
                    .from(patient)
                    .innerJoin(appointments, eq(patient.id, appointments.patientId))
                    .innerJoin(interpreter, eq(appointments.interpreterId, interpreter.id))
                    .where(
                        and(
                            // Condition 1: Match the logged-in interpreter
                            eq(interpreter.clerkUserId, userId),
                            // Condition 2: Match the name search term
                            or(
                                ilike(patient.firstName, searchTerm),
                                ilike(patient.lastName, searchTerm)
                            )
                        )
                    )
                    .limit(20); // Optional: limit results
            }
            // --- End Conditional Query Construction ---

            // --- Execute Query and Return ---
            try {
                const data = await query;
                console.log(`[API /patients/search] Found ${data.length} results for query "${q}" for role "${userRole}".`);
                return c.json({ data });
            } catch (error) {
                console.error(`[API /patients/search] Database error for query "${q}" for role "${userRole}":`, error);
                return c.json({ error: "Failed to search patients due to database error" }, 500);
            }
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
                patientId: patient.patientId,
                firstName: patient.firstName,
                lastName: patient.lastName,
                email: patient.email,
                phoneNumber: patient.phoneNumber,
                insuranceCarrier: patient.insuranceCarrier,
                preferredLanguage: patient.preferredLanguage,
                claimNumber: patient.claimNumber,
                dateOfBirth: patient.dateOfBirth
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
                    patientId: patient.patientId,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    email: patient.email,
                    phoneNumber: patient.phoneNumber,
                    preferredLanguage: patient.preferredLanguage,
                    insuranceCarrier: patient.insuranceCarrier,
                    claimNumber:patient.claimNumber,
                    dateOfBirth: patient.dateOfBirth
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
            insertPatientSchema.omit({
                id: true,
                patientId: true,
                createdAt: true,
                updatedAt: true,
            }).extend({
                // Override dateOfBirth to handle string → Date conversion
                dateOfBirth: z.coerce.date().optional()
            })
        ),
        async (c) => {
            const values = c.req.valid('json')
            const auth = getAuth(c)
            console.log('Validated values:', JSON.stringify(values, null, 2));

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const currentYear = new Date().getFullYear()
            const lastPatient = await db.select({patientId: patient.patientId})
                .from(patient)
                .where(like(patient.patientId, `PAT-${currentYear}-%`))
                .orderBy(desc(patient.patientId))
                .limit(1);
            let nextNumber = 1;
            if (lastPatient.length > 0 && lastPatient[0].patientId) {
                const parts = lastPatient[0].patientId.split('-');
                if (parts.length === 3) {
                    nextNumber = parseInt(parts[2]) + 1;
                }
            }

            const patientId = `PAT-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;


            // insert patient values using spread which only allows picked values
            const [data] = await db.insert(patient).values({
                id: createId(),
                patientId,
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
        zValidator("json", insertPatientSchema.omit({
            id: true,
            patientId: true,
            createdAt: true,
            updatedAt: true,
            }).extend({
                dateOfBirth: z.coerce.date().optional()
            })
        ),
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