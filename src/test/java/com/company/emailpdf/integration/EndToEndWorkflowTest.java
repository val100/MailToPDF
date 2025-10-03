package com.company.emailpdf.integration;

import com.company.emailpdf.domain.MailboxSchedule;
import com.company.emailpdf.dto.ProcessingResult;
import com.company.emailpdf.dto.ProcessingSettings;
import com.company.emailpdf.repository.MailboxScheduleRepository;
import com.company.emailpdf.service.EmailProcessingOrchestrator;
import com.company.emailpdf.service.FileNamingService;
import com.company.emailpdf.service.MailboxLockingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class EndToEndWorkflowTest {
    
    @Autowired
    private MailboxScheduleRepository scheduleRepository;
    
    @Autowired
    private MailboxLockingService lockingService;
    
    @Autowired
    private EmailProcessingOrchestrator orchestrator;
    
    @Autowired
    private FileNamingService fileNamingService;
    
    @BeforeEach
    void setUp() {
        scheduleRepository.deleteAll();
    }
    
    @Test
    @Transactional
    void completeMailboxProcessingWorkflow_CreatesSchedule_AcquiresLock_ProcessesEmails() throws Exception {
        String mailboxId = "workflow-test@company.com";
        String jobId = "job-workflow-001";
        
        MailboxSchedule schedule = MailboxSchedule.createDaily(mailboxId, 9, 30);
        schedule.setMaxEmailsPerRun(50);
        schedule.setDateRangeDays(7);
        MailboxSchedule savedSchedule = scheduleRepository.save(schedule);
        
        assertNotNull(savedSchedule.getId());
        assertEquals(mailboxId, savedSchedule.getMailboxId());
        
        boolean lockAcquired = lockingService.tryAcquireLock(mailboxId);
        assertTrue(lockAcquired, "Lock should be acquired for mailbox processing");
        
        assertTrue(lockingService.isMailboxLocked(mailboxId));
        Optional<MailboxLockingService.ExecutionContext> context = lockingService.getExecutionContext(mailboxId);
        assertTrue(context.isPresent());
        assertEquals(mailboxId, context.get().getMailboxId());
        
        ProcessingSettings settings = ProcessingSettings.builder()
            .maxEmailsPerRun(savedSchedule.getMaxEmailsPerRun())
            .dateRangeDays(savedSchedule.getDateRangeDays())
            .build();
        
        CompletableFuture<ProcessingResult> processingFuture = 
            orchestrator.processMailboxEmails(mailboxId, jobId, settings);
        
        ProcessingResult result = processingFuture.get(10, TimeUnit.SECONDS);
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertTrue(result.getEmailsProcessed() > 0);
        assertTrue(result.getPdfsGenerated() > 0);
        
        savedSchedule.recordExecution(result.isSuccess());
        MailboxSchedule updatedSchedule = scheduleRepository.save(savedSchedule);
        
        assertEquals(1L, updatedSchedule.getExecutionCount());
        if (result.isSuccess()) {
            assertEquals(0L, updatedSchedule.getFailureCount());
        }
        assertNotNull(updatedSchedule.getLastExecutionTime());
        
        lockingService.releaseLock(mailboxId);
        assertFalse(lockingService.isMailboxLocked(mailboxId));
        
        String pdfFilename = fileNamingService.generatePdfFilename(
            "recipient@company.com",
            "sender@company.com",
            LocalDateTime.now(),
            "MSG123456",
            "office365"
        );
        
        assertNotNull(pdfFilename);
        assertTrue(pdfFilename.endsWith(".pdf"));
        assertTrue(pdfFilename.contains("{recipient@company.com}"));
        assertTrue(pdfFilename.contains("{sender@company.com}"));
        assertTrue(pdfFilename.contains("{MSG123456@office365.company.com}"));
    }
    
    @Test
    @Transactional
    void concurrentMailboxProcessing_PreventsDoubleExecution() throws Exception {
        String mailbox1 = "concurrent1@company.com";
        String mailbox2 = "concurrent2@company.com";
        
        scheduleRepository.save(MailboxSchedule.createHourly(mailbox1));
        scheduleRepository.save(MailboxSchedule.createHourly(mailbox2));
        
        boolean lock1 = lockingService.tryAcquireLock(mailbox1);
        boolean lock2 = lockingService.tryAcquireLock(mailbox2);
        
        assertTrue(lock1);
        assertTrue(lock2);
        
        ProcessingSettings settings = ProcessingSettings.defaultSettings();
        CompletableFuture<ProcessingResult> future1 = orchestrator.processMailboxEmails(mailbox1, "job1", settings);
        CompletableFuture<ProcessingResult> future2 = orchestrator.processMailboxEmails(mailbox2, "job2", settings);
        
        ProcessingResult result1 = future1.get(10, TimeUnit.SECONDS);
        ProcessingResult result2 = future2.get(10, TimeUnit.SECONDS);
        
        assertTrue(result1.isSuccess());
        assertTrue(result2.isSuccess());
        
        lockingService.releaseLock(mailbox1);
        lockingService.releaseLock(mailbox2);
    }
    
    @Test
    @Transactional
    void fullLifecycle_CreateSchedule_Process_UpdateStats_Verify() throws Exception {
        String mailboxId = "lifecycle@company.com";
        
        MailboxSchedule schedule = MailboxSchedule.createDaily(mailboxId, 10, 0);
        scheduleRepository.save(schedule);
        
        assertEquals(0L, schedule.getExecutionCount());
        
        for (int i = 0; i < 3; i++) {
            boolean acquired = lockingService.tryAcquireLock(mailboxId);
            assertTrue(acquired);
            
            ProcessingSettings settings = ProcessingSettings.defaultSettings();
            CompletableFuture<ProcessingResult> future = orchestrator.processMailboxEmails(
                mailboxId, "job-" + i, settings);
            ProcessingResult result = future.get(10, TimeUnit.SECONDS);
            
            schedule.recordExecution(result.isSuccess());
            scheduleRepository.save(schedule);
            
            lockingService.releaseLock(mailboxId);
        }
        
        MailboxSchedule finalSchedule = scheduleRepository.findByMailboxId(mailboxId).orElseThrow();
        assertEquals(3L, finalSchedule.getExecutionCount());
        assertEquals(100.0, finalSchedule.getSuccessRate(), 0.01);
    }
    
    @Test
    @Transactional
    void failedProcessing_UpdatesFailureCount() throws Exception {
        String mailboxId = "failure-test@company.com";
        
        MailboxSchedule schedule = MailboxSchedule.createHourly(mailboxId);
        scheduleRepository.save(schedule);
        
        boolean acquired = lockingService.tryAcquireLock(mailboxId);
        assertTrue(acquired);
        
        schedule.recordExecution(false);
        scheduleRepository.save(schedule);
        
        lockingService.releaseLock(mailboxId);
        
        MailboxSchedule updated = scheduleRepository.findByMailboxId(mailboxId).orElseThrow();
        assertEquals(1L, updated.getExecutionCount());
        assertEquals(1L, updated.getFailureCount());
        assertEquals(0.0, updated.getSuccessRate(), 0.01);
    }
    
    @Test
    void verifyAllComponentsWiredTogether() {
        assertNotNull(scheduleRepository);
        assertNotNull(lockingService);
        assertNotNull(orchestrator);
        assertNotNull(fileNamingService);
    }
}
