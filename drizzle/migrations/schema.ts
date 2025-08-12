import { pgTable, unique, text, varchar, timestamp, date, numeric, foreignKey, time, interval, integer, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const patients = pgTable("patients", {
	id: text().primaryKey().notNull(),
	firstName: varchar().notNull(),
	lastName: varchar().notNull(),
	email: varchar().notNull(),
	phoneNumber: varchar().notNull(),
	insuranceCarrier: varchar(),
	preferredLanguage: varchar(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	patientId: varchar("patient_id"),
	claimNumber: varchar(),
	dateOfBirth: date("date_of_birth"),
}, (table) => [
	unique("patients_patient_id_unique").on(table.patientId),
]);

export const facilities = pgTable("facilities", {
	id: text().primaryKey().notNull(),
	name: varchar().notNull(),
	address: text().notNull(),
	email: varchar(),
	phoneNumber: varchar(),
	facilityType: varchar().notNull(),
	averageWaitTime: varchar().notNull(),
	operatingHours: varchar().notNull(),
	longitude: numeric().notNull(),
	latitude: numeric().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const followUpRequest = pgTable("follow_up_request", {
	id: text().primaryKey().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	startTime: time("start_time").notNull(),
	projectedDuration: varchar("projected_duration"),
	notes: text(),
	appointmentType: varchar(),
	status: varchar().default('Pending'),
	patientId: text("patient_id"),
	facilityId: text("facility_id"),
	interpreterId: text("interpreter_id"),
	newFacilityAddress: text("new_facility_address"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "follow_up_request_patient_id_patients_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.facilityId],
			foreignColumns: [facilities.id],
			name: "follow_up_request_facility_id_facilities_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.interpreterId],
			foreignColumns: [interpreter.id],
			name: "follow_up_request_interpreter_id_interpreter_id_fk"
		}).onDelete("cascade"),
]);

export const appointments = pgTable("appointments", {
	id: text().primaryKey().notNull(),
	patientId: text("patient_id"),
	facilityId: text("facility_id"),
	date: timestamp({ mode: 'string' }).notNull(),
	notes: text(),
	startTime: time("start_time").notNull(),
	appointmentType: varchar(),
	endTime: time("end_time"),
	status: varchar().default('Pending'),
	interpreterId: text("interpreter_id"),
	projectedEndTime: time("projected_end_time"),
	projectedDuration: varchar("projected_duration"),
	duration: interval(),
	bookingId: integer().generatedAlwaysAsIdentity({ name: "appointments_bookingId_seq", startWith: 100000, increment: 1, minValue: 1, maxValue: 2147483647 }),
	isCertified: boolean("is_certified").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.interpreterId],
			foreignColumns: [interpreter.id],
			name: "appointments_interpreter_id_interpreter_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "appointments_patient_id_patients_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.facilityId],
			foreignColumns: [facilities.id],
			name: "appointments_facility_id_facilities_id_fk"
		}).onDelete("set null"),
	unique("appointments_bookingId_unique").on(table.bookingId),
]);

export const interpreter = pgTable("interpreter", {
	id: text().primaryKey().notNull(),
	firstName: varchar().notNull(),
	lastName: varchar().notNull(),
	email: varchar().notNull(),
	phoneNumber: varchar().notNull(),
	clerkUserId: text().notNull(),
	isCertified: boolean("is_certified").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	expoPushToken: text("expo_push_token"),
}, (table) => [
	unique("interpreter_clerkUserId_unique").on(table.clerkUserId),
]);
