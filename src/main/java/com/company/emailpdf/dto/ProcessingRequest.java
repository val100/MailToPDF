package com.company.emailpdf.dto;

import java.time.LocalDateTime;

public class ProcessingRequest {
    private final ProcessingSettings settings;
    private final String requestedBy;
    private final LocalDateTime requestedAt;
    private final String reason;
    
    private ProcessingRequest(Builder builder) {
        this.settings = builder.settings;
        this.requestedBy = builder.requestedBy;
        this.requestedAt = builder.requestedAt;
        this.reason = builder.reason;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private ProcessingSettings settings;
        private String requestedBy;
        private LocalDateTime requestedAt;
        private String reason;
        
        public Builder settings(ProcessingSettings settings) {
            this.settings = settings;
            return this;
        }
        
        public Builder requestedBy(String requestedBy) {
            this.requestedBy = requestedBy;
            return this;
        }
        
        public Builder requestedAt(LocalDateTime requestedAt) {
            this.requestedAt = requestedAt;
            return this;
        }
        
        public Builder reason(String reason) {
            this.reason = reason;
            return this;
        }
        
        public ProcessingRequest build() {
            return new ProcessingRequest(this);
        }
    }
    
    // Getters
    public ProcessingSettings getSettings() { return settings; }
    public String getRequestedBy() { return requestedBy; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public String getReason() { return reason; }
}