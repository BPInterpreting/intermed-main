ALTER TABLE "patients" ADD COLUMN "patient_id" varchar;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "claimNumber" varchar;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_patient_id_unique" UNIQUE("patient_id");