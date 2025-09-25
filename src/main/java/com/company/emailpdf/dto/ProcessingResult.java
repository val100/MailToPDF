package com.company.emailpdf.dto;

public class ProcessingResult {
    private final boolean success;
    private final int emailsProcessed;
    private final int pdfsGenerated;
    private final String message;
    private final String errorMessage;
    
    private ProcessingResult(boolean success, int emailsProcessed, int pdfsGenerated, String message, String errorMessage) {
        this.success = success;
        this.emailsProcessed = emailsProcessed;
        this.pdfsGenerated = pdfsGenerated;
        this.message = message;
        this.errorMessage = errorMessage;
    }
    
    public static ProcessingResult success(int emailsProcessed, int pdfsGenerated, String message) {
        return new ProcessingResult(true, emailsProcessed, pdfsGenerated, message, null);
    }
    
    public static ProcessingResult failure(String errorMessage) {
        return new ProcessingResult(false, 0, 0, null, errorMessage);
    }
    
    // Getters
    public boolean isSuccess() { return success; }
    public int getEmailsProcessed() { return emailsProcessed; }
    public int getPdfsGenerated() { return pdfsGenerated; }
    public String getMessage() { return message; }
    public String getErrorMessage() { return errorMessage; }
}