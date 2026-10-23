import React from 'react';
import type { DataStatus, ParticipationStatus } from '../../types/profile';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, UserX } from 'lucide-react';

interface StatusBadgeProps {
  type: 'data' | 'participation';
  status: DataStatus | ParticipationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  if (type === 'data') {
    switch (status) {
      case 'verified':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 ${sizeClasses}`}>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Verified Link
          </span>
        );
      case 'user_supplied':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-600/50 text-amber-200 ${sizeClasses}`}>
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            User Supplied
          </span>
        );
      case 'invalid_format_warning':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-rose-950/60 border border-rose-600/50 text-rose-300 ${sizeClasses}`}>
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Format Warning
          </span>
        );
      case 'link_unverified':
      default:
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 ${sizeClasses}`}>
            <Clock className="w-3 h-3 text-neutral-400" />
            Link Unverified
          </span>
        );
    }
  }

  // Participation Status
  switch (status) {
    case 'enrolled':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-blue-950/60 border border-blue-600/50 text-blue-300 ${sizeClasses}`}>
          <CheckCircle2 className="w-3 h-3 text-blue-400" />
          Enrolled & Consented
        </span>
      );
    case 'invited':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-indigo-950/60 border border-indigo-600/50 text-indigo-300 ${sizeClasses}`}>
          <Clock className="w-3 h-3 text-indigo-400" />
          Invitation Sent
        </span>
      );
    case 'not_invited':
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-stone-900/80 border border-stone-800 text-stone-400 ${sizeClasses}`}>
          <UserX className="w-3 h-3 text-stone-500" />
          Preliminary (Not Invited)
        </span>
      );
  }
};
