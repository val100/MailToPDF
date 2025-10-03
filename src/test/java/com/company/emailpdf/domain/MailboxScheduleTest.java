package com.company.emailpdf.domain;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class MailboxScheduleTest {
    
    @Test
    void create_WithValidCronExpression_CreatesSchedule() {
        String mailboxId = "test-mailbox";
        String cronExpression = "0 0 9 * * ?";
        
        MailboxSchedule schedule = MailboxSchedule.create(mailboxId, cronExpression);
        
        assertNotNull(schedule);
        assertNotNull(schedule.getId());
        assertEquals(mailboxId, schedule.getMailboxId());
        assertEquals(cronExpression, schedule.getCronExpression());
        assertTrue(schedule.isEnabled());
        assertNotNull(schedule.getNextExecutionTime());
        assertNotNull(schedule.getCreatedAt());
        assertNotNull(schedule.getUpdatedAt());
    }
    
    @Test
    void createDaily_WithHourAndMinute_CreatesCorrectCron() {
        String mailboxId = "daily-mailbox";
        
        MailboxSchedule schedule = MailboxSchedule.createDaily(mailboxId, 9, 30);
        
        assertNotNull(schedule);
        assertEquals(mailboxId, schedule.getMailboxId());
        assertEquals("0 30 9 * * ?", schedule.getCronExpression());
    }
    
    @Test
    void createHourly_CreatesCorrectCron() {
        String mailboxId = "hourly-mailbox";
        
        MailboxSchedule schedule = MailboxSchedule.createHourly(mailboxId);
        
        assertNotNull(schedule);
        assertEquals(mailboxId, schedule.getMailboxId());
        assertEquals("0 0 * * * ?", schedule.getCronExpression());
    }
    
    @Test
    void recordExecution_WithSuccess_UpdatesCounters() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("test-mailbox");
        Long initialExecutionCount = schedule.getExecutionCount();
        Long initialFailureCount = schedule.getFailureCount();
        
        schedule.recordExecution(true);
        
        assertEquals(initialExecutionCount + 1, schedule.getExecutionCount());
        assertEquals(initialFailureCount, schedule.getFailureCount());
        assertNotNull(schedule.getLastExecutionTime());
        assertNotNull(schedule.getNextExecutionTime());
    }
    
    @Test
    void recordExecution_WithFailure_UpdatesBothCounters() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("test-mailbox");
        Long initialExecutionCount = schedule.getExecutionCount();
        Long initialFailureCount = schedule.getFailureCount();
        
        schedule.recordExecution(false);
        
        assertEquals(initialExecutionCount + 1, schedule.getExecutionCount());
        assertEquals(initialFailureCount + 1, schedule.getFailureCount());
    }
    
    @Test
    void shouldExecute_WhenEnabledAndTimePassed_ReturnsTrue() throws InterruptedException {
        MailboxSchedule schedule = MailboxSchedule.create("test-mailbox", "0 0 9 * * ?");
        schedule.setNextExecutionTime(LocalDateTime.now().minusMinutes(1));
        
        boolean shouldExecute = schedule.shouldExecute();
        
        assertTrue(shouldExecute);
    }
    
    @Test
    void shouldExecute_WhenDisabled_ReturnsFalse() {
        MailboxSchedule schedule = MailboxSchedule.create("test-mailbox", "0 0 9 * * ?");
        schedule.setNextExecutionTime(LocalDateTime.now().minusMinutes(1));
        schedule.setEnabled(false);
        
        boolean shouldExecute = schedule.shouldExecute();
        
        assertFalse(shouldExecute);
    }
    
    @Test
    void shouldExecute_WhenTimeNotYetPassed_ReturnsFalse() {
        MailboxSchedule schedule = MailboxSchedule.create("test-mailbox", "0 0 9 * * ?");
        schedule.setNextExecutionTime(LocalDateTime.now().plusHours(1));
        
        boolean shouldExecute = schedule.shouldExecute();
        
        assertFalse(shouldExecute);
    }
    
    @Test
    void getSuccessRate_WithNoExecutions_ReturnsZero() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("test-mailbox");
        
        double successRate = schedule.getSuccessRate();
        
        assertEquals(0.0, successRate);
    }
    
    @Test
    void getSuccessRate_WithAllSuccessful_Returns100() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("test-mailbox");
        schedule.recordExecution(true);
        schedule.recordExecution(true);
        schedule.recordExecution(true);
        
        double successRate = schedule.getSuccessRate();
        
        assertEquals(100.0, successRate, 0.01);
    }
    
    @Test
    void getSuccessRate_WithPartialFailures_ReturnsCorrectPercentage() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("test-mailbox");
        schedule.recordExecution(true);
        schedule.recordExecution(true);
        schedule.recordExecution(false);
        schedule.recordExecution(true);
        
        double successRate = schedule.getSuccessRate();
        
        assertEquals(75.0, successRate, 0.01);
    }
    
    @Test
    void setters_UpdateValuesCorrectly() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("test-mailbox");
        
        schedule.setMaxEmailsPerRun(100);
        schedule.setDateRangeDays(30);
        schedule.setEnabled(false);
        
        assertEquals(100, schedule.getMaxEmailsPerRun());
        assertEquals(30, schedule.getDateRangeDays());
        assertFalse(schedule.isEnabled());
    }
    
    @Test
    void multipleExecutions_TrackCorrectly() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("test-mailbox");
        
        for (int i = 0; i < 10; i++) {
            schedule.recordExecution(i % 3 != 0);
        }
        
        assertEquals(10L, schedule.getExecutionCount());
        assertEquals(4L, schedule.getFailureCount());
        assertEquals(60.0, schedule.getSuccessRate(), 0.01);
    }
}
