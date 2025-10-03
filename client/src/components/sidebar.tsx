import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: "fa-tachometer-alt" },
  { name: "Accounts", href: "/accounts", icon: "fa-user-circle" },
  { name: "Scenarios", href: "/scenarios", icon: "fa-sitemap" },
  { name: "Email Processing", href: "/email-processing", icon: "fa-envelope" },
  { name: "PDF Files", href: "/pdf-files", icon: "fa-folder" },
  { name: "Settings", href: "/settings", icon: "fa-cog" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className={cn("w-64 bg-card border-r border-border flex flex-col", className)}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center" data-testid="logo">
            <i className="fas fa-file-pdf text-primary-foreground text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Email PDF</h1>
            <p className="text-sm text-muted-foreground">Converter</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <i className="fas fa-user text-muted-foreground text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground" data-testid="user-name">
              John Doe
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="user-email">
              john.doe@company.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
