ALTER TABLE "interpreter_rates" ADD COLUMN "certified_late_cancel_fee" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "interpreter_rates" ADD COLUMN "qualified_late_cancel_fee" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "interpreter_rates" ADD COLUMN "certified_no_show_fee" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "interpreter_rates" ADD COLUMN "qualified_no_show_fee" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "interpreter_rates" DROP COLUMN "late_cancel_fee";--> statement-breakpoint
ALTER TABLE "interpreter_rates" DROP COLUMN "no_show_fee";