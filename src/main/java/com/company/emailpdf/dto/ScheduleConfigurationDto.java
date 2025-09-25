package com.company.emailpdf.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ScheduleConfigurationDto {
    @NotBlank(message = "Cron expression is required")
    private String cronExpression;
    
    @Min(value = 1, message = "Max emails per run must be at least 1")
    @Max(value = 1000, message = "Max emails per run cannot exceed 1000")
    private Integer maxEmailsPerRun = 50;
    
    @Min(value = 1, message = "Date range days must be at least 1")
    @Max(value = 365, message = "Date range days cannot exceed 365")
    private Integer dateRangeDays = 7;
    
    private boolean includeAttachments = true;
    private boolean combineAttachmentsInPdf = true;
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String cronExpression;
        private Integer maxEmailsPerRun = 50;
        private Integer dateRangeDays = 7;
        private boolean includeAttachments = true;
        private boolean combineAttachmentsInPdf = true;
        
        public Builder cronExpression(String cronExpression) {
            this.cronExpression = cronExpression;
            return this;
        }
        
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
        
        public ScheduleConfigurationDto build() {
            ScheduleConfigurationDto dto = new ScheduleConfigurationDto();
            dto.cronExpression = this.cronExpression;
            dto.maxEmailsPerRun = this.maxEmailsPerRun;
            dto.dateRangeDays = this.dateRangeDays;
            dto.includeAttachments = this.includeAttachments;
            dto.combineAttachmentsInPdf = this.combineAttachmentsInPdf;
            return dto;
        }
    }
    
    // Getters and setters
    public String getCronExpression() { return cronExpression; }
    public void setCronExpression(String cronExpression) { this.cronExpression = cronExpression; }
    
    public Integer getMaxEmailsPerRun() { return maxEmailsPerRun; }
    public void setMaxEmailsPerRun(Integer maxEmailsPerRun) { this.maxEmailsPerRun = maxEmailsPerRun; }
    
    public Integer getDateRangeDays() { return dateRangeDays; }
    public void setDateRangeDays(Integer dateRangeDays) { this.dateRangeDays = dateRangeDays; }
    
    public boolean isIncludeAttachments() { return includeAttachments; }
    public void setIncludeAttachments(boolean includeAttachments) { this.includeAttachments = includeAttachments; }
    
    public boolean isCombineAttachmentsInPdf() { return combineAttachmentsInPdf; }
    public void setCombineAttachmentsInPdf(boolean combineAttachmentsInPdf) { this.combineAttachmentsInPdf = combineAttachmentsInPdf; }
}