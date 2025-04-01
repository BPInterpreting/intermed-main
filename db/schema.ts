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
    varchar
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import {relations} from "drizzle-orm";
import {z} from "zod";

export const patient = pgTable("patients", {
    id: text("id").primaryKey(),
    firstName: varchar("firstName").notNull(),
    lastName: varchar("lastName").notNull(),
    email: varchar("email").notNull(),
    phoneNumber: varchar("phoneNumber").notNull(),
    insuranceCarrier: varchar("insuranceCarrier"),
    preferredLanguage: varchar("preferredLanguage"),
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
    email: varchar("email").notNull(),
    phoneNumber: varchar("phoneNumber").notNull(),
    facilityType: varchar("facilityType").notNull(),
    averageWaitTime: varchar("averageWaitTime").notNull(),
    operatingHours: varchar("operatingHours").notNull(),
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
    isCertified: boolean('is_certified').default(false),
    clerkUserId: text("clerkUserId").notNull().unique(), //stores the clerk id of the user
    // targetLanguages: varchar("targetLanguages").notNull(),
    // isCertified: boolean("isCertified").notNull(),
    // specialty: varchar("specialty").notNull(),
    // coverageArea: varchar("coverageArea").notNull(),
})

export const interpreterRelations = relations(interpreter, ({ many }) => ({
    appointments: many(appointments)
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
    notes: text("notes"),
    appointmentType : varchar("appointmentType"),
    status: varchar("status").default('Pending'),
    patientId: text("patient_id").references(() => patient.id, {
        onDelete: "cascade",
    }),
    facilityId: text("facility_id").references(() => facilities.id, {
        onDelete: "cascade",
    }),
    interpreterId: text("interpreter_id").references(() => interpreter.id, {
        onDelete: "cascade",
    }),

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
    })
}))

export const insertAppointmentSchema = createInsertSchema(appointments, {
    date: z.coerce.date(),
})

export const followUpRequest = pgTable("follow_up_request", {
    id: text("id").primaryKey(),
    date: timestamp("date", {mode: "date"}).notNull(),
    startTime: time("start_time", {withTimezone: false}).notNull(),
    projectedDuration: varchar("projected_duration"),
    notes: text("notes"),
    appointmentType : varchar("appointmentType"),
    status: varchar("status").default('Pending'),
    newFacilityAddress: text("new_facility_address"),
    patientId: text("patient_id").references(() => patient.id, {
        onDelete: "cascade",
    }),
    facilityId: text("facility_id").references(() => facilities.id, {
        onDelete: "cascade",
    }),
    interpreterId: text("interpreter_id").references(() => interpreter.id, {
        onDelete: "cascade",
    }),

})
export const insertFollowUpRequestSchema = createInsertSchema(followUpRequest, {
    date: z.coerce.date(),
})