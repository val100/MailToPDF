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

// Email Accounts (similar to "Adding your first account" in Automatic Email Manager)
export const emailAccounts = pgTable("email_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(), // Display name for the account
  emailAddress: text("email_address").notNull(),
  accountType: text("account_type").notNull(), // office365, gmail, imap
  isActive: boolean("is_active").default(true),
  
  // Scheduling settings
  checkingMode: text("checking_mode").notNull().default("interval"), // interval, daily, manual, advanced
  intervalMinutes: integer("interval_minutes").default(10), // Check every X minutes
  dailyTime: text("daily_time"), // e.g., "09:00" for daily checks
  advancedSchedule: jsonb("advanced_schedule"), // {days: ['monday', 'tuesday'], timeRanges: [{start: '09:00', end: '17:00'}]}
  
  // Connection settings
  connectionSettings: jsonb("connection_settings"), // IMAP/SMTP settings if not Office 365
  lastChecked: timestamp("last_checked"),
  lastCheckStatus: text("last_check_status"), // success, failed
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scenarios (rules + actions)
export const scenarios = pgTable("scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  
  // Advanced scheduling for this scenario
  useScheduler: boolean("use_scheduler").default(false),
  schedulerSettings: jsonb("scheduler_settings"), // {days: ['monday'], timeRanges: [{start: '09:00', end: '17:00'}]}
  
  // Actions configuration
  actions: jsonb("actions").notNull(), // Array of action objects
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scenario Conditions/Rules
export const scenarioConditions = pgTable("scenario_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").references(() => scenarios.id).notNull(),
  field: text("field").notNull(), // sender, recipient, subject, date, size, body, hasAttachment, attachmentName, emailRaw, priority
  operator: text("operator").notNull(), // equals, contains, notContains, greaterThan, lessThan, startsWith, endsWith, regex
  value: text("value").notNull(), // Can contain multiple values separated by newlines (OR logic)
  useAndOperator: boolean("use_and_operator").default(true), // Use AND between this rule and next, or OR
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Link scenarios to accounts
export const accountScenarios = pgTable("account_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").references(() => emailAccounts.id).notNull(),
  scenarioId: varchar("scenario_id").references(() => scenarios.id).notNull(),
  orderIndex: integer("order_index").notNull().default(0),
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

export const insertEmailAccountSchema = createInsertSchema(emailAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScenarioConditionSchema = createInsertSchema(scenarioConditions).omit({
  id: true,
  createdAt: true,
});

export const insertAccountScenarioSchema = createInsertSchema(accountScenarios).omit({
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
export type InsertEmailAccount = z.infer<typeof insertEmailAccountSchema>;
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenarioCondition = z.infer<typeof insertScenarioConditionSchema>;
export type ScenarioCondition = typeof scenarioConditions.$inferSelect;
export type InsertAccountScenario = z.infer<typeof insertAccountScenarioSchema>;
export type AccountScenario = typeof accountScenarios.$inferSelect;
