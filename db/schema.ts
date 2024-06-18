import {pgTable, serial, text, time, timestamp, varchar} from "drizzle-orm/pg-core";
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
    address: varchar("address").notNull(),
    city: varchar("city").notNull(),
    state: varchar("state").notNull(),
    county: varchar("county").notNull(),
    zipCode: varchar("zipCode").notNull(),
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

export const appointments = pgTable("appointments", {
    id: text("id").primaryKey(),
    date: timestamp("date", {mode: "date"}).notNull(),
    startTime: time("start_time", {withTimezone: false}).notNull(),
    endTime: time("end_time", {withTimezone: false}),
    notes: text("notes"),
    appointmentType : varchar("appointmentType"),
    patientId: text("patient_id").references(() => patient.id, {
        onDelete: "cascade",
    }),
    facilityId: text("facility_id").references(() => facilities.id, {
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
    })
}))

export const insertAppointmentSchema = createInsertSchema(appointments, {
    date: z.coerce.date(),
})