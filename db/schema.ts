import {pgTable, serial, text, timestamp, varchar} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import {relations} from "drizzle-orm";

export const patient = pgTable("patients", {
    id: text("id").primaryKey(),
    firstName: varchar("firstName").notNull(),
})

export const patientsRelations = relations(patient, ({ many }) => ({
    appointments: many(appointments)
}))

export const insertPatientSchema = createInsertSchema(patient)

export const facilities = pgTable("facilities", {
    id: text("id").primaryKey(),
    name: varchar("name").notNull(),
})

export const facilitiesRelations = relations(facilities, ({ many }) => ({
    appointments: many(appointments)
}))

export const insertFacilitySchema = createInsertSchema(facilities)

export const appointments = pgTable("appointments", {
    id: text("id").primaryKey(),
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

export const insertAppointmentSchema = createInsertSchema(appointments)