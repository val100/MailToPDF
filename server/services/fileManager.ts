import fs from 'fs/promises';
import path from 'path';

export class FileManagerService {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'pdfs');
  }

  async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating output directory:', error);
      throw new Error('Failed to create PDF output directory');
    }
  }

  async getFileInfo(filename: string): Promise<{
    exists: boolean;
    size?: number;
    path?: string;
  }> {
    try {
      const filepath = path.join(this.outputDir, filename);
      const stats = await fs.stat(filepath);
      
      return {
        exists: true,
        size: stats.size,
        path: filepath
      };
    } catch (error) {
      return { exists: false };
    }
  }

  async readFile(filename: string): Promise<Buffer> {
    try {
      const filepath = path.join(this.outputDir, filename);
      return await fs.readFile(filepath);
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('File not found or cannot be read');
    }
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const filepath = path.join(this.outputDir, filename);
      await fs.unlink(filepath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async listFiles(): Promise<Array<{
    name: string;
    size: number;
    created: Date;
    path: string;
  }>> {
    try {
      await this.ensureOutputDirectory();
      const files = await fs.readdir(this.outputDir);
      const fileStats = await Promise.all(
        files
          .filter(file => file.endsWith('.pdf'))
          .map(async (file) => {
            const filepath = path.join(this.outputDir, file);
            const stats = await fs.stat(filepath);
            return {
              name: file,
              size: stats.size,
              created: stats.birthtime,
              path: filepath
            };
          })
      );
      
      return fileStats.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  async getDirectorySize(): Promise<number> {
    try {
      const files = await this.listFiles();
      return files.reduce((total, file) => total + file.size, 0);
    } catch (error) {
      console.error('Error calculating directory size:', error);
      return 0;
    }
  }

  async cleanupOldFiles(maxAge: number = 30): Promise<number> {
    try {
      const files = await this.listFiles();
      const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const file of files) {
        if (file.created < cutoffDate) {
          const deleted = await this.deleteFile(file.name);
          if (deleted) deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Error during cleanup:', error);
      return 0;
    }
  }
}

export const fileManagerService = new FileManagerService();
