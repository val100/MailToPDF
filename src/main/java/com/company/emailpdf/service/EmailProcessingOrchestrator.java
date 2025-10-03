package com.company.emailpdf.service;

import com.company.emailpdf.dto.ProcessingResult;
import com.company.emailpdf.dto.ProcessingSettings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailProcessingOrchestrator {
    
    private static final Logger log = LoggerFactory.getLogger(EmailProcessingOrchestrator.class);
    
    @Autowired
    private MicrosoftGraphEmailService graphEmailService;
    
    @Autowired
    private PdfGenerationService pdfGenerationService;
    
    @Autowired
    private FileNamingService fileNamingService;
    
    @Autowired
    private EmailExportService emailExportService;
    
    @Autowired
    private EmailActionService emailActionService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Value("${email.pdf.output-directory:./output/pdfs}")
    private String outputDirectory;
    
    /**
     * Process emails for a specific mailbox with real Microsoft Graph API integration
     */
    public CompletableFuture<ProcessingResult> processMailboxEmails(String mailboxId, String jobId, ProcessingSettings settings) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Starting email processing for mailbox: {} with jobId: {}", mailboxId, jobId);
                
                // Initialize Microsoft Graph if not already done
                graphEmailService.initialize();
                
                // Fetch emails from Office 365
                int maxEmails = settings.getMaxEmailsPerRun() != null ? settings.getMaxEmailsPerRun() : 10;
                int dateRangeDays = settings.getDateRangeDays() != null ? settings.getDateRangeDays() : 7;
                
                List<MicrosoftGraphEmailService.EmailMessage> emails = 
                    graphEmailService.fetchEmails(mailboxId, maxEmails, dateRangeDays);
                
                if (emails.isEmpty()) {
                    log.info("No emails found for mailbox: {}", mailboxId);
                    return ProcessingResult.success(0, 0, "No emails to process");
                }
                
                int emailsProcessed = 0;
                int pdfsGenerated = 0;
                
                // Process each email
                for (MicrosoftGraphEmailService.EmailMessage email : emails) {
                    try {
                        // Fetch attachments if present
                        List<MicrosoftGraphEmailService.EmailAttachment> attachments = 
                            email.isHasAttachments() ? 
                            graphEmailService.fetchAttachments(mailboxId, email.getId()) : 
                            List.of();
                        
                        // Generate PDF
                        byte[] pdfData = pdfGenerationService.generateEmailPdf(email, attachments);
                        
                        // Generate unique filename with exact format: 
                        // {to_email}.{from_email}.{date}.{time}.{emailID@account.company.com}.pdf
                        LocalDateTime dateTime = LocalDateTime.now();
                        String filename = fileNamingService.generatePdfFilename(
                            email.getTo(),
                            email.getFrom(),
                            dateTime,
                            email.getId(),
                            mailboxId.split("@")[mailboxId.split("@").length - 1]
                        );
                        
                        // Ensure unique filename
                        String finalFilename = fileNamingService.generateUniqueFilename(outputDirectory, filename);
                        String fullPath = outputDirectory + "/" + finalFilename;
                        
                        // Save PDF
                        pdfGenerationService.savePdfToFile(pdfData, fullPath);
                        pdfsGenerated++;
                        
                        // Optional: Save in other formats based on settings
                        if (settings.isSaveAsEml()) {
                            String emlPath = fullPath.replace(".pdf", ".eml");
                            emailExportService.saveAsEml(email, emlPath);
                        }
                        
                        if (settings.isSaveAsTxt()) {
                            String txtPath = fullPath.replace(".pdf", ".txt");
                            emailExportService.saveAsTxt(email, txtPath);
                        }
                        
                        if (settings.isSaveAsXml()) {
                            String xmlPath = fullPath.replace(".pdf", ".xml");
                            emailExportService.saveAsXml(email, xmlPath);
                        }
                        
                        // Optional: Perform actions on the email
                        if (settings.isMarkAsRead()) {
                            emailActionService.markAsRead(mailboxId, email.getId());
                        }
                        
                        if (settings.isMoveToFolder() && settings.getTargetFolder() != null) {
                            emailActionService.moveEmail(mailboxId, email.getId(), settings.getTargetFolder());
                        }
                        
                        if (settings.isDeleteAfterProcessing()) {
                            emailActionService.deleteEmail(mailboxId, email.getId());
                        }
                        
                        emailsProcessed++;
                        
                        log.info("Processed email {}/{}: {} - PDF: {}", 
                            emailsProcessed, emails.size(), email.getSubject(), finalFilename);
                        
                    } catch (Exception e) {
                        log.error("Failed to process email: {}", email.getId(), e);
                    }
                }
                
                // Send notification if configured
                String message = String.format(
                    "Email processing completed for %s\nProcessed: %d emails\nGenerated: %d PDFs",
                    mailboxId, emailsProcessed, pdfsGenerated
                );
                
                if (settings.getSlackWebhookUrl() != null) {
                    notificationService.sendSlackNotification(settings.getSlackWebhookUrl(), message);
                }
                
                if (settings.getTeamsWebhookUrl() != null) {
                    notificationService.sendTeamsNotification(
                        settings.getTeamsWebhookUrl(), 
                        "Email Processing Complete", 
                        message
                    );
                }
                
                log.info("Completed email processing for mailbox: {} - Processed: {} emails, Generated: {} PDFs", 
                    mailboxId, emailsProcessed, pdfsGenerated);
                
                return ProcessingResult.success(emailsProcessed, pdfsGenerated, 
                    "Successfully processed " + emailsProcessed + " emails and generated " + pdfsGenerated + " PDFs");
                
            } catch (Exception e) {
                log.error("Email processing failed for mailbox: {}", mailboxId, e);
                return ProcessingResult.failure("Processing failed: " + e.getMessage());
            }
        });
    }
}
