package com.company.emailpdf.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class FileNamingService {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH-mm-ss");
    
    /**
     * Generate PDF filename with exact format: {to_email}.{from_email}.{date}.{time}.{emailID@account.company.com}.pdf
     * Note: Uses literal curly braces in filename as requested
     */
    public String generatePdfFilename(String toEmail, String fromEmail, LocalDateTime receivedDateTime, String emailId, String account) {
        String date = receivedDateTime.format(DATE_FORMATTER);
        String time = receivedDateTime.format(TIME_FORMATTER);
        String emailIdWithAccount = emailId + "@" + account + ".company.com";
        
        // Using literal curly braces as requested by user
        return String.format("{%s}.{%s}.{%s}.{%s}.{%s}.pdf", 
            sanitizeForFilename(toEmail),
            sanitizeForFilename(fromEmail),
            date,
            time,
            sanitizeForFilename(emailIdWithAccount)
        );
    }
    
    /**
     * Sanitize email addresses and other components for safe filename usage
     */
    private String sanitizeForFilename(String input) {
        if (input == null) return "unknown";
        
        // Replace characters that are not safe in filenames
        return input.replaceAll("[^a-zA-Z0-9@._-]", "_")
                   .replaceAll("_{2,}", "_"); // Replace multiple underscores with single
    }
    
    /**
     * Generate unique filename if file already exists
     */
    public String generateUniqueFilename(String basePath, String filename) {
        String fullPath = basePath + "/" + filename;
        java.io.File file = new java.io.File(fullPath);
        
        if (!file.exists()) {
            return filename;
        }
        
        // Add counter if file exists
        String nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        String extension = filename.substring(filename.lastIndexOf('.'));
        
        int counter = 1;
        while (file.exists()) {
            String newFilename = nameWithoutExt + "_" + counter + extension;
            file = new java.io.File(basePath + "/" + newFilename);
            counter++;
        }
        
        return file.getName();
    }
}"