import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';

interface MsalConfig {
  auth: {
    clientId: string;
    clientSecret: string;
    authority: string;
  };
}

export class MicrosoftGraphService {
  private msalApp: ConfidentialClientApplication;
  
  constructor() {
    const msalConfig: MsalConfig = {
      auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID || process.env.CLIENT_ID || 'your_client_id',
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || process.env.CLIENT_SECRET || 'your_client_secret',
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || process.env.TENANT_ID || 'common'}`
      }
    };
    
    this.msalApp = new ConfidentialClientApplication(msalConfig);
  }

  async getAccessToken(): Promise<string> {
    try {
      const tokenRequest = {
        scopes: ['https://graph.microsoft.com/.default']
      };
      
      const response = await this.msalApp.acquireTokenByClientCredential(tokenRequest);
      
      if (!response || !response.accessToken) {
        throw new Error('Failed to acquire access token');
      }
      
      return response.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Authentication failed with Microsoft Graph');
    }
  }

  async getGraphClient(): Promise<Client> {
    const accessToken = await this.getAccessToken();
    
    return Client.init({
      authProvider: {
        getAccessToken: () => Promise.resolve(accessToken)
      }
    });
  }

  async getEmails(options: {
    maxCount?: number;
    dateRange?: string;
    select?: string[];
  } = {}): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      const { maxCount = 100, select = ['id', 'subject', 'from', 'receivedDateTime', 'body', 'hasAttachments'] } = options;
      
      let query = client
        .api('/me/messages')
        .select(select.join(','))
        .orderby('receivedDateTime desc')
        .top(maxCount);

      // Add date filter if specified
      if (options.dateRange) {
        const dateFilter = this.getDateFilter(options.dateRange);
        if (dateFilter) {
          query = query.filter(dateFilter);
        }
      }

      const response = await query.get();
      return response.value || [];
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error('Failed to fetch emails from Office 365');
    }
  }

  async getEmailAttachments(emailId: string): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      const response = await client
        .api(`/me/messages/${emailId}/attachments`)
        .get();
      
      return response.value || [];
    } catch (error) {
      console.error('Error fetching email attachments:', error);
      return [];
    }
  }

  async downloadAttachment(emailId: string, attachmentId: string): Promise<Buffer> {
    try {
      const client = await this.getGraphClient();
      const attachment = await client
        .api(`/me/messages/${emailId}/attachments/${attachmentId}`)
        .get();
      
      if (attachment.contentBytes) {
        return Buffer.from(attachment.contentBytes, 'base64');
      }
      
      throw new Error('No content bytes found in attachment');
    } catch (error) {
      console.error('Error downloading attachment:', error);
      throw new Error('Failed to download attachment');
    }
  }

  private getDateFilter(dateRange: string): string | null {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'last_7_days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last_30_days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last_90_days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return null;
    }

    return `receivedDateTime ge ${startDate.toISOString()}`;
  }

  async getUserInfo(): Promise<any> {
    try {
      const client = await this.getGraphClient();
      return await client.api('/me').get();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw new Error('Failed to fetch user information');
    }
  }
}

export const microsoftGraphService = new MicrosoftGraphService();
