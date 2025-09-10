import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  metadata?: any;
  createdAt: Date;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return { icon: 'fa-check', bgColor: 'bg-green-50', iconColor: 'text-green-600' };
      case 'error': return { icon: 'fa-exclamation-triangle', bgColor: 'bg-red-50', iconColor: 'text-red-600' };
      case 'warning': return { icon: 'fa-exclamation-triangle', bgColor: 'bg-yellow-50', iconColor: 'text-yellow-600' };
      case 'info': return { icon: 'fa-info-circle', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' };
      default: return { icon: 'fa-circle', bgColor: 'bg-gray-50', iconColor: 'text-gray-600' };
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className={cn("bg-card rounded-lg border border-border", className)}>
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => {
              const iconConfig = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", iconConfig.bgColor)}>
                    <i className={cn("fas text-sm", iconConfig.icon, iconConfig.iconColor)}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    {activity.metadata?.from && (
                      <p className="text-xs text-muted-foreground">From: {activity.metadata.from}</p>
                    )}
                    {activity.metadata?.filename && (
                      <p className="text-xs text-muted-foreground">File: {activity.metadata.filename}</p>
                    )}
                    <p className="text-xs text-muted-foreground" data-testid={`activity-time-${activity.id}`}>
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
