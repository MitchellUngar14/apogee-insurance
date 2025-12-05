CREATE TYPE "public"."applicant_status" AS ENUM('Incomplete', 'Complete');--> statement-breakpoint
ALTER TABLE "applicants" RENAME COLUMN "full_name" TO "first_name";--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "middle_name" varchar(256);--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "last_name" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "birthdate" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "status" "applicant_status" DEFAULT 'Incomplete' NOT NULL;