package com.company.emailpdf.dto;

public class ProcessingSettings {
    private final Integer maxEmailsPerRun;
    private final Integer dateRangeDays;
    private final boolean includeAttachments;
    private final boolean combineAttachmentsInPdf;
    
    private ProcessingSettings(Builder builder) {
        this.maxEmailsPerRun = builder.maxEmailsPerRun;
        this.dateRangeDays = builder.dateRangeDays;
        this.includeAttachments = builder.includeAttachments;
        this.combineAttachmentsInPdf = builder.combineAttachmentsInPdf;
    }
    
    public static ProcessingSettings defaultSettings() {
        return builder()
            .maxEmailsPerRun(50)
            .dateRangeDays(7)
            .includeAttachments(true)
            .combineAttachmentsInPdf(true)
            .build();
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private Integer maxEmailsPerRun = 50;
        private Integer dateRangeDays = 7;
        private boolean includeAttachments = true;
        private boolean combineAttachmentsInPdf = true;
        
        public Builder maxEmailsPerRun(Integer maxEmailsPerRun) {
            this.maxEmailsPerRun = maxEmailsPerRun;
            return this;
        }
        
        public Builder dateRangeDays(Integer dateRangeDays) {
            this.dateRangeDays = dateRangeDays;
            return this;
        }
        
        public Builder includeAttachments(boolean includeAttachments) {
            this.includeAttachments = includeAttachments;
            return this;
        }
        
        public Builder combineAttachmentsInPdf(boolean combineAttachmentsInPdf) {
            this.combineAttachmentsInPdf = combineAttachmentsInPdf;
            return this;
        }
        
        public ProcessingSettings build() {
            return new ProcessingSettings(this);
        }
    }
    
    // Getters
    public Integer getMaxEmailsPerRun() { return maxEmailsPerRun; }
    public Integer getDateRangeDays() { return dateRangeDays; }
    public boolean isIncludeAttachments() { return includeAttachments; }
    public boolean isCombineAttachmentsInPdf() { return combineAttachmentsInPdf; }
}