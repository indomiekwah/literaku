CREATE TYPE "public"."digitization_status" AS ENUM('pending', 'in_progress', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'operator', 'student');--> statement-breakpoint
CREATE TABLE "book_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"institution_id" integer NOT NULL,
	"assigned_by" integer,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"author" text,
	"isbn" text,
	"language" text DEFAULT 'id' NOT NULL,
	"level" text,
	"cover_image_url" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "digitization_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"institution_id" integer NOT NULL,
	"requested_by" integer NOT NULL,
	"book_title" text NOT NULL,
	"book_author" text,
	"book_isbn" text,
	"status" "digitization_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institutions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"contact_email" text,
	"contact_phone" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"book_id" integer NOT NULL,
	"assignment_id" integer,
	"pages_read" integer DEFAULT 0 NOT NULL,
	"total_pages" integer,
	"completion_percent" integer DEFAULT 0 NOT NULL,
	"last_read_at" timestamp,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text,
	"role" "user_role" NOT NULL,
	"institution_id" integer,
	"external_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_assignments" ADD CONSTRAINT "book_assignments_book_id_book_catalog_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_assignments" ADD CONSTRAINT "book_assignments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_assignments" ADD CONSTRAINT "book_assignments_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_assignments" ADD CONSTRAINT "book_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digitization_requests" ADD CONSTRAINT "digitization_requests_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digitization_requests" ADD CONSTRAINT "digitization_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_book_id_book_catalog_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_assignment_id_book_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."book_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "book_assignments_student_idx" ON "book_assignments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "book_assignments_book_idx" ON "book_assignments" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "book_assignments_institution_idx" ON "book_assignments" USING btree ("institution_id");--> statement-breakpoint
CREATE INDEX "book_catalog_title_idx" ON "book_catalog" USING btree ("title");--> statement-breakpoint
CREATE INDEX "digitization_requests_institution_idx" ON "digitization_requests" USING btree ("institution_id");--> statement-breakpoint
CREATE INDEX "digitization_requests_status_idx" ON "digitization_requests" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "institutions_name_idx" ON "institutions" USING btree ("name");--> statement-breakpoint
CREATE INDEX "reading_progress_student_idx" ON "reading_progress" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "reading_progress_book_idx" ON "reading_progress" USING btree ("book_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_institution_idx" ON "users" USING btree ("institution_id");