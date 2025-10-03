package com.company.emailpdf.integration;

import com.company.emailpdf.domain.MailboxSchedule;
import com.company.emailpdf.repository.MailboxScheduleRepository;
import com.company.emailpdf.service.FileNamingService;
import com.company.emailpdf.service.MailboxLockingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class EmailPdfApplicationIntegrationTest {
    
    @LocalServerPort
    private int port;
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private MailboxScheduleRepository scheduleRepository;
    
    @Autowired
    private FileNamingService fileNamingService;
    
    @Autowired
    private MailboxLockingService lockingService;
    
    @Test
    void contextLoads() {
        assertNotNull(scheduleRepository);
        assertNotNull(fileNamingService);
        assertNotNull(lockingService);
    }
    
    @Test
    void healthEndpoint_ReturnsHealthyStatus() {
        String url = "http://localhost:" + port + "/api/health";
        
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("UP", response.getBody().get("status"));
    }
    
    @Test
    void statusEndpoint_ReturnsServiceInformation() {
        String url = "http://localhost:" + port + "/api/status";
        
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Email to PDF Converter", response.getBody().get("service"));
        assertEquals("running", response.getBody().get("status"));
        assertEquals("1.0.0", response.getBody().get("version"));
    }
    
    @Test
    void convertEndpoint_AcceptsRequest() {
        String url = "http://localhost:" + port + "/api/convert";
        Map<String, Object> request = Map.of("mailboxId", "test@company.com");
        
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("message"));
    }
    
    @Test
    void databaseIntegration_SaveAndRetrieveSchedule() {
        scheduleRepository.deleteAll();
        
        MailboxSchedule schedule = MailboxSchedule.createDaily("integration-test@company.com", 9, 30);
        MailboxSchedule saved = scheduleRepository.save(schedule);
        
        assertNotNull(saved.getId());
        
        MailboxSchedule retrieved = scheduleRepository.findByMailboxId("integration-test@company.com").orElse(null);
        
        assertNotNull(retrieved);
        assertEquals("integration-test@company.com", retrieved.getMailboxId());
        assertEquals("0 30 9 * * ?", retrieved.getCronExpression());
    }
    
    @Test
    void fileNamingService_IntegrationWithRealData() {
        String filename = fileNamingService.generatePdfFilename(
            "recipient@company.com",
            "sender@company.com",
            LocalDateTime.of(2025, 10, 3, 14, 30, 45),
            "MSG123456",
            "office365"
        );
        
        assertNotNull(filename);
        assertTrue(filename.startsWith("{recipient@company.com}"));
        assertTrue(filename.endsWith(".pdf"));
    }
    
    @Test
    void lockingService_IntegrationTest() {
        String mailboxId = "integration-lock-test";
        
        boolean acquired = lockingService.tryAcquireLock(mailboxId);
        assertTrue(acquired);
        
        boolean isLocked = lockingService.isMailboxLocked(mailboxId);
        assertTrue(isLocked);
        
        lockingService.releaseLock(mailboxId);
        
        boolean isStillLocked = lockingService.isMailboxLocked(mailboxId);
        assertFalse(isStillLocked);
    }
    
    @Test
    @Transactional
    void scheduleLifecycle_CreateUpdateDelete() {
        scheduleRepository.deleteAll();
        
        MailboxSchedule schedule = MailboxSchedule.createHourly("lifecycle-test@company.com");
        MailboxSchedule created = scheduleRepository.save(schedule);
        assertNotNull(created.getId());
        
        created.setMaxEmailsPerRun(200);
        created.recordExecution(true);
        MailboxSchedule updated = scheduleRepository.save(created);
        assertEquals(200, updated.getMaxEmailsPerRun());
        assertEquals(1L, updated.getExecutionCount());
        
        scheduleRepository.deleteByMailboxId("lifecycle-test@company.com");
        assertTrue(scheduleRepository.findByMailboxId("lifecycle-test@company.com").isEmpty());
    }
    
    @Test
    @Transactional
    void multipleSchedules_CanCoexist() {
        scheduleRepository.deleteAll();
        
        scheduleRepository.save(MailboxSchedule.createDaily("mailbox1@company.com", 9, 0));
        scheduleRepository.save(MailboxSchedule.createDaily("mailbox2@company.com", 10, 0));
        scheduleRepository.save(MailboxSchedule.createHourly("mailbox3@company.com"));
        
        long count = scheduleRepository.count();
        assertEquals(3, count);
        
        scheduleRepository.deleteAll();
    }
}
