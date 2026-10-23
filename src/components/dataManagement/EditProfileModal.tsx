import React, { useState, useEffect } from 'react';
import type { Profile, DataStatus, LinkVerificationStage } from '../../types/profile';
import { profileRepo } from '../../services/profileRepository';
import { X, Edit3, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface EditProfileModalProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [name, setName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [dataStatus, setDataStatus] = useState<DataStatus>('link_unverified');
  const [notes, setNotes] = useState('');
  const [linkedinStage, setLinkedinStage] = useState<LinkVerificationStage>('unverified');
  const [instagramStage, setInstagramStage] = useState<LinkVerificationStage>('unverified');
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setLinkedinUrl(profile.linkedinUrl || '');
      setInstagramHandle(profile.instagramHandle || '');
      setInstagramUrl(profile.instagramUrl || '');
      setSourceUrl(profile.sourceUrl || '');
      setDataStatus(profile.dataStatus);
      setNotes(profile.notes || '');

      setLinkedinStage(profile.verification?.linkedin?.stage || (profile.linkedinUrl ? 'researcher_supplied' : 'unverified'));
      setInstagramStage(profile.verification?.instagram?.stage || (profile.instagramHandle ? 'unverified' : 'unverified'));
      setIdentityConfirmed(profile.verification?.identityCorrespondenceConfirmed || false);
      setVerificationNotes(profile.verification?.manualReviewNotes || '');

      setError(null);
      setSuccessMsg(null);
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const timestamp = new Date().toISOString();

    const result = profileRepo.updateProfile(profile.id, {
      name,
      linkedinUrl: linkedinUrl.trim() || null,
      instagramHandle: instagramHandle.trim() || null,
      instagramUrl: instagramUrl.trim() || null,
      sourceUrl: sourceUrl.trim() || null,
      dataStatus,
      notes: notes.trim() || undefined,
      verification: {
        identityCorrespondenceConfirmed: identityConfirmed,
        manualReviewNotes: verificationNotes.trim() || undefined,
        lastAuditedAt: timestamp,
        linkedin: linkedinUrl ? {
          stage: linkedinStage,
          checkedAt: timestamp,
          verifiedBy: 'manual_researcher',
        } : undefined,
        instagram: instagramHandle ? {
          stage: instagramStage,
          checkedAt: timestamp,
          verifiedBy: 'manual_researcher',
        } : undefined,
      },
    });

    if (!result.success) {
      setError(result.error || 'Failed to update record');
      return;
    }

    setSuccessMsg('Record updated successfully.');
    setTimeout(() => {
      onProfileUpdated();
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-[#121418] border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-y-auto p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-editorial text-xl font-bold text-white">
                Edit Research Candidate Record
              </h2>
              <span className="text-[11px] font-mono-code text-neutral-400">
                ID: {profile.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono-code">
          {/* Candidate Name */}
          <div className="space-y-1">
            <label className="text-neutral-300 block">Candidate Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          {/* LinkedIn URL & Verification Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-neutral-300 block">LinkedIn Profile URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/username/"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-300 block">Link Stage</label>
              <select
                value={linkedinStage}
                onChange={(e) => setLinkedinStage(e.target.value as LinkVerificationStage)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 font-sans"
              >
                <option value="researcher_supplied">Researcher Supplied</option>
                <option value="syntax_valid">Syntax Valid</option>
                <option value="checked_reachable">Checked Reachable</option>
                <option value="identity_confirmed">Identity Confirmed</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>

          {/* Instagram Handle & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-neutral-300 block">Instagram Handle (no @)</label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="username"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-300 block">Handle Stage</label>
              <select
                value={instagramStage}
                onChange={(e) => setInstagramStage(e.target.value as LinkVerificationStage)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 font-sans"
              >
                <option value="unverified">Unverified</option>
                <option value="syntax_valid">Syntax Valid</option>
                <option value="checked_reachable">Checked Reachable</option>
                <option value="identity_confirmed">Identity Confirmed</option>
                <option value="conflicting_or_invalid">Format Warning</option>
              </select>
            </div>
          </div>

          {/* Explicit Instagram URL & Source URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-neutral-300 block">Explicit Instagram URL</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="Leave blank to auto-construct"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-300 block">Research Source URL</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://research-source/..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>
          </div>

          {/* Overall Data Status */}
          <div className="space-y-1">
            <label className="text-neutral-300 block">Overall Record Data Status</label>
            <select
              value={dataStatus}
              onChange={(e) => setDataStatus(e.target.value as DataStatus)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 font-sans"
            >
              <option value="link_unverified">link_unverified (Constructed handle link)</option>
              <option value="user_supplied">user_supplied (Explicitly provided URL)</option>
              <option value="verified">verified (Manually confirmed identity)</option>
              <option value="invalid_format_warning">invalid_format_warning (URL withheld)</option>
            </select>
          </div>

          {/* Manual Identity Audit Checkbox */}
          <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-lg space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={identityConfirmed}
                onChange={(e) => setIdentityConfirmed(e.target.checked)}
                className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500 bg-neutral-900"
              />
              <span className="text-white font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Identity Correspondence Confirmed by Manual Review</span>
              </span>
            </label>
            <p className="text-[10px] text-neutral-400 leading-relaxed pl-5">
              Confirms that reliable public evidence connects the LinkedIn and Instagram profiles to the same person.
            </p>
          </div>

          {/* Verification Notes */}
          <div className="space-y-1">
            <label className="text-neutral-300 block">Verification & Audit Notes</label>
            <textarea
              rows={2}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="e.g. Manually verified via mutual project reference on public company page."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-sans transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs font-sans transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
