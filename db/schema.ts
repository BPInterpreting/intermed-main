import {
    boolean,
    integer,
    interval,
    numeric,
    pgTable,
    serial,
    text,
    time,
    timestamp,
    varchar,
    date
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import {relations} from "drizzle-orm";
import {z} from "zod";

export const patient = pgTable("patients", {
    id: text("id").primaryKey(),
    patientId: varchar("patient_id").unique(),
    firstName: varchar("firstName").notNull(),
    lastName: varchar("lastName").notNull(),
    email: varchar("email").notNull(),
    phoneNumber: varchar("phoneNumber").notNull(),
    claimNumber: varchar("claimNumber"),
    dateOfBirth: timestamp("date_of_birth", {mode: "date"}),
    insuranceCarrier: varchar("insuranceCarrier"),
    preferredLanguage: varchar("preferredLanguage"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})

export const patientsRelations = relations(patient, ({ many }) => ({
    appointments: many(appointments)
}))

export const insertPatientSchema = createInsertSchema(patient)

export const facilities = pgTable("facilities", {
    id: text("id").primaryKey(),
    name: varchar("name").notNull(),
    address: text("address").notNull(),
    longitude: numeric("longitude").notNull(),
    latitude: numeric("latitude").notNull(),
    email: varchar("email"),
    phoneNumber: varchar("phoneNumber"),
    facilityType: varchar("facilityType").notNull(),
    averageWaitTime: varchar("averageWaitTime").notNull(),
    operatingHours: varchar("operatingHours").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})

export const facilitiesRelations = relations(facilities, ({ many }) => ({
    appointments: many(appointments)
}))

export const insertFacilitySchema = createInsertSchema(facilities)

export const interpreter =pgTable("interpreter", {
    id: text("id").primaryKey(),
    firstName: varchar("firstName").notNull(),
    lastName: varchar("lastName").notNull(),
    email: varchar("email").notNull(),
    phoneNumber: varchar("phoneNumber").notNull(),
    address: text("address"),
    longitude: numeric("longitude"),
    latitude: numeric("latitude"),
    isCertified: boolean('is_certified').default(false),
    clerkUserId: text("clerkUserId").notNull().unique(), //stores the clerk id of the user
    expoPushToken: text("expo_push_token"), // stores the expo push token for notifications
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    // targetLanguages: varchar("targetLanguages").notNull(),
    // isCertified: boolean("isCertified").notNull(),
    // specialty: varchar("specialty").notNull(),
    // coverageArea: varchar("coverageArea").notNull(),
})

export const interpreterRelations = relations(interpreter, ({ many }) => ({
    appointments: many(appointments),
    rates: many(interpreterRates),
    payouts: many(payouts),
}))

export const insertInterpreterSchema = createInsertSchema(interpreter)

export const appointments = pgTable("appointments", {
    id: text("id").primaryKey(),
    bookingId: integer().unique().generatedAlwaysAsIdentity({ startWith: 100000 }),
    date: timestamp("date", {mode: "date"}).notNull(),
    startTime: time("start_time", {withTimezone: false}).notNull(),
    projectedEndTime: time("projected_end_time", {withTimezone: false}),
    endTime: time("end_time", {withTimezone: false}),
    projectedDuration: varchar("projected_duration"),
    duration: interval("duration"),
    isCertified: boolean('is_certified').default(false),
    adminNotes: text("admin_notes"),
    interpreterNotes: text('interpreter_notes'),
    notes: text("notes"),
    appointmentType : varchar("appointmentType"),
    status: varchar("status").default('Pending'),
    offerMode: boolean('offerMode').default(false),
    searchRadius: integer('search_radius').default(30).notNull(),
    radiusExpandedAt: timestamp('radius_expanded_at', {mode: 'date'}),
    radiusExpandedBy: text("radius_expanded_by"),
    offerSentAt: timestamp('offer_sent_at', {mode: 'date'}),
    assignedAt: timestamp("assigned_at", {mode: 'date'}),
    isRushAppointment: boolean('is_rush_appointment').default(false),
    payerId: text("payer_id").references(() => payers.id, { onDelete: "set null" }),
    language: varchar("language"),                                // Language for this appointment
    mileageApproved: boolean("mileage_approved").default(true),   // Is mileage reimbursable?
    actualMiles: numeric("actual_miles", { precision: 8, scale: 2 }),
    actualDurationMinutes: integer("actual_duration_minutes"),
    billingStatus: varchar("billing_status").default("pending"),  // pending, ready, invoiced, paid
    payoutStatus: varchar("payout_status").default("pending"),    // pending, scheduled, paid
    patientId: text("patient_id").references(() => patient.id, {
        onDelete: "set null",
    }),
    facilityId: text("facility_id").references(() => facilities.id, {
        onDelete: "set null",
    }),
    interpreterId: text("interpreter_id").references(() => interpreter.id, {
        onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),

})

// create a relation between appointments and patients which references the patient id
export const appointmentsRelations = relations(appointments, ({ one }) => ({
    patient: one(patient, {
        fields: [appointments.patientId],
        references: [patient.id]
    }),
    facility: one(facilities, {
        fields: [appointments.facilityId],
        references: [facilities.id]
    }),
    interpreter: one(interpreter, {
        fields: [appointments.interpreterId],
        references: [interpreter.id]
    }),
    payer: one(payers, {
        fields: [appointments.payerId],
        references: [payers.id]
    }),
}))

export const insertAppointmentSchema = createInsertSchema(appointments, {
    date: z.coerce.date(),
})

export const appointmentOffers = pgTable("appointmentOffers", {
    id: text("id").primaryKey(),
    appointmentId: text("appointment_id").references(() => appointments.id, {
        onDelete: "cascade",
    }).notNull(),
    interpreterId: text("interpreter_id").references(() => interpreter.id, {
        onDelete: "cascade",
    }).notNull(),
    notifiedAt: timestamp('notified_at', {mode: 'date'}).notNull().defaultNow(),
    viewedAt: timestamp('viewed_at', {mode: 'date'}),
    respondedAt: timestamp('responded_at', {mode: 'date'}),
    response: varchar("response"),
    distanceMiles: numeric("distance_miles"),
    hasFacilityHistory: boolean('has_facility_history').default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const appointmentOffersRelations = relations(appointmentOffers, ({ one }) => ({
    appointment: one(appointments, {
        fields: [appointmentOffers.appointmentId],
        references: [appointments.id]
    }),
    interpreter: one(interpreter, {
        fields: [appointmentOffers.interpreterId],
        references: [interpreter.id]
    })
}))

// Add the insert schema
export const insertAppointmentOfferSchema = createInsertSchema(appointmentOffers)

export const notifications = pgTable("notifications", {
    id: text("id").primaryKey(),
    userId: text('user_id').notNull(), //this gets the clerkId of the user
    message: text("message").notNull(),
    subtext: text("sub_text"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    link: text('link') //this optional link goes to url that is clicked
})

// ============================================================================
// BILLING SYSTEM TABLES
// ============================================================================

// PAYERS - Insurance companies that pay the agency
export const payers = pgTable("payers", {
    id: text("id").primaryKey(),
    name: varchar("name").notNull(),                              // "State Fund Workers Comp"
    type: varchar("type").notNull(),                              // workers_comp, medi_cal, private, self_pay
    defaultHourlyRate: numeric("default_hourly_rate", { precision: 10, scale: 2 }),
    defaultMileageRate: numeric("default_mileage_rate", { precision: 10, scale: 2 }),
    minimumHours: numeric("minimum_hours", { precision: 4, scale: 2 }).default("2.00"),
    lateCancelFee: numeric("late_cancel_fee", { precision: 10, scale: 2 }),    // CHANGED: dollar amount
    noShowFee: numeric("no_show_fee", { precision: 10, scale: 2 }),            // CHANGED: dollar amount
    paymentTermsDays: integer("payment_terms_days").default(30),
    billingCode: varchar("billing_code"),                         // Reference code for tracking
    notes: text("notes"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})

// PAYER LANGUAGE RATES - Language-specific rates for each payer
export const payerLanguageRates = pgTable("payer_language_rates", {
    id: text("id").primaryKey(),
    payerId: text("payer_id").references(() => payers.id, { onDelete: "cascade" }).notNull(),
    language: varchar("language").notNull(),                      // "Spanish", "Mandarin", "ASL"
    hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }).notNull(),
    minimumHours: numeric("minimum_hours", { precision: 4, scale: 2 }), // Override payer default
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})

// INTERPRETER RATES - Compensation agreements with interpreters (with history)
export const interpreterRates = pgTable("interpreter_rates", {
    id: text("id").primaryKey(),
    interpreterId: text("interpreter_id").references(() => interpreter.id, { onDelete: "cascade" }).notNull(),
    hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }).notNull(),     // e.g., $55.00
    mileageRate: numeric("mileage_rate", { precision: 10, scale: 2 }).default("0.00"), // e.g., $0.56
    acceptsNoMileage: boolean("accepts_no_mileage").default(false).notNull(),
    minimumHours: numeric("minimum_hours", { precision: 4, scale: 2 }).default("2.00"),
    lateCancelFee: numeric("late_cancel_fee", { precision: 10, scale: 2 }),         // e.g., $80.00
    noShowFee: numeric("no_show_fee", { precision: 10, scale: 2 }),                 // e.g., $80.00
    effectiveDate: timestamp("effective_date", { mode: "date" }).notNull(),
    endDate: timestamp("end_date", { mode: "date" }),             // null = current rate
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})

// INVOICES - Billing to insurance/payers
export const invoices = pgTable("invoices", {
    id: text("id").primaryKey(),
    invoiceNumber: varchar("invoice_number").unique().notNull(),  // "INV-2025-0001"
    payerId: text("payer_id").references(() => payers.id, { onDelete: "set null" }),
    periodStart: timestamp("period_start", { mode: "date" }).notNull(),
    periodEnd: timestamp("period_end", { mode: "date" }).notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    adjustments: numeric("adjustments", { precision: 10, scale: 2 }).default("0.00"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status").default("draft").notNull(),         // draft, sent, partial, paid, overdue, disputed
    sentAt: timestamp("sent_at", { mode: "date" }),
    dueDate: timestamp("due_date", { mode: "date" }),
    paidAt: timestamp("paid_at", { mode: "date" }),
    paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})

// INVOICE LINE ITEMS - Individual appointments on an invoice
export const invoiceLineItems = pgTable("invoice_line_items", {
    id: text("id").primaryKey(),
    invoiceId: text("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
    appointmentId: text("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
    description: text("description").notNull(),
    serviceDate: timestamp("service_date", { mode: "date" }).notNull(),
    serviceHours: numeric("service_hours", { precision: 6, scale: 2 }).notNull(),
    serviceRate: numeric("service_rate", { precision: 10, scale: 2 }).notNull(),
    serviceAmount: numeric("service_amount", { precision: 10, scale: 2 }).notNull(),
    mileage: numeric("mileage", { precision: 8, scale: 2 }),
    mileageRate: numeric("mileage_rate", { precision: 10, scale: 2 }),
    mileageAmount: numeric("mileage_amount", { precision: 10, scale: 2 }),
    adjustmentType: varchar("adjustment_type"),                   // no_show, late_cancel, null
    adjustmentAmount: numeric("adjustment_amount", { precision: 10, scale: 2 }), // CHANGED: dollar amount
    lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})

// PAYOUTS - Payments to interpreters
export const payouts = pgTable("payouts", {
    id: text("id").primaryKey(),
    payoutNumber: varchar("payout_number").unique().notNull(),    // "PAY-2025-0001"
    interpreterId: text("interpreter_id").references(() => interpreter.id, { onDelete: "set null" }),
    periodStart: timestamp("period_start", { mode: "date" }).notNull(),
    periodEnd: timestamp("period_end", { mode: "date" }).notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    adjustments: numeric("adjustments", { precision: 10, scale: 2 }).default("0.00"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status").default("pending").notNull(),       // pending, scheduled, processing, paid, failed
    scheduledDate: timestamp("scheduled_date", { mode: "date" }),
    paidAt: timestamp("paid_at", { mode: "date" }),
    paymentMethod: varchar("payment_method"),                     // ach, check, manual
    paymentReference: varchar("payment_reference"),               // check #, transaction ID
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})

// PAYOUT LINE ITEMS - Individual appointments in a payout
export const payoutLineItems = pgTable("payout_line_items", {
    id: text("id").primaryKey(),
    payoutId: text("payout_id").references(() => payouts.id, { onDelete: "cascade" }).notNull(),
    appointmentId: text("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
    description: text("description").notNull(),
    serviceDate: timestamp("service_date", { mode: "date" }).notNull(),
    serviceHours: numeric("service_hours", { precision: 6, scale: 2 }).notNull(),
    serviceRate: numeric("service_rate", { precision: 10, scale: 2 }).notNull(),
    serviceAmount: numeric("service_amount", { precision: 10, scale: 2 }).notNull(),
    mileage: numeric("mileage", { precision: 8, scale: 2 }),
    mileageRate: numeric("mileage_rate", { precision: 10, scale: 2 }),
    mileageAmount: numeric("mileage_amount", { precision: 10, scale: 2 }),
    adjustmentType: varchar("adjustment_type"),                   // no_show, late_cancel, null
    adjustmentAmount: numeric("adjustment_amount", { precision: 10, scale: 2 }), // flat fee paid
    lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})

// ============================================================================
// BILLING RELATIONS
// ============================================================================

export const payersRelations = relations(payers, ({ many }) => ({
    languageRates: many(payerLanguageRates),
    appointments: many(appointments),
    invoices: many(invoices),
}))

export const payerLanguageRatesRelations = relations(payerLanguageRates, ({ one }) => ({
    payer: one(payers, {
        fields: [payerLanguageRates.payerId],
        references: [payers.id],
    }),
}))

export const interpreterRatesRelations = relations(interpreterRates, ({ one }) => ({
    interpreter: one(interpreter, {
        fields: [interpreterRates.interpreterId],
        references: [interpreter.id],
    }),
}))

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
    payer: one(payers, {
        fields: [invoices.payerId],
        references: [payers.id],
    }),
    lineItems: many(invoiceLineItems),
}))

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
    invoice: one(invoices, {
        fields: [invoiceLineItems.invoiceId],
        references: [invoices.id],
    }),
    appointment: one(appointments, {
        fields: [invoiceLineItems.appointmentId],
        references: [appointments.id],
    }),
}))

export const payoutsRelations = relations(payouts, ({ one, many }) => ({
    interpreter: one(interpreter, {
        fields: [payouts.interpreterId],
        references: [interpreter.id],
    }),
    lineItems: many(payoutLineItems),
}))

export const payoutLineItemsRelations = relations(payoutLineItems, ({ one }) => ({
    payout: one(payouts, {
        fields: [payoutLineItems.payoutId],
        references: [payouts.id],
    }),
    appointment: one(appointments, {
        fields: [payoutLineItems.appointmentId],
        references: [appointments.id],
    }),
}))

// ============================================================================
// BILLING INSERT SCHEMAS
// ============================================================================

export const insertPayerSchema = createInsertSchema(payers)
export const insertPayerLanguageRateSchema = createInsertSchema(payerLanguageRates)
export const insertInterpreterRateSchema = createInsertSchema(interpreterRates, {
    effectiveDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
})
export const insertInvoiceSchema = createInsertSchema(invoices, {
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    dueDate: z.coerce.date().optional().nullable(),
})
export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems, {
    serviceDate: z.coerce.date(),
})
export const insertPayoutSchema = createInsertSchema(payouts, {
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    scheduledDate: z.coerce.date().optional().nullable(),
})
export const insertPayoutLineItemSchema = createInsertSchema(payoutLineItems, {
    serviceDate: z.coerce.date(),
})