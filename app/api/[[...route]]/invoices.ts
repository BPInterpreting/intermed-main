import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {
    invoices,
    invoiceLineItems,
    payers,
    appointments,
    patient,
    facilities,
    interpreter,
    insertInvoiceSchema,
    insertInvoiceLineItemSchema,
    payerLanguageRates,
} from "@/db/schema"
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { createId } from "@paralleldrive/cuid2"
import { and, eq, gte, lte, asc, desc, sql, isNull } from "drizzle-orm"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"

// Helper to generate invoice number: INV-2025-0001
async function generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `INV-${year}-`

    // Get the highest invoice number for this year
    const [latest] = await db
        .select({ invoiceNumber: invoices.invoiceNumber })
        .from(invoices)
        .where(sql`${invoices.invoiceNumber} LIKE ${prefix + '%'}`)
        .orderBy(desc(invoices.invoiceNumber))
        .limit(1)

    let nextNumber = 1
    if (latest?.invoiceNumber) {
        const currentNumber = parseInt(latest.invoiceNumber.split('-')[2], 10)
        nextNumber = currentNumber + 1
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`
}

const app = new Hono()

    // ========================================================================
    // GET ALL INVOICES
    // ========================================================================
    .get(
        '/',
        clerkMiddleware(),
        zValidator('query', z.object({
            payerId: z.string().optional(),
            status: z.string().optional(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
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

            const { payerId, status, startDate, endDate } = c.req.valid('query')

            // Build conditions array
            const conditions = []
            if (payerId) conditions.push(eq(invoices.payerId, payerId))
            if (status) conditions.push(eq(invoices.status, status))
            if (startDate) conditions.push(gte(invoices.periodStart, new Date(startDate)))
            if (endDate) conditions.push(lte(invoices.periodEnd, new Date(endDate)))

            const data = await db
                .select({
                    id: invoices.id,
                    invoiceNumber: invoices.invoiceNumber,
                    payerId: invoices.payerId,
                    payerName: payers.name,
                    periodStart: invoices.periodStart,
                    periodEnd: invoices.periodEnd,
                    subtotal: invoices.subtotal,
                    adjustments: invoices.adjustments,
                    total: invoices.total,
                    status: invoices.status,
                    sentAt: invoices.sentAt,
                    dueDate: invoices.dueDate,
                    paidAt: invoices.paidAt,
                    paidAmount: invoices.paidAmount,
                    createdAt: invoices.createdAt,
                })
                .from(invoices)
                .leftJoin(payers, eq(invoices.payerId, payers.id))
                .where(conditions.length > 0 ? and(...conditions) : undefined)
                .orderBy(desc(invoices.createdAt))

            return c.json({ data })
        }
    )

    // ========================================================================
    // GET SINGLE INVOICE WITH LINE ITEMS
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

            // Get invoice with payer info
            const [invoice] = await db
                .select({
                    id: invoices.id,
                    invoiceNumber: invoices.invoiceNumber,
                    payerId: invoices.payerId,
                    payerName: payers.name,
                    payerType: payers.type,
                    payerBillingCode: payers.billingCode,
                    periodStart: invoices.periodStart,
                    periodEnd: invoices.periodEnd,
                    subtotal: invoices.subtotal,
                    adjustments: invoices.adjustments,
                    total: invoices.total,
                    status: invoices.status,
                    sentAt: invoices.sentAt,
                    dueDate: invoices.dueDate,
                    paidAt: invoices.paidAt,
                    paidAmount: invoices.paidAmount,
                    notes: invoices.notes,
                    createdAt: invoices.createdAt,
                    updatedAt: invoices.updatedAt,
                })
                .from(invoices)
                .leftJoin(payers, eq(invoices.payerId, payers.id))
                .where(eq(invoices.id, id))
                .limit(1)

            if (!invoice) {
                return c.json({ error: "Invoice not found" }, 404)
            }

            // Get line items with appointment details
            const lineItems = await db
                .select({
                    id: invoiceLineItems.id,
                    appointmentId: invoiceLineItems.appointmentId,
                    bookingId: appointments.bookingId,
                    description: invoiceLineItems.description,
                    serviceDate: invoiceLineItems.serviceDate,
                    serviceHours: invoiceLineItems.serviceHours,
                    serviceRate: invoiceLineItems.serviceRate,
                    serviceAmount: invoiceLineItems.serviceAmount,
                    mileage: invoiceLineItems.mileage,
                    mileageRate: invoiceLineItems.mileageRate,
                    mileageAmount: invoiceLineItems.mileageAmount,
                    adjustmentType: invoiceLineItems.adjustmentType,
                    adjustmentAmount: invoiceLineItems.adjustmentAmount,
                    lineTotal: invoiceLineItems.lineTotal,
                    patientName: sql<string>`${patient.firstName} || ' ' || ${patient.lastName}`,
                    interpreterName: sql<string>`${interpreter.firstName} || ' ' || ${interpreter.lastName}`,
                    facilityName: facilities.name,
                })
                .from(invoiceLineItems)
                .leftJoin(appointments, eq(invoiceLineItems.appointmentId, appointments.id))
                .leftJoin(patient, eq(appointments.patientId, patient.id))
                .leftJoin(interpreter, eq(appointments.interpreterId, interpreter.id))
                .leftJoin(facilities, eq(appointments.facilityId, facilities.id))
                .where(eq(invoiceLineItems.invoiceId, id))
                .orderBy(asc(invoiceLineItems.serviceDate))

            return c.json({
                data: {
                    ...invoice,
                    lineItems
                }
            })
        }
    )

    // ========================================================================
    // GENERATE INVOICE FOR PAYER + DATE RANGE
    // ========================================================================
    .post(
        '/generate',
        clerkMiddleware(),
        zValidator(
            'json',
            z.object({
                payerId: z.string(),
                periodStart: z.coerce.date(),
                periodEnd: z.coerce.date(),
                notes: z.string().optional(),
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

            // Get payer info
            const [payer] = await db
                .select()
                .from(payers)
                .where(eq(payers.id, values.payerId))
                .limit(1)

            if (!payer) {
                return c.json({ error: "Payer not found" }, 404)
            }

            // Get billable appointments for this payer in date range
            // that haven't been invoiced yet
            const billableAppointments = await db
                .select({
                    id: appointments.id,
                    bookingId: appointments.bookingId,
                    date: appointments.date,
                    status: appointments.status,
                    language: appointments.language,
                    actualDurationMinutes: appointments.actualDurationMinutes,
                    actualMiles: appointments.actualMiles,
                    mileageApproved: appointments.mileageApproved,
                    projectedDuration: appointments.projectedDuration,
                    patientFirstName: patient.firstName,
                    patientLastName: patient.lastName,
                    interpreterFirstName: interpreter.firstName,
                    interpreterLastName: interpreter.lastName,
                    facilityName: facilities.name,
                })
                .from(appointments)
                .leftJoin(patient, eq(appointments.patientId, patient.id))
                .leftJoin(interpreter, eq(appointments.interpreterId, interpreter.id))
                .leftJoin(facilities, eq(appointments.facilityId, facilities.id))
                .where(
                    and(
                        eq(appointments.payerId, values.payerId),
                        gte(appointments.date, values.periodStart),
                        lte(appointments.date, values.periodEnd),
                        eq(appointments.billingStatus, 'pending') // Only unbilled appointments
                    )
                )
                .orderBy(asc(appointments.date))

            if (billableAppointments.length === 0) {
                return c.json({ 
                    error: "No billable appointments found for this payer in the selected date range" 
                }, 400)
            }

            // Calculate line items
            const lineItemsData: {
                id: string
                appointmentId: string
                description: string
                serviceDate: Date
                serviceHours: string
                serviceRate: string
                serviceAmount: string
                mileage: string | null
                mileageRate: string | null
                mileageAmount: string | null
                adjustmentType: string | null
                adjustmentAmount: string | null
                lineTotal: string
            }[] = []
            let subtotal = 0

            for (const appt of billableAppointments) {
                // Determine hourly rate (check language-specific rate first, then default)
                let hourlyRate = parseFloat(payer.defaultHourlyRate || '0')
                
                if (appt.language) {
                    const [langRate] = await db
                        .select()
                        .from(payerLanguageRates)
                        .where(
                            and(
                                eq(payerLanguageRates.payerId, values.payerId),
                                eq(payerLanguageRates.language, appt.language)
                            )
                        )
                        .limit(1)
                    
                    if (langRate) {
                        hourlyRate = parseFloat(langRate.hourlyRate)
                    }
                }

                // Calculate service hours (use actual if available, else projected)
                let serviceHours = 2.0 // Default minimum
                if (appt.actualDurationMinutes) {
                    serviceHours = Math.max(appt.actualDurationMinutes / 60, parseFloat(payer.minimumHours || '2'))
                } else if (appt.projectedDuration) {
                    // Parse projected duration (e.g., "2 hours" or "1.5")
                    const parsed = parseFloat(appt.projectedDuration)
                    if (!isNaN(parsed)) {
                        serviceHours = Math.max(parsed, parseFloat(payer.minimumHours || '2'))
                    }
                }

                const serviceAmount = serviceHours * hourlyRate

                // Calculate mileage
                let mileage = 0
                let mileageRate = 0
                let mileageAmount = 0

                if (appt.mileageApproved && appt.actualMiles) {
                    mileage = parseFloat(appt.actualMiles)
                    mileageRate = parseFloat(payer.defaultMileageRate || '0')
                    mileageAmount = mileage * mileageRate
                }

                // Handle adjustments (no-show, late cancel)
                let adjustmentType = null
                let adjustmentAmount = 0

                if (appt.status === 'No Show') {
                    adjustmentType = 'no_show'
                    adjustmentAmount = parseFloat(payer.noShowFee || '0')
                } else if (appt.status === 'Late CX') {
                    adjustmentType = 'late_cancel'
                    adjustmentAmount = parseFloat(payer.lateCancelFee || '0')
                }

                // Calculate line total
                let lineTotal = serviceAmount + mileageAmount
                if (adjustmentType) {
                    // For no-show/late cancel, we bill the flat fee instead
                    lineTotal = adjustmentAmount
                }

                // Build description
                const description = `${appt.date.toLocaleDateString()} - ${appt.patientFirstName} ${appt.patientLastName} at ${appt.facilityName}${adjustmentType ? ` (${adjustmentType.replace('_', ' ').toUpperCase()})` : ''}`

                lineItemsData.push({
                    id: createId(),
                    appointmentId: appt.id,
                    description,
                    serviceDate: appt.date,
                    serviceHours: serviceHours.toFixed(2),
                    serviceRate: hourlyRate.toFixed(2),
                    serviceAmount: serviceAmount.toFixed(2),
                    mileage: mileage > 0 ? mileage.toFixed(2) : null,
                    mileageRate: mileageRate > 0 ? mileageRate.toFixed(2) : null,
                    mileageAmount: mileageAmount > 0 ? mileageAmount.toFixed(2) : null,
                    adjustmentType,
                    adjustmentAmount: adjustmentAmount > 0 ? adjustmentAmount.toFixed(2) : null,
                    lineTotal: lineTotal.toFixed(2),
                })

                subtotal += lineTotal
            }

            // Create invoice with line items in a transaction
            const result = await db.transaction(async (tx) => {
                const invoiceNumber = await generateInvoiceNumber()

                // Create invoice
                const [newInvoice] = await tx
                    .insert(invoices)
                    .values({
                        id: createId(),
                        invoiceNumber,
                        payerId: values.payerId,
                        periodStart: values.periodStart,
                        periodEnd: values.periodEnd,
                        subtotal: subtotal.toFixed(2),
                        adjustments: '0.00',
                        total: subtotal.toFixed(2),
                        status: 'draft',
                        notes: values.notes,
                    })
                    .returning()

                // Create line items
                const lineItemsWithInvoiceId = lineItemsData.map(item => ({
                    ...item,
                    invoiceId: newInvoice.id,
                }))

                await tx.insert(invoiceLineItems).values(lineItemsWithInvoiceId)

                // Update appointments billing status
                const appointmentIds = billableAppointments.map(a => a.id)
                for (const apptId of appointmentIds) {
                    await tx
                        .update(appointments)
                        .set({ billingStatus: 'invoiced' })
                        .where(eq(appointments.id, apptId))
                }

                return newInvoice
            })

            console.log(`[Invoices] Generated invoice ${result.invoiceNumber} with ${lineItemsData.length} line items, total: $${subtotal.toFixed(2)}`)

            return c.json({ 
                data: result,
                lineItemCount: lineItemsData.length,
                total: subtotal.toFixed(2)
            })
        }
    )

    // ========================================================================
    // UPDATE INVOICE (status, notes, adjustments)
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
                status: z.string().optional(),
                notes: z.string().optional(),
                adjustments: z.string().optional(),
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

            // If adjustments changed, recalculate total
            const updateData: Record<string, unknown> = { ...values }

            if (values.adjustments !== undefined) {
                const [currentInvoice] = await db
                    .select({ subtotal: invoices.subtotal })
                    .from(invoices)
                    .where(eq(invoices.id, id))
                    .limit(1)

                if (currentInvoice) {
                    const newTotal = parseFloat(currentInvoice.subtotal || '0') + parseFloat(values.adjustments)
                    updateData.total = newTotal.toFixed(2)
                }
            }

            const [data] = await db
                .update(invoices)
                .set(updateData)
                .where(eq(invoices.id, id))
                .returning()

            if (!data) {
                return c.json({ error: "Invoice not found" }, 404)
            }

            console.log(`[Invoices] Updated invoice ${data.invoiceNumber}`)

            return c.json({ data })
        }
    )

    // ========================================================================
    // MARK INVOICE AS SENT
    // ========================================================================
    .post(
        '/:id/mark-sent',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        zValidator(
            'json',
            z.object({
                dueDate: z.coerce.date().optional(),
            })
        ),
        async (c) => {
            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as { role: string })?.role
            const { id } = c.req.valid('param')
            const { dueDate } = c.req.valid('json')

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (userRole !== 'admin') {
                return c.json({ error: "Admin access required" }, 403)
            }

            // Get payer payment terms if no due date provided
            let calculatedDueDate = dueDate

            if (!calculatedDueDate) {
                const [invoice] = await db
                    .select({ 
                        payerId: invoices.payerId,
                        paymentTermsDays: payers.paymentTermsDays 
                    })
                    .from(invoices)
                    .leftJoin(payers, eq(invoices.payerId, payers.id))
                    .where(eq(invoices.id, id))
                    .limit(1)

                if (invoice?.paymentTermsDays) {
                    calculatedDueDate = new Date()
                    calculatedDueDate.setDate(calculatedDueDate.getDate() + invoice.paymentTermsDays)
                }
            }

            const [data] = await db
                .update(invoices)
                .set({
                    status: 'sent',
                    sentAt: new Date(),
                    dueDate: calculatedDueDate,
                })
                .where(eq(invoices.id, id))
                .returning()

            if (!data) {
                return c.json({ error: "Invoice not found" }, 404)
            }

            console.log(`[Invoices] Marked invoice ${data.invoiceNumber} as sent, due: ${calculatedDueDate}`)

            return c.json({ data })
        }
    )

    // ========================================================================
    // RECORD PAYMENT
    // ========================================================================
    .post(
        '/:id/record-payment',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        zValidator(
            'json',
            z.object({
                amount: z.string(),
                paidAt: z.coerce.date().optional(),
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

            // Get current invoice
            const [currentInvoice] = await db
                .select()
                .from(invoices)
                .where(eq(invoices.id, id))
                .limit(1)

            if (!currentInvoice) {
                return c.json({ error: "Invoice not found" }, 404)
            }

            const paymentAmount = parseFloat(values.amount)
            const currentPaid = parseFloat(currentInvoice.paidAmount || '0')
            const totalPaid = currentPaid + paymentAmount
            const invoiceTotal = parseFloat(currentInvoice.total)

            // Determine new status
            let newStatus = 'partial'
            if (totalPaid >= invoiceTotal) {
                newStatus = 'paid'
            }

            const [data] = await db
                .update(invoices)
                .set({
                    paidAmount: totalPaid.toFixed(2),
                    paidAt: values.paidAt || new Date(),
                    status: newStatus,
                    notes: values.notes 
                        ? `${currentInvoice.notes || ''}\n${new Date().toLocaleDateString()}: Payment of $${paymentAmount.toFixed(2)} recorded. ${values.notes}`.trim()
                        : currentInvoice.notes,
                })
                .where(eq(invoices.id, id))
                .returning()

            // Update appointments billing status to 'paid'
            if (newStatus === 'paid') {
                const lineItems = await db
                    .select({ appointmentId: invoiceLineItems.appointmentId })
                    .from(invoiceLineItems)
                    .where(eq(invoiceLineItems.invoiceId, id))

                for (const item of lineItems) {
                    if (item.appointmentId) {
                        await db
                            .update(appointments)
                            .set({ billingStatus: 'paid' })
                            .where(eq(appointments.id, item.appointmentId))
                    }
                }
            }

            console.log(`[Invoices] Recorded payment of $${paymentAmount.toFixed(2)} for invoice ${data.invoiceNumber}, status: ${newStatus}`)

            return c.json({ data })
        }
    )

    // ========================================================================
    // EXPORT INVOICE AS CSV
    // ========================================================================
    .get(
        '/:id/export',
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

            // Get invoice
            const [invoice] = await db
                .select({
                    invoiceNumber: invoices.invoiceNumber,
                    payerName: payers.name,
                    periodStart: invoices.periodStart,
                    periodEnd: invoices.periodEnd,
                    total: invoices.total,
                })
                .from(invoices)
                .leftJoin(payers, eq(invoices.payerId, payers.id))
                .where(eq(invoices.id, id))
                .limit(1)

            if (!invoice) {
                return c.json({ error: "Invoice not found" }, 404)
            }

            // Get line items
            const lineItems = await db
                .select({
                    description: invoiceLineItems.description,
                    serviceDate: invoiceLineItems.serviceDate,
                    serviceHours: invoiceLineItems.serviceHours,
                    serviceRate: invoiceLineItems.serviceRate,
                    serviceAmount: invoiceLineItems.serviceAmount,
                    mileage: invoiceLineItems.mileage,
                    mileageRate: invoiceLineItems.mileageRate,
                    mileageAmount: invoiceLineItems.mileageAmount,
                    adjustmentType: invoiceLineItems.adjustmentType,
                    adjustmentAmount: invoiceLineItems.adjustmentAmount,
                    lineTotal: invoiceLineItems.lineTotal,
                })
                .from(invoiceLineItems)
                .where(eq(invoiceLineItems.invoiceId, id))
                .orderBy(asc(invoiceLineItems.serviceDate))

            // Build CSV
            const headers = [
                'Service Date',
                'Description',
                'Hours',
                'Hourly Rate',
                'Service Amount',
                'Mileage',
                'Mileage Rate',
                'Mileage Amount',
                'Adjustment Type',
                'Adjustment Amount',
                'Line Total'
            ]

            const rows = lineItems.map(item => [
                item.serviceDate.toLocaleDateString(),
                `"${item.description}"`,
                item.serviceHours,
                item.serviceRate,
                item.serviceAmount,
                item.mileage || '',
                item.mileageRate || '',
                item.mileageAmount || '',
                item.adjustmentType || '',
                item.adjustmentAmount || '',
                item.lineTotal,
            ])

            const csv = [
                `Invoice: ${invoice.invoiceNumber}`,
                `Payer: ${invoice.payerName}`,
                `Period: ${invoice.periodStart.toLocaleDateString()} - ${invoice.periodEnd.toLocaleDateString()}`,
                `Total: $${invoice.total}`,
                '',
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n')

            return new Response(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.csv"`
                }
            })
        }
    )

export default app