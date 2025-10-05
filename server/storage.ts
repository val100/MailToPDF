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
  type InsertActivityLog,
  type EmailAccount,
  type InsertEmailAccount,
  type Scenario,
  type InsertScenario,
  type ScenarioCondition,
  type InsertScenarioCondition,
  type AccountScenario,
  type InsertAccountScenario
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

  // Email account methods
  createEmailAccount(account: InsertEmailAccount): Promise<EmailAccount>;
  getEmailAccount(id: string): Promise<EmailAccount | undefined>;
  updateEmailAccount(id: string, updates: Partial<EmailAccount>): Promise<EmailAccount | undefined>;
  deleteEmailAccount(id: string): Promise<boolean>;
  getEmailAccountsByUser(userId: string): Promise<EmailAccount[]>;

  // Scenario methods
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  getScenario(id: string): Promise<Scenario | undefined>;
  updateScenario(id: string, updates: Partial<Scenario>): Promise<Scenario | undefined>;
  deleteScenario(id: string): Promise<boolean>;
  getScenariosByUser(userId: string): Promise<Scenario[]>;

  // Scenario condition methods
  createScenarioCondition(condition: InsertScenarioCondition): Promise<ScenarioCondition>;
  getScenarioConditions(scenarioId: string): Promise<ScenarioCondition[]>;
  deleteScenarioConditions(scenarioId: string): Promise<boolean>;

  // Account-scenario linking methods
  linkAccountScenario(link: InsertAccountScenario): Promise<AccountScenario>;
  getAccountScenarios(accountId: string): Promise<AccountScenario[]>;
  unlinkAccountScenario(accountId: string, scenarioId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private emailProcessingJobs: Map<string, EmailProcessingJob>;
  private convertedEmails: Map<string, ConvertedEmail>;
  private office365Tokens: Map<string, Office365Token>;
  private activityLogs: Map<string, ActivityLog>;
  private emailAccounts: Map<string, EmailAccount>;
  private scenarios: Map<string, Scenario>;
  private scenarioConditions: Map<string, ScenarioCondition>;
  private accountScenarios: Map<string, AccountScenario>;

  constructor() {
    this.users = new Map();
    this.emailProcessingJobs = new Map();
    this.convertedEmails = new Map();
    this.office365Tokens = new Map();
    this.activityLogs = new Map();
    this.emailAccounts = new Map();
    this.scenarios = new Map();
    this.scenarioConditions = new Map();
    this.accountScenarios = new Map();
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
      id,
      userId: job.userId,
      status: job.status ?? "pending",
      emailCount: job.emailCount ?? null,
      processedCount: job.processedCount ?? null,
      failedCount: job.failedCount ?? null,
      dateRange: job.dateRange ?? null,
      startedAt: job.startedAt ?? null,
      completedAt: job.completedAt ?? null,
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
      id,
      jobId: email.jobId ?? null,
      emailId: email.emailId,
      subject: email.subject ?? null,
      sender: email.sender ?? null,
      receivedDateTime: email.receivedDateTime ?? null,
      pdfFileName: email.pdfFileName,
      pdfFilePath: email.pdfFilePath,
      fileSize: email.fileSize ?? null,
      attachmentCount: email.attachmentCount ?? null,
      conversionStatus: email.conversionStatus,
      errorMessage: email.errorMessage ?? null,
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
      id,
      userId: token.userId,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken ?? null,
      expiresAt: token.expiresAt,
      scope: token.scope ?? null,
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
      id,
      userId: log.userId ?? null,
      type: log.type,
      message: log.message,
      metadata: log.metadata ?? null,
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

  // Email account methods
  async createEmailAccount(account: InsertEmailAccount): Promise<EmailAccount> {
    const id = randomUUID();
    const emailAccount: EmailAccount = {
      id,
      userId: account.userId,
      name: account.name,
      emailAddress: account.emailAddress,
      accountType: account.accountType,
      isActive: account.isActive ?? true,
      checkingMode: account.checkingMode ?? "interval",
      intervalMinutes: account.intervalMinutes ?? null,
      dailyTime: account.dailyTime ?? null,
      advancedSchedule: account.advancedSchedule ?? null,
      connectionSettings: account.connectionSettings ?? null,
      lastChecked: account.lastChecked ?? null,
      lastCheckStatus: account.lastCheckStatus ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.emailAccounts.set(id, emailAccount);
    return emailAccount;
  }

  async getEmailAccount(id: string): Promise<EmailAccount | undefined> {
    return this.emailAccounts.get(id);
  }

  async updateEmailAccount(id: string, updates: Partial<EmailAccount>): Promise<EmailAccount | undefined> {
    const account = this.emailAccounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...updates, updatedAt: new Date() };
    this.emailAccounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteEmailAccount(id: string): Promise<boolean> {
    return this.emailAccounts.delete(id);
  }

  async getEmailAccountsByUser(userId: string): Promise<EmailAccount[]> {
    return Array.from(this.emailAccounts.values())
      .filter(account => account.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  // Scenario methods
  async createScenario(scenario: InsertScenario): Promise<Scenario> {
    const id = randomUUID();
    const newScenario: Scenario = {
      id,
      userId: scenario.userId,
      name: scenario.name,
      description: scenario.description ?? null,
      isActive: scenario.isActive ?? true,
      useScheduler: scenario.useScheduler ?? false,
      schedulerSettings: scenario.schedulerSettings ?? null,
      actions: scenario.actions,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.scenarios.set(id, newScenario);
    return newScenario;
  }

  async getScenario(id: string): Promise<Scenario | undefined> {
    return this.scenarios.get(id);
  }

  async updateScenario(id: string, updates: Partial<Scenario>): Promise<Scenario | undefined> {
    const scenario = this.scenarios.get(id);
    if (!scenario) return undefined;
    
    const updatedScenario = { ...scenario, ...updates, updatedAt: new Date() };
    this.scenarios.set(id, updatedScenario);
    return updatedScenario;
  }

  async deleteScenario(id: string): Promise<boolean> {
    return this.scenarios.delete(id);
  }

  async getScenariosByUser(userId: string): Promise<Scenario[]> {
    return Array.from(this.scenarios.values())
      .filter(scenario => scenario.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  // Scenario condition methods
  async createScenarioCondition(condition: InsertScenarioCondition): Promise<ScenarioCondition> {
    const id = randomUUID();
    const newCondition: ScenarioCondition = {
      id,
      scenarioId: condition.scenarioId,
      field: condition.field,
      operator: condition.operator,
      value: condition.value,
      useAndOperator: condition.useAndOperator ?? true,
      orderIndex: condition.orderIndex ?? 0,
      createdAt: new Date()
    };
    this.scenarioConditions.set(id, newCondition);
    return newCondition;
  }

  async getScenarioConditions(scenarioId: string): Promise<ScenarioCondition[]> {
    return Array.from(this.scenarioConditions.values())
      .filter(condition => condition.scenarioId === scenarioId)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }

  async deleteScenarioConditions(scenarioId: string): Promise<boolean> {
    const conditions = await this.getScenarioConditions(scenarioId);
    conditions.forEach(condition => this.scenarioConditions.delete(condition.id));
    return true;
  }

  // Account-scenario linking methods
  async linkAccountScenario(link: InsertAccountScenario): Promise<AccountScenario> {
    const id = randomUUID();
    const newLink: AccountScenario = {
      id,
      accountId: link.accountId,
      scenarioId: link.scenarioId,
      orderIndex: link.orderIndex ?? 0,
      createdAt: new Date()
    };
    this.accountScenarios.set(id, newLink);
    return newLink;
  }

  async getAccountScenarios(accountId: string): Promise<AccountScenario[]> {
    return Array.from(this.accountScenarios.values())
      .filter(link => link.accountId === accountId)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }

  async unlinkAccountScenario(accountId: string, scenarioId: string): Promise<boolean> {
    const link = Array.from(this.accountScenarios.values()).find(
      l => l.accountId === accountId && l.scenarioId === scenarioId
    );
    if (!link) return false;
    return this.accountScenarios.delete(link.id);
  }
}

export const storage = new MemStorage();
