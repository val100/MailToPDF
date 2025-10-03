package com.company.emailpdf.dto;

public class ProcessingSettings {
    // Basic settings
    private final Integer maxEmailsPerRun;
    private final Integer dateRangeDays;
    private final boolean includeAttachments;
    private final boolean combineAttachmentsInPdf;
    
    // Export formats (like Automatic Email Manager)
    private final boolean saveAsEml;
    private final boolean saveAsMsg;
    private final boolean saveAsTxt;
    private final boolean saveAsXml;
    
    // Email actions (like Automatic Email Manager)
    private final boolean markAsRead;
    private final boolean moveToFolder;
    private final String targetFolder;
    private final boolean copyToFolder;
    private final boolean deleteAfterProcessing;
    
    // Auto-reply and forward
    private final boolean autoReply;
    private final String autoReplyMessage;
    private final boolean autoForward;
    private final String forwardToAddress;
    
    // Notifications (like Automatic Email Manager)
    private final String slackWebhookUrl;
    private final String teamsWebhookUrl;
    private final String telegramBotToken;
    private final String telegramChatId;
    
    private ProcessingSettings(Builder builder) {
        this.maxEmailsPerRun = builder.maxEmailsPerRun;
        this.dateRangeDays = builder.dateRangeDays;
        this.includeAttachments = builder.includeAttachments;
        this.combineAttachmentsInPdf = builder.combineAttachmentsInPdf;
        this.saveAsEml = builder.saveAsEml;
        this.saveAsMsg = builder.saveAsMsg;
        this.saveAsTxt = builder.saveAsTxt;
        this.saveAsXml = builder.saveAsXml;
        this.markAsRead = builder.markAsRead;
        this.moveToFolder = builder.moveToFolder;
        this.targetFolder = builder.targetFolder;
        this.copyToFolder = builder.copyToFolder;
        this.deleteAfterProcessing = builder.deleteAfterProcessing;
        this.autoReply = builder.autoReply;
        this.autoReplyMessage = builder.autoReplyMessage;
        this.autoForward = builder.autoForward;
        this.forwardToAddress = builder.forwardToAddress;
        this.slackWebhookUrl = builder.slackWebhookUrl;
        this.teamsWebhookUrl = builder.teamsWebhookUrl;
        this.telegramBotToken = builder.telegramBotToken;
        this.telegramChatId = builder.telegramChatId;
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
        private boolean saveAsEml = false;
        private boolean saveAsMsg = false;
        private boolean saveAsTxt = false;
        private boolean saveAsXml = false;
        private boolean markAsRead = false;
        private boolean moveToFolder = false;
        private String targetFolder = null;
        private boolean copyToFolder = false;
        private boolean deleteAfterProcessing = false;
        private boolean autoReply = false;
        private String autoReplyMessage = null;
        private boolean autoForward = false;
        private String forwardToAddress = null;
        private String slackWebhookUrl = null;
        private String teamsWebhookUrl = null;
        private String telegramBotToken = null;
        private String telegramChatId = null;
        
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
        
        public Builder saveAsEml(boolean saveAsEml) {
            this.saveAsEml = saveAsEml;
            return this;
        }
        
        public Builder saveAsMsg(boolean saveAsMsg) {
            this.saveAsMsg = saveAsMsg;
            return this;
        }
        
        public Builder saveAsTxt(boolean saveAsTxt) {
            this.saveAsTxt = saveAsTxt;
            return this;
        }
        
        public Builder saveAsXml(boolean saveAsXml) {
            this.saveAsXml = saveAsXml;
            return this;
        }
        
        public Builder markAsRead(boolean markAsRead) {
            this.markAsRead = markAsRead;
            return this;
        }
        
        public Builder moveToFolder(boolean moveToFolder) {
            this.moveToFolder = moveToFolder;
            return this;
        }
        
        public Builder targetFolder(String targetFolder) {
            this.targetFolder = targetFolder;
            return this;
        }
        
        public Builder copyToFolder(boolean copyToFolder) {
            this.copyToFolder = copyToFolder;
            return this;
        }
        
        public Builder deleteAfterProcessing(boolean deleteAfterProcessing) {
            this.deleteAfterProcessing = deleteAfterProcessing;
            return this;
        }
        
        public Builder autoReply(boolean autoReply) {
            this.autoReply = autoReply;
            return this;
        }
        
        public Builder autoReplyMessage(String autoReplyMessage) {
            this.autoReplyMessage = autoReplyMessage;
            return this;
        }
        
        public Builder autoForward(boolean autoForward) {
            this.autoForward = autoForward;
            return this;
        }
        
        public Builder forwardToAddress(String forwardToAddress) {
            this.forwardToAddress = forwardToAddress;
            return this;
        }
        
        public Builder slackWebhookUrl(String slackWebhookUrl) {
            this.slackWebhookUrl = slackWebhookUrl;
            return this;
        }
        
        public Builder teamsWebhookUrl(String teamsWebhookUrl) {
            this.teamsWebhookUrl = teamsWebhookUrl;
            return this;
        }
        
        public Builder telegramBotToken(String telegramBotToken) {
            this.telegramBotToken = telegramBotToken;
            return this;
        }
        
        public Builder telegramChatId(String telegramChatId) {
            this.telegramChatId = telegramChatId;
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
    public boolean isSaveAsEml() { return saveAsEml; }
    public boolean isSaveAsMsg() { return saveAsMsg; }
    public boolean isSaveAsTxt() { return saveAsTxt; }
    public boolean isSaveAsXml() { return saveAsXml; }
    public boolean isMarkAsRead() { return markAsRead; }
    public boolean isMoveToFolder() { return moveToFolder; }
    public String getTargetFolder() { return targetFolder; }
    public boolean isCopyToFolder() { return copyToFolder; }
    public boolean isDeleteAfterProcessing() { return deleteAfterProcessing; }
    public boolean isAutoReply() { return autoReply; }
    public String getAutoReplyMessage() { return autoReplyMessage; }
    public boolean isAutoForward() { return autoForward; }
    public String getForwardToAddress() { return forwardToAddress; }
    public String getSlackWebhookUrl() { return slackWebhookUrl; }
    public String getTeamsWebhookUrl() { return teamsWebhookUrl; }
    public String getTelegramBotToken() { return telegramBotToken; }
    public String getTelegramChatId() { return telegramChatId; }
}
