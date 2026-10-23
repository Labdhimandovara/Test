import React from 'react';
import type { Profile, DataStatus } from '../../types/profile';
import { StatusBadge } from '../common/StatusBadge';
import { SafeExternalLink } from '../common/SafeExternalLink';
import { LinkedinIcon, InstagramIcon } from '../common/SocialIcons';
import { 
  X, 
  AlertTriangle, 
  Calendar, 
  FileCode,
  Edit,
  Globe
} from 'lucide-react';

interface PersonDetailModalProps {
  profile: Profile | null;
  onClose: () => void;
  onUpdateStatus?: (id: string, newStatus: DataStatus) => void;
  onEditProfile?: (profile: Profile) => void;
  onConfirmIdentity?: (id: string, confirmed: boolean, notes?: string) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  profile,
  onClose,
  onEditProfile,
  onConfirmIdentity,
}) => {
  if (!profile) return null;

  const handleToggleIdentity = () => {
    if (onConfirmIdentity) {
      const current = profile.verification?.identityCorrespondenceConfirmed || false;
      onConfirmIdentity(profile.id, !current, 'Manual public identity correspondence confirmed by researcher.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white border border-pink-100 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between text-purple-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-pink-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-200 uppercase">
                Profile Details
              </span>
              <span className="text-pink-300">•</span>
              <span className="text-xs font-mono-code text-purple-900/50">
                {profile.id}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#1e1b2e]">
              {profile.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {onEditProfile && (
              <button
                onClick={() => {
                  onEditProfile(profile);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-xs font-semibold text-pink-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-pink-600" />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Legal / Data Status Notice */}
          <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-600 uppercase">
                Data & Participation Classification
              </span>
              <div className="flex gap-2">
                <StatusBadge type="data" status={profile.dataStatus} />
                <StatusBadge type="participation" status={profile.participationStatus} />
              </div>
            </div>
            <p className="text-xs text-purple-900/70 leading-relaxed">
              This record is preserved in its authentic research state. No dating intentions, romantic compatibility, sexuality, or personality traits have been assumed or synthesized.
            </p>
          </div>

          {/* Sourced External Channels */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900/70 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-pink-500" />
              <span>Sourced Identity Channels & Link Verification Stages</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* LinkedIn Box */}
              <div className="bg-white border border-pink-100 rounded-2xl p-3.5 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <LinkedinIcon className="w-3.5 h-3.5 text-sky-500" />
                    <span>LinkedIn Profile</span>
                  </span>
                  <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                    {profile.verification?.linkedin?.stage || 'Sourced'}
                  </span>
                </div>
                {profile.linkedinUrl ? (
                  <div>
                    <SafeExternalLink
                      url={profile.linkedinUrl}
                      label={profile.linkedinUrl}
                      isVerified={true}
                      type="linkedin"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-purple-900/40">Not provided</span>
                )}
              </div>

              {/* Instagram Box */}
              <div className="bg-white border border-pink-100 rounded-2xl p-3.5 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram Record</span>
                  </span>
                  {profile.dataStatus === 'invalid_format_warning' ? (
                    <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Format Warning
                    </span>
                  ) : profile.dataStatus === 'user_supplied' ? (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      User Supplied
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      {profile.verification?.instagram?.stage || 'Constructed'}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-purple-900">
                    Handle: <span className="font-bold">@{profile.instagramHandle || 'Not provided'}</span>
                  </div>
                  <div>
                    {profile.instagramUrl ? (
                      <SafeExternalLink
                        url={profile.instagramUrl}
                        label={profile.instagramUrl}
                        isVerified={profile.dataStatus === 'user_supplied' || profile.dataStatus === 'verified'}
                        type="instagram"
                      />
                    ) : (
                      <span className="text-[11px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 inline-flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        <span>URL withheld (Invalid handle syntax &apos;{profile.instagramHandle}&apos;)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Source Origin & Notes */}
            <div className="bg-pink-50/20 border border-pink-100 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900/70">Source Reference:</span>
                <span className="font-mono-code text-[11px] text-purple-900/50">{profile.sourceUrl || 'Direct Observation'}</span>
              </div>
              {profile.sourceUrl && (
                <div className="flex items-center gap-1.5 text-purple-900/70">
                  <Globe className="w-3.5 h-3.5 text-pink-500" />
                  <span className="truncate max-w-sm">{profile.sourceUrl}</span>
                </div>
              )}
              {profile.notes && (
                <p className="text-purple-900/70 pt-1 border-t border-pink-100">
                  <strong>Notes:</strong> {profile.notes}
                </p>
              )}
            </div>
          </div>

          {/* Verification Actions */}
          <div className="pt-2 border-t border-pink-100 space-y-2">
            <span className="text-xs font-bold text-purple-900/70 block">
              Identity Verification Status
            </span>
            <div className="flex items-center justify-between bg-pink-50/30 p-3 rounded-2xl border border-pink-100">
              <span className="text-xs text-purple-900 font-medium">
                Identity Correspondence Confirmed:
              </span>
              <button
                type="button"
                onClick={handleToggleIdentity}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  profile.verification?.identityCorrespondenceConfirmed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-purple-900/60 border-pink-200 hover:bg-pink-50'
                }`}
              >
                {profile.verification?.identityCorrespondenceConfirmed ? 'Confirmed ✔' : 'Confirm Identity'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-pink-100 bg-pink-50/40 flex items-center justify-between text-xs text-purple-900/60">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-pink-500" />
            Ingested: {new Date(profile.createdAt).toLocaleDateString()}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold transition-all shadow-sm shadow-pink-500/20 cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
