import {pgTable, serial, timestamp, varchar} from "drizzle-orm/pg-core";
import db from "@/db/drizzle";
import {relations} from "drizzle-orm";

export const patient = pgTable("patients", {
    id: serial("id").primaryKey(),
    firstName: varchar("name").notNull(),
})

//one to many relationship between patient and appointment
export const patientRelations = relations(patient, ({many}) =>({
    appointments: many(appointment)
}))

export const appointment = pgTable("appointments", {
    id: serial("id").primaryKey(),
    address: varchar("address").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
})

//relation describes one patient to many appointments. returns object that maps to the patient table using the appointment id field related to the patient id field
export const appointmentRelations = relations(appointment, ({ one }) => ({
    patient: one(patient, {
        fields: [appointment.id],
        references:[patient.id],
    })
}))