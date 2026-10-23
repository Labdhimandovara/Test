import React, { useState } from 'react';
import type { NewProfileInput } from '../../types/profile';
import { profileRepo } from '../../services/profileRepository';
import { X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileAdded: () => void;
}

export const AddProfileModal: React.FC<AddProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileAdded,
}) => {
  const [name, setName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const input: NewProfileInput = {
      name,
      linkedinUrl: linkedinUrl.trim() || undefined,
      instagramHandle: instagramHandle.trim() || undefined,
      instagramUrl: instagramUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const result = profileRepo.addProfile(input);

    if (!result.success) {
      setError(result.error || 'Failed to add profile.');
      return;
    }

    setSuccessMsg(`Successfully added "${result.profile?.name}" to the research ledger.`);
    setTimeout(() => {
      setName('');
      setLinkedinUrl('');
      setInstagramHandle('');
      setInstagramUrl('');
      setNotes('');
      setError(null);
      setSuccessMsg(null);
      onProfileAdded();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-[#121418] border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h2 className="font-editorial text-xl font-bold text-white">
              Add Preliminary Candidate
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Ingest a new preliminary record. Sourced identities default to <code className="text-amber-300 font-mono-code">not_invited</code> with null dating preferences. Automatic deduplication and handle format validation will be enforced.
        </p>

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
          <div className="space-y-1">
            <label className="text-neutral-300 block">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Patel"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-neutral-300 block">LinkedIn Profile URL</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/username/"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-neutral-300 block">Instagram Handle</label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="e.g. mayapatel (no @)"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-sans"
              />
              <span className="text-[10px] text-neutral-400 block">
                Invalid chars (*, etc.) withhold URL automatically.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 block">Explicit Instagram URL</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="Optional (if provided directly)"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-sans"
              />
              <span className="text-[10px] text-neutral-400 block">
                If omitted, constructed link is unverified.
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-neutral-300 block">Ingestion Source Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sourced from research batch 2"
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
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
