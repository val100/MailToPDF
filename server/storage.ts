import { 
  type User, 
  type InsertUser,
  type EmailProcessingJob,
  type InsertEmailProcessingJob,
  type ConvertedEmail,
  type InsertConvertedEmail,
  type Office365Token,
  type InsertOffice365Token,
  type ActivityLog,
  type InsertActivityLog
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Email processing job methods
  createEmailProcessingJob(job: InsertEmailProcessingJob): Promise<EmailProcessingJob>;
  getEmailProcessingJob(id: string): Promise<EmailProcessingJob | undefined>;
  updateEmailProcessingJob(id: string, updates: Partial<EmailProcessingJob>): Promise<EmailProcessingJob | undefined>;
  getEmailProcessingJobsByUser(userId: string): Promise<EmailProcessingJob[]>;

  // Converted email methods
  createConvertedEmail(email: InsertConvertedEmail): Promise<ConvertedEmail>;
  getConvertedEmailsByJob(jobId: string): Promise<ConvertedEmail[]>;
  getRecentConvertedEmails(userId: string, limit?: number): Promise<ConvertedEmail[]>;
  deleteConvertedEmail(id: string): Promise<boolean>;

  // Office 365 token methods
  saveOffice365Token(token: InsertOffice365Token): Promise<Office365Token>;
  getOffice365Token(userId: string): Promise<Office365Token | undefined>;
  updateOffice365Token(userId: string, updates: Partial<Office365Token>): Promise<Office365Token | undefined>;
  deleteOffice365Token(userId: string): Promise<boolean>;

  // Activity log methods
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(userId: string, limit?: number): Promise<ActivityLog[]>;

  // Dashboard stats
  getDashboardStats(userId: string): Promise<{
    totalEmails: number;
    convertedPdfs: number;
    processing: number;
    failed: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private emailProcessingJobs: Map<string, EmailProcessingJob>;
  private convertedEmails: Map<string, ConvertedEmail>;
  private office365Tokens: Map<string, Office365Token>;
  private activityLogs: Map<string, ActivityLog>;

  constructor() {
    this.users = new Map();
    this.emailProcessingJobs = new Map();
    this.convertedEmails = new Map();
    this.office365Tokens = new Map();
    this.activityLogs = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createEmailProcessingJob(job: InsertEmailProcessingJob): Promise<EmailProcessingJob> {
    const id = randomUUID();
    const emailJob: EmailProcessingJob = { 
      ...job, 
      id, 
      createdAt: new Date()
    };
    this.emailProcessingJobs.set(id, emailJob);
    return emailJob;
  }

  async getEmailProcessingJob(id: string): Promise<EmailProcessingJob | undefined> {
    return this.emailProcessingJobs.get(id);
  }

  async updateEmailProcessingJob(id: string, updates: Partial<EmailProcessingJob>): Promise<EmailProcessingJob | undefined> {
    const job = this.emailProcessingJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.emailProcessingJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getEmailProcessingJobsByUser(userId: string): Promise<EmailProcessingJob[]> {
    return Array.from(this.emailProcessingJobs.values()).filter(
      job => job.userId === userId
    );
  }

  async createConvertedEmail(email: InsertConvertedEmail): Promise<ConvertedEmail> {
    const id = randomUUID();
    const convertedEmail: ConvertedEmail = { 
      ...email, 
      id, 
      createdAt: new Date()
    };
    this.convertedEmails.set(id, convertedEmail);
    return convertedEmail;
  }

  async getConvertedEmailsByJob(jobId: string): Promise<ConvertedEmail[]> {
    return Array.from(this.convertedEmails.values()).filter(
      email => email.jobId === jobId
    );
  }

  async getRecentConvertedEmails(userId: string, limit = 10): Promise<ConvertedEmail[]> {
    const userJobs = await this.getEmailProcessingJobsByUser(userId);
    const jobIds = userJobs.map(job => job.id);
    
    return Array.from(this.convertedEmails.values())
      .filter(email => jobIds.includes(email.jobId || ''))
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async deleteConvertedEmail(id: string): Promise<boolean> {
    return this.convertedEmails.delete(id);
  }

  async saveOffice365Token(token: InsertOffice365Token): Promise<Office365Token> {
    const id = randomUUID();
    const office365Token: Office365Token = { 
      ...token, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.office365Tokens.set(token.userId, office365Token);
    return office365Token;
  }

  async getOffice365Token(userId: string): Promise<Office365Token | undefined> {
    return Array.from(this.office365Tokens.values()).find(
      token => token.userId === userId
    );
  }

  async updateOffice365Token(userId: string, updates: Partial<Office365Token>): Promise<Office365Token | undefined> {
    const token = await this.getOffice365Token(userId);
    if (!token) return undefined;
    
    const updatedToken = { ...token, ...updates, updatedAt: new Date() };
    this.office365Tokens.set(userId, updatedToken);
    return updatedToken;
  }

  async deleteOffice365Token(userId: string): Promise<boolean> {
    const token = await this.getOffice365Token(userId);
    if (!token) return false;
    return this.office365Tokens.delete(userId);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const activityLog: ActivityLog = { 
      ...log, 
      id, 
      createdAt: new Date()
    };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }

  async getActivityLogs(userId: string, limit = 20): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getDashboardStats(userId: string): Promise<{
    totalEmails: number;
    convertedPdfs: number;
    processing: number;
    failed: number;
  }> {
    const userJobs = await this.getEmailProcessingJobsByUser(userId);
    const jobIds = userJobs.map(job => job.id);
    
    const convertedEmails = Array.from(this.convertedEmails.values())
      .filter(email => jobIds.includes(email.jobId || ''));
    
    const totalEmails = userJobs.reduce((sum, job) => sum + (job.emailCount || 0), 0);
    const convertedPdfs = convertedEmails.filter(email => email.conversionStatus === 'success').length;
    const failed = convertedEmails.filter(email => email.conversionStatus === 'failed').length;
    const processing = userJobs.filter(job => job.status === 'processing').length;

    return {
      totalEmails,
      convertedPdfs,
      processing,
      failed
    };
  }
}

export const storage = new MemStorage();
