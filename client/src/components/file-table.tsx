import { cn } from "@/lib/utils";

interface ConvertedFile {
  id: string;
  subject: string;
  sender: string;
  pdfFileName: string;
  fileSize: number;
  createdAt: Date;
  conversionStatus: 'success' | 'failed';
}

interface FileTableProps {
  files: ConvertedFile[];
  onDownload: (filename: string) => void;
  onPreview: (filename: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function FileTable({ files, onDownload, onPreview, onDelete, className }: FileTableProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className={cn("bg-card rounded-lg border border-border", className)}>
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recently Converted Files</h3>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors" data-testid="button-view-all">
            View All →
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">File Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Original Email</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Size</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Converted</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {files.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No converted files yet
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className="hover:bg-muted/50 transition-colors" data-testid={`file-row-${file.id}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <i className={cn(
                        "fas fa-file-pdf",
                        file.conversionStatus === 'success' ? 'text-red-500' : 'text-gray-400'
                      )}></i>
                      <span className="text-sm font-medium text-foreground">{file.pdfFileName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-foreground">{file.subject || 'No Subject'}</p>
                      <p className="text-xs text-muted-foreground">From: {file.sender}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatFileSize(file.fileSize)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatTimeAgo(file.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {file.conversionStatus === 'success' && (
                        <>
                          <button 
                            className="p-1 text-muted-foreground hover:text-primary transition-colors" 
                            onClick={() => onDownload(file.pdfFileName)}
                            title="Download"
                            data-testid={`button-download-${file.id}`}
                          >
                            <i className="fas fa-download text-sm"></i>
                          </button>
                          <button 
                            className="p-1 text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => onPreview(file.pdfFileName)}
                            title="Preview"
                            data-testid={`button-preview-${file.id}`}
                          >
                            <i className="fas fa-eye text-sm"></i>
                          </button>
                        </>
                      )}
                      <button 
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => onDelete(file.id)}
                        title="Delete"
                        data-testid={`button-delete-${file.id}`}
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
