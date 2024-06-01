import {pgTable, serial, text, timestamp, varchar} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const patient = pgTable("patients", {
    id: text("id").primaryKey(),
    firstName: varchar("firstName").notNull(),
})

export const insertPatientSchema = createInsertSchema(patient)

