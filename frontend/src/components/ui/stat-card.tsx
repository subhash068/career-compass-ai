import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  className,
  iconClassName 
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl p-5 border shadow-card card-glow relative overflow-hidden group",
      className
    )}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</p>
          <p className="text-3xl font-bold font-display bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground/80 line-clamp-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-medium pt-1",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground/60">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
          "bg-gradient-to-br from-primary/15 to-primary/5",
          iconClassName
        )}>
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
