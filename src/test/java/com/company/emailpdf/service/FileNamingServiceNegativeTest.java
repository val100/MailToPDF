package com.company.emailpdf.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class FileNamingServiceNegativeTest {
    
    private FileNamingService fileNamingService;
    
    @BeforeEach
    void setUp() {
        fileNamingService = new FileNamingService();
    }
    
    @Test
    void generatePdfFilename_WithAllNullInputs_HandlesGracefully() {
        LocalDateTime dateTime = LocalDateTime.of(2025, 10, 3, 14, 30, 45);
        
        String result = fileNamingService.generatePdfFilename(null, null, dateTime, null, null);
        
        assertNotNull(result);
        assertTrue(result.contains("{unknown}"));
        assertTrue(result.endsWith(".pdf"));
    }
    
    @Test
    void generatePdfFilename_WithEmptyStrings_SanitizesCorrectly() {
        LocalDateTime dateTime = LocalDateTime.of(2025, 10, 3, 14, 30, 45);
        
        String result = fileNamingService.generatePdfFilename("", "", dateTime, "", "");
        
        assertNotNull(result);
        assertTrue(result.endsWith(".pdf"));
    }
    
    @Test
    void generatePdfFilename_WithOnlySpecialCharacters_ReplacesWithUnderscores() {
        LocalDateTime dateTime = LocalDateTime.of(2025, 10, 3, 14, 30, 45);
        
        String result = fileNamingService.generatePdfFilename("!!!@@@", "$$$%%%", dateTime, "###", "***");
        
        assertNotNull(result);
        assertFalse(result.contains("!"));
        assertFalse(result.contains("$"));
        assertFalse(result.contains("#"));
        assertFalse(result.contains("*"));
        assertTrue(result.endsWith(".pdf"));
    }
    
    @Test
    void generatePdfFilename_WithVeryLongEmail_HandlesCorrectly() {
        String longEmail = "very.long.email.address.with.many.dots.and.characters@company.com";
        LocalDateTime dateTime = LocalDateTime.of(2025, 10, 3, 14, 30, 45);
        
        String result = fileNamingService.generatePdfFilename(longEmail, longEmail, dateTime, "MSG123", "office365");
        
        assertNotNull(result);
        assertTrue(result.contains(longEmail));
        assertTrue(result.endsWith(".pdf"));
    }
    
    @Test
    void generateUniqueFilename_WithNonExistentPath_HandlesGracefully() {
        String result = fileNamingService.generateUniqueFilename("/nonexistent/path", "test.pdf");
        
        assertEquals("test.pdf", result);
    }
    
    @Test
    void generatePdfFilename_WithUnicodeCharacters_SanitizesCorrectly() {
        LocalDateTime dateTime = LocalDateTime.of(2025, 10, 3, 14, 30, 45);
        
        String result = fileNamingService.generatePdfFilename("user@测试.com", "sender@тест.com", dateTime, "MSG123", "office365");
        
        assertNotNull(result);
        assertTrue(result.endsWith(".pdf"));
    }
}
