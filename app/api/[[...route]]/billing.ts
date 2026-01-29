import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {
    appointments,
    invoices,
    payouts,
    payers,
    payerLanguageRates,
    interpreter,
    interpreterRates,
    patient,
    facilities,
} from "@/db/schema"
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { and, eq, gte, lte, sql, isNull, sum, count } from "drizzle-orm"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"

const app = new Hono()

    // ========================================================================
    // GET BILLING DASHBOARD STATS
    // ========================================================================
    .get(
        '/dashboard',
        clerkMiddleware(),
        zValidator('query', z.object({
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

            const { startDate, endDate } = c.req.valid('query')

            // Default to current month if no dates provided
            const now = new Date()
            const periodStart = startDate 
                ? new Date(startDate) 
                : new Date(now.getFullYear(), now.getMonth(), 1)
            const periodEnd = endDate 
                ? new Date(endDate) 
                : new Date(now.getFullYear(), now.getMonth() + 1, 0)

            // Revenue stats (from invoices)
            const [invoiceStats] = await db
                .select({
                    totalInvoiced: sql<string>`COALESCE(SUM(${invoices.total}), 0)`,
                    totalPaid: sql<string>`COALESCE(SUM(${invoices.paidAmount}), 0)`,
                    invoiceCount: count(invoices.id),
                })
                .from(invoices)
                .where(
                    and(
                        gte(invoices.periodStart, periodStart),
                        lte(invoices.periodEnd, periodEnd)
                    )
                )

            // Outstanding invoices (sent but not fully paid)
            const [outstandingStats] = await db
                .select({
                    totalOutstanding: sql<string>`COALESCE(SUM(${invoices.total} - COALESCE(${invoices.paidAmount}, 0)), 0)`,
                    outstandingCount: count(invoices.id),
                })
                .from(invoices)
                .where(
                    and(
                        sql`${invoices.status} IN ('sent', 'partial', 'overdue')`,
                        gte(invoices.periodStart, periodStart),
                        lte(invoices.periodEnd, periodEnd)
                    )
                )

            // Overdue invoices
            const [overdueStats] = await db
                .select({
                    totalOverdue: sql<string>`COALESCE(SUM(${invoices.total} - COALESCE(${invoices.paidAmount}, 0)), 0)`,
                    overdueCount: count(invoices.id),
                })
                .from(invoices)
                .where(
                    and(
                        eq(invoices.status, 'overdue'),
                        gte(invoices.periodStart, periodStart),
                        lte(invoices.periodEnd, periodEnd)
                    )
                )

            // Payout stats (to interpreters)
            const [payoutStats] = await db
                .select({
                    totalPayouts: sql<string>`COALESCE(SUM(${payouts.total}), 0)`,
                    totalPaidOut: sql<string>`COALESCE(SUM(CASE WHEN ${payouts.status} = 'paid' THEN ${payouts.total} ELSE 0 END), 0)`,
                    payoutCount: count(payouts.id),
                })
                .from(payouts)
                .where(
                    and(
                        gte(payouts.periodStart, periodStart),
                        lte(payouts.periodEnd, periodEnd)
                    )
                )

            // Pending payouts
            const [pendingPayoutStats] = await db
                .select({
                    totalPending: sql<string>`COALESCE(SUM(${payouts.total}), 0)`,
                    pendingCount: count(payouts.id),
                })
                .from(payouts)
                .where(
                    and(
                        eq(payouts.status, 'pending'),
                        gte(payouts.periodStart, periodStart),
                        lte(payouts.periodEnd, periodEnd)
                    )
                )

            // Appointment stats
            const [appointmentStats] = await db
                .select({
                    totalAppointments: count(appointments.id),
                    completedCount: sql<number>`COUNT(CASE WHEN ${appointments.status} IN ('Closed', 'Confirmed') THEN 1 END)`,
                    noShowCount: sql<number>`COUNT(CASE WHEN ${appointments.status} = 'No Show' THEN 1 END)`,
                    lateCancelCount: sql<number>`COUNT(CASE WHEN ${appointments.status} = 'Late CX' THEN 1 END)`,
                    pendingBillingCount: sql<number>`COUNT(CASE WHEN ${appointments.billingStatus} = 'pending' THEN 1 END)`,
                    pendingPayoutCount: sql<number>`COUNT(CASE WHEN ${appointments.payoutStatus} = 'pending' THEN 1 END)`,
                })
                .from(appointments)
                .where(
                    and(
                        gte(appointments.date, periodStart),
                        lte(appointments.date, periodEnd)
                    )
                )

            // Calculate margins
            const totalRevenue = parseFloat(invoiceStats?.totalPaid || '0')
            const totalExpenses = parseFloat(payoutStats?.totalPaidOut || '0')
            const grossMargin = totalRevenue - totalExpenses
            const marginPercent = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0

            return c.json({
                data: {
                    period: {
                        start: periodStart,
                        end: periodEnd,
                    },
                    revenue: {
                        totalInvoiced: invoiceStats?.totalInvoiced || '0',
                        totalPaid: invoiceStats?.totalPaid || '0',
                        invoiceCount: invoiceStats?.invoiceCount || 0,
                    },
                    outstanding: {
                        total: outstandingStats?.totalOutstanding || '0',
                        count: outstandingStats?.outstandingCount || 0,
                    },
                    overdue: {
                        total: overdueStats?.totalOverdue || '0',
                        count: overdueStats?.overdueCount || 0,
                    },
                    payouts: {
                        total: payoutStats?.totalPayouts || '0',
                        totalPaid: payoutStats?.totalPaidOut || '0',
                        count: payoutStats?.payoutCount || 0,
                    },
                    pendingPayouts: {
                        total: pendingPayoutStats?.totalPending || '0',
                        count: pendingPayoutStats?.pendingCount || 0,
                    },
                    appointments: {
                        total: appointmentStats?.totalAppointments || 0,
                        completed: appointmentStats?.completedCount || 0,
                        noShow: appointmentStats?.noShowCount || 0,
                        lateCancel: appointmentStats?.lateCancelCount || 0,
                        pendingBilling: appointmentStats?.pendingBillingCount || 0,
                        pendingPayout: appointmentStats?.pendingPayoutCount || 0,
                    },
                    margin: {
                        gross: grossMargin.toFixed(2),
                        percent: marginPercent.toFixed(2),
                    },
                }
            })
        }
    )

    // ========================================================================
    // GET BILLING DETAILS FOR SINGLE APPOINTMENT
    // ========================================================================
    .get(
        '/appointment/:id',
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

            // Get appointment with all related data
            const [appointment] = await db
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
                    billingStatus: appointments.billingStatus,
                    payoutStatus: appointments.payoutStatus,
                    payerId: appointments.payerId,
                    payerName: payers.name,
                    payerType: payers.type,
                    interpreterId: appointments.interpreterId,
                    interpreterFirstName: interpreter.firstName,
                    interpreterLastName: interpreter.lastName,
                    patientFirstName: patient.firstName,
                    patientLastName: patient.lastName,
                    facilityName: facilities.name,
                })
                .from(appointments)
                .leftJoin(payers, eq(appointments.payerId, payers.id))
                .leftJoin(interpreter, eq(appointments.interpreterId, interpreter.id))
                .leftJoin(patient, eq(appointments.patientId, patient.id))
                .leftJoin(facilities, eq(appointments.facilityId, facilities.id))
                .where(eq(appointments.id, id))
                .limit(1)

            if (!appointment) {
                return c.json({ error: "Appointment not found" }, 404)
            }

            return c.json({ data: appointment })
        }
    )

    // ========================================================================
    // UPDATE BILLING FIELDS ON APPOINTMENT
    // ========================================================================
    .patch(
        '/appointment/:id',
        clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string()
        })),
        zValidator(
            'json',
            z.object({
                payerId: z.string().optional().nullable(),
                language: z.string().optional().nullable(),
                mileageApproved: z.boolean().optional(),
                actualMiles: z.string().optional().nullable(),
                actualDurationMinutes: z.number().optional().nullable(),
                billingStatus: z.string().optional(),
                payoutStatus: z.string().optional(),
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
                .update(appointments)
                .set(values)
                .where(eq(appointments.id, id))
                .returning()

            if (!data) {
                return c.json({ error: "Appointment not found" }, 404)
            }

            console.log(`[Billing] Updated billing fields for appointment ${data.bookingId}`)

            return c.json({ data })
        }
    )

    // ========================================================================
    // PREVIEW BILLING CALCULATION FOR APPOINTMENT
    // ========================================================================
    .get(
        '/calculate/:id',
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

            // Get appointment
            const [appointment] = await db
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
                    payerId: appointments.payerId,
                    interpreterId: appointments.interpreterId,
                })
                .from(appointments)
                .where(eq(appointments.id, id))
                .limit(1)

            if (!appointment) {
                return c.json({ error: "Appointment not found" }, 404)
            }

            // Initialize billing preview
            const billing = {
                billToInsurance: {
                    serviceHours: 0,
                    serviceRate: 0,
                    serviceAmount: 0,
                    mileage: 0,
                    mileageRate: 0,
                    mileageAmount: 0,
                    adjustmentType: null as string | null,
                    adjustmentAmount: 0,
                    total: 0,
                },
                payToInterpreter: {
                    serviceHours: 0,
                    serviceRate: 0,
                    serviceAmount: 0,
                    mileage: 0,
                    mileageRate: 0,
                    mileageAmount: 0,
                    adjustmentType: null as string | null,
                    adjustmentAmount: 0,
                    total: 0,
                },
                margin: 0,
                marginPercent: 0,
                warnings: [] as string[],
            }

            // Get payer rates
            let payerRate = {
                hourlyRate: 0,
                mileageRate: 0,
                minimumHours: 2,
                lateCancelFee: 0,
                noShowFee: 0,
            }

            if (appointment.payerId) {
                const [payer] = await db
                    .select()
                    .from(payers)
                    .where(eq(payers.id, appointment.payerId))
                    .limit(1)

                if (payer) {
                    payerRate.hourlyRate = parseFloat(payer.defaultHourlyRate || '0')
                    payerRate.mileageRate = parseFloat(payer.defaultMileageRate || '0')
                    payerRate.minimumHours = parseFloat(payer.minimumHours || '2')
                    payerRate.lateCancelFee = parseFloat(payer.lateCancelFee || '0')
                    payerRate.noShowFee = parseFloat(payer.noShowFee || '0')

                    // Check for language-specific rate
                    if (appointment.language) {
                        const [langRate] = await db
                            .select()
                            .from(payerLanguageRates)
                            .where(
                                and(
                                    eq(payerLanguageRates.payerId, appointment.payerId),
                                    eq(payerLanguageRates.language, appointment.language)
                                )
                            )
                            .limit(1)

                        if (langRate) {
                            payerRate.hourlyRate = parseFloat(langRate.hourlyRate)
                            if (langRate.minimumHours) {
                                payerRate.minimumHours = parseFloat(langRate.minimumHours)
                            }
                        }
                    }
                }
            } else {
                billing.warnings.push('No payer assigned - cannot calculate insurance billing')
            }

            // Get interpreter rates
            let interpRate = {
                hourlyRate: 0,
                mileageRate: 0,
                minimumHours: 2,
                lateCancelFee: 0,
                noShowFee: 0,
            }

            if (appointment.interpreterId) {
                const [currentRate] = await db
                    .select()
                    .from(interpreterRates)
                    .where(
                        and(
                            eq(interpreterRates.interpreterId, appointment.interpreterId),
                            isNull(interpreterRates.endDate)
                        )
                    )
                    .limit(1)

                if (currentRate) {
                    interpRate.hourlyRate = parseFloat(currentRate.hourlyRate)
                    interpRate.mileageRate = parseFloat(currentRate.mileageRate || '0')
                    interpRate.minimumHours = parseFloat(currentRate.minimumHours || '2')
                    interpRate.lateCancelFee = parseFloat(currentRate.lateCancelFee || '0')
                    interpRate.noShowFee = parseFloat(currentRate.noShowFee || '0')
                } else {
                    billing.warnings.push('No rate configured for interpreter')
                }
            } else {
                billing.warnings.push('No interpreter assigned - cannot calculate payout')
            }

            // Calculate service hours
            let serviceHours = Math.max(payerRate.minimumHours, interpRate.minimumHours)
            if (appointment.actualDurationMinutes) {
                serviceHours = Math.max(
                    appointment.actualDurationMinutes / 60,
                    Math.max(payerRate.minimumHours, interpRate.minimumHours)
                )
            } else if (appointment.projectedDuration) {
                const parsed = parseFloat(appointment.projectedDuration)
                if (!isNaN(parsed)) {
                    serviceHours = Math.max(
                        parsed,
                        Math.max(payerRate.minimumHours, interpRate.minimumHours)
                    )
                }
            }

            // Calculate mileage
            let mileage = 0
            if (appointment.mileageApproved && appointment.actualMiles) {
                mileage = parseFloat(appointment.actualMiles)
            }

            // Check for adjustments (no-show, late cancel)
            const isNoShow = appointment.status === 'No Show'
            const isLateCancel = appointment.status === 'Late CX'

            // Calculate bill to insurance
            if (isNoShow) {
                billing.billToInsurance.adjustmentType = 'no_show'
                billing.billToInsurance.adjustmentAmount = payerRate.noShowFee
                billing.billToInsurance.total = payerRate.noShowFee
            } else if (isLateCancel) {
                billing.billToInsurance.adjustmentType = 'late_cancel'
                billing.billToInsurance.adjustmentAmount = payerRate.lateCancelFee
                billing.billToInsurance.total = payerRate.lateCancelFee
            } else {
                billing.billToInsurance.serviceHours = serviceHours
                billing.billToInsurance.serviceRate = payerRate.hourlyRate
                billing.billToInsurance.serviceAmount = serviceHours * payerRate.hourlyRate
                billing.billToInsurance.mileage = mileage
                billing.billToInsurance.mileageRate = payerRate.mileageRate
                billing.billToInsurance.mileageAmount = mileage * payerRate.mileageRate
                billing.billToInsurance.total = 
                    billing.billToInsurance.serviceAmount + billing.billToInsurance.mileageAmount
            }

            // Calculate pay to interpreter
            if (isNoShow) {
                billing.payToInterpreter.adjustmentType = 'no_show'
                billing.payToInterpreter.adjustmentAmount = interpRate.noShowFee
                billing.payToInterpreter.total = interpRate.noShowFee
            } else if (isLateCancel) {
                billing.payToInterpreter.adjustmentType = 'late_cancel'
                billing.payToInterpreter.adjustmentAmount = interpRate.lateCancelFee
                billing.payToInterpreter.total = interpRate.lateCancelFee
            } else {
                billing.payToInterpreter.serviceHours = serviceHours
                billing.payToInterpreter.serviceRate = interpRate.hourlyRate
                billing.payToInterpreter.serviceAmount = serviceHours * interpRate.hourlyRate
                billing.payToInterpreter.mileage = mileage
                billing.payToInterpreter.mileageRate = interpRate.mileageRate
                billing.payToInterpreter.mileageAmount = mileage * interpRate.mileageRate
                billing.payToInterpreter.total = 
                    billing.payToInterpreter.serviceAmount + billing.payToInterpreter.mileageAmount
            }

            // Calculate margin
            billing.margin = billing.billToInsurance.total - billing.payToInterpreter.total
            billing.marginPercent = billing.billToInsurance.total > 0
                ? (billing.margin / billing.billToInsurance.total) * 100
                : 0

            return c.json({
                data: {
                    appointment: {
                        id: appointment.id,
                        bookingId: appointment.bookingId,
                        date: appointment.date,
                        status: appointment.status,
                        language: appointment.language,
                    },
                    billing,
                }
            })
        }
    )

export default app