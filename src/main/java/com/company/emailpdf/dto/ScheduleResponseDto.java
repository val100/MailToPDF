package com.company.emailpdf.dto;

import java.time.LocalDateTime;

public class ScheduleResponseDto {
    private String mailboxId;
    private String cronExpression;
    private String cronDescription;
    private boolean enabled;
    private LocalDateTime lastExecution;
    private LocalDateTime nextExecution;
    private Long executionCount;
    private Long failureCount;
    private Double successRate;
    
    public static ScheduleResponseDto fromScheduleInfo(MailboxScheduleInfo info) {
        ScheduleResponseDto dto = new ScheduleResponseDto();
        dto.mailboxId = info.getMailboxId();
        dto.cronExpression = info.getCronExpression();
        dto.cronDescription = "Custom schedule: " + info.getCronExpression();
        dto.enabled = info.isEnabled();
        dto.lastExecution = info.getLastExecution();
        dto.nextExecution = info.getNextExecution();
        dto.executionCount = info.getExecutionCount();
        dto.failureCount = info.getFailureCount();
        dto.successRate = info.getSuccessRate();
        return dto;
    }
    
    // Getters and setters
    public String getMailboxId() { return mailboxId; }
    public void setMailboxId(String mailboxId) { this.mailboxId = mailboxId; }
    
    public String getCronExpression() { return cronExpression; }
    public void setCronExpression(String cronExpression) { this.cronExpression = cronExpression; }
    
    public String getCronDescription() { return cronDescription; }
    public void setCronDescription(String cronDescription) { this.cronDescription = cronDescription; }
    
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    
    public LocalDateTime getLastExecution() { return lastExecution; }
    public void setLastExecution(LocalDateTime lastExecution) { this.lastExecution = lastExecution; }
    
    public LocalDateTime getNextExecution() { return nextExecution; }
    public void setNextExecution(LocalDateTime nextExecution) { this.nextExecution = nextExecution; }
    
    public Long getExecutionCount() { return executionCount; }
    public void setExecutionCount(Long executionCount) { this.executionCount = executionCount; }
    
    public Long getFailureCount() { return failureCount; }
    public void setFailureCount(Long failureCount) { this.failureCount = failureCount; }
    
    public Double getSuccessRate() { return successRate; }
    public void setSuccessRate(Double successRate) { this.successRate = successRate; }
}