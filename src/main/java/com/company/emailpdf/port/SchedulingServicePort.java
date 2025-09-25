package com.company.emailpdf.port;

import com.company.emailpdf.dto.MailboxScheduleInfo;
import com.company.emailpdf.dto.ScheduleSettings;

import java.util.List;

public interface SchedulingServicePort {
    void scheduleMailboxProcessing(String mailboxId, String cronExpression, ScheduleSettings settings);
    void updateSchedule(String mailboxId, String cronExpression, ScheduleSettings settings);
    void enableSchedule(String mailboxId);
    void disableSchedule(String mailboxId);
    void deleteSchedule(String mailboxId);
    MailboxScheduleInfo getScheduleInfo(String mailboxId);
    List<MailboxScheduleInfo> getAllSchedules();
    void executeScheduledTasks();
}