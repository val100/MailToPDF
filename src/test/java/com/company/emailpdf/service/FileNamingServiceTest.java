package com.company.emailpdf.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class FileNamingServiceTest {
    
    private FileNamingService fileNamingService;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setUp() {
        fileNamingService = new FileNamingService();
    }
    
    @Test
    void generatePdfFilename_WithValidInputs_GeneratesCorrectFormat() {
        String toEmail = "recipient@company.com";
        String fromEmail = "sender@company.com";
        LocalDateTime dateTime = LocalDateTime.of(2025, 10, 3, 14, 30, 45);
        String emailId = "MSG123456";
        String account = "office365";
        
        String result = fileNamingService.generatePdfFilename(toEmail, fromEmail, dateTime, emailId, account);
        
        assertNotNull(result);
        assertEquals("{recipient@company.com}.{sender@company.com}.{2025-10-03}.{14-30-45}.{MSG123456@office365.company.com}.pdf", result);
    }
    
    @Test
    void generatePdfFilename_WithSpecialCharacters_SanitizesCorrectly() {
        String toEmail = "user+test@company.com";
        String fromEmail = "sender/name@company.com";
        LocalDateTime dateTime = LocalDateTime.of(2025, 10, 3, 14, 30, 45);
        String emailId = "MSG#123";
        String account = "office365";
        
        String result = fileNamingService.generatePdfFilename(toEmail, fromEmail, dateTime, emailId, account);
        
        assertTrue(result.contains("{user_test@company.com}"));
        assertTrue(result.contains("{sender_name@company.com}"));
        assertTrue(result.contains("{MSG_123@office365.company.com}"));
        assertTrue(result.endsWith(".pdf"));
    }
    
    @Test
    void generatePdfFilename_WithNullEmail_UsesUnknown() {
        LocalDateTime dateTime = LocalDateTime.of(2025, 10, 3, 14, 30, 45);
        
        String result = fileNamingService.generatePdfFilename(null, "sender@company.com", dateTime, "MSG123", "office365");
        
        assertTrue(result.startsWith("{unknown}."));
    }
    
    @Test
    void generatePdfFilename_WithMidnightTime_FormatsCorrectly() {
        LocalDateTime dateTime = LocalDateTime.of(2025, 10, 3, 0, 0, 0);
        
        String result = fileNamingService.generatePdfFilename("to@company.com", "from@company.com", dateTime, "MSG123", "office365");
        
        assertTrue(result.contains("{00-00-00}"));
    }
    
    @Test
    void generatePdfFilename_WithLeapYearDate_HandlesCorrectly() {
        LocalDateTime dateTime = LocalDateTime.of(2024, 2, 29, 15, 45, 30);
        
        String result = fileNamingService.generatePdfFilename("to@company.com", "from@company.com", dateTime, "MSG123", "office365");
        
        assertTrue(result.contains("{2024-02-29}"));
        assertTrue(result.contains("{15-45-30}"));
    }
    
    @Test
    void generateUniqueFilename_WhenFileDoesNotExist_ReturnsOriginal() {
        String basePath = tempDir.toString();
        String filename = "test.pdf";
        
        String result = fileNamingService.generateUniqueFilename(basePath, filename);
        
        assertEquals(filename, result);
    }
    
    @Test
    void generateUniqueFilename_WhenFileExists_AddsCounter() throws IOException {
        String basePath = tempDir.toString();
        String filename = "test.pdf";
        
        new File(tempDir.toFile(), filename).createNewFile();
        
        String result = fileNamingService.generateUniqueFilename(basePath, filename);
        
        assertEquals("test_1.pdf", result);
    }
    
    @Test
    void generateUniqueFilename_WhenMultipleFilesExist_FindsNextAvailable() throws IOException {
        String basePath = tempDir.toString();
        String filename = "test.pdf";
        
        new File(tempDir.toFile(), "test.pdf").createNewFile();
        new File(tempDir.toFile(), "test_1.pdf").createNewFile();
        new File(tempDir.toFile(), "test_2.pdf").createNewFile();
        
        String result = fileNamingService.generateUniqueFilename(basePath, filename);
        
        assertEquals("test_3.pdf", result);
    }
    
    @Test
    void generatePdfFilename_WithComplexEmailAddress_PreservesAtSymbolAndDot() {
        String toEmail = "john.doe@company.com";
        String fromEmail = "jane.smith@company.com";
        LocalDateTime dateTime = LocalDateTime.of(2025, 10, 3, 14, 30, 45);
        
        String result = fileNamingService.generatePdfFilename(toEmail, fromEmail, dateTime, "MSG123", "office365");
        
        assertTrue(result.contains("{john.doe@company.com}"));
        assertTrue(result.contains("{jane.smith@company.com}"));
    }
    
    @Test
    void generatePdfFilename_WithMultipleConsecutiveSpecialChars_CollapsesToSingleUnderscore() {
        String toEmail = "user@@@test.com";
        LocalDateTime dateTime = LocalDateTime.of(2025, 10, 3, 14, 30, 45);
        
        String result = fileNamingService.generatePdfFilename(toEmail, "from@company.com", dateTime, "MSG123", "office365");
        
        assertFalse(result.contains("__"));
    }
}
