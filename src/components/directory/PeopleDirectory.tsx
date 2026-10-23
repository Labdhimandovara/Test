import React, { useState, useMemo } from 'react';
import type { Profile, ParticipationStatus } from '../../types/profile';
import { ProfileCard } from './ProfileCard';
import { Search, Plus, CheckCircle2, X } from 'lucide-react';
import cohortResearchBatch from '../../data/cohortResearchBatch.json';
import { importService } from '../../services/importService';
import { profileRepo } from '../../services/profileRepository';

interface PeopleDirectoryProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
  onRefresh?: () => void;
  onNavigateToOnboarding?: () => void;
}

export const PeopleDirectory: React.FC<PeopleDirectoryProps> = ({
  profiles,
  onSelectProfile,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [participationFilter, setParticipationFilter] = useState<ParticipationStatus | 'all'>('all');
  const [cohortImportMsg, setCohortImportMsg] = useState<string | null>(null);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      // Participation status filter
      if (participationFilter !== 'all' && p.participationStatus !== participationFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchHandle = p.instagramHandle ? p.instagramHandle.toLowerCase().includes(q) : false;
        const matchLinkedin = p.linkedinUrl ? p.linkedinUrl.toLowerCase().includes(q) : false;
        return matchName || matchHandle || matchLinkedin;
      }
      return true;
    });
  }, [profiles, searchQuery, participationFilter]);

  const handleQuickImportCohort = () => {
    const analysis = importService.analyzeBatch(cohortResearchBatch, profileRepo.getAll());
    if (analysis.validRows.length > 0) {
      const newProfiles = importService.convertPreviewsToProfiles(analysis.validRows);
      const res = profileRepo.bulkAddProfiles(newProfiles);
      setCohortImportMsg(`Added ${res.addedCount} new peer records! Total records now: ${profileRepo.getAll().length}. 💜`);
      if (onRefresh) onRefresh();
    } else {
      setCohortImportMsg(`All cohort profiles are already imported (${analysis.duplicateRows.length} duplicates detected). ✨`);
    }
    setTimeout(() => setCohortImportMsg(null), 5000);
  };

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      {/* Directory Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
              Directory
            </span>
            <span className="text-xs text-purple-900/50 font-medium">
              Showing {filteredProfiles.length} of {profiles.length}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e1b2e] tracking-tight">
            People Directory
          </h1>
          <p className="text-xs sm:text-sm text-purple-900/70 mt-1">
            {profiles.length} real people from our research. Only opted-in people can have agents. 💜
          </p>
        </div>

        {/* Action Button: Import Cohort */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickImportCohort}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Import Cohort (+10)</span>
          </button>
        </div>
      </div>

      {/* Cohort Import Notification Banner */}
      {cohortImportMsg && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between text-purple-800 text-xs sm:text-sm font-medium shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span>{cohortImportMsg}</span>
          </div>
          <button 
            onClick={() => setCohortImportMsg(null)}
            className="text-purple-600 hover:text-purple-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-pink-100 shadow-[0_2px_15px_rgba(244,114,182,0.05)] flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, Instagram or LinkedIn..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-pink-50/40 border border-pink-100 text-xs sm:text-sm text-[#1e1b2e] placeholder-purple-900/40 focus:outline-none focus:border-pink-300 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={participationFilter}
            onChange={(e) => setParticipationFilter(e.target.value as any)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-pink-50/40 border border-pink-100 text-xs sm:text-sm text-purple-900 font-semibold focus:outline-none focus:border-pink-300 cursor-pointer"
          >
            <option value="all">All People ({profiles.length})</option>
            <option value="enrolled">Opted In Only</option>
            <option value="not_invited">Not Invited / Research</option>
          </select>
        </div>
      </div>

      {/* Profile Cards Grid */}
      {filteredProfiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onSelect={onSelectProfile}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-pink-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1e1b2e]">No matching profiles found</h3>
          <p className="text-xs text-purple-900/60 max-w-sm mx-auto">
            Try adjusting your search query or clear filters to see all {profiles.length} profiles.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setParticipationFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-pink-50 text-pink-600 font-bold text-xs hover:bg-pink-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
