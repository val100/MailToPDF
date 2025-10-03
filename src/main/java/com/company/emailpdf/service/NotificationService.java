package com.company.emailpdf.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {
    
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final WebClient webClient;
    
    public NotificationService() {
        this.webClient = WebClient.builder().build();
    }
    
    public void sendSlackNotification(String webhookUrl, String message) {
        if (webhookUrl == null || webhookUrl.isEmpty()) {
            log.debug("Slack webhook URL not configured");
            return;
        }
        
        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("text", message);
            
            webClient.post()
                .uri(webhookUrl)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(response -> log.info("Slack notification sent successfully"))
                .doOnError(error -> log.error("Failed to send Slack notification", error))
                .subscribe();
                
        } catch (Exception e) {
            log.error("Error sending Slack notification", e);
        }
    }
    
    public void sendTeamsNotification(String webhookUrl, String title, String message) {
        if (webhookUrl == null || webhookUrl.isEmpty()) {
            log.debug("Teams webhook URL not configured");
            return;
        }
        
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("@type", "MessageCard");
            payload.put("@context", "https://schema.org/extensions");
            payload.put("summary", title);
            payload.put("title", title);
            payload.put("text", message);
            
            webClient.post()
                .uri(webhookUrl)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(response -> log.info("Teams notification sent successfully"))
                .doOnError(error -> log.error("Failed to send Teams notification", error))
                .subscribe();
                
        } catch (Exception e) {
            log.error("Error sending Teams notification", e);
        }
    }
    
    public void sendTelegramNotification(String botToken, String chatId, String message) {
        if (botToken == null || botToken.isEmpty() || chatId == null || chatId.isEmpty()) {
            log.debug("Telegram credentials not configured");
            return;
        }
        
        try {
            String url = String.format("https://api.telegram.org/bot%s/sendMessage", botToken);
            
            Map<String, String> payload = new HashMap<>();
            payload.put("chat_id", chatId);
            payload.put("text", message);
            
            webClient.post()
                .uri(url)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(response -> log.info("Telegram notification sent successfully"))
                .doOnError(error -> log.error("Failed to send Telegram notification", error))
                .subscribe();
                
        } catch (Exception e) {
            log.error("Error sending Telegram notification", e);
        }
    }
}
