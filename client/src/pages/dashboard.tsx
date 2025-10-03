import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/stats-card";
import { ProcessingStatus } from "@/components/processing-status";
import { RecentActivity } from "@/components/recent-activity";
import { FileTable } from "@/components/file-table";
import { useState, useEffect } from "react";

interface DashboardStats {
  totalEmails: number;
  convertedPdfs: number;
  processing: number;
  failed: number;
}

interface ProcessingJob {
  id: string;
  status: string;
  emailCount: number;
  processedCount: number;
  failedCount: number;
}

interface ConnectionStatus {
  connected: boolean;
  error?: string;
  user?: {
    displayName: string;
    email: string;
  };
}

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch recent activity
  const { data: activities = [] } = useQuery<any[]>({
    queryKey: ['/api/activity'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch recent files
  const { data: recentFiles = [] } = useQuery<any[]>({
    queryKey: ['/api/files/recent'],
    refetchInterval: 10000,
  });

  // Fetch job status if there's a current job
  const { data: currentJob } = useQuery<ProcessingJob>({
    queryKey: ['/api/processing/status', currentJobId],
    enabled: !!currentJobId,
    refetchInterval: 2000, // Refresh every 2 seconds during processing
  });

  // Check Office 365 connection
  const { data: connectionStatus } = useQuery<ConnectionStatus>({
    queryKey: ['/api/office365/test'],
    refetchInterval: 60000, // Check every minute
  });

  // Start processing mutation
  const startProcessingMutation = useMutation({
    mutationFn: async (data: { dateRange: string; emailLimit: number }) => {
      const response = await apiRequest('POST', '/api/processing/start', data);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentJobId(data.jobId);
      toast({
        title: "Processing Started",
        description: "Email to PDF conversion has begun.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // File actions
  const handleDownload = (filename: string) => {
    window.open(`/api/files/download/${filename}`, '_blank');
  };

  const handlePreview = (filename: string) => {
    // For now, just download - in a real app, you might open in a PDF viewer
    handleDownload(filename);
  };

  const deleteFileMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/files/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "File Deleted",
        description: "The PDF file has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/files/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate progress
  const calculateProgress = () => {
    if (!currentJob || !currentJob.emailCount) {
      return {
        percentage: 0,
        currentActivity: "Ready to process emails...",
        processed: 0,
        remaining: 0,
        estimatedTime: "0m"
      };
    }

    const percentage = Math.round((currentJob.processedCount / currentJob.emailCount) * 100);
    const processed = currentJob.processedCount;
    const remaining = currentJob.emailCount - processed;
    
    // Simple time estimation based on current pace
    const estimatedMinutes = remaining > 0 ? Math.ceil(remaining * 0.5) : 0;
    const estimatedTime = estimatedMinutes > 60 
      ? `~${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`
      : `~${estimatedMinutes}m`;

    return {
      percentage,
      currentActivity: currentJob.status === 'processing' 
        ? "Converting emails to PDF..." 
        : "Processing complete",
      processed,
      remaining,
      estimatedTime
    };
  };

  const progress = calculateProgress();
  const isProcessing = currentJob?.status === 'processing';

  // Auto-clear job when completed
  useEffect(() => {
    if (currentJob && (currentJob.status === 'completed' || currentJob.status === 'failed')) {
      setTimeout(() => setCurrentJobId(null), 5000); // Clear after 5 seconds
    }
  }, [currentJob]);

  if (statsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground">Monitor your email to PDF conversion process</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              connectionStatus?.connected 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus?.connected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span data-testid="connection-status">
                {connectionStatus?.connected ? 'Office 365 Connected' : 'Office 365 Disconnected'}
              </span>
            </div>
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
                queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
                queryClient.invalidateQueries({ queryKey: ['/api/files/recent'] });
              }}
              data-testid="button-refresh"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Emails"
            value={stats?.totalEmails || 0}
            icon="fa-envelope"
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
            subtitle="+12% from last week"
          />
          <StatsCard
            title="Converted PDFs"
            value={stats?.convertedPdfs || 0}
            icon="fa-file-pdf"
            iconBgColor="bg-green-50"
            iconColor="text-green-600"
            subtitle={`${stats ? Math.round((stats.convertedPdfs / (stats.totalEmails || 1)) * 100) : 0}% success rate`}
          />
          <StatsCard
            title="Processing"
            value={stats?.processing || 0}
            icon="fa-spinner"
            iconBgColor="bg-yellow-50"
            iconColor="text-yellow-600"
            subtitle="In progress"
          />
          <StatsCard
            title="Failed"
            value={stats?.failed || 0}
            icon="fa-exclamation-triangle"
            iconBgColor="bg-red-50"
            iconColor="text-red-600"
            subtitle={`${stats ? Math.round((stats.failed / (stats.totalEmails || 1)) * 100) : 0}% error rate`}
          />
        </div>

        {/* Processing Status */}
        <ProcessingStatus
          isProcessing={isProcessing}
          progress={progress}
          onStartProcessing={() => startProcessingMutation.mutate({ dateRange: 'last_7_days', emailLimit: 100 })}
        />

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity activities={activities} />
          
          {/* Quick Actions */}
          <div className="bg-card rounded-lg border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Office 365 Connection */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <i className="fab fa-microsoft text-primary"></i>
                    <span className="font-medium text-foreground">Office 365 Connection</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    connectionStatus?.connected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {connectionStatus?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                {connectionStatus?.user && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Connected as: {connectionStatus.user.email}
                  </p>
                )}
                <button 
                  className="w-full px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/office365/test'] })}
                  data-testid="button-refresh-connection"
                >
                  <i className="fas fa-sync mr-2"></i>
                  Refresh Connection
                </button>
              </div>

              {/* Batch Processing */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <i className="fas fa-layer-group text-primary"></i>
                  <span className="font-medium text-foreground">Batch Processing</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">Date Range</label>
                    <select className="px-2 py-1 bg-background border border-border rounded text-sm">
                      <option value="last_7_days">Last 7 days</option>
                      <option value="last_30_days">Last 30 days</option>
                      <option value="last_90_days">Last 90 days</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">Email Limit</label>
                    <input 
                      type="number" 
                      defaultValue={100}
                      className="w-20 px-2 py-1 bg-background border border-border rounded text-sm"
                      data-testid="input-email-limit"
                    />
                  </div>
                  <button 
                    className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    onClick={() => startProcessingMutation.mutate({ dateRange: 'last_7_days', emailLimit: 100 })}
                    disabled={startProcessingMutation.isPending || isProcessing}
                    data-testid="button-batch-process"
                  >
                    <i className="fas fa-play mr-2"></i>
                    Start Batch Process
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Files Table */}
        <FileTable
          files={recentFiles}
          onDownload={handleDownload}
          onPreview={handlePreview}
          onDelete={(id) => deleteFileMutation.mutate(id)}
        />
      </div>
    </div>
  );
}
