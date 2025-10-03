package com.company.emailpdf.domain;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class MailboxScheduleNegativeTest {
    
    @Test
    void create_WithInvalidCronExpression_HandlesFallback() {
        String mailboxId = "test-mailbox";
        String invalidCron = "INVALID CRON";
        
        MailboxSchedule schedule = MailboxSchedule.create(mailboxId, invalidCron);
        
        assertNotNull(schedule);
        assertEquals(invalidCron, schedule.getCronExpression());
    }
    
    @Test
    void shouldExecute_WithNullNextExecutionTime_ReturnsFalse() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("test-mailbox");
        schedule.setNextExecutionTime(null);
        
        boolean shouldExecute = schedule.shouldExecute();
        
        assertFalse(shouldExecute);
    }
    
    @Test
    void recordExecution_MultipleFailures_TracksCorrectly() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("test-mailbox");
        
        for (int i = 0; i < 10; i++) {
            schedule.recordExecution(false);
        }
        
        assertEquals(10L, schedule.getExecutionCount());
        assertEquals(10L, schedule.getFailureCount());
        assertEquals(0.0, schedule.getSuccessRate(), 0.01);
    }
    
    @Test
    void createDaily_WithInvalidHour_StillCreatesSchedule() {
        MailboxSchedule schedule = MailboxSchedule.createDaily("test-mailbox", 25, 61);
        
        assertNotNull(schedule);
        assertNotNull(schedule.getCronExpression());
    }
    
    @Test
    void setters_WithNullValues_HandleGracefully() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("test-mailbox");
        
        schedule.setMaxEmailsPerRun(null);
        schedule.setDateRangeDays(null);
        
        assertNull(schedule.getMaxEmailsPerRun());
        assertNull(schedule.getDateRangeDays());
    }
    
    @Test
    void recordExecution_UpdatesTimestamps() throws InterruptedException {
        MailboxSchedule schedule = MailboxSchedule.createHourly("test-mailbox");
        LocalDateTime beforeExecution = LocalDateTime.now();
        
        Thread.sleep(10);
        schedule.recordExecution(true);
        
        assertNotNull(schedule.getLastExecutionTime());
        assertTrue(schedule.getLastExecutionTime().isAfter(beforeExecution) || 
                   schedule.getLastExecutionTime().isEqual(beforeExecution));
    }
}
