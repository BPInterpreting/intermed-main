import {pgTable, serial, text, timestamp, varchar} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const patient = pgTable("patients", {
    id: text("id").primaryKey(),
    firstName: varchar("firstName").notNull(),
})

export const insertPatientSchema = createInsertSchema(patient)

export const facilities = pgTable("facilities", {
    id: text("id").primaryKey(),
    name: varchar("name").notNull(),
})

export const insertFacilitySchema = createInsertSchema(facilities)