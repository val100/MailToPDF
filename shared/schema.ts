import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const emailProcessingJobs = pgTable("email_processing_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  emailCount: integer("email_count").default(0),
  processedCount: integer("processed_count").default(0),
  failedCount: integer("failed_count").default(0),
  dateRange: text("date_range"), // e.g., "last_7_days"
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const convertedEmails = pgTable("converted_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => emailProcessingJobs.id),
  emailId: text("email_id").notNull(), // Microsoft Graph email ID
  subject: text("subject"),
  sender: text("sender"),
  receivedDateTime: timestamp("received_date_time"),
  pdfFileName: text("pdf_file_name").notNull(),
  pdfFilePath: text("pdf_file_path").notNull(),
  fileSize: integer("file_size"), // in bytes
  attachmentCount: integer("attachment_count").default(0),
  conversionStatus: text("conversion_status").notNull(), // success, failed
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const office365Tokens = pgTable("office365_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at").notNull(),
  scope: text("scope"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(), // success, error, info, warning
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEmailProcessingJobSchema = createInsertSchema(emailProcessingJobs).omit({
  id: true,
  createdAt: true,
});

export const insertConvertedEmailSchema = createInsertSchema(convertedEmails).omit({
  id: true,
  createdAt: true,
});

export const insertOffice365TokenSchema = createInsertSchema(office365Tokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEmailProcessingJob = z.infer<typeof insertEmailProcessingJobSchema>;
export type EmailProcessingJob = typeof emailProcessingJobs.$inferSelect;
export type InsertConvertedEmail = z.infer<typeof insertConvertedEmailSchema>;
export type ConvertedEmail = typeof convertedEmails.$inferSelect;
export type InsertOffice365Token = z.infer<typeof insertOffice365TokenSchema>;
export type Office365Token = typeof office365Tokens.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
