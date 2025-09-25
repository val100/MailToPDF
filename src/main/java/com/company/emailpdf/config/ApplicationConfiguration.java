package com.company.emailpdf.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.Arrays;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "application")
@Validated
public class ApplicationConfiguration {
    
    @Valid
    private PdfConfiguration pdf = new PdfConfiguration();
    
    @Valid
    private SchedulingConfiguration scheduling = new SchedulingConfiguration();
    
    @Valid
    private ProcessingConfiguration processing = new ProcessingConfiguration();
    
    // Getters and setters
    public PdfConfiguration getPdf() { return pdf; }
    public void setPdf(PdfConfiguration pdf) { this.pdf = pdf; }
    
    public SchedulingConfiguration getScheduling() { return scheduling; }
    public void setScheduling(SchedulingConfiguration scheduling) { this.scheduling = scheduling; }
    
    public ProcessingConfiguration getProcessing() { return processing; }
    public void setProcessing(ProcessingConfiguration processing) { this.processing = processing; }
    
    @Validated
    public static class PdfConfiguration {
        @NotBlank
        private String storagePath = "/app/pdfs";
        
        @Min(1) @Max(100)
        private Integer maxFileSizeMb = 50;
        
        @NotBlank
        private String filenameTemplate = "{to_email}.{from_email}.{date}.{time}.{emailID@account.company.com}.pdf";
        
        private boolean createDirectories = true;
        private boolean overwriteExisting = false;
        
        // Getters and setters
        public String getStoragePath() { return storagePath; }
        public void setStoragePath(String storagePath) { this.storagePath = storagePath; }
        
        public Integer getMaxFileSizeMb() { return maxFileSizeMb; }
        public void setMaxFileSizeMb(Integer maxFileSizeMb) { this.maxFileSizeMb = maxFileSizeMb; }
        
        public String getFilenameTemplate() { return filenameTemplate; }
        public void setFilenameTemplate(String filenameTemplate) { this.filenameTemplate = filenameTemplate; }
        
        public boolean isCreateDirectories() { return createDirectories; }
        public void setCreateDirectories(boolean createDirectories) { this.createDirectories = createDirectories; }
        
        public boolean isOverwriteExisting() { return overwriteExisting; }
        public void setOverwriteExisting(boolean overwriteExisting) { this.overwriteExisting = overwriteExisting; }
    }
    
    @Validated
    public static class SchedulingConfiguration {
        @Min(1) @Max(100)
        private Integer threadPoolSize = 10;
        
        @Min(1) @Max(3600)
        private Integer taskTimeoutMinutes = 30;
        
        @Min(1) @Max(60)
        private Integer healthCheckIntervalMinutes = 5;
        
        private boolean enableAutoCleanup = true;
        
        @Min(1) @Max(24)
        private Integer staleTaskCleanupHours = 2;
        
        // Getters and setters
        public Integer getThreadPoolSize() { return threadPoolSize; }
        public void setThreadPoolSize(Integer threadPoolSize) { this.threadPoolSize = threadPoolSize; }
        
        public Integer getTaskTimeoutMinutes() { return taskTimeoutMinutes; }
        public void setTaskTimeoutMinutes(Integer taskTimeoutMinutes) { this.taskTimeoutMinutes = taskTimeoutMinutes; }
        
        public Integer getHealthCheckIntervalMinutes() { return healthCheckIntervalMinutes; }
        public void setHealthCheckIntervalMinutes(Integer healthCheckIntervalMinutes) { this.healthCheckIntervalMinutes = healthCheckIntervalMinutes; }
        
        public boolean isEnableAutoCleanup() { return enableAutoCleanup; }
        public void setEnableAutoCleanup(boolean enableAutoCleanup) { this.enableAutoCleanup = enableAutoCleanup; }
        
        public Integer getStaleTaskCleanupHours() { return staleTaskCleanupHours; }
        public void setStaleTaskCleanupHours(Integer staleTaskCleanupHours) { this.staleTaskCleanupHours = staleTaskCleanupHours; }
    }
    
    @Validated
    public static class ProcessingConfiguration {
        @Min(1) @Max(1000)
        private Integer defaultMaxEmailsPerRun = 50;
        
        @Min(1) @Max(365)
        private Integer defaultDateRangeDays = 7;
        
        private boolean defaultIncludeAttachments = true;
        private boolean defaultCombineAttachmentsInPdf = true;
        
        @Min(1) @Max(10)
        private Integer maxConcurrentTasks = 5;
        
        @Min(1) @Max(100)
        private Integer maxAttachmentSizeMb = 25;
        
        private List<String> supportedDocumentTypes = Arrays.asList(
            "application/pdf", "application/msword", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain"
        );
        
        private List<String> supportedImageTypes = Arrays.asList(
            "image/png", "image/jpeg", "image/jpg", "image/gif", "image/bmp"
        );
        
        // Getters and setters
        public Integer getDefaultMaxEmailsPerRun() { return defaultMaxEmailsPerRun; }
        public void setDefaultMaxEmailsPerRun(Integer defaultMaxEmailsPerRun) { this.defaultMaxEmailsPerRun = defaultMaxEmailsPerRun; }
        
        public Integer getDefaultDateRangeDays() { return defaultDateRangeDays; }
        public void setDefaultDateRangeDays(Integer defaultDateRangeDays) { this.defaultDateRangeDays = defaultDateRangeDays; }
        
        public boolean isDefaultIncludeAttachments() { return defaultIncludeAttachments; }
        public void setDefaultIncludeAttachments(boolean defaultIncludeAttachments) { this.defaultIncludeAttachments = defaultIncludeAttachments; }
        
        public boolean isDefaultCombineAttachmentsInPdf() { return defaultCombineAttachmentsInPdf; }
        public void setDefaultCombineAttachmentsInPdf(boolean defaultCombineAttachmentsInPdf) { this.defaultCombineAttachmentsInPdf = defaultCombineAttachmentsInPdf; }
        
        public Integer getMaxConcurrentTasks() { return maxConcurrentTasks; }
        public void setMaxConcurrentTasks(Integer maxConcurrentTasks) { this.maxConcurrentTasks = maxConcurrentTasks; }
        
        public Integer getMaxAttachmentSizeMb() { return maxAttachmentSizeMb; }
        public void setMaxAttachmentSizeMb(Integer maxAttachmentSizeMb) { this.maxAttachmentSizeMb = maxAttachmentSizeMb; }
        
        public List<String> getSupportedDocumentTypes() { return supportedDocumentTypes; }
        public void setSupportedDocumentTypes(List<String> supportedDocumentTypes) { this.supportedDocumentTypes = supportedDocumentTypes; }
        
        public List<String> getSupportedImageTypes() { return supportedImageTypes; }
        public void setSupportedImageTypes(List<String> supportedImageTypes) { this.supportedImageTypes = supportedImageTypes; }
    }
}