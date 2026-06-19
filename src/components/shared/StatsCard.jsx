import React from 'react';
import { cn } from '@/lib/utils';

export default function StatsCard({ title, value, icon: Icon, variant = 'default', subtitle, accent = false }) {
  const iconClass = {
    default: 'text-muted-foreground',
    critical: 'text-primary',
    warning: 'text-primary',
    neutral: 'text-slate-500',
    brand: 'text-primary'
  }[variant] || 'text-muted-foreground';

  const accentClass = {
    critical: 'border-l-4 border-l-primary',
    warning: 'border-l-4 border-l-primary',
    brand: 'border-l-4 border-l-primary',
    default: 'border-l-4 border-l-primary',
    neutral: 'border-l-4 border-l-primary'
  }[variant] || 'border-l-4 border-l-primary';

  return (
    <div className={cn(
      "bg-card border border-border rounded-md p-4 hover:shadow-sm transition-shadow",
      accentClass
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">{title}</p>
          <p className={cn(
            "text-2xl font-bold mt-1 leading-none text-[hsl(var(--foreground))]",
            variant === 'critical' ? "" : 'text-foreground'
          )}>{value}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {Icon &&
        <div className="w-8 h-8 rounded flex items-center justify-center bg-muted/70 shrink-0 mt-0.5 hidden">
          <Icon className={cn("w-4 h-4", iconClass)} />
        </div>
        }
      </div>
    </div>
  );
}