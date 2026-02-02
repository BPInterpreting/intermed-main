ALTER TABLE "interpreter_rates" ADD COLUMN "certified_hourly_rate" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "interpreter_rates" ADD COLUMN "qualified_hourly_rate" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "interpreter_rates" DROP COLUMN "hourly_rate";