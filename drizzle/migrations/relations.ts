import { relations } from "drizzle-orm/relations";
import { patients, followUpRequest, facilities, interpreter, appointments } from "./schema";

export const followUpRequestRelations = relations(followUpRequest, ({one}) => ({
	patient: one(patients, {
		fields: [followUpRequest.patientId],
		references: [patients.id]
	}),
	facility: one(facilities, {
		fields: [followUpRequest.facilityId],
		references: [facilities.id]
	}),
	interpreter: one(interpreter, {
		fields: [followUpRequest.interpreterId],
		references: [interpreter.id]
	}),
}));

export const patientsRelations = relations(patients, ({many}) => ({
	followUpRequests: many(followUpRequest),
	appointments: many(appointments),
}));

export const facilitiesRelations = relations(facilities, ({many}) => ({
	followUpRequests: many(followUpRequest),
	appointments: many(appointments),
}));

export const interpreterRelations = relations(interpreter, ({many}) => ({
	followUpRequests: many(followUpRequest),
	appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({one}) => ({
	interpreter: one(interpreter, {
		fields: [appointments.interpreterId],
		references: [interpreter.id]
	}),
	patient: one(patients, {
		fields: [appointments.patientId],
		references: [patients.id]
	}),
	facility: one(facilities, {
		fields: [appointments.facilityId],
		references: [facilities.id]
	}),
}));