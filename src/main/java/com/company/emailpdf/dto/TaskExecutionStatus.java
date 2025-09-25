package com.company.emailpdf.dto;

import java.time.Duration;
import java.time.LocalDateTime;

public class TaskExecutionStatus {
    private final String mailboxId;
    private final String status;
    private final LocalDateTime startTime;
    private final Duration duration;
    private final String threadName;
    private final boolean cancelled;
    
    private TaskExecutionStatus(Builder builder) {
        this.mailboxId = builder.mailboxId;
        this.status = builder.status;
        this.startTime = builder.startTime;
        this.duration = builder.duration;
        this.threadName = builder.threadName;
        this.cancelled = builder.cancelled;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String mailboxId;
        private String status;
        private LocalDateTime startTime;
        private Duration duration;
        private String threadName;
        private boolean cancelled;
        
        public Builder mailboxId(String mailboxId) { this.mailboxId = mailboxId; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public Builder duration(Duration duration) { this.duration = duration; return this; }
        public Builder threadName(String threadName) { this.threadName = threadName; return this; }
        public Builder cancelled(boolean cancelled) { this.cancelled = cancelled; return this; }
        
        public TaskExecutionStatus build() {
            return new TaskExecutionStatus(this);
        }
    }
    
    // Getters
    public String getMailboxId() { return mailboxId; }
    public String getStatus() { return status; }
    public LocalDateTime getStartTime() { return startTime; }
    public Duration getDuration() { return duration; }
    public String getThreadName() { return threadName; }
    public boolean isCancelled() { return cancelled; }
}

class TaskStatusResponseDto {
    private String mailboxId;
    private String status;
    private LocalDateTime startTime;
    private String duration;
    private String threadName;
    private boolean cancelled;
    private String message;
    
    public static TaskStatusResponseDto fromTaskExecutionStatus(TaskExecutionStatus status) {
        TaskStatusResponseDto dto = new TaskStatusResponseDto();
        dto.mailboxId = status.getMailboxId();
        dto.status = status.getStatus();
        dto.startTime = status.getStartTime();
        dto.duration = status.getDuration() != null ? status.getDuration().toString() : null;
        dto.threadName = status.getThreadName();
        dto.cancelled = status.isCancelled();
        dto.message = "Task is " + status.getStatus().toLowerCase();
        return dto;
    }
    
    public static Builder builder() { return new Builder(); }
    
    public static class Builder {
        private String mailboxId;
        private String status;
        private String message;
        
        public Builder mailboxId(String mailboxId) { this.mailboxId = mailboxId; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder message(String message) { this.message = message; return this; }
        
        public TaskStatusResponseDto build() {
            TaskStatusResponseDto dto = new TaskStatusResponseDto();
            dto.mailboxId = this.mailboxId;
            dto.status = this.status;
            dto.message = this.message;
            return dto;
        }
    }
    
    // Getters and setters
    public String getMailboxId() { return mailboxId; }
    public void setMailboxId(String mailboxId) { this.mailboxId = mailboxId; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    
    public String getThreadName() { return threadName; }
    public void setThreadName(String threadName) { this.threadName = threadName; }
    
    public boolean isCancelled() { return cancelled; }
    public void setCancelled(boolean cancelled) { this.cancelled = cancelled; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}