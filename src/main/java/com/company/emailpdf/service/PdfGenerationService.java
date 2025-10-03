package com.company.emailpdf.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfGenerationService {
    
    private static final Logger log = LoggerFactory.getLogger(PdfGenerationService.class);
    private static final int MAX_CHARS_PER_LINE = 90;
    private static final float FONT_SIZE = 11f;
    private static final float LEADING = 14f;
    
    public byte[] generateEmailPdf(MicrosoftGraphEmailService.EmailMessage email, 
                                     List<MicrosoftGraphEmailService.EmailAttachment> attachments) throws IOException {
        
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                float margin = 50;
                float yPosition = page.getMediaBox().getHeight() - margin;
                float pageWidth = page.getMediaBox().getWidth() - (2 * margin);
                
                PDType1Font titleFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                PDType1Font normalFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
                PDType1Font boldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                
                // Title
                contentStream.beginText();
                contentStream.setFont(titleFont, 16);
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Email Message");
                contentStream.endText();
                yPosition -= 30;
                
                // Email headers
                contentStream.setFont(boldFont, FONT_SIZE);
                yPosition = addTextField(contentStream, "From:", email.getFrom(), margin, yPosition, normalFont, boldFont);
                yPosition = addTextField(contentStream, "To:", email.getTo(), margin, yPosition, normalFont, boldFont);
                yPosition = addTextField(contentStream, "Subject:", email.getSubject(), margin, yPosition, normalFont, boldFont);
                yPosition = addTextField(contentStream, "Date:", formatDateTime(email.getReceivedDateTime()), 
                    margin, yPosition, normalFont, boldFont);
                
                yPosition -= 20;
                
                // Separator line
                contentStream.moveTo(margin, yPosition);
                contentStream.lineTo(page.getMediaBox().getWidth() - margin, yPosition);
                contentStream.stroke();
                yPosition -= 20;
                
                // Body
                contentStream.beginText();
                contentStream.setFont(boldFont, FONT_SIZE);
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Message Body:");
                contentStream.endText();
                yPosition -= 20;
                
                // Add body text with word wrapping
                String bodyText = stripHtml(email.getBody());
                List<String> lines = wrapText(bodyText, MAX_CHARS_PER_LINE);
                
                contentStream.setFont(normalFont, FONT_SIZE);
                for (String line : lines) {
                    if (yPosition < margin + 50) {
                        // Need new page
                        contentStream.close();
                        page = new PDPage(PDRectangle.A4);
                        document.addPage(page);
                        PDPageContentStream newStream = new PDPageContentStream(document, page);
                        yPosition = page.getMediaBox().getHeight() - margin;
                        newStream.setFont(normalFont, FONT_SIZE);
                        
                        newStream.beginText();
                        newStream.newLineAtOffset(margin, yPosition);
                        newStream.showText(line);
                        newStream.endText();
                        yPosition -= LEADING;
                    } else {
                        contentStream.beginText();
                        contentStream.newLineAtOffset(margin, yPosition);
                        contentStream.showText(line);
                        contentStream.endText();
                        yPosition -= LEADING;
                    }
                }
                
                // Attachments info
                if (attachments != null && !attachments.isEmpty()) {
                    yPosition -= 20;
                    contentStream.beginText();
                    contentStream.setFont(boldFont, FONT_SIZE);
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("Attachments (" + attachments.size() + "):");
                    contentStream.endText();
                    yPosition -= 20;
                    
                    for (MicrosoftGraphEmailService.EmailAttachment att : attachments) {
                        contentStream.setFont(normalFont, FONT_SIZE);
                        contentStream.beginText();
                        contentStream.newLineAtOffset(margin + 10, yPosition);
                        contentStream.showText("- " + att.getName() + " (" + formatSize(att.getSize()) + ")");
                        contentStream.endText();
                        yPosition -= LEADING;
                    }
                }
            }
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
            
        } catch (Exception e) {
            log.error("Failed to generate PDF for email", e);
            throw new IOException("PDF generation failed", e);
        }
    }
    
    public void savePdfToFile(byte[] pdfData, String filePath) throws IOException {
        File file = new File(filePath);
        file.getParentFile().mkdirs();
        
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(pdfData);
            log.info("PDF saved to: {}", filePath);
        }
    }
    
    private float addTextField(PDPageContentStream stream, String label, String value, 
                                float x, float y, PDType1Font normalFont, PDType1Font boldFont) throws IOException {
        stream.beginText();
        stream.setFont(boldFont, FONT_SIZE);
        stream.newLineAtOffset(x, y);
        stream.showText(label + " ");
        stream.endText();
        
        float labelWidth = boldFont.getStringWidth(label + " ") / 1000 * FONT_SIZE;
        
        stream.beginText();
        stream.setFont(normalFont, FONT_SIZE);
        stream.newLineAtOffset(x + labelWidth, y);
        stream.showText(value != null ? value : "");
        stream.endText();
        
        return y - 20;
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
    
    private List<String> wrapText(String text, int maxCharsPerLine) {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isEmpty()) {
            return lines;
        }
        
        String[] paragraphs = text.split("\n");
        for (String paragraph : paragraphs) {
            if (paragraph.length() <= maxCharsPerLine) {
                lines.add(paragraph);
            } else {
                String[] words = paragraph.split(" ");
                StringBuilder currentLine = new StringBuilder();
                
                for (String word : words) {
                    if (currentLine.length() + word.length() + 1 <= maxCharsPerLine) {
                        if (currentLine.length() > 0) {
                            currentLine.append(" ");
                        }
                        currentLine.append(word);
                    } else {
                        if (currentLine.length() > 0) {
                            lines.add(currentLine.toString());
                        }
                        currentLine = new StringBuilder(word);
                    }
                }
                
                if (currentLine.length() > 0) {
                    lines.add(currentLine.toString());
                }
            }
        }
        
        return lines;
    }
    
    private String formatDateTime(String dateTime) {
        try {
            LocalDateTime dt = LocalDateTime.parse(dateTime);
            return dt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (Exception e) {
            return dateTime;
        }
    }
    
    private String formatSize(Integer bytes) {
        if (bytes == null || bytes == 0) return "0 B";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }
}
