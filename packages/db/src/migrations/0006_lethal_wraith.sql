ALTER TABLE "execution_logs" ADD COLUMN "job_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "steps" ADD COLUMN "name" varchar NOT NULL;