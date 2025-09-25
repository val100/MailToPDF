package com.company.emailpdf.controller;

import com.company.emailpdf.dto.*;
import com.company.emailpdf.port.SchedulingServicePort;
import com.company.emailpdf.service.TaskExecutionService;
import com.company.emailpdf.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/mailboxes")
@Validated
public class MailboxController {
    
    private final SchedulingServicePort schedulingService;
    private final TaskExecutionService taskExecutionService;
    
    public MailboxController(SchedulingServicePort schedulingService,
                           TaskExecutionService taskExecutionService) {
        this.schedulingService = schedulingService;
        this.taskExecutionService = taskExecutionService;
    }
    
    /**
     * Configure mailbox processing schedule
     * POST /api/mailboxes/{mailboxId}/schedule
     */
    @PostMapping("/{mailboxId}/schedule")
    public ResponseEntity<ScheduleResponseDto> configureSchedule(
            @PathVariable @NotBlank String mailboxId,
            @RequestBody @Valid ScheduleConfigurationDto request) {
        
        try {
            ScheduleSettings settings = ScheduleSettings.builder()
                .maxEmailsPerRun(request.getMaxEmailsPerRun())
                .dateRangeDays(request.getDateRangeDays())
                .includeAttachments(request.isIncludeAttachments())
                .combineAttachmentsInPdf(request.isCombineAttachmentsInPdf())
                .build();
            
            schedulingService.scheduleMailboxProcessing(mailboxId, request.getCronExpression(), settings);
            
            MailboxScheduleInfo scheduleInfo = schedulingService.getScheduleInfo(mailboxId);
            ScheduleResponseDto response = ScheduleResponseDto.fromScheduleInfo(scheduleInfo);
            
            return ResponseEntity.ok(response);
            
        } catch (InvalidCronExpressionException e) {
            throw new BadRequestException("Invalid cron expression: " + e.getMessage());
        } catch (Exception e) {
            throw new InternalServerException("Failed to configure schedule: " + e.getMessage());
        }
    }
    
    /**
     * Get schedule information
     * GET /api/mailboxes/{mailboxId}/schedule
     */
    @GetMapping("/{mailboxId}/schedule")
    public ResponseEntity<ScheduleResponseDto> getSchedule(@PathVariable @NotBlank String mailboxId) {
        try {
            MailboxScheduleInfo scheduleInfo = schedulingService.getScheduleInfo(mailboxId);
            ScheduleResponseDto response = ScheduleResponseDto.fromScheduleInfo(scheduleInfo);
            return ResponseEntity.ok(response);
        } catch (ScheduleNotFoundException e) {
            throw new NotFoundException("Schedule not found for mailbox: " + mailboxId);
        }
    }
    
    /**
     * Trigger immediate processing
     * POST /api/mailboxes/{mailboxId}/process
     */
    @PostMapping("/{mailboxId}/process")
    public ResponseEntity<ProcessingJobResponseDto> triggerProcessing(
            @PathVariable @NotBlank String mailboxId,
            @RequestBody @Valid ProcessingRequestDto request) {
        
        try {
            ProcessingSettings settings = ProcessingSettings.builder()
                .maxEmailsPerRun(request.getMaxEmailsPerRun())
                .dateRangeDays(request.getDateRangeDays())
                .includeAttachments(request.isIncludeAttachments())
                .combineAttachmentsInPdf(request.isCombineAttachmentsInPdf())
                .build();
            
            ProcessingRequest processingRequest = ProcessingRequest.builder()
                .settings(settings)
                .requestedBy("API")
                .requestedAt(LocalDateTime.now())
                .reason("Manual trigger via API")
                .build();
            
            CompletableFuture<ProcessingResult> future = taskExecutionService.executeProcessingTask(
                mailboxId, processingRequest);
            
            ProcessingJobResponseDto response = ProcessingJobResponseDto.builder()
                .mailboxId(mailboxId)
                .status("RUNNING")
                .triggeredAt(LocalDateTime.now())
                .message("Processing task started successfully")
                .build();
            
            return ResponseEntity.accepted().body(response);
            
        } catch (MailboxLockException e) {
            throw new ConflictException("Another processing task is already running for this mailbox");
        } catch (Exception e) {
            throw new InternalServerException("Failed to trigger processing: " + e.getMessage());
        }
    }
    
    /**
     * Get processing task status
     * GET /api/mailboxes/{mailboxId}/status
     */
    @GetMapping("/{mailboxId}/status")
    public ResponseEntity<TaskStatusResponseDto> getTaskStatus(@PathVariable @NotBlank String mailboxId) {
        Optional<TaskExecutionStatus> status = taskExecutionService.getTaskStatus(mailboxId);
        
        if (status.isPresent()) {
            TaskStatusResponseDto response = TaskStatusResponseDto.fromTaskExecutionStatus(status.get());
            return ResponseEntity.ok(response);
        } else {
            TaskStatusResponseDto response = TaskStatusResponseDto.builder()
                .mailboxId(mailboxId)
                .status("IDLE")
                .message("No active processing task")
                .build();
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * Cancel running task
     * POST /api/mailboxes/{mailboxId}/cancel
     */
    @PostMapping("/{mailboxId}/cancel")
    public ResponseEntity<TaskStatusResponseDto> cancelTask(@PathVariable @NotBlank String mailboxId) {
        boolean cancelled = taskExecutionService.cancelTask(mailboxId);
        
        TaskStatusResponseDto response = TaskStatusResponseDto.builder()
            .mailboxId(mailboxId)
            .status(cancelled ? "CANCELLED" : "NOT_RUNNING")
            .message(cancelled ? "Task cancelled successfully" : "No running task to cancel")
            .build();
        
        return ResponseEntity.ok(response);
    }
}