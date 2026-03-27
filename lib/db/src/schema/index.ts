import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  pgEnum,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "operator",
  "student",
]);

export const digitizationStatusEnum = pgEnum("digitization_status", [
  "pending",
  "in_progress",
  "completed",
  "rejected",
]);

export const institutions = pgTable(
  "institutions",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("institutions_name_idx").on(table.name)],
);

export const institutionsRelations = relations(institutions, ({ many }) => ({
  users: many(users),
  bookAssignments: many(bookAssignments),
  digitizationRequests: many(digitizationRequests),
}));

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash"),
    role: userRoleEnum("role").notNull(),
    institutionId: integer("institution_id").references(() => institutions.id),
    externalId: text("external_id"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_institution_idx").on(table.institutionId),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [users.institutionId],
    references: [institutions.id],
  }),
  bookAssignments: many(bookAssignments),
  readingProgress: many(readingProgress),
}));

export const bookCatalog = pgTable(
  "book_catalog",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    author: text("author"),
    isbn: text("isbn"),
    language: text("language").notNull().default("id"),
    level: text("level"),
    coverImageUrl: text("cover_image_url"),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("book_catalog_title_idx").on(table.title)],
);

export const bookCatalogRelations = relations(bookCatalog, ({ many }) => ({
  assignments: many(bookAssignments),
  readingProgress: many(readingProgress),
}));

export const bookAssignments = pgTable(
  "book_assignments",
  {
    id: serial("id").primaryKey(),
    bookId: integer("book_id")
      .notNull()
      .references(() => bookCatalog.id),
    studentId: integer("student_id")
      .notNull()
      .references(() => users.id),
    institutionId: integer("institution_id")
      .notNull()
      .references(() => institutions.id),
    assignedBy: integer("assigned_by").references(() => users.id),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
    dueDate: timestamp("due_date"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("book_assignments_student_idx").on(table.studentId),
    index("book_assignments_book_idx").on(table.bookId),
    index("book_assignments_institution_idx").on(table.institutionId),
  ],
);

export const bookAssignmentsRelations = relations(
  bookAssignments,
  ({ one }) => ({
    book: one(bookCatalog, {
      fields: [bookAssignments.bookId],
      references: [bookCatalog.id],
    }),
    student: one(users, {
      fields: [bookAssignments.studentId],
      references: [users.id],
    }),
    institution: one(institutions, {
      fields: [bookAssignments.institutionId],
      references: [institutions.id],
    }),
    assigner: one(users, {
      fields: [bookAssignments.assignedBy],
      references: [users.id],
    }),
  }),
);

export const readingProgress = pgTable(
  "reading_progress",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => users.id),
    bookId: integer("book_id")
      .notNull()
      .references(() => bookCatalog.id),
    assignmentId: integer("assignment_id").references(() => bookAssignments.id),
    pagesRead: integer("pages_read").notNull().default(0),
    totalPages: integer("total_pages"),
    completionPercent: integer("completion_percent").notNull().default(0),
    lastReadAt: timestamp("last_read_at"),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("reading_progress_student_idx").on(table.studentId),
    index("reading_progress_book_idx").on(table.bookId),
  ],
);

export const readingProgressRelations = relations(
  readingProgress,
  ({ one }) => ({
    student: one(users, {
      fields: [readingProgress.studentId],
      references: [users.id],
    }),
    book: one(bookCatalog, {
      fields: [readingProgress.bookId],
      references: [bookCatalog.id],
    }),
    assignment: one(bookAssignments, {
      fields: [readingProgress.assignmentId],
      references: [bookAssignments.id],
    }),
  }),
);

export const digitizationRequests = pgTable(
  "digitization_requests",
  {
    id: serial("id").primaryKey(),
    institutionId: integer("institution_id")
      .notNull()
      .references(() => institutions.id),
    requestedBy: integer("requested_by")
      .notNull()
      .references(() => users.id),
    bookTitle: text("book_title").notNull(),
    bookAuthor: text("book_author"),
    bookIsbn: text("book_isbn"),
    status: digitizationStatusEnum("status").notNull().default("pending"),
    notes: text("notes"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("digitization_requests_institution_idx").on(table.institutionId),
    index("digitization_requests_status_idx").on(table.status),
  ],
);

export const digitizationRequestsRelations = relations(
  digitizationRequests,
  ({ one }) => ({
    institution: one(institutions, {
      fields: [digitizationRequests.institutionId],
      references: [institutions.id],
    }),
    requester: one(users, {
      fields: [digitizationRequests.requestedBy],
      references: [users.id],
    }),
  }),
);

export const insertInstitutionSchema = createInsertSchema(institutions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Institution = typeof institutions.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertBookSchema = createInsertSchema(bookCatalog).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof bookCatalog.$inferSelect;

export const insertBookAssignmentSchema = createInsertSchema(
  bookAssignments,
).omit({ id: true, assignedAt: true });
export type InsertBookAssignment = z.infer<typeof insertBookAssignmentSchema>;
export type BookAssignment = typeof bookAssignments.$inferSelect;

export const insertReadingProgressSchema = createInsertSchema(
  readingProgress,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;
export type ReadingProgress = typeof readingProgress.$inferSelect;

export const insertDigitizationRequestSchema = createInsertSchema(
  digitizationRequests,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDigitizationRequest = z.infer<
  typeof insertDigitizationRequestSchema
>;
export type DigitizationRequest = typeof digitizationRequests.$inferSelect;
