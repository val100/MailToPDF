package com.company.emailpdf.repository;

import com.company.emailpdf.domain.MailboxSchedule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class MailboxScheduleRepositoryTest {
    
    @Autowired
    private MailboxScheduleRepository repository;
    
    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }
    
    @Test
    void save_WithValidSchedule_SavesSuccessfully() {
        MailboxSchedule schedule = MailboxSchedule.createDaily("test-mailbox", 9, 30);
        
        MailboxSchedule saved = repository.save(schedule);
        
        assertNotNull(saved);
        assertNotNull(saved.getId());
        assertEquals("test-mailbox", saved.getMailboxId());
    }
    
    @Test
    void findByMailboxId_WhenExists_ReturnsSchedule() {
        MailboxSchedule schedule = MailboxSchedule.createDaily("mailbox-1", 10, 0);
        repository.save(schedule);
        
        Optional<MailboxSchedule> found = repository.findByMailboxId("mailbox-1");
        
        assertTrue(found.isPresent());
        assertEquals("mailbox-1", found.get().getMailboxId());
    }
    
    @Test
    void findByMailboxId_WhenNotExists_ReturnsEmpty() {
        Optional<MailboxSchedule> found = repository.findByMailboxId("non-existent");
        
        assertTrue(found.isEmpty());
    }
    
    @Test
    void findEnabledSchedules_ReturnsOnlyEnabled() {
        MailboxSchedule enabled1 = MailboxSchedule.createHourly("enabled-1");
        MailboxSchedule enabled2 = MailboxSchedule.createHourly("enabled-2");
        MailboxSchedule disabled = MailboxSchedule.createHourly("disabled-1");
        disabled.setEnabled(false);
        
        repository.save(enabled1);
        repository.save(enabled2);
        repository.save(disabled);
        
        List<MailboxSchedule> enabledSchedules = repository.findEnabledSchedules();
        
        assertEquals(2, enabledSchedules.size());
        assertTrue(enabledSchedules.stream().allMatch(MailboxSchedule::isEnabled));
    }
    
    @Test
    void findSchedulesReadyForExecution_ReturnsReadySchedules() {
        MailboxSchedule ready1 = MailboxSchedule.createHourly("ready-1");
        ready1.setNextExecutionTime(LocalDateTime.now().minusMinutes(5));
        
        MailboxSchedule ready2 = MailboxSchedule.createHourly("ready-2");
        ready2.setNextExecutionTime(LocalDateTime.now().minusMinutes(1));
        
        MailboxSchedule future = MailboxSchedule.createHourly("future-1");
        future.setNextExecutionTime(LocalDateTime.now().plusHours(1));
        
        repository.save(ready1);
        repository.save(ready2);
        repository.save(future);
        
        List<MailboxSchedule> readySchedules = repository.findSchedulesReadyForExecution(LocalDateTime.now());
        
        assertEquals(2, readySchedules.size());
    }
    
    @Test
    void findByNextExecutionTimeBefore_ReturnsMatchingSchedules() {
        LocalDateTime cutoff = LocalDateTime.now();
        
        MailboxSchedule before1 = MailboxSchedule.createHourly("before-1");
        before1.setNextExecutionTime(cutoff.minusHours(2));
        
        MailboxSchedule before2 = MailboxSchedule.createHourly("before-2");
        before2.setNextExecutionTime(cutoff.minusHours(1));
        
        MailboxSchedule after = MailboxSchedule.createHourly("after-1");
        after.setNextExecutionTime(cutoff.plusHours(1));
        
        repository.save(before1);
        repository.save(before2);
        repository.save(after);
        
        List<MailboxSchedule> foundSchedules = repository.findByNextExecutionTimeBefore(cutoff);
        
        assertEquals(2, foundSchedules.size());
    }
    
    @Test
    void deleteByMailboxId_RemovesSchedule() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("to-delete");
        repository.save(schedule);
        
        assertTrue(repository.findByMailboxId("to-delete").isPresent());
        
        repository.deleteByMailboxId("to-delete");
        repository.flush();
        
        assertTrue(repository.findByMailboxId("to-delete").isEmpty());
    }
    
    @Test
    void update_ExistingSchedule_UpdatesSuccessfully() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("update-test");
        MailboxSchedule saved = repository.save(schedule);
        
        saved.setMaxEmailsPerRun(200);
        saved.setEnabled(false);
        MailboxSchedule updated = repository.save(saved);
        
        assertEquals(200, updated.getMaxEmailsPerRun());
        assertFalse(updated.isEnabled());
    }
    
    @Test
    void findAll_ReturnsAllSchedules() {
        repository.save(MailboxSchedule.createHourly("mailbox-1"));
        repository.save(MailboxSchedule.createHourly("mailbox-2"));
        repository.save(MailboxSchedule.createHourly("mailbox-3"));
        
        List<MailboxSchedule> all = repository.findAll();
        
        assertEquals(3, all.size());
    }
    
    @Test
    void optimisticLocking_WorksCorrectly() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("lock-test");
        MailboxSchedule saved = repository.save(schedule);
        
        MailboxSchedule fetched = repository.findById(saved.getId()).orElseThrow();
        fetched.setMaxEmailsPerRun(100);
        MailboxSchedule updated = repository.save(fetched);
        
        assertNotNull(updated.getVersion());
        assertEquals(100, updated.getMaxEmailsPerRun());
    }
    
    @Test
    void recordExecution_UpdatesSchedule() {
        MailboxSchedule schedule = MailboxSchedule.createHourly("execution-test");
        MailboxSchedule saved = repository.save(schedule);
        
        saved.recordExecution(true);
        MailboxSchedule updated = repository.save(saved);
        
        assertEquals(1L, updated.getExecutionCount());
        assertNotNull(updated.getLastExecutionTime());
    }
}
