package com.company.emailpdf.dto;

import java.time.LocalDateTime;

public class ProcessingJobResponseDto {
    private String mailboxId;
    private String status;
    private LocalDateTime triggeredAt;
    private String message;
    
    public static Builder builder() { return new Builder(); }
    
    public static class Builder {
        private String mailboxId;
        private String status;
        private LocalDateTime triggeredAt;
        private String message;
        
        public Builder mailboxId(String mailboxId) { this.mailboxId = mailboxId; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder triggeredAt(LocalDateTime triggeredAt) { this.triggeredAt = triggeredAt; return this; }
        public Builder message(String message) { this.message = message; return this; }
        
        public ProcessingJobResponseDto build() {
            ProcessingJobResponseDto dto = new ProcessingJobResponseDto();
            dto.mailboxId = this.mailboxId;
            dto.status = this.status;
            dto.triggeredAt = this.triggeredAt;
            dto.message = this.message;
            return dto;
        }
    }
    
    // Getters and setters
    public String getMailboxId() { return mailboxId; }
    public void setMailboxId(String mailboxId) { this.mailboxId = mailboxId; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getTriggeredAt() { return triggeredAt; }
    public void setTriggeredAt(LocalDateTime triggeredAt) { this.triggeredAt = triggeredAt; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}