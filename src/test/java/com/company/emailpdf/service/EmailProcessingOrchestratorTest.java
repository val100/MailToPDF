package com.company.emailpdf.service;

import com.company.emailpdf.dto.ProcessingResult;
import com.company.emailpdf.dto.ProcessingSettings;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class EmailProcessingOrchestratorTest {
    
    private EmailProcessingOrchestrator orchestrator;
    
    @BeforeEach
    void setUp() {
        orchestrator = new EmailProcessingOrchestrator();
    }
    
    @Test
    void processMailboxEmails_WithValidInputs_ReturnsSuccessfulResult() throws Exception {
        String mailboxId = "test-mailbox";
        String jobId = "job-123";
        ProcessingSettings settings = ProcessingSettings.builder()
            .maxEmailsPerRun(50)
            .dateRangeDays(7)
            .build();
        
        CompletableFuture<ProcessingResult> future = orchestrator.processMailboxEmails(mailboxId, jobId, settings);
        ProcessingResult result = future.get(5, TimeUnit.SECONDS);
        
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals(5, result.getEmailsProcessed());
        assertEquals(5, result.getPdfsGenerated());
        assertNotNull(result.getMessage());
    }
    
    @Test
    void processMailboxEmails_CompletesAsynchronously_ReturnsCompletableFuture() throws Exception {
        String mailboxId = "test-mailbox-2";
        String jobId = "job-456";
        ProcessingSettings settings = ProcessingSettings.defaultSettings();
        
        CompletableFuture<ProcessingResult> future = orchestrator.processMailboxEmails(mailboxId, jobId, settings);
        
        assertNotNull(future);
        ProcessingResult result = future.get(5, TimeUnit.SECONDS);
        assertNotNull(result);
        assertTrue(result.isSuccess());
    }
    
    @Test
    void processMailboxEmails_WithDifferentSettings_ProcessesCorrectly() throws Exception {
        String mailboxId = "test-mailbox-3";
        String jobId = "job-789";
        ProcessingSettings settings = ProcessingSettings.builder()
            .maxEmailsPerRun(100)
            .dateRangeDays(30)
            .build();
        
        CompletableFuture<ProcessingResult> future = orchestrator.processMailboxEmails(mailboxId, jobId, settings);
        ProcessingResult result = future.get(5, TimeUnit.SECONDS);
        
        assertNotNull(result);
        assertTrue(result.isSuccess());
    }
    
    @Test
    void processMailboxEmails_MultipleMailboxes_ProcessIndependently() throws Exception {
        ProcessingSettings settings = ProcessingSettings.defaultSettings();
        
        CompletableFuture<ProcessingResult> future1 = orchestrator.processMailboxEmails("mailbox-1", "job-1", settings);
        CompletableFuture<ProcessingResult> future2 = orchestrator.processMailboxEmails("mailbox-2", "job-2", settings);
        CompletableFuture<ProcessingResult> future3 = orchestrator.processMailboxEmails("mailbox-3", "job-3", settings);
        
        CompletableFuture<Void> allFutures = CompletableFuture.allOf(future1, future2, future3);
        allFutures.get(10, TimeUnit.SECONDS);
        
        assertTrue(future1.get().isSuccess());
        assertTrue(future2.get().isSuccess());
        assertTrue(future3.get().isSuccess());
    }
    
    @Test
    void processingResult_ContainsExpectedData() throws Exception {
        String mailboxId = "test-mailbox-4";
        String jobId = "job-999";
        ProcessingSettings settings = ProcessingSettings.defaultSettings();
        
        CompletableFuture<ProcessingResult> future = orchestrator.processMailboxEmails(mailboxId, jobId, settings);
        ProcessingResult result = future.get(5, TimeUnit.SECONDS);
        
        assertTrue(result.getEmailsProcessed() > 0);
        assertTrue(result.getPdfsGenerated() > 0);
        assertFalse(result.getMessage().isEmpty());
    }
}
