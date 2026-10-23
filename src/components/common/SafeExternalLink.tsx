import React from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface SafeExternalLinkProps {
  url: string | null;
  label: string;
  isVerified?: boolean;
  type?: 'linkedin' | 'instagram' | 'generic';
}

export const SafeExternalLink: React.FC<SafeExternalLinkProps> = ({
  url,
  label,
  isVerified = false,
  type = 'generic',
}) => {
  if (!url) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-rose-400/90 bg-rose-950/30 px-2 py-1 rounded border border-rose-900/40">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{label} (URL Withheld / Unverified)</span>
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 text-xs font-semibold transition-colors duration-150 text-purple-900/80 hover:text-pink-600 focus:outline-none focus:ring-1 focus:ring-pink-400 rounded px-1 -mx-1"
      title={`${label} (Opens in new tab)`}
    >
      <span className="truncate max-w-[200px]">{label}</span>
      <ExternalLink className="w-3 h-3 text-purple-400 group-hover:text-pink-600 transition-colors flex-shrink-0" />
      {!isVerified && type === 'instagram' && (
        <span className="text-[10px] text-pink-500/80 uppercase font-sans tracking-wider ml-0.5">
          (Unverified)
        </span>
      )}
    </a>
  );
};
