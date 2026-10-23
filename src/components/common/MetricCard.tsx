import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: string;
  accent?: 'amber' | 'emerald' | 'blue' | 'rose' | 'neutral';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  badge,
  accent = 'amber',
}) => {
  const accentBorder = {
    amber: 'border-l-amber-500/70',
    emerald: 'border-l-emerald-500/70',
    blue: 'border-l-blue-500/70',
    rose: 'border-l-rose-500/70',
    neutral: 'border-l-neutral-600',
  }[accent];

  return (
    <div className={`bg-[#121418] border border-neutral-800/80 rounded-lg p-4 border-l-2 ${accentBorder} shadow-sm hover:border-neutral-700 transition-colors`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono-code font-medium">
          {label}
        </span>
        {badge && (
          <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/60">
            {badge}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight text-white font-editorial mb-1">
        {value}
      </div>
      {subtext && (
        <p className="text-xs text-neutral-400/90 leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
};
