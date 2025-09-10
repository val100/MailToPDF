import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
  iconColor,
  className
}: StatsCardProps) {
  return (
    <div className={cn("bg-card rounded-lg border border-border p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
        </div>
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBgColor)}>
          <i className={cn("fas text-xl", icon, iconColor)}></i>
        </div>
      </div>
      {subtitle && (
        <div className="mt-4">
          <span className="text-sm text-green-600">{subtitle}</span>
        </div>
      )}
    </div>
  );
}
