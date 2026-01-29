import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import { 
    payers, 
    payerLanguageRates, 
    insertPayerSchema, 
    insertPayerLanguageRateSchema 
} from "@/db/schema"
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { createId } from "@paralleldrive/cuid2"
import { and, eq, asc } from "drizzle-orm"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"

const app = new Hono()

    // ========================================================================
    // GET ALL PAYERS
    // ========================================================================
    .get(
        '/',
        clerkMiddleware(),
        zValidator('query', z.object({
            activeOnly: z.string().optional(), // "true" or "false"
        })),
        async (c) => {
            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as { role: string })?.role

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (userRole !== 'admin') {
                return c.json({ error: "Admin access required" }, 403)
            }

            const { activeOnly } = c.req.valid('query')

            const whereClause = activeOnly === 'true' 
                ? eq(payers.isActive, true) 
                : undefined

            const data = await db
                .select({
                    id: payers.id,
                    name: payers.name,
                    type: payers.type,
                    defaultHourlyRate: payers.defaultHourlyRate,
                    defaultMileageRate: payers.defaultMileageRate,
                    minimumHours: payers.minimumHours,
                    lateCancelFee: payers.lateCancelFee,
                    noShowFee: payers.noShowFee,
                    paymentTermsDays: payers.paymentTermsDays,
                    billingCode: payers.billingCode,
                    isActive: payers.isActive,
                    createdAt: payers.createdAt,
                })
                .from(payers)
                .where(whereClause)
                .orderBy(asc(payers.name))

            return c.json({ data })
        }
    )

    // ========================================================================
    // GET SINGLE PAYER WITH LANGUAGE RATES
    // ========================================================================
    .get(
        '/:id',
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

            // Get payer
            const [payer] = await db
                .select()
                .from(payers)
                .where(eq(payers.id, id))
                .limit(1)

            if (!payer) {
                return c.json({ error: "Payer not found" }, 404)
            }

            // Get language rates for this payer
            const languageRates = await db
                .select()
                .from(payerLanguageRates)
                .where(eq(payerLanguageRates.payerId, id))
                .orderBy(asc(payerLanguageRates.language))

            return c.json({ 
                data: {
                    ...payer,
                    languageRates
                }
            })
        }
    )

    // ========================================================================
    // CREATE PAYER
    // ========================================================================
    .post(
        '/',
        clerkMiddleware(),
        zValidator(
            'json',
            insertPayerSchema.omit({
                id: true,
                createdAt: true,
                updatedAt: true,
            })
        ),
        async (c) => {
            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as { role: string })?.role
            const values = c.req.valid('json')

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (userRole !== 'admin') {
                return c.json({ error: "Admin access required" }, 403)
            }

            const [data] = await db
                .insert(payers)
                .values({
                    id: createId(),
                    ...values,
                })
                .returning()

            console.log(`[Payers] Created payer: ${data.name} (${data.id})`)

            return c.json({ data })
        }
    )

    // ========================================================================
    // UPDATE PAYER
    // ========================================================================
    .patch(
        '/:id',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        zValidator(
            'json',
            insertPayerSchema.omit({
                id: true,
                createdAt: true,
                updatedAt: true,
            }).partial() // All fields optional for update
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

            const [data] = await db
                .update(payers)
                .set(values)
                .where(eq(payers.id, id))
                .returning()

            if (!data) {
                return c.json({ error: "Payer not found" }, 404)
            }

            console.log(`[Payers] Updated payer: ${data.name} (${data.id})`)

            return c.json({ data })
        }
    )

    // ========================================================================
    // DELETE PAYER (Soft Delete)
    // ========================================================================
    .delete(
        '/:id',
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

            // Soft delete - just set isActive to false
            const [data] = await db
                .update(payers)
                .set({ isActive: false })
                .where(eq(payers.id, id))
                .returning()

            if (!data) {
                return c.json({ error: "Payer not found" }, 404)
            }

            console.log(`[Payers] Soft deleted payer: ${data.name} (${data.id})`)

            return c.json({ data })
        }
    )

    // ========================================================================
    // GET LANGUAGE RATES FOR PAYER
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

            if (userRole !== 'admin') {
                return c.json({ error: "Admin access required" }, 403)
            }

            const data = await db
                .select()
                .from(payerLanguageRates)
                .where(eq(payerLanguageRates.payerId, id))
                .orderBy(asc(payerLanguageRates.language))

            return c.json({ data })
        }
    )

    // ========================================================================
    // CREATE LANGUAGE RATE FOR PAYER
    // ========================================================================
    .post(
        '/:id/rates',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        zValidator(
            'json',
            insertPayerLanguageRateSchema.omit({
                id: true,
                payerId: true, // We get this from the URL param
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

            // Check if payer exists
            const [payer] = await db
                .select({ id: payers.id })
                .from(payers)
                .where(eq(payers.id, id))
                .limit(1)

            if (!payer) {
                return c.json({ error: "Payer not found" }, 404)
            }

            // Check if language rate already exists for this payer
            const [existingRate] = await db
                .select()
                .from(payerLanguageRates)
                .where(
                    and(
                        eq(payerLanguageRates.payerId, id),
                        eq(payerLanguageRates.language, values.language)
                    )
                )
                .limit(1)

            if (existingRate) {
                return c.json({ error: `Rate for ${values.language} already exists for this payer` }, 409)
            }

            const [data] = await db
                .insert(payerLanguageRates)
                .values({
                    id: createId(),
                    payerId: id,
                    ...values,
                })
                .returning()

            console.log(`[Payers] Added ${values.language} rate for payer ${id}`)

            return c.json({ data })
        }
    )

    // ========================================================================
    // UPDATE LANGUAGE RATE
    // ========================================================================
    .patch(
        '/:id/rates/:rateId',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string(),
            rateId: z.string()
        })),
        zValidator(
            'json',
            insertPayerLanguageRateSchema.omit({
                id: true,
                payerId: true,
                createdAt: true,
                updatedAt: true,
            }).partial()
        ),
        async (c) => {
            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as { role: string })?.role
            const { id, rateId } = c.req.valid('param')
            const values = c.req.valid('json')

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (userRole !== 'admin') {
                return c.json({ error: "Admin access required" }, 403)
            }

            const [data] = await db
                .update(payerLanguageRates)
                .set(values)
                .where(
                    and(
                        eq(payerLanguageRates.id, rateId),
                        eq(payerLanguageRates.payerId, id)
                    )
                )
                .returning()

            if (!data) {
                return c.json({ error: "Language rate not found" }, 404)
            }

            console.log(`[Payers] Updated ${data.language} rate for payer ${id}`)

            return c.json({ data })
        }
    )

    // ========================================================================
    // DELETE LANGUAGE RATE
    // ========================================================================
    .delete(
        '/:id/rates/:rateId',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string(),
            rateId: z.string()
        })),
        async (c) => {
            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as { role: string })?.role
            const { id, rateId } = c.req.valid('param')

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (userRole !== 'admin') {
                return c.json({ error: "Admin access required" }, 403)
            }

            const [data] = await db
                .delete(payerLanguageRates)
                .where(
                    and(
                        eq(payerLanguageRates.id, rateId),
                        eq(payerLanguageRates.payerId, id)
                    )
                )
                .returning()

            if (!data) {
                return c.json({ error: "Language rate not found" }, 404)
            }

            console.log(`[Payers] Deleted ${data.language} rate for payer ${id}`)

            return c.json({ data })
        }
    )

export default app