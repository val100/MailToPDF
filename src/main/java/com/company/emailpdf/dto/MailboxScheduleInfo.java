package com.company.emailpdf.dto;

import java.time.LocalDateTime;

public class MailboxScheduleInfo {
    private final String mailboxId;
    private final String cronExpression;
    private final boolean enabled;
    private final LocalDateTime lastExecution;
    private final LocalDateTime nextExecution;
    private final Long executionCount;
    private final Long failureCount;
    private final double successRate;
    private final ScheduleSettings settings;
    
    private MailboxScheduleInfo(Builder builder) {
        this.mailboxId = builder.mailboxId;
        this.cronExpression = builder.cronExpression;
        this.enabled = builder.enabled;
        this.lastExecution = builder.lastExecution;
        this.nextExecution = builder.nextExecution;
        this.executionCount = builder.executionCount;
        this.failureCount = builder.failureCount;
        this.successRate = builder.successRate;
        this.settings = builder.settings;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String mailboxId;
        private String cronExpression;
        private boolean enabled;
        private LocalDateTime lastExecution;
        private LocalDateTime nextExecution;
        private Long executionCount;
        private Long failureCount;
        private double successRate;
        private ScheduleSettings settings;
        
        public Builder mailboxId(String mailboxId) { this.mailboxId = mailboxId; return this; }
        public Builder cronExpression(String cronExpression) { this.cronExpression = cronExpression; return this; }
        public Builder enabled(boolean enabled) { this.enabled = enabled; return this; }
        public Builder lastExecution(LocalDateTime lastExecution) { this.lastExecution = lastExecution; return this; }
        public Builder nextExecution(LocalDateTime nextExecution) { this.nextExecution = nextExecution; return this; }
        public Builder executionCount(Long executionCount) { this.executionCount = executionCount; return this; }
        public Builder failureCount(Long failureCount) { this.failureCount = failureCount; return this; }
        public Builder successRate(double successRate) { this.successRate = successRate; return this; }
        public Builder settings(ScheduleSettings settings) { this.settings = settings; return this; }
        
        public MailboxScheduleInfo build() {
            return new MailboxScheduleInfo(this);
        }
    }
    
    // Getters
    public String getMailboxId() { return mailboxId; }
    public String getCronExpression() { return cronExpression; }
    public boolean isEnabled() { return enabled; }
    public LocalDateTime getLastExecution() { return lastExecution; }
    public LocalDateTime getNextExecution() { return nextExecution; }
    public Long getExecutionCount() { return executionCount; }
    public Long getFailureCount() { return failureCount; }
    public double getSuccessRate() { return successRate; }
    public ScheduleSettings getSettings() { return settings; }
}