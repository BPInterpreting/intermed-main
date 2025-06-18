CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"bookingId" integer GENERATED ALWAYS AS IDENTITY (sequence name "appointments_bookingId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 100000 CACHE 1),
	"date" timestamp NOT NULL,
	"start_time" time NOT NULL,
	"projected_end_time" time,
	"end_time" time,
	"projected_duration" varchar,
	"duration" interval,
	"is_certified" boolean DEFAULT false,
	"notes" text,
	"appointmentType" varchar,
	"status" varchar DEFAULT 'Pending',
	"patient_id" text,
	"facility_id" text,
	"interpreter_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "appointments_bookingId_unique" UNIQUE("bookingId")
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"address" text NOT NULL,
	"longitude" numeric NOT NULL,
	"latitude" numeric NOT NULL,
	"email" varchar,
	"phoneNumber" varchar,
	"facilityType" varchar NOT NULL,
	"averageWaitTime" varchar NOT NULL,
	"operatingHours" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_up_request" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"start_time" time NOT NULL,
	"projected_duration" varchar,
	"notes" text,
	"appointmentType" varchar,
	"status" varchar DEFAULT 'Pending',
	"new_facility_address" text,
	"patient_id" text,
	"facility_id" text,
	"interpreter_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interpreter" (
	"id" text PRIMARY KEY NOT NULL,
	"firstName" varchar NOT NULL,
	"lastName" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phoneNumber" varchar NOT NULL,
	"is_certified" boolean DEFAULT false,
	"clerkUserId" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "interpreter_clerkUserId_unique" UNIQUE("clerkUserId")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" text PRIMARY KEY NOT NULL,
	"firstName" varchar NOT NULL,
	"lastName" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phoneNumber" varchar NOT NULL,
	"insuranceCarrier" varchar,
	"preferredLanguage" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_interpreter_id_interpreter_id_fk" FOREIGN KEY ("interpreter_id") REFERENCES "public"."interpreter"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_request" ADD CONSTRAINT "follow_up_request_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_request" ADD CONSTRAINT "follow_up_request_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_request" ADD CONSTRAINT "follow_up_request_interpreter_id_interpreter_id_fk" FOREIGN KEY ("interpreter_id") REFERENCES "public"."interpreter"("id") ON DELETE cascade ON UPDATE no action;