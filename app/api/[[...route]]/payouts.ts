import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {
    payouts,
    payoutLineItems,
    appointments,
    patient,
    facilities,
    interpreter,
    interpreterRates,
} from "@/db/schema"
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { createId } from "@paralleldrive/cuid2"
import { and, eq, gte, lte, asc, desc, sql, isNull } from "drizzle-orm"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"

// Helper to generate payout number: PAY-2025-0001
async function generatePayoutNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `PAY-${year}-`

    const [latest] = await db
        .select({ payoutNumber: payouts.payoutNumber })
        .from(payouts)
        .where(sql`${payouts.payoutNumber} LIKE ${prefix + '%'}`)
        .orderBy(desc(payouts.payoutNumber))
        .limit(1)

    let nextNumber = 1
    if (latest?.payoutNumber) {
        const currentNumber = parseInt(latest.payoutNumber.split('-')[2], 10)
        nextNumber = currentNumber + 1
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`
}

// Helper to parse projected duration strings like "5h", "45m", "1h30m"
function parseProjectedDuration(duration: string): number | null {
    if (!duration) return null

    const trimmed = duration.trim().toLowerCase()

    // Check for "Xh Ym" or "XhYm" format
    const hoursMinutesMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*h\s*(\d+)\s*m?/)
    if (hoursMinutesMatch) {
        const hours = parseFloat(hoursMinutesMatch[1])
        const mins = parseInt(hoursMinutesMatch[2])
        return (hours * 60) + mins
    }

    // Check for "Xh" format
    const hoursMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*h$/)
    if (hoursMatch) {
        return parseFloat(hoursMatch[1]) * 60
    }

    // Check for "Xm" format
    const minutesMatch = trimmed.match(/^(\d+)\s*m$/)
    if (minutesMatch) {
        return parseInt(minutesMatch[1])
    }

    // Plain number - assume hours if small, minutes if large
    const plainNumber = parseFloat(trimmed)
    if (!isNaN(plainNumber)) {
        if (plainNumber > 10) {
            return plainNumber // Assume minutes
        } else {
            return plainNumber * 60 // Assume hours
        }
    }

    return null
}

const app = new Hono()

    // ========================================================================
    // GET ALL PAYOUTS
    // ========================================================================
    .get(
        '/',
        clerkMiddleware(),
        zValidator('query', z.object({
            interpreterId: z.string().optional(),
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

            const { interpreterId, status, startDate, endDate } = c.req.valid('query')

            const conditions = []
            if (interpreterId) conditions.push(eq(payouts.interpreterId, interpreterId))
            if (status) conditions.push(eq(payouts.status, status))
            if (startDate) conditions.push(gte(payouts.periodStart, new Date(startDate)))
            if (endDate) conditions.push(lte(payouts.periodEnd, new Date(endDate)))

            const data = await db
                .select({
                    id: payouts.id,
                    payoutNumber: payouts.payoutNumber,
                    interpreterId: payouts.interpreterId,
                    interpreterName: sql<string>`${interpreter.firstName} || ' ' || ${interpreter.lastName}`,
                    periodStart: payouts.periodStart,
                    periodEnd: payouts.periodEnd,
                    subtotal: payouts.subtotal,
                    adjustments: payouts.adjustments,
                    total: payouts.total,
                    status: payouts.status,
                    scheduledDate: payouts.scheduledDate,
                    paidAt: payouts.paidAt,
                    paymentMethod: payouts.paymentMethod,
                    createdAt: payouts.createdAt,
                })
                .from(payouts)
                .leftJoin(interpreter, eq(payouts.interpreterId, interpreter.id))
                .where(conditions.length > 0 ? and(...conditions) : undefined)
                .orderBy(desc(payouts.createdAt))

            return c.json({ data })
        }
    )

    // ========================================================================
    // GET PENDING PAYOUTS (Grouped by Interpreter)
    // ========================================================================
    .get(
        '/pending',
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c)
            const userRole = (auth?.sessionClaims?.metadata as { role: string })?.role

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if (userRole !== 'admin') {
                return c.json({ error: "Admin access required" }, 403)
            }

            const data = await db
                .select({
                    id: payouts.id,
                    payoutNumber: payouts.payoutNumber,
                    interpreterId: payouts.interpreterId,
                    interpreterFirstName: interpreter.firstName,
                    interpreterLastName: interpreter.lastName,
                    interpreterEmail: interpreter.email,
                    total: payouts.total,
                    status: payouts.status,
                    scheduledDate: payouts.scheduledDate,
                    periodStart: payouts.periodStart,
                    periodEnd: payouts.periodEnd,
                })
                .from(payouts)
                .leftJoin(interpreter, eq(payouts.interpreterId, interpreter.id))
                .where(eq(payouts.status, 'pending'))
                .orderBy(asc(interpreter.lastName), asc(interpreter.firstName))

            return c.json({ data })
        }
    )

    // ========================================================================
    // GET SINGLE PAYOUT WITH LINE ITEMS
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

            let payout

            if (userRole === 'admin') {
                [payout] = await db
                    .select({
                        id: payouts.id,
                        payoutNumber: payouts.payoutNumber,
                        interpreterId: payouts.interpreterId,
                        interpreterFirstName: interpreter.firstName,
                        interpreterLastName: interpreter.lastName,
                        interpreterEmail: interpreter.email,
                        periodStart: payouts.periodStart,
                        periodEnd: payouts.periodEnd,
                        subtotal: payouts.subtotal,
                        adjustments: payouts.adjustments,
                        total: payouts.total,
                        status: payouts.status,
                        scheduledDate: payouts.scheduledDate,
                        paidAt: payouts.paidAt,
                        paymentMethod: payouts.paymentMethod,
                        paymentReference: payouts.paymentReference,
                        notes: payouts.notes,
                        createdAt: payouts.createdAt,
                        updatedAt: payouts.updatedAt,
                    })
                    .from(payouts)
                    .leftJoin(interpreter, eq(payouts.interpreterId, interpreter.id))
                    .where(eq(payouts.id, id))
                    .limit(1)
            } else {
                const [currentInterpreter] = await db
                    .select({ id: interpreter.id })
                    .from(interpreter)
                    .where(eq(interpreter.clerkUserId, auth.userId))
                    .limit(1)

                if (!currentInterpreter) {
                    return c.json({ error: "Interpreter not found" }, 404)
                }

                [payout] = await db
                    .select({
                        id: payouts.id,
                        payoutNumber: payouts.payoutNumber,
                        interpreterId: payouts.interpreterId,
                        interpreterFirstName: interpreter.firstName,
                        interpreterLastName: interpreter.lastName,
                        interpreterEmail: interpreter.email,
                        periodStart: payouts.periodStart,
                        periodEnd: payouts.periodEnd,
                        subtotal: payouts.subtotal,
                        adjustments: payouts.adjustments,
                        total: payouts.total,
                        status: payouts.status,
                        scheduledDate: payouts.scheduledDate,
                        paidAt: payouts.paidAt,
                        paymentMethod: payouts.paymentMethod,
                        paymentReference: payouts.paymentReference,
                        notes: payouts.notes,
                        createdAt: payouts.createdAt,
                        updatedAt: payouts.updatedAt,
                    })
                    .from(payouts)
                    .leftJoin(interpreter, eq(payouts.interpreterId, interpreter.id))
                    .where(
                        and(
                            eq(payouts.id, id),
                            eq(payouts.interpreterId, currentInterpreter.id)
                        )
                    )
                    .limit(1)
            }

            if (!payout) {
                return c.json({ error: "Payout not found" }, 404)
            }

            const lineItems = await db
                .select({
                    id: payoutLineItems.id,
                    appointmentId: payoutLineItems.appointmentId,
                    bookingId: appointments.bookingId,
                    description: payoutLineItems.description,
                    serviceDate: payoutLineItems.serviceDate,
                    serviceHours: payoutLineItems.serviceHours,
                    serviceRate: payoutLineItems.serviceRate,
                    serviceAmount: payoutLineItems.serviceAmount,
                    mileage: payoutLineItems.mileage,
                    mileageRate: payoutLineItems.mileageRate,
                    mileageAmount: payoutLineItems.mileageAmount,
                    adjustmentType: payoutLineItems.adjustmentType,
                    adjustmentAmount: payoutLineItems.adjustmentAmount,
                    lineTotal: payoutLineItems.lineTotal,
                    patientName: sql<string>`${patient.firstName} || ' ' || ${patient.lastName}`,
                    facilityName: facilities.name,
                    appointmentStatus: appointments.status,
                    startTime: appointments.startTime,
                    endTime: appointments.endTime,
                    actualDurationMinutes: appointments.actualDurationMinutes,
                    projectedDuration: appointments.projectedDuration,
                })
                .from(payoutLineItems)
                .leftJoin(appointments, eq(payoutLineItems.appointmentId, appointments.id))
                .leftJoin(patient, eq(appointments.patientId, patient.id))
                .leftJoin(facilities, eq(appointments.facilityId, facilities.id))
                .where(eq(payoutLineItems.payoutId, id))
                .orderBy(asc(payoutLineItems.serviceDate))

            return c.json({
                data: {
                    ...payout,
                    lineItems
                }
            })
        }
    )
    // ========================================================================
    // PREVIEW PAYOUTS FOR DATE RANGE (Dry Run - No Data Created)
    // ========================================================================
    // ========================================================================
    // PREVIEW PAYOUTS FOR DATE RANGE (Dry Run - No Data Created)
    // ========================================================================
    .post(
        '/preview',
        clerkMiddleware(),
        zValidator(
            'json',
            z.object({
                periodStart: z.coerce.date(),
                periodEnd: z.coerce.date(),
                periodType: z.enum(["first_half", "second_half", "full_month"]),
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

            // Get all payable appointments (same query as generate but read-only)
            const payableAppointments = await db
                .select({
                    id: appointments.id,
                    bookingId: appointments.bookingId,
                    date: appointments.date,
                    status: appointments.status,
                    interpreterId: appointments.interpreterId,
                    isCertified: appointments.isCertified,
                    actualDurationMinutes: appointments.actualDurationMinutes,
                    projectedDuration: appointments.projectedDuration,
                    startTime: appointments.startTime,
                    endTime: appointments.endTime,
                    actualMiles: appointments.actualMiles,
                    mileageApproved: appointments.mileageApproved,
                    patientFirstName: patient.firstName,
                    patientLastName: patient.lastName,
                    facilityName: facilities.name,
                })
                .from(appointments)
                .leftJoin(patient, eq(appointments.patientId, patient.id))
                .leftJoin(facilities, eq(appointments.facilityId, facilities.id))
                .where(
                    and(
                        gte(appointments.date, values.periodStart),
                        lte(appointments.date, values.periodEnd),
                        eq(appointments.payoutStatus, 'pending'),
                        sql`${appointments.interpreterId} IS NOT NULL`,
                        sql`${appointments.status} IN ('Closed', 'No Show', 'Late CX')`,
                        sql`${appointments.interpreterId} IN (
                            SELECT id FROM interpreter 
                            WHERE COALESCE(payment_frequency, 'monthly') = ${values.periodType === 'full_month' ? 'monthly' : 'biweekly'}
                        )`
                    )
                )
                .orderBy(asc(appointments.interpreterId), asc(appointments.date))

            // Check for unclosed past appointments in the same period (for warnings)
            // Include status and interpreter info for detailed breakdown
            const unclosedPastAppointments = await db
                .select({
                    id: appointments.id,
                    bookingId: appointments.bookingId,
                    date: appointments.date,
                    status: appointments.status,
                    interpreterId: appointments.interpreterId,
                    interpreterFirstName: interpreter.firstName,
                    interpreterLastName: interpreter.lastName,
                    patientFirstName: patient.firstName,
                    patientLastName: patient.lastName,
                    facilityName: facilities.name,
                })
                .from(appointments)
                .leftJoin(interpreter, eq(appointments.interpreterId, interpreter.id))
                .leftJoin(patient, eq(appointments.patientId, patient.id))
                .leftJoin(facilities, eq(appointments.facilityId, facilities.id))
                .where(
                    and(
                        gte(appointments.date, values.periodStart),
                        lte(appointments.date, values.periodEnd),
                        sql`${appointments.interpreterId} IS NOT NULL`,
                        sql`${appointments.status} NOT IN ('Closed', 'No Show', 'Late CX', 'Cancelled')`,
                        lte(appointments.date, new Date())
                    )
                )
                .orderBy(asc(appointments.date))

            // Build unclosed breakdown by status
            const unclosedByStatus: Record<string, number> = {}
            for (const appt of unclosedPastAppointments) {
                const status = appt.status || 'Unknown'
                unclosedByStatus[status] = (unclosedByStatus[status] || 0) + 1
            }

            // Format unclosed appointments for frontend
            const unclosedDetails = unclosedPastAppointments.map(appt => ({
                id: appt.id,
                bookingId: appt.bookingId,
                date: appt.date,
                status: appt.status,
                interpreterName: appt.interpreterFirstName && appt.interpreterLastName
                    ? `${appt.interpreterFirstName} ${appt.interpreterLastName}`
                    : 'Unassigned',
                patientName: appt.patientFirstName && appt.patientLastName
                    ? `${appt.patientFirstName} ${appt.patientLastName}`
                    : 'Unknown',
                facilityName: appt.facilityName || 'Unknown',
            }))

            // Group by interpreter
            const appointmentsByInterpreter = new Map<string, typeof payableAppointments>()
            for (const appt of payableAppointments) {
                if (!appt.interpreterId) continue
                const existing = appointmentsByInterpreter.get(appt.interpreterId) || []
                existing.push(appt)
                appointmentsByInterpreter.set(appt.interpreterId, existing)
            }

            // Build preview data per interpreter with individual appointment details
            const interpreterPreviews: {
                interpreterId: string
                interpreterName: string
                appointmentCount: number
                estimatedHours: number
                estimatedTotal: number
                rate: number
                isCertified: boolean
                appointments: {
                    id: string
                    bookingId: number | null
                    date: Date
                    status: string | null
                    patientName: string
                    facilityName: string
                    startTime: string | null
                    endTime: string | null
                    serviceHours: number
                    hourlyRate: number
                    mileage: number
                    mileageRate: number
                    adjustmentType: string | null
                    adjustmentAmount: number
                    lineTotal: number
                    isCertified: boolean
                    durationSource: string
                }[]
            }[] = []

            const skippedInterpreters: { 
                name: string
                reason: string
                appointmentCount: number
                appointments: {
                    id: string
                    bookingId: number | null
                    date: Date
                    status: string | null
                    patientName: string
                    facilityName: string
                }[]
            }[] = []

            const warnings: { type: string; message: string; count?: number }[] = []

            let noEndTimeCount = 0

            for (const [interpreterId, appts] of appointmentsByInterpreter) {
                // Get interpreter name
                const [interp] = await db
                    .select({ 
                        firstName: interpreter.firstName, 
                        lastName: interpreter.lastName 
                    })
                    .from(interpreter)
                    .where(eq(interpreter.id, interpreterId))
                    .limit(1)

                const interpName = interp 
                    ? `${interp.firstName} ${interp.lastName}` 
                    : `Unknown (${interpreterId})`

                // Get current rate
                const [currentRate] = await db
                    .select()
                    .from(interpreterRates)
                    .where(
                        and(
                            eq(interpreterRates.interpreterId, interpreterId),
                            isNull(interpreterRates.endDate)
                        )
                    )
                    .limit(1)

                if (!currentRate) {
                    skippedInterpreters.push({
                        name: interpName,
                        reason: 'No rate configured',
                        appointmentCount: appts.length,
                        appointments: appts.map(appt => ({
                            id: appt.id,
                            bookingId: appt.bookingId,
                            date: appt.date,
                            status: appt.status,
                            patientName: `${appt.patientFirstName || ''} ${appt.patientLastName || ''}`.trim() || 'Unknown',
                            facilityName: appt.facilityName || 'Unknown',
                        }))
                    })
                    continue
                }

                let totalHours = 0
                let totalAmount = 0
                const apptDetails: typeof interpreterPreviews[0]['appointments'] = []

                for (const appt of appts) {
                    const isCertifiedAppt = appt.isCertified ?? false
                    let hourlyRate = parseFloat(currentRate.certifiedHourlyRate)
                    
                    if (!isCertifiedAppt && currentRate.qualifiedHourlyRate) {
                        hourlyRate = parseFloat(currentRate.qualifiedHourlyRate)
                    }

                    const minimumHours = parseFloat(currentRate.minimumHours || '2')
                    let serviceHours = minimumHours
                    let durationSource = 'minimum'

                    if (appt.actualDurationMinutes && appt.actualDurationMinutes > 0) {
                        serviceHours = Math.max(appt.actualDurationMinutes / 60, minimumHours)
                        durationSource = appt.actualDurationMinutes / 60 < minimumHours ? 'minimum (actual below min)' : 'actual'
                    } else if (appt.projectedDuration) {
                        const parsedMinutes = parseProjectedDuration(appt.projectedDuration)
                        if (parsedMinutes && parsedMinutes > 0) {
                            serviceHours = Math.max(parsedMinutes / 60, minimumHours)
                            durationSource = parsedMinutes / 60 < minimumHours ? 'minimum (projected below min)' : 'projected'
                        }
                    }

                    if (!appt.endTime) {
                        noEndTimeCount++
                    }

                    // Mileage
                    let mileage = 0
                    let mileageRate = 0
                    if (appt.mileageApproved && appt.actualMiles) {
                        mileage = parseFloat(appt.actualMiles)
                        mileageRate = parseFloat(currentRate.mileageRate || '0')
                    }
                    const mileageAmount = mileage * mileageRate

                    let adjustmentType: string | null = null
                    let adjustmentAmount = 0
                    let lineTotal: number

                    if (appt.status === 'No Show') {
                        adjustmentType = 'no_show'
                        adjustmentAmount = isCertifiedAppt 
                            ? parseFloat(currentRate.certifiedNoShowFee || '0')
                            : parseFloat(currentRate.qualifiedNoShowFee || '0')
                        lineTotal = adjustmentAmount + mileageAmount
                    } else if (appt.status === 'Late CX') {
                        adjustmentType = 'late_cancel'
                        adjustmentAmount = isCertifiedAppt 
                            ? parseFloat(currentRate.certifiedLateCancelFee || '0')
                            : parseFloat(currentRate.qualifiedLateCancelFee || '0')
                        mileage = 0
                        lineTotal = adjustmentAmount
                    } else {
                        lineTotal = (serviceHours * hourlyRate) + mileageAmount
                        totalHours += serviceHours
                    }

                    totalAmount += lineTotal

                    apptDetails.push({
                        id: appt.id,
                        bookingId: appt.bookingId,
                        date: appt.date,
                        status: appt.status,
                        patientName: `${appt.patientFirstName || ''} ${appt.patientLastName || ''}`.trim() || 'Unknown',
                        facilityName: appt.facilityName || 'Unknown',
                        startTime: appt.startTime,
                        endTime: appt.endTime,
                        serviceHours,
                        hourlyRate,
                        mileage,
                        mileageRate,
                        adjustmentType,
                        adjustmentAmount,
                        lineTotal,
                        isCertified: isCertifiedAppt,
                        durationSource,
                    })
                }

                const primaryCertified = appts.some(a => a.isCertified)

                interpreterPreviews.push({
                    interpreterId,
                    interpreterName: interpName,
                    appointmentCount: appts.length,
                    estimatedHours: totalHours,
                    estimatedTotal: totalAmount,
                    rate: parseFloat(primaryCertified ? currentRate.certifiedHourlyRate : (currentRate.qualifiedHourlyRate || currentRate.certifiedHourlyRate)),
                    isCertified: primaryCertified,
                    appointments: apptDetails,
                })
            }

            // Build warnings
            if (noEndTimeCount > 0) {
                warnings.push({
                    type: 'no_end_time',
                    message: `${noEndTimeCount} appointment${noEndTimeCount > 1 ? 's' : ''} missing end time — using projected duration or minimum hours as fallback.`,
                    count: noEndTimeCount,
                })
            }

            if (unclosedPastAppointments.length > 0) {
                const statusBreakdown = Object.entries(unclosedByStatus)
                    .map(([status, count]) => `${count} ${status}`)
                    .join(', ')
                warnings.push({
                    type: 'unclosed_past',
                    message: `${unclosedPastAppointments.length} past appointment${unclosedPastAppointments.length > 1 ? 's' : ''} not included: ${statusBreakdown}`,
                    count: unclosedPastAppointments.length,
                })
            }

            const estimatedTotal = interpreterPreviews.reduce((sum, i) => sum + i.estimatedTotal, 0)

            return c.json({
                data: {
                    totalAppointments: payableAppointments.length,
                    totalInterpreters: interpreterPreviews.length,
                    estimatedTotal,
                    interpreters: interpreterPreviews,
                    warnings,
                    skippedInterpreters,
                    unclosedByStatus,
                    unclosedDetails,
                }
            })
        }
    )

    // ========================================================================
    // GENERATE PAYOUTS FOR DATE RANGE (All Interpreters)
    // ========================================================================
    .post(
        '/generate',
        clerkMiddleware(),
        zValidator(
            'json',
            z.object({
                periodStart: z.coerce.date(),
                periodEnd: z.coerce.date(),
                periodType: z.enum(["first_half", "second_half", "full_month"]),
                scheduledDate: z.coerce.date().optional(),
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

            const payableAppointments = await db
                .select({
                    id: appointments.id,
                    bookingId: appointments.bookingId,
                    date: appointments.date,
                    status: appointments.status,
                    interpreterId: appointments.interpreterId,
                    language: appointments.language,
                    isCertified: appointments.isCertified,
                    actualDurationMinutes: appointments.actualDurationMinutes,
                    actualMiles: appointments.actualMiles,
                    mileageApproved: appointments.mileageApproved,
                    projectedDuration: appointments.projectedDuration,
                    patientFirstName: patient.firstName,
                    patientLastName: patient.lastName,
                    facilityName: facilities.name,
                })
                .from(appointments)
                .leftJoin(patient, eq(appointments.patientId, patient.id))
                .leftJoin(facilities, eq(appointments.facilityId, facilities.id))
                .where(
                    and(
                        gte(appointments.date, values.periodStart),
                        lte(appointments.date, values.periodEnd),
                        eq(appointments.payoutStatus, 'pending'),
                        sql`${appointments.interpreterId} IS NOT NULL`,
                        sql`${appointments.status} IN ('Closed', 'No Show', 'Late CX')`,
                        sql`${appointments.interpreterId} IN (
                            SELECT id FROM interpreter 
                            WHERE COALESCE(payment_frequency, 'monthly') = ${values.periodType === 'full_month' ? 'monthly' : 'biweekly'}
                        )`
                    )
                )
                .orderBy(asc(appointments.interpreterId), asc(appointments.date))

            if (payableAppointments.length === 0) {
                return c.json({
                    error: "No payable appointments found in the selected date range"
                }, 400)
            }

            const appointmentsByInterpreter = new Map<string, typeof payableAppointments>()

            for (const appt of payableAppointments) {
                if (!appt.interpreterId) continue

                const existing = appointmentsByInterpreter.get(appt.interpreterId) || []
                existing.push(appt)
                appointmentsByInterpreter.set(appt.interpreterId, existing)
            }

            const generatedPayouts: { interpreterId: string; payoutNumber: string; total: string; lineItemCount: number }[] = []

            for (const [interpreterId, appts] of appointmentsByInterpreter) {
                const [currentRate] = await db
                    .select()
                    .from(interpreterRates)
                    .where(
                        and(
                            eq(interpreterRates.interpreterId, interpreterId),
                            isNull(interpreterRates.endDate)
                        )
                    )
                    .limit(1)

                if (!currentRate) {
                    console.log(`[Payouts] Skipping interpreter ${interpreterId} - no rate configured`)
                    continue
                }

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

                for (const appt of appts) {
                    // Rate selection: Certified vs Qualified
                    const isCertifiedAppt = appt.isCertified ?? false
                    
                    // Use certified rate by default
                    // If it's a qualified appointment AND qualifiedHourlyRate exists, use that
                    let hourlyRate = parseFloat(currentRate.certifiedHourlyRate)
                    
                    if (!isCertifiedAppt && currentRate.qualifiedHourlyRate) {
                        hourlyRate = parseFloat(currentRate.qualifiedHourlyRate)
                    }
                    
                    const minimumHours = parseFloat(currentRate.minimumHours || '2')

                    let serviceHours = minimumHours

                    if (appt.actualDurationMinutes && appt.actualDurationMinutes > 0) {
                        // Use actual duration (calculated from endTime - startTime)
                        serviceHours = Math.max(appt.actualDurationMinutes / 60, minimumHours)
                    } else if (appt.projectedDuration) {
                        // Parse projected duration strings like "5h", "45m", "1h30m"
                        const parsedMinutes = parseProjectedDuration(appt.projectedDuration)
                        if (parsedMinutes && parsedMinutes > 0) {
                            serviceHours = Math.max(parsedMinutes / 60, minimumHours)
                        }
                    }

                    const serviceAmount = serviceHours * hourlyRate

                    let mileage = 0
                    let mileageRate = 0
                    let mileageAmount = 0

                    if (appt.mileageApproved && appt.actualMiles) {
                        mileage = parseFloat(appt.actualMiles)
                        mileageRate = parseFloat(currentRate.mileageRate || '0')
                        mileageAmount = mileage * mileageRate
                    }

                    let adjustmentType: string | null = null
                    let adjustmentAmount = 0

                    if (appt.status === 'No Show') {
                        adjustmentType = 'no_show'
                        // Use certified or qualified no show fee based on appointment type
                        if (isCertifiedAppt) {
                            adjustmentAmount = parseFloat(currentRate.certifiedNoShowFee || '0')
                        } else {
                            adjustmentAmount = parseFloat(currentRate.qualifiedNoShowFee || '0')
                        }
                    } else if (appt.status === 'Late CX') {
                        adjustmentType = 'late_cancel'
                        // Use certified or qualified late cancel fee based on appointment type
                        if (isCertifiedAppt) {
                            adjustmentAmount = parseFloat(currentRate.certifiedLateCancelFee || '0')
                        } else {
                            adjustmentAmount = parseFloat(currentRate.qualifiedLateCancelFee || '0')
                        }
                        // Late cancel = no mileage (interpreter never went)
                        mileage = 0
                        mileageRate = 0
                        mileageAmount = 0
                    }

                    // Calculate line total
                    let lineTotal: number
                    if (adjustmentType === 'no_show') {
                        // No Show: Fee + Mileage (interpreter showed up)
                        lineTotal = adjustmentAmount + mileageAmount
                    } else if (adjustmentType === 'late_cancel') {
                        // Late Cancel: Fee only (interpreter never went)
                        lineTotal = adjustmentAmount
                    } else {
                        // Normal appointment: Service + Mileage
                        lineTotal = serviceAmount + mileageAmount
                    }

                    const apptType = isCertifiedAppt ? 'Certified' : 'Qualified'
                    const description = `${appt.date.toLocaleDateString()} - ${appt.patientFirstName} ${appt.patientLastName} at ${appt.facilityName} (${apptType})${adjustmentType ? ` - ${adjustmentType.replace('_', ' ').toUpperCase()}` : ''}`

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

                await db.transaction(async (tx) => {
                    const payoutNumber = await generatePayoutNumber()

                    const [newPayout] = await tx
                        .insert(payouts)
                        .values({
                            id: createId(),
                            payoutNumber,
                            interpreterId,
                            periodStart: values.periodStart,
                            periodEnd: values.periodEnd,
                            subtotal: subtotal.toFixed(2),
                            adjustments: '0.00',
                            total: subtotal.toFixed(2),
                            status: 'pending',
                            scheduledDate: values.scheduledDate,
                        })
                        .returning()

                    const lineItemsWithPayoutId = lineItemsData.map(item => ({
                        ...item,
                        payoutId: newPayout.id,
                    }))

                    await tx.insert(payoutLineItems).values(lineItemsWithPayoutId)

                    for (const appt of appts) {
                        await tx
                            .update(appointments)
                            .set({ payoutStatus: 'scheduled' })
                            .where(eq(appointments.id, appt.id))
                    }

                    generatedPayouts.push({
                        interpreterId,
                        payoutNumber,
                        total: subtotal.toFixed(2),
                        lineItemCount: lineItemsData.length,
                    })

                    console.log(`[Payouts] Generated payout ${payoutNumber} for interpreter ${interpreterId}: $${subtotal.toFixed(2)}`)
                })
            }

            return c.json({
                data: generatedPayouts,
                message: `Generated ${generatedPayouts.length} payouts`
            })
        }
    )

    // ========================================================================
    // UPDATE PAYOUT (status, notes)
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
                scheduledDate: z.coerce.date().optional(),
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

            const updateData: Record<string, unknown> = { ...values }

            if (values.adjustments !== undefined) {
                const [currentPayout] = await db
                    .select({ subtotal: payouts.subtotal })
                    .from(payouts)
                    .where(eq(payouts.id, id))
                    .limit(1)

                if (currentPayout) {
                    const newTotal = parseFloat(currentPayout.subtotal || '0') + parseFloat(values.adjustments)
                    updateData.total = newTotal.toFixed(2)
                }
            }

            const [data] = await db
                .update(payouts)
                .set(updateData)
                .where(eq(payouts.id, id))
                .returning()

            if (!data) {
                return c.json({ error: "Payout not found" }, 404)
            }

            console.log(`[Payouts] Updated payout ${data.payoutNumber}`)

            return c.json({ data })
        }
    )

    // ========================================================================
    // MARK PAYOUT AS PAID
    // ========================================================================
    .post(
        '/:id/mark-paid',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        zValidator(
            'json',
            z.object({
                paymentMethod: z.string(),
                paymentReference: z.string().optional(),
                paidAt: z.coerce.date().optional(),
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
                .update(payouts)
                .set({
                    status: 'paid',
                    paidAt: values.paidAt || new Date(),
                    paymentMethod: values.paymentMethod,
                    paymentReference: values.paymentReference,
                })
                .where(eq(payouts.id, id))
                .returning()

            if (!data) {
                return c.json({ error: "Payout not found" }, 404)
            }

            const lineItems = await db
                .select({ appointmentId: payoutLineItems.appointmentId })
                .from(payoutLineItems)
                .where(eq(payoutLineItems.payoutId, id))

            for (const item of lineItems) {
                if (item.appointmentId) {
                    await db
                        .update(appointments)
                        .set({ payoutStatus: 'paid' })
                        .where(eq(appointments.id, item.appointmentId))
                }
            }

            console.log(`[Payouts] Marked payout ${data.payoutNumber} as paid via ${values.paymentMethod}`)

            return c.json({ data })
        }
    )

    // ========================================================================
    // EXPORT PAYOUTS AS CSV (For Bank ACH Upload)
    // ========================================================================
    .get(
        '/export',
        clerkMiddleware(),
        zValidator('query', z.object({
            status: z.string().optional(),
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

            const { status } = c.req.valid('query')

            const conditions = []
            if (status) conditions.push(eq(payouts.status, status))

            const data = await db
                .select({
                    payoutNumber: payouts.payoutNumber,
                    interpreterFirstName: interpreter.firstName,
                    interpreterLastName: interpreter.lastName,
                    interpreterEmail: interpreter.email,
                    total: payouts.total,
                    status: payouts.status,
                    periodStart: payouts.periodStart,
                    periodEnd: payouts.periodEnd,
                })
                .from(payouts)
                .leftJoin(interpreter, eq(payouts.interpreterId, interpreter.id))
                .where(conditions.length > 0 ? and(...conditions) : undefined)
                .orderBy(asc(interpreter.lastName))

            const headers = [
                'Payout Number',
                'Interpreter Name',
                'Email',
                'Amount',
                'Period Start',
                'Period End',
                'Status'
            ]

            const rows = data.map(item => [
                item.payoutNumber,
                `"${item.interpreterFirstName} ${item.interpreterLastName}"`,
                item.interpreterEmail,
                item.total,
                item.periodStart.toLocaleDateString(),
                item.periodEnd.toLocaleDateString(),
                item.status,
            ])

            const csv = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n')

            return new Response(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="payouts-${new Date().toISOString().split('T')[0]}.csv"`
                }
            })
        }
    )

    // ========================================================================
    // EXPORT SINGLE PAYOUT AS CSV
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

            const [payout] = await db
                .select({
                    payoutNumber: payouts.payoutNumber,
                    interpreterName: sql<string>`${interpreter.firstName} || ' ' || ${interpreter.lastName}`,
                    periodStart: payouts.periodStart,
                    periodEnd: payouts.periodEnd,
                    total: payouts.total,
                })
                .from(payouts)
                .leftJoin(interpreter, eq(payouts.interpreterId, interpreter.id))
                .where(eq(payouts.id, id))
                .limit(1)

            if (!payout) {
                return c.json({ error: "Payout not found" }, 404)
            }

            const lineItems = await db
                .select({
                    description: payoutLineItems.description,
                    serviceDate: payoutLineItems.serviceDate,
                    serviceHours: payoutLineItems.serviceHours,
                    serviceRate: payoutLineItems.serviceRate,
                    serviceAmount: payoutLineItems.serviceAmount,
                    mileage: payoutLineItems.mileage,
                    mileageRate: payoutLineItems.mileageRate,
                    mileageAmount: payoutLineItems.mileageAmount,
                    adjustmentType: payoutLineItems.adjustmentType,
                    adjustmentAmount: payoutLineItems.adjustmentAmount,
                    lineTotal: payoutLineItems.lineTotal,
                })
                .from(payoutLineItems)
                .where(eq(payoutLineItems.payoutId, id))
                .orderBy(asc(payoutLineItems.serviceDate))

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
                `Payout: ${payout.payoutNumber}`,
                `Interpreter: ${payout.interpreterName}`,
                `Period: ${payout.periodStart.toLocaleDateString()} - ${payout.periodEnd.toLocaleDateString()}`,
                `Total: $${payout.total}`,
                '',
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n')

            return new Response(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${payout.payoutNumber}.csv"`
                }
            })
        }
    )

export default app