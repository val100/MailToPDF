package com.company.emailpdf.service;

import com.company.emailpdf.domain.MailboxSchedule;
import com.company.emailpdf.dto.*;
import com.company.emailpdf.exception.*;
import com.company.emailpdf.repository.MailboxScheduleRepository;
import com.company.emailpdf.port.SchedulingServicePort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import jakarta.annotation.PostConstruct;

@Service
public class DynamicSchedulingService implements SchedulingServicePort {
    
    private static final Logger log = LoggerFactory.getLogger(DynamicSchedulingService.class);
    
    private final TaskScheduler taskScheduler;
    private final MailboxScheduleRepository scheduleRepository;
    private final EmailProcessingOrchestrator emailProcessor;
    private final MailboxLockingService lockingService;
    
    // Map to track scheduled tasks for dynamic management
    private final ConcurrentHashMap<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();
    
    public DynamicSchedulingService(TaskScheduler taskScheduler,
                                   MailboxScheduleRepository scheduleRepository,
                                   EmailProcessingOrchestrator emailProcessor,
                                   MailboxLockingService lockingService) {
        this.taskScheduler = taskScheduler;
        this.scheduleRepository = scheduleRepository;
        this.emailProcessor = emailProcessor;
        this.lockingService = lockingService;
    }
    
    @PostConstruct
    private void initializeExistingSchedules() {
        List<MailboxSchedule> enabledSchedules = scheduleRepository.findEnabledSchedules();
        
        for (MailboxSchedule schedule : enabledSchedules) {
            try {
                scheduleMailboxTask(schedule);
                log.info("Initialized schedule for mailbox: {} with cron: {}", 
                    schedule.getMailboxId(), schedule.getCronExpression());
            } catch (Exception e) {
                log.error("Failed to initialize schedule for mailbox: {}", schedule.getMailboxId(), e);
            }
        }
        
        log.info("Initialized {} scheduled tasks", scheduledTasks.size());
    }
    
    @Override
    public void scheduleMailboxProcessing(String mailboxId, String cronExpression, ScheduleSettings settings) {
        try {
            validateCronExpression(cronExpression);
            
            // Create or update schedule entity
            MailboxSchedule schedule = MailboxSchedule.create(mailboxId, cronExpression);
            schedule.setMaxEmailsPerRun(settings.getMaxEmailsPerRun());
            schedule.setDateRangeDays(settings.getDateRangeDays());
            
            scheduleRepository.save(schedule);
            
            // Schedule the task dynamically
            scheduleMailboxTask(schedule);
            
            log.info("Scheduled mailbox processing - ID: {}, Cron: {}, Settings: {}", 
                mailboxId, cronExpression, settings);
                
        } catch (Exception e) {
            throw new SchedulingException("Failed to schedule mailbox processing: " + mailboxId, e);
        }
    }
    
    @Override
    public MailboxScheduleInfo getScheduleInfo(String mailboxId) {
        MailboxSchedule schedule = scheduleRepository.findByMailboxId(mailboxId)
            .orElseThrow(() -> new ScheduleNotFoundException("Schedule not found for mailbox: " + mailboxId));
        
        return convertToScheduleInfo(schedule);
    }
    
    @Override
    public List<MailboxScheduleInfo> getAllSchedules() {
        return scheduleRepository.findEnabledSchedules()
            .stream()
            .map(this::convertToScheduleInfo)
            .collect(Collectors.toList());
    }
    
    private void scheduleMailboxTask(MailboxSchedule schedule) {
        try {
            CronTrigger trigger = new CronTrigger(schedule.getCronExpression());
            
            Runnable task = () -> executeMailboxProcessing(schedule.getMailboxId());
            
            ScheduledFuture<?> scheduledTask = taskScheduler.schedule(task, trigger);
            
            // Store the scheduled task for management
            ScheduledFuture<?> existingTask = scheduledTasks.put(schedule.getMailboxId(), scheduledTask);
            
            // Cancel existing task if there was one
            if (existingTask != null && !existingTask.isDone()) {
                existingTask.cancel(false);
            }
            
        } catch (Exception e) {
            throw new SchedulingException("Failed to schedule task for mailbox: " + schedule.getMailboxId(), e);
        }
    }
    
    private void executeMailboxProcessing(String mailboxId) {
        // Ensure only one task per mailbox (thread safety)
        if (!lockingService.tryAcquireLock(mailboxId)) {
            log.info("Skipping scheduled execution for mailbox {} - task already running", mailboxId);
            return;
        }
        
        try {
            log.info("Starting scheduled email processing for mailbox: {}", mailboxId);
            
            MailboxSchedule schedule = scheduleRepository.findByMailboxId(mailboxId).orElse(null);
            if (schedule == null || !schedule.isEnabled()) {
                log.warn("Schedule not found or disabled for mailbox: {}", mailboxId);
                return;
            }
            
            // Create processing job
            String jobId = UUID.randomUUID().toString();
            
            // Execute email processing
            CompletableFuture<ProcessingResult> processingFuture = emailProcessor.processMailboxEmails(
                mailboxId, jobId, createProcessingSettings(schedule));
            
            // Wait for completion and record results
            ProcessingResult result = processingFuture.get(30, TimeUnit.MINUTES); // 30 min timeout
            
            // Update schedule execution record
            schedule.recordExecution(result.isSuccess());
            scheduleRepository.save(schedule);
            
            log.info("Completed scheduled processing for mailbox: {} - Success: {}, Processed: {}", 
                mailboxId, result.isSuccess(), result.getEmailsProcessed());
            
        } catch (Exception e) {
            log.error("Scheduled processing failed for mailbox: {}", mailboxId, e);
            
            // Record failure
            try {
                MailboxSchedule schedule = scheduleRepository.findByMailboxId(mailboxId).orElse(null);
                if (schedule != null) {
                    schedule.recordExecution(false);
                    scheduleRepository.save(schedule);
                }
            } catch (Exception dbError) {
                log.error("Failed to record execution failure", dbError);
            }
            
        } finally {
            lockingService.releaseLock(mailboxId);
        }
    }
    
    private void validateCronExpression(String cronExpression) {
        try {
            org.springframework.scheduling.support.CronExpression.parse(cronExpression);
        } catch (Exception e) {
            throw new InvalidCronExpressionException("Invalid cron expression: " + cronExpression, e);
        }
    }
    
    private ProcessingSettings createProcessingSettings(MailboxSchedule schedule) {
        return ProcessingSettings.builder()
            .maxEmailsPerRun(schedule.getMaxEmailsPerRun())
            .dateRangeDays(schedule.getDateRangeDays())
            .includeAttachments(true)
            .combineAttachmentsInPdf(true)
            .build();
    }
    
    private MailboxScheduleInfo convertToScheduleInfo(MailboxSchedule schedule) {
        ScheduleSettings settings = ScheduleSettings.builder()
            .maxEmailsPerRun(schedule.getMaxEmailsPerRun())
            .dateRangeDays(schedule.getDateRangeDays())
            .includeAttachments(true)
            .combineAttachmentsInPdf(true)
            .build();
        
        return MailboxScheduleInfo.builder()
            .mailboxId(schedule.getMailboxId())
            .cronExpression(schedule.getCronExpression())
            .enabled(schedule.isEnabled())
            .lastExecution(schedule.getLastExecutionTime())
            .nextExecution(schedule.getNextExecutionTime())
            .executionCount(schedule.getExecutionCount())
            .failureCount(schedule.getFailureCount())
            .successRate(schedule.getSuccessRate())
            .settings(settings)
            .build();
    }
    
    @Override
    public void updateSchedule(String mailboxId, String cronExpression, ScheduleSettings settings) {
        // Implementation similar to scheduleMailboxProcessing but for updates
        throw new UnsupportedOperationException("Not yet implemented");
    }
    
    @Override
    public void enableSchedule(String mailboxId) {
        // Implementation for enabling schedule
        throw new UnsupportedOperationException("Not yet implemented");
    }
    
    @Override
    public void disableSchedule(String mailboxId) {
        // Implementation for disabling schedule
        throw new UnsupportedOperationException("Not yet implemented");
    }
    
    @Override
    public void deleteSchedule(String mailboxId) {
        // Implementation for deleting schedule
        throw new UnsupportedOperationException("Not yet implemented");
    }
    
    @Override
    public void executeScheduledTasks() {
        // Implementation for executing scheduled tasks
        throw new UnsupportedOperationException("Not yet implemented");
    }
}