CREATE TYPE "public"."quote_status" AS ENUM('In Progress', 'Ready for Sale', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."quote_type" AS ENUM('Individual', 'Group');--> statement-breakpoint
CREATE TABLE "applicants" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "applicants_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "coverages" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_id" integer NOT NULL,
	"product_type" varchar(100) NOT NULL,
	"details" text
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_name" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "quote_status" DEFAULT 'In Progress' NOT NULL,
	"type" "quote_type" NOT NULL,
	"applicant_id" integer,
	"group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverages" ADD CONSTRAINT "coverages_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;