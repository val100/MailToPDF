import { cn } from "@/lib/utils";

interface ProcessingStatusProps {
  isProcessing: boolean;
  progress: {
    percentage: number;
    currentActivity: string;
    processed: number;
    remaining: number;
    estimatedTime: string;
  };
  onStartProcessing: () => void;
  className?: string;
}

export function ProcessingStatus({ 
  isProcessing, 
  progress, 
  onStartProcessing,
  className 
}: ProcessingStatusProps) {
  return (
    <div className={cn("bg-card rounded-lg border border-border", className)}>
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Current Processing Status</h3>
          <button 
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            onClick={onStartProcessing}
            disabled={isProcessing}
            data-testid="button-start-processing"
          >
            <i className="fas fa-play mr-1"></i>
            {isProcessing ? 'Processing...' : 'Start Processing'}
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium text-foreground" data-testid="progress-percentage">
                {progress.percentage}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
                data-testid="progress-bar"
              ></div>
            </div>
          </div>

          {/* Current Activity */}
          {isProcessing && (
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse-dot"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse-dot [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse-dot [animation-delay:0.4s]"></div>
              </div>
              <span className="text-muted-foreground" data-testid="current-activity">
                {progress.currentActivity}
              </span>
            </div>
          )}

          {/* Processing Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground" data-testid="processed-count">
                {progress.processed}
              </p>
              <p className="text-sm text-muted-foreground">Processed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground" data-testid="remaining-count">
                {progress.remaining}
              </p>
              <p className="text-sm text-muted-foreground">Remaining</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground" data-testid="estimated-time">
                {progress.estimatedTime}
              </p>
              <p className="text-sm text-muted-foreground">Est. Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
