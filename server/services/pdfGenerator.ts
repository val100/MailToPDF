import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export interface EmailToPdfOptions {
  subject: string;
  from: string;
  receivedDateTime: string;
  body: string;
  attachments?: Array<{
    name: string;
    contentType: string;
    size: number;
    buffer: Buffer;
  }>;
}

export class PdfGeneratorService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async convertEmailToPdf(emailData: EmailToPdfOptions): Promise<{
    filename: string;
    filepath: string;
    size: number;
  }> {
    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Failed to initialize PDF generator');
    }

    const page = await this.browser.newPage();
    
    try {
      // Generate unique filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
      const dateStr = timestamp[0].replace(/-/g, '');
      const timeStr = timestamp[1].split('.')[0].replace(/-/g, '');
      const uniqueId = randomUUID().substring(0, 8);
      const filename = `email_${dateStr}_${timeStr}_${uniqueId}.pdf`;
      
      // Create output directory if it doesn't exist
      const outputDir = path.join(process.cwd(), 'pdfs');
      await fs.mkdir(outputDir, { recursive: true });
      
      const filepath = path.join(outputDir, filename);
      
      // Generate HTML content for the email
      const htmlContent = this.generateEmailHtml(emailData);
      
      // Set page content and wait for it to load
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Configure PDF options
      const pdfOptions = {
        path: filepath,
        format: 'A4' as const,
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      };
      
      // Generate PDF
      await page.pdf(pdfOptions);
      
      // Get file size
      const stats = await fs.stat(filepath);
      
      return {
        filename,
        filepath,
        size: stats.size
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF from email');
    } finally {
      await page.close();
    }
  }

  async convertAttachmentToPdf(attachment: {
    name: string;
    contentType: string;
    buffer: Buffer;
  }): Promise<{
    filename: string;
    filepath: string;
    size: number;
  } | null> {
    // Handle different attachment types
    const supportedTypes = [
      'text/html',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!supportedTypes.includes(attachment.contentType)) {
      return null; // Unsupported type
    }

    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Failed to initialize PDF generator');
    }

    const page = await this.browser.newPage();
    
    try {
      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
      const dateStr = timestamp[0].replace(/-/g, '');
      const timeStr = timestamp[1].split('.')[0].replace(/-/g, '');
      const uniqueId = randomUUID().substring(0, 8);
      const baseName = path.parse(attachment.name).name;
      const filename = `attachment_${baseName}_${dateStr}_${timeStr}_${uniqueId}.pdf`;
      
      const outputDir = path.join(process.cwd(), 'pdfs');
      await fs.mkdir(outputDir, { recursive: true });
      const filepath = path.join(outputDir, filename);
      
      let htmlContent = '';
      
      if (attachment.contentType === 'text/html') {
        htmlContent = attachment.buffer.toString('utf-8');
      } else if (attachment.contentType === 'text/plain') {
        const textContent = attachment.buffer.toString('utf-8');
        htmlContent = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; white-space: pre-wrap; }
              </style>
            </head>
            <body>${textContent}</body>
          </html>
        `;
      } else {
        // For Word documents, we'd need a more sophisticated converter
        // For now, just create a placeholder
        htmlContent = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .attachment-info { background: #f5f5f5; padding: 15px; border-radius: 5px; }
              </style>
            </head>
            <body>
              <div class="attachment-info">
                <h2>Attachment: ${attachment.name}</h2>
                <p><strong>Type:</strong> ${attachment.contentType}</p>
                <p><strong>Size:</strong> ${Math.round(attachment.buffer.length / 1024)} KB</p>
                <p><em>Note: This attachment type requires specialized conversion software to view content.</em></p>
              </div>
            </body>
          </html>
        `;
      }
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfOptions = {
        path: filepath,
        format: 'A4' as const,
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      };
      
      await page.pdf(pdfOptions);
      
      const stats = await fs.stat(filepath);
      
      return {
        filename,
        filepath,
        size: stats.size
      };
    } catch (error) {
      console.error('Error converting attachment to PDF:', error);
      return null;
    } finally {
      await page.close();
    }
  }

  private generateEmailHtml(emailData: EmailToPdfOptions): string {
    const { subject, from, receivedDateTime, body, attachments = [] } = emailData;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-header {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #007bff;
            }
            .email-header h1 {
              margin: 0 0 10px 0;
              color: #007bff;
              font-size: 24px;
            }
            .email-meta {
              font-size: 14px;
              color: #666;
              margin: 5px 0;
            }
            .email-body {
              background: white;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #dee2e6;
              margin-bottom: 20px;
            }
            .attachments {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #dee2e6;
            }
            .attachment-item {
              background: white;
              padding: 10px;
              margin: 5px 0;
              border-radius: 4px;
              border: 1px solid #dee2e6;
              font-size: 14px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #dee2e6;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="email-header">
            <h1>${this.escapeHtml(subject || 'No Subject')}</h1>
            <div class="email-meta">
              <strong>From:</strong> ${this.escapeHtml(from)}
            </div>
            <div class="email-meta">
              <strong>Date:</strong> ${new Date(receivedDateTime).toLocaleString()}
            </div>
          </div>
          
          <div class="email-body">
            ${body || '<em>No content</em>'}
          </div>
          
          ${attachments.length > 0 ? `
            <div class="attachments">
              <h3>Attachments (${attachments.length})</h3>
              ${attachments.map(att => `
                <div class="attachment-item">
                  <strong>${this.escapeHtml(att.name)}</strong><br>
                  Type: ${att.contentType} | Size: ${Math.round(att.size / 1024)} KB
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="footer">
            Generated by Email to PDF Converter | ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;
  }

  private escapeHtml(text: string): string {
    const div = { innerHTML: '' } as any;
    div.textContent = text;
    return div.innerHTML;
  }
}

export const pdfGeneratorService = new PdfGeneratorService();
