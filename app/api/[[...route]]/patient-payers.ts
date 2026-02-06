// ==========================================================================
// NEW FILE: /app/api/[[...route]]/patient-payers.ts
// ==========================================================================
// Then add to your route.ts:
//   import patientPayers from "@/app/api/[[...route]]/patient-payers"
//   .route('/patient-payers', patientPayers)
// ==========================================================================

import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {
    patientPayers,
    payers,
    patient,
} from "@/db/schema"
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { createId } from "@paralleldrive/cuid2"
import { and, eq, desc, isNull, asc } from "drizzle-orm"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"

const app = new Hono()

    // ========================================================================
    // GET PAYER ASSIGNMENTS FOR A PATIENT (with history)
    // ========================================================================
    .get(
        '/patient/:patientId',
        clerkMiddleware(),
        zValidator('param', z.object({
            patientId: z.string()
        })),
        async (c) => {
            const auth = getAuth(c)
            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const { patientId } = c.req.valid('param')

            const data = await db
                .select({
                    id: patientPayers.id,
                    patientId: patientPayers.patientId,
                    payerId: patientPayers.payerId,
                    payerName: payers.name,
                    payerType: payers.type,
                    claimNumber: patientPayers.claimNumber,
                    isPrimary: patientPayers.isPrimary,
                    isActive: patientPayers.isActive,
                    effectiveDate: patientPayers.effectiveDate,
                    endDate: patientPayers.endDate,
                    notes: patientPayers.notes,
                    createdAt: patientPayers.createdAt,
                })
                .from(patientPayers)
                .leftJoin(payers, eq(patientPayers.payerId, payers.id))
                .where(eq(patientPayers.patientId, patientId))
                .orderBy(desc(patientPayers.effectiveDate))

            return c.json({ data })
        }
    )

    // ========================================================================
    // GET CURRENT ACTIVE PAYER(S) FOR A PATIENT
    // Used by appointment form to auto-populate
    // ========================================================================
    .get(
        '/patient/:patientId/active',
        clerkMiddleware(),
        zValidator('param', z.object({
            patientId: z.string()
        })),
        async (c) => {
            const auth = getAuth(c)
            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const { patientId } = c.req.valid('param')

            const data = await db
                .select({
                    id: patientPayers.id,
                    payerId: patientPayers.payerId,
                    payerName: payers.name,
                    payerType: payers.type,
                    claimNumber: patientPayers.claimNumber,
                    isPrimary: patientPayers.isPrimary,
                    effectiveDate: patientPayers.effectiveDate,
                })
                .from(patientPayers)
                .leftJoin(payers, eq(patientPayers.payerId, payers.id))
                .where(
                    and(
                        eq(patientPayers.patientId, patientId),
                        eq(patientPayers.isActive, true)
                    )
                )
                .orderBy(desc(patientPayers.isPrimary), asc(patientPayers.effectiveDate))

            return c.json({ data })
        }
    )

    // ========================================================================
    // ASSIGN A PAYER TO A PATIENT
    // If setting as primary, deactivates previous primary payer (with end date)
    // ========================================================================
    .post(
        '/',
        clerkMiddleware(),
        zValidator(
            'json',
            z.object({
                patientId: z.string(),
                payerId: z.string(),
                claimNumber: z.string().optional().nullable(),
                isPrimary: z.boolean().default(true),
                effectiveDate: z.coerce.date(),
                notes: z.string().optional().nullable(),
            })
        ),
        async (c) => {
            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as { role: string })?.role

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (userRole !== 'admin') {
                return c.json({ error: "Admin access required" }, 403)
            }

            const values = c.req.valid('json')

            // If this is a primary payer, end the current primary assignment
            if (values.isPrimary) {
                const currentPrimary = await db
                    .select({ id: patientPayers.id })
                    .from(patientPayers)
                    .where(
                        and(
                            eq(patientPayers.patientId, values.patientId),
                            eq(patientPayers.isPrimary, true),
                            eq(patientPayers.isActive, true)
                        )
                    )

                for (const existing of currentPrimary) {
                    await db
                        .update(patientPayers)
                        .set({
                            isActive: false,
                            endDate: values.effectiveDate, // End date = new payer's start date
                        })
                        .where(eq(patientPayers.id, existing.id))
                }
            }

            // If secondary, just deactivate previous secondary
            if (!values.isPrimary) {
                const currentSecondary = await db
                    .select({ id: patientPayers.id })
                    .from(patientPayers)
                    .where(
                        and(
                            eq(patientPayers.patientId, values.patientId),
                            eq(patientPayers.isPrimary, false),
                            eq(patientPayers.isActive, true)
                        )
                    )

                for (const existing of currentSecondary) {
                    await db
                        .update(patientPayers)
                        .set({
                            isActive: false,
                            endDate: values.effectiveDate,
                        })
                        .where(eq(patientPayers.id, existing.id))
                }
            }

            const [data] = await db
                .insert(patientPayers)
                .values({
                    id: createId(),
                    ...values,
                })
                .returning()

            console.log(`[PatientPayers] Assigned payer to patient ${values.patientId} (primary: ${values.isPrimary})`)

            return c.json({ data })
        }
    )

    // ========================================================================
    // UPDATE A PAYER ASSIGNMENT (claim number, notes, etc.)
    // ========================================================================
    .patch(
        '/:id',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        zValidator(
            'json',
            z.object({
                claimNumber: z.string().optional().nullable(),
                isPrimary: z.boolean().optional(),
                notes: z.string().optional().nullable(),
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

            const [data] = await db
                .update(patientPayers)
                .set(values)
                .where(eq(patientPayers.id, id))
                .returning()

            if (!data) {
                return c.json({ error: "Patient payer assignment not found" }, 404)
            }

            return c.json({ data })
        }
    )

    // ========================================================================
    // END A PAYER ASSIGNMENT (deactivate, set end date)
    // Does NOT delete — preserves history
    // ========================================================================
    .post(
        '/:id/end',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        zValidator(
            'json',
            z.object({
                endDate: z.coerce.date(),
                notes: z.string().optional(),
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

            const [data] = await db
                .update(patientPayers)
                .set({
                    isActive: false,
                    endDate: values.endDate,
                    notes: values.notes || undefined,
                })
                .where(eq(patientPayers.id, id))
                .returning()

            if (!data) {
                return c.json({ error: "Patient payer assignment not found" }, 404)
            }

            console.log(`[PatientPayers] Ended payer assignment ${id}`)

            return c.json({ data })
        }
    )

export default app