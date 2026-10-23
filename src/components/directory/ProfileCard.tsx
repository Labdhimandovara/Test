import React from 'react';
import type { Profile } from '../../types/profile';
import { LinkedinIcon, InstagramIcon } from '../common/SocialIcons';
import { ArrowUpRight, Heart, User } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  onSelect: (profile: Profile) => void;
}

// Generate deterministic cute pastel gradient based on name
function getInitialsColor(name: string): string {
  const gradients = [
    'from-pink-100 to-purple-100 text-purple-700 border-purple-200',
    'from-purple-100 to-indigo-100 text-indigo-700 border-indigo-200',
    'from-rose-100 to-pink-100 text-pink-700 border-pink-200',
    'from-amber-100 to-pink-100 text-rose-700 border-rose-200',
    'from-teal-100 to-purple-100 text-teal-800 border-teal-200',
  ];
  const charCode = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
  return gradients[charCode % gradients.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSelect }) => {
  const isEnrolled = profile.participationStatus === 'enrolled';
  const initialsColor = getInitialsColor(profile.name);
  const initials = getInitials(profile.name);

  return (
    <div className="bg-white rounded-2xl p-5 border border-pink-100 shadow-[0_4px_20px_rgba(244,114,182,0.06)] hover:shadow-[0_8px_30px_rgba(244,114,182,0.12)] hover:border-pink-200 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Avatar & Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${initialsColor} border flex items-center justify-center font-bold text-sm tracking-wider shadow-inner`}>
              {initials}
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1e1b2e] group-hover:text-pink-600 transition-colors">
                {profile.name}
              </h3>
              <p className="text-[11px] text-purple-900/50 font-medium">
                {profile.sourceUrl?.includes('direct') ? 'Research Record' : 'Peer Cohort'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelect(profile)}
            className="p-2 rounded-xl bg-pink-50/80 hover:bg-pink-100 text-pink-600 border border-pink-100 transition-colors cursor-pointer"
            title="View details & consent status"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Social Links Row */}
        <div className="flex items-center gap-2 my-3">
          {profile.linkedinUrl ? (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0a66c2]/10 hover:bg-[#0a66c2]/15 text-[#0a66c2] text-xs font-semibold border border-[#0a66c2]/20 transition-colors"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
          ) : (
            <span className="text-[11px] text-gray-400 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">
              No LinkedIn
            </span>
          )}

          {profile.instagramHandle ? (
            profile.instagramUrl ? (
              <a
                href={profile.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-semibold border border-pink-200 transition-colors"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                <span>@{profile.instagramHandle}</span>
              </a>
            ) : (
              <span className="text-[11px] text-rose-500 px-2 py-1 rounded-xl bg-rose-50 border border-rose-200">
                @{profile.instagramHandle} (invalid)
              </span>
            )
          ) : (
            <span className="text-[11px] text-gray-400 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">
              No Insta
            </span>
          )}
        </div>
      </div>

      {/* Footer Status Pill */}
      <div className="pt-3 border-t border-pink-100/80 flex items-center justify-between">
        {isEnrolled ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Heart className="w-3.5 h-3.5 fill-current text-purple-600" />
            <span>Opted In</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-500 border border-pink-200">
            <User className="w-3 h-3" />
            <span>Not Invited</span>
          </span>
        )}

        <button
          onClick={() => onSelect(profile)}
          className="text-xs font-bold text-pink-600 hover:text-pink-700 transition-colors cursor-pointer"
        >
          Details →
        </button>
      </div>
    </div>
  );
};
