package com.company.emailpdf.domain;

import jakarta.persistence.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.support.CronExpression;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mailbox_schedules")
public class MailboxSchedule {
    
    private static final Logger log = LoggerFactory.getLogger(MailboxSchedule.class);
    
    @Id
    private String id;
    
    @Column(name = "mailbox_id", nullable = false, unique = true)
    private String mailboxId;
    
    @Column(name = "cron_expression", nullable = false)
    private String cronExpression;
    
    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;
    
    @Column(name = "max_emails_per_run")
    private Integer maxEmailsPerRun = 50;
    
    @Column(name = "date_range_days")
    private Integer dateRangeDays = 7;
    
    @Column(name = "last_execution_time")
    private LocalDateTime lastExecutionTime;
    
    @Column(name = "next_execution_time")
    private LocalDateTime nextExecutionTime;
    
    @Column(name = "execution_count", nullable = false)
    private Long executionCount = 0L;
    
    @Column(name = "failure_count", nullable = false)
    private Long failureCount = 0L;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Version
    private Long version; // Optimistic locking
    
    // Default constructor for JPA
    protected MailboxSchedule() {}
    
    // Business methods
    public void recordExecution(boolean successful) {
        this.lastExecutionTime = LocalDateTime.now();
        this.executionCount++;
        
        if (!successful) {
            this.failureCount++;
        }
        
        // Calculate next execution time
        this.nextExecutionTime = calculateNextExecution();
        this.updatedAt = LocalDateTime.now();
    }
    
    public boolean shouldExecute() {
        return enabled && 
               nextExecutionTime != null && 
               LocalDateTime.now().isAfter(nextExecutionTime);
    }
    
    public double getSuccessRate() {
        if (executionCount == 0) return 0.0;
        return ((double) (executionCount - failureCount)) / executionCount * 100.0;
    }
    
    private LocalDateTime calculateNextExecution() {
        try {
            CronExpression cron = CronExpression.parse(cronExpression);
            return cron.next(LocalDateTime.now());
        } catch (Exception e) {
            log.error("Failed to calculate next execution time for mailbox: {}", mailboxId, e);
            return LocalDateTime.now().plusHours(1); // Fallback to 1 hour
        }
    }
    
    // Static factory methods
    public static MailboxSchedule createDaily(String mailboxId, int hour, int minute) {
        return create(mailboxId, String.format("0 %d %d * * ?", minute, hour));
    }
    
    public static MailboxSchedule createHourly(String mailboxId) {
        return create(mailboxId, "0 0 * * * ?");
    }
    
    public static MailboxSchedule create(String mailboxId, String cronExpression) {
        MailboxSchedule schedule = new MailboxSchedule();
        schedule.id = UUID.randomUUID().toString();
        schedule.mailboxId = mailboxId;
        schedule.cronExpression = cronExpression;
        schedule.enabled = true;
        schedule.createdAt = LocalDateTime.now();
        schedule.updatedAt = LocalDateTime.now();
        schedule.nextExecutionTime = schedule.calculateNextExecution();
        return schedule;
    }
    
    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getMailboxId() { return mailboxId; }
    public void setMailboxId(String mailboxId) { this.mailboxId = mailboxId; }
    
    public String getCronExpression() { return cronExpression; }
    public void setCronExpression(String cronExpression) { this.cronExpression = cronExpression; }
    
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    
    public Integer getMaxEmailsPerRun() { return maxEmailsPerRun; }
    public void setMaxEmailsPerRun(Integer maxEmailsPerRun) { this.maxEmailsPerRun = maxEmailsPerRun; }
    
    public Integer getDateRangeDays() { return dateRangeDays; }
    public void setDateRangeDays(Integer dateRangeDays) { this.dateRangeDays = dateRangeDays; }
    
    public LocalDateTime getLastExecutionTime() { return lastExecutionTime; }
    public void setLastExecutionTime(LocalDateTime lastExecutionTime) { this.lastExecutionTime = lastExecutionTime; }
    
    public LocalDateTime getNextExecutionTime() { return nextExecutionTime; }
    public void setNextExecutionTime(LocalDateTime nextExecutionTime) { this.nextExecutionTime = nextExecutionTime; }
    
    public Long getExecutionCount() { return executionCount; }
    public void setExecutionCount(Long executionCount) { this.executionCount = executionCount; }
    
    public Long getFailureCount() { return failureCount; }
    public void setFailureCount(Long failureCount) { this.failureCount = failureCount; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}