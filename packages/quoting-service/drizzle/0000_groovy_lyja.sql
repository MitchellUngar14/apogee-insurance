CREATE TYPE "public"."applicant_status" AS ENUM('Incomplete', 'Complete');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('In Progress', 'Ready for Sale', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."quote_type" AS ENUM('Individual', 'Group');--> statement-breakpoint
CREATE TABLE "applicants" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(256) NOT NULL,
	"middle_name" varchar(256),
	"last_name" varchar(256) NOT NULL,
	"birthdate" timestamp NOT NULL,
	"phone_number" varchar(20),
	"email" varchar(256),
	"address_line_1" varchar(256),
	"address_line_2" varchar(256),
	"city" varchar(100),
	"state_province" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(2),
	"group_id" integer,
	"class_id" integer,
	"quote_type" "quote_type",
	"status" "applicant_status" DEFAULT 'Incomplete' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coverages" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_id" integer NOT NULL,
	"product_type" varchar(100) NOT NULL,
	"details" text
);
--> statement-breakpoint
CREATE TABLE "employee_classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"class_name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_name" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_benefits" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_id" integer NOT NULL,
	"template_db_id" integer NOT NULL,
	"template_uuid" varchar(36) NOT NULL,
	"template_name" varchar(256) NOT NULL,
	"template_version" varchar(20) NOT NULL,
	"category_name" varchar(100) NOT NULL,
	"category_icon" varchar(50),
	"field_schema" jsonb NOT NULL,
	"configured_values" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"instance_number" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_class_id_employee_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."employee_classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverages" ADD CONSTRAINT "coverages_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_classes" ADD CONSTRAINT "employee_classes_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_benefits" ADD CONSTRAINT "quote_benefits_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;