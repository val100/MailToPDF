import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { microsoftGraphService } from "./services/microsoftGraph";
import { pdfGeneratorService } from "./services/pdfGenerator";
import { fileManagerService } from "./services/fileManager";
import { z } from "zod";
import { 
  insertEmailAccountSchema, 
  insertScenarioSchema 
} from "@shared/schema";

const updateEmailAccountSchema = insertEmailAccountSchema.partial().omit({ userId: true });
const updateScenarioSchema = insertScenarioSchema.partial().omit({ userId: true });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      // For now, use a default user ID - in a real app, this would come from authentication
      const userId = 'default-user';
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  });

  // Start email processing job
  app.post("/api/processing/start", async (req, res) => {
    try {
      const { dateRange = 'last_7_days', emailLimit = 100 } = req.body;
      const userId = 'default-user';

      // Create processing job
      const job = await storage.createEmailProcessingJob({
        userId,
        status: 'pending',
        dateRange,
        emailCount: 0,
        processedCount: 0,
        failedCount: 0
      });

      // Start processing in background
      processEmailsInBackground(job.id, dateRange, emailLimit);

      res.json({ jobId: job.id, status: 'started' });
    } catch (error) {
      console.error('Start processing error:', error);
      res.status(500).json({ error: 'Failed to start email processing' });
    }
  });

  // Get processing job status
  app.get("/api/processing/status/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await storage.getEmailProcessingJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json(job);
    } catch (error) {
      console.error('Job status error:', error);
      res.status(500).json({ error: 'Failed to fetch job status' });
    }
  });

  // Get recent activity logs
  app.get("/api/activity", async (req, res) => {
    try {
      const userId = 'default-user';
      const limit = parseInt(req.query.limit as string) || 20;
      const logs = await storage.getActivityLogs(userId, limit);
      res.json(logs);
    } catch (error) {
      console.error('Activity logs error:', error);
      res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
  });

  // Get recent converted files
  app.get("/api/files/recent", async (req, res) => {
    try {
      const userId = 'default-user';
      const limit = parseInt(req.query.limit as string) || 10;
      const files = await storage.getRecentConvertedEmails(userId, limit);
      res.json(files);
    } catch (error) {
      console.error('Recent files error:', error);
      res.status(500).json({ error: 'Failed to fetch recent files' });
    }
  });

  // Download PDF file
  app.get("/api/files/download/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      
      // Validate filename to prevent directory traversal
      if (!filename.match(/^[a-zA-Z0-9_-]+\.pdf$/)) {
        return res.status(400).json({ error: 'Invalid filename' });
      }

      const fileInfo = await fileManagerService.getFileInfo(filename);
      
      if (!fileInfo.exists) {
        return res.status(404).json({ error: 'File not found' });
      }

      const fileBuffer = await fileManagerService.readFile(filename);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(fileBuffer);
    } catch (error) {
      console.error('File download error:', error);
      res.status(500).json({ error: 'Failed to download file' });
    }
  });

  // Delete PDF file
  app.delete("/api/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the converted email record to find the filename
      const email = await storage.getConvertedEmailsByJob(''); // This needs to be fixed
      const convertedEmail = email.find(e => e.id === id);
      
      if (!convertedEmail) {
        return res.status(404).json({ error: 'File record not found' });
      }

      // Delete the physical file
      const deleted = await fileManagerService.deleteFile(convertedEmail.pdfFileName);
      
      if (deleted) {
        // Delete the database record
        await storage.deleteConvertedEmail(id);
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to delete file' });
      }
    } catch (error) {
      console.error('File deletion error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  });

  // Test Office 365 connection
  app.get("/api/office365/test", async (req, res) => {
    try {
      const userInfo = await microsoftGraphService.getUserInfo();
      res.json({ 
        connected: true, 
        user: {
          name: userInfo.displayName,
          email: userInfo.mail || userInfo.userPrincipalName
        }
      });
    } catch (error) {
      console.error('Office 365 connection test error:', error);
      res.status(500).json({ 
        connected: false, 
        error: 'Failed to connect to Office 365' 
      });
    }
  });

  // Email Account routes
  app.get("/api/accounts", async (req, res) => {
    try {
      const userId = 'default-user';
      const accounts = await storage.getEmailAccountsByUser(userId);
      res.json(accounts);
    } catch (error) {
      console.error('Get accounts error:', error);
      res.status(500).json({ error: 'Failed to fetch email accounts' });
    }
  });

  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const account = await storage.getEmailAccount(id);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      res.json(account);
    } catch (error) {
      console.error('Get account error:', error);
      res.status(500).json({ error: 'Failed to fetch email account' });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const userId = 'default-user';
      const validatedData = insertEmailAccountSchema.parse({
        ...req.body,
        userId
      });
      
      const account = await storage.createEmailAccount(validatedData);
      
      await storage.createActivityLog({
        userId,
        type: 'success',
        message: `Created email account: ${account.name}`,
        metadata: { accountId: account.id, emailAddress: account.emailAddress }
      });
      
      res.status(201).json(account);
    } catch (error) {
      console.error('Create account error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create email account' });
    }
  });

  app.patch("/api/accounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = 'default-user';
      
      const existingAccount = await storage.getEmailAccount(id);
      if (!existingAccount) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      if (existingAccount.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized to update this account' });
      }
      
      const validatedData = updateEmailAccountSchema.parse(req.body);
      const account = await storage.updateEmailAccount(id, validatedData);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      await storage.createActivityLog({
        userId,
        type: 'info',
        message: `Updated email account: ${account.name}`,
        metadata: { accountId: account.id }
      });
      
      res.json(account);
    } catch (error) {
      console.error('Update account error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update email account' });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = 'default-user';
      
      const account = await storage.getEmailAccount(id);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      const deleted = await storage.deleteEmailAccount(id);
      
      if (deleted) {
        await storage.createActivityLog({
          userId,
          type: 'info',
          message: `Deleted email account: ${account.name}`,
          metadata: { accountId: id }
        });
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to delete account' });
      }
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: 'Failed to delete email account' });
    }
  });

  // Scenario routes
  app.get("/api/scenarios", async (req, res) => {
    try {
      const userId = 'default-user';
      const scenarios = await storage.getScenariosByUser(userId);
      res.json(scenarios);
    } catch (error) {
      console.error('Get scenarios error:', error);
      res.status(500).json({ error: 'Failed to fetch scenarios' });
    }
  });

  app.get("/api/scenarios/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const scenario = await storage.getScenario(id);
      
      if (!scenario) {
        return res.status(404).json({ error: 'Scenario not found' });
      }
      
      res.json(scenario);
    } catch (error) {
      console.error('Get scenario error:', error);
      res.status(500).json({ error: 'Failed to fetch scenario' });
    }
  });

  app.post("/api/scenarios", async (req, res) => {
    try {
      const userId = 'default-user';
      const validatedData = insertScenarioSchema.parse({
        ...req.body,
        userId
      });
      
      const scenario = await storage.createScenario(validatedData);
      
      await storage.createActivityLog({
        userId,
        type: 'success',
        message: `Created scenario: ${scenario.name}`,
        metadata: { scenarioId: scenario.id }
      });
      
      res.status(201).json(scenario);
    } catch (error) {
      console.error('Create scenario error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create scenario' });
    }
  });

  app.patch("/api/scenarios/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = 'default-user';
      
      const existingScenario = await storage.getScenario(id);
      if (!existingScenario) {
        return res.status(404).json({ error: 'Scenario not found' });
      }
      
      if (existingScenario.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized to update this scenario' });
      }
      
      const validatedData = updateScenarioSchema.parse(req.body);
      const scenario = await storage.updateScenario(id, validatedData);
      
      if (!scenario) {
        return res.status(404).json({ error: 'Scenario not found' });
      }
      
      await storage.createActivityLog({
        userId,
        type: 'info',
        message: `Updated scenario: ${scenario.name}`,
        metadata: { scenarioId: scenario.id }
      });
      
      res.json(scenario);
    } catch (error) {
      console.error('Update scenario error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update scenario' });
    }
  });

  app.delete("/api/scenarios/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = 'default-user';
      
      const scenario = await storage.getScenario(id);
      if (!scenario) {
        return res.status(404).json({ error: 'Scenario not found' });
      }
      
      const deleted = await storage.deleteScenario(id);
      
      if (deleted) {
        await storage.createActivityLog({
          userId,
          type: 'info',
          message: `Deleted scenario: ${scenario.name}`,
          metadata: { scenarioId: id }
        });
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to delete scenario' });
      }
    } catch (error) {
      console.error('Delete scenario error:', error);
      res.status(500).json({ error: 'Failed to delete scenario' });
    }
  });

  // Background processing function
  async function processEmailsInBackground(jobId: string, dateRange: string, emailLimit: number) {
    try {
      const userId = 'default-user';
      
      // Update job status to processing
      await storage.updateEmailProcessingJob(jobId, { 
        status: 'processing',
        startedAt: new Date()
      });

      // Log start of processing
      await storage.createActivityLog({
        userId,
        type: 'info',
        message: 'Started email processing job',
        metadata: { jobId, dateRange, emailLimit }
      });

      // Fetch emails from Office 365
      const emails = await microsoftGraphService.getEmails({
        maxCount: emailLimit,
        dateRange
      });

      // Update job with email count
      await storage.updateEmailProcessingJob(jobId, { 
        emailCount: emails.length 
      });

      let processedCount = 0;
      let failedCount = 0;

      // Process each email
      for (const email of emails) {
        try {
          // Convert email to PDF
          const pdfResult = await pdfGeneratorService.convertEmailToPdf({
            subject: email.subject,
            from: email.from?.emailAddress?.address || 'Unknown',
            receivedDateTime: email.receivedDateTime,
            body: email.body?.content || ''
          });

          // Save converted email record
          await storage.createConvertedEmail({
            jobId,
            emailId: email.id,
            subject: email.subject,
            sender: email.from?.emailAddress?.address,
            receivedDateTime: new Date(email.receivedDateTime),
            pdfFileName: pdfResult.filename,
            pdfFilePath: pdfResult.filepath,
            fileSize: pdfResult.size,
            attachmentCount: 0,
            conversionStatus: 'success'
          });

          // Process attachments if any
          if (email.hasAttachments) {
            try {
              const attachments = await microsoftGraphService.getEmailAttachments(email.id);
              
              for (const attachment of attachments) {
                try {
                  const attachmentBuffer = await microsoftGraphService.downloadAttachment(email.id, attachment.id);
                  const attachmentPdf = await pdfGeneratorService.convertAttachmentToPdf({
                    name: attachment.name,
                    contentType: attachment.contentType,
                    buffer: attachmentBuffer
                  });

                  if (attachmentPdf) {
                    await storage.createConvertedEmail({
                      jobId,
                      emailId: `${email.id}_${attachment.id}`,
                      subject: `Attachment: ${attachment.name}`,
                      sender: email.from?.emailAddress?.address,
                      receivedDateTime: new Date(email.receivedDateTime),
                      pdfFileName: attachmentPdf.filename,
                      pdfFilePath: attachmentPdf.filepath,
                      fileSize: attachmentPdf.size,
                      attachmentCount: 1,
                      conversionStatus: 'success'
                    });
                  }
                } catch (attachmentError) {
                  console.error('Attachment processing error:', attachmentError);
                  // Continue with other attachments
                }
              }
            } catch (attachmentsError) {
              console.error('Error fetching attachments:', attachmentsError);
              // Continue with next email
            }
          }

          processedCount++;
          
          // Log successful conversion
          await storage.createActivityLog({
            userId,
            type: 'success',
            message: `Successfully converted email to PDF`,
            metadata: { 
              emailSubject: email.subject,
              from: email.from?.emailAddress?.address,
              filename: pdfResult.filename
            }
          });

        } catch (emailError) {
          console.error('Error processing email:', emailError);
          failedCount++;

          // Log failed conversion
          await storage.createActivityLog({
            userId,
            type: 'error',
            message: `Failed to convert email to PDF`,
            metadata: { 
              emailSubject: email.subject,
              from: email.from?.emailAddress?.address,
              error: emailError instanceof Error ? emailError.message : 'Unknown error'
            }
          });

          // Save failed conversion record
          await storage.createConvertedEmail({
            jobId,
            emailId: email.id,
            subject: email.subject,
            sender: email.from?.emailAddress?.address,
            receivedDateTime: new Date(email.receivedDateTime),
            pdfFileName: '',
            pdfFilePath: '',
            fileSize: 0,
            attachmentCount: 0,
            conversionStatus: 'failed',
            errorMessage: emailError instanceof Error ? emailError.message : 'Unknown error'
          });
        }

        // Update job progress
        await storage.updateEmailProcessingJob(jobId, { 
          processedCount,
          failedCount
        });
      }

      // Mark job as completed
      await storage.updateEmailProcessingJob(jobId, { 
        status: 'completed',
        completedAt: new Date()
      });

      // Log completion
      await storage.createActivityLog({
        userId,
        type: 'success',
        message: `Email processing job completed`,
        metadata: { 
          jobId,
          totalEmails: emails.length,
          processed: processedCount,
          failed: failedCount
        }
      });

    } catch (error) {
      console.error('Background processing error:', error);
      
      // Mark job as failed
      await storage.updateEmailProcessingJob(jobId, { 
        status: 'failed',
        completedAt: new Date()
      });

      // Log error
      await storage.createActivityLog({
        userId: 'default-user',
        type: 'error',
        message: `Email processing job failed`,
        metadata: { 
          jobId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
