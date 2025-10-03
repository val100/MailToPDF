package com.company.emailpdf.service;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailExportService {
    
    private static final Logger log = LoggerFactory.getLogger(EmailExportService.class);
    private final XmlMapper xmlMapper = new XmlMapper();
    
    public void saveAsEml(MicrosoftGraphEmailService.EmailMessage email, String filePath) throws IOException {
        // EML format (RFC 822)
        StringBuilder eml = new StringBuilder();
        eml.append("From: ").append(email.getFrom()).append("\r\n");
        eml.append("To: ").append(email.getTo()).append("\r\n");
        eml.append("Subject: ").append(email.getSubject()).append("\r\n");
        eml.append("Date: ").append(email.getReceivedDateTime()).append("\r\n");
        eml.append("Content-Type: text/plain; charset=UTF-8\r\n");
        eml.append("\r\n");
        eml.append(email.getBody());
        
        writeToFile(filePath, eml.toString().getBytes(StandardCharsets.UTF_8));
        log.info("Email saved as EML: {}", filePath);
    }
    
    public void saveAsMsg(MicrosoftGraphEmailService.EmailMessage email, String filePath) throws IOException {
        // MSG format (simplified - full MSG requires Outlook libraries)
        // This creates a text representation that can be opened in text editors
        StringBuilder msg = new StringBuilder();
        msg.append("Microsoft Outlook Message\n");
        msg.append("==========================\n\n");
        msg.append("From: ").append(email.getFrom()).append("\n");
        msg.append("To: ").append(email.getTo()).append("\n");
        msg.append("Subject: ").append(email.getSubject()).append("\n");
        msg.append("Date: ").append(email.getReceivedDateTime()).append("\n");
        msg.append("\n");
        msg.append(email.getBody());
        
        writeToFile(filePath, msg.toString().getBytes(StandardCharsets.UTF_8));
        log.info("Email saved as MSG: {}", filePath);
    }
    
    public void saveAsTxt(MicrosoftGraphEmailService.EmailMessage email, String filePath) throws IOException {
        StringBuilder txt = new StringBuilder();
        txt.append("From: ").append(email.getFrom()).append("\n");
        txt.append("To: ").append(email.getTo()).append("\n");
        txt.append("Subject: ").append(email.getSubject()).append("\n");
        txt.append("Date: ").append(email.getReceivedDateTime()).append("\n");
        txt.append("\n");
        txt.append(stripHtml(email.getBody()));
        
        writeToFile(filePath, txt.toString().getBytes(StandardCharsets.UTF_8));
        log.info("Email saved as TXT: {}", filePath);
    }
    
    public void saveAsXml(MicrosoftGraphEmailService.EmailMessage email, String filePath) throws IOException {
        Map<String, Object> emailMap = new HashMap<>();
        emailMap.put("id", email.getId());
        emailMap.put("from", email.getFrom());
        emailMap.put("to", email.getTo());
        emailMap.put("subject", email.getSubject());
        emailMap.put("receivedDateTime", email.getReceivedDateTime());
        emailMap.put("body", email.getBody());
        emailMap.put("hasAttachments", email.isHasAttachments());
        
        String xml = xmlMapper.writeValueAsString(emailMap);
        writeToFile(filePath, xml.getBytes(StandardCharsets.UTF_8));
        log.info("Email saved as XML: {}", filePath);
    }
    
    private void writeToFile(String filePath, byte[] data) throws IOException {
        File file = new File(filePath);
        file.getParentFile().mkdirs();
        
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(data);
        }
    }
    
    private String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", "")
                   .replaceAll("&nbsp;", " ")
                   .replaceAll("&lt;", "<")
                   .replaceAll("&gt;", ">")
                   .replaceAll("&amp;", "&")
                   .trim();
    }
}
