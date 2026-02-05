ALTER TABLE "executions" RENAME TO "execution_logs";--> statement-breakpoint
ALTER TABLE "execution_logs" DROP CONSTRAINT "executions_workflow_id_workflows_id_fk";
--> statement-breakpoint
ALTER TABLE "execution_logs" DROP CONSTRAINT "executions_step_id_steps_id_fk";
--> statement-breakpoint
ALTER TABLE "execution_logs" ADD CONSTRAINT "execution_logs_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_logs" ADD CONSTRAINT "execution_logs_step_id_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."steps"("id") ON DELETE no action ON UPDATE no action;