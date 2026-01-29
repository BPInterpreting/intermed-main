CREATE TABLE "appointmentOffers" (
	"id" text PRIMARY KEY NOT NULL,
	"appointment_id" text NOT NULL,
	"interpreter_id" text NOT NULL,
	"notified_at" timestamp DEFAULT now() NOT NULL,
	"viewed_at" timestamp,
	"responded_at" timestamp,
	"response" varchar,
	"distance_miles" numeric,
	"has_facility_history" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interpreter_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"interpreter_id" text NOT NULL,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"mileage_rate" numeric(10, 2) DEFAULT '0.00',
	"accepts_no_mileage" boolean DEFAULT false NOT NULL,
	"minimum_hours" numeric(4, 2) DEFAULT '2.00',
	"late_cancel_fee" numeric(10, 2),
	"no_show_fee" numeric(10, 2),
	"effective_date" timestamp NOT NULL,
	"end_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"appointment_id" text,
	"description" text NOT NULL,
	"service_date" timestamp NOT NULL,
	"service_hours" numeric(6, 2) NOT NULL,
	"service_rate" numeric(10, 2) NOT NULL,
	"service_amount" numeric(10, 2) NOT NULL,
	"mileage" numeric(8, 2),
	"mileage_rate" numeric(10, 2),
	"mileage_amount" numeric(10, 2),
	"adjustment_type" varchar,
	"adjustment_amount" numeric(10, 2),
	"line_total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_number" varchar NOT NULL,
	"payer_id" text,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"adjustments" numeric(10, 2) DEFAULT '0.00',
	"total" numeric(10, 2) NOT NULL,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp,
	"due_date" timestamp,
	"paid_at" timestamp,
	"paid_amount" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"sub_text" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"link" text
);
--> statement-breakpoint
CREATE TABLE "payer_language_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"payer_id" text NOT NULL,
	"language" varchar NOT NULL,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"minimum_hours" numeric(4, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"default_hourly_rate" numeric(10, 2),
	"default_mileage_rate" numeric(10, 2),
	"minimum_hours" numeric(4, 2) DEFAULT '2.00',
	"late_cancel_fee" numeric(10, 2),
	"no_show_fee" numeric(10, 2),
	"payment_terms_days" integer DEFAULT 30,
	"billing_code" varchar,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout_line_items" (
	"id" text PRIMARY KEY NOT NULL,
	"payout_id" text NOT NULL,
	"appointment_id" text,
	"description" text NOT NULL,
	"service_date" timestamp NOT NULL,
	"service_hours" numeric(6, 2) NOT NULL,
	"service_rate" numeric(10, 2) NOT NULL,
	"service_amount" numeric(10, 2) NOT NULL,
	"mileage" numeric(8, 2),
	"mileage_rate" numeric(10, 2),
	"mileage_amount" numeric(10, 2),
	"adjustment_type" varchar,
	"adjustment_amount" numeric(10, 2),
	"line_total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" text PRIMARY KEY NOT NULL,
	"payout_number" varchar NOT NULL,
	"interpreter_id" text,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"adjustments" numeric(10, 2) DEFAULT '0.00',
	"total" numeric(10, 2) NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"scheduled_date" timestamp,
	"paid_at" timestamp,
	"payment_method" varchar,
	"payment_reference" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payouts_payout_number_unique" UNIQUE("payout_number")
);
--> statement-breakpoint
ALTER TABLE "follow_up_request" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "follow_up_request" CASCADE;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "date_of_birth" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "admin_notes" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "interpreter_notes" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "offerMode" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "search_radius" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "radius_expanded_at" timestamp;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "radius_expanded_by" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "offer_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "assigned_at" timestamp;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "is_rush_appointment" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "payer_id" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "language" varchar;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "mileage_approved" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "actual_miles" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "actual_duration_minutes" integer;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "billing_status" varchar DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "payout_status" varchar DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "interpreter" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "interpreter" ADD COLUMN "longitude" numeric;--> statement-breakpoint
ALTER TABLE "interpreter" ADD COLUMN "latitude" numeric;--> statement-breakpoint
ALTER TABLE "appointmentOffers" ADD CONSTRAINT "appointmentOffers_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointmentOffers" ADD CONSTRAINT "appointmentOffers_interpreter_id_interpreter_id_fk" FOREIGN KEY ("interpreter_id") REFERENCES "public"."interpreter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpreter_rates" ADD CONSTRAINT "interpreter_rates_interpreter_id_interpreter_id_fk" FOREIGN KEY ("interpreter_id") REFERENCES "public"."interpreter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payer_id_payers_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."payers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payer_language_rates" ADD CONSTRAINT "payer_language_rates_payer_id_payers_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."payers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_line_items" ADD CONSTRAINT "payout_line_items_payout_id_payouts_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."payouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_line_items" ADD CONSTRAINT "payout_line_items_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_interpreter_id_interpreter_id_fk" FOREIGN KEY ("interpreter_id") REFERENCES "public"."interpreter"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_payer_id_payers_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."payers"("id") ON DELETE set null ON UPDATE no action;