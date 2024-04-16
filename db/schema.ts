import {pgSchema, pgTable, serial, varchar} from "drizzle-orm/pg-core";
import db from "@/db/drizzle";

export const patient = pgTable("patients", {
    id: serial("id").primaryKey(),
    firstName: varchar("name").notNull(),
})