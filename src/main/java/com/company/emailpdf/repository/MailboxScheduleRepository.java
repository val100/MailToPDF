package com.company.emailpdf.repository;

import com.company.emailpdf.domain.MailboxSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MailboxScheduleRepository extends JpaRepository<MailboxSchedule, String> {
    
    Optional<MailboxSchedule> findByMailboxId(String mailboxId);
    
    @Query("SELECT ms FROM MailboxSchedule ms WHERE ms.enabled = true")
    List<MailboxSchedule> findEnabledSchedules();
    
    @Query("SELECT ms FROM MailboxSchedule ms WHERE ms.enabled = true AND ms.nextExecutionTime <= :now")
    List<MailboxSchedule> findSchedulesReadyForExecution(LocalDateTime now);
    
    @Query("SELECT ms FROM MailboxSchedule ms WHERE ms.nextExecutionTime < :cutoff")
    List<MailboxSchedule> findByNextExecutionTimeBefore(LocalDateTime cutoff);
    
    void deleteByMailboxId(String mailboxId);
}