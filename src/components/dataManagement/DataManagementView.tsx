import React, { useState } from 'react';
import type { Profile, DataStatus, ParticipationStatus } from '../../types/profile';
import { StatusBadge } from '../common/StatusBadge';
import { SafeExternalLink } from '../common/SafeExternalLink';
import { AddProfileModal } from './AddProfileModal';
import { EditProfileModal } from './EditProfileModal';
import { ImportModal } from './ImportModal';
import { exportToCsv } from '../../utils/csvParser';
import { 
  Database, 
  UserPlus, 
  UploadCloud,
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Search, 
  FileJson,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  Edit,
  ExternalLink,
  Filter
} from 'lucide-react';

interface DataManagementViewProps {
  profiles: Profile[];
  onReload: () => void;
  onResetToSeed: () => void;
  onSelectProfile: (profile: Profile) => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  profiles,
  onReload,
  onResetToSeed,
  onSelectProfile,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const [copiedJson, setCopiedJson] = useState(false);
  const [showJsonView, setShowJsonView] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [dataStatusFilter, setDataStatusFilter] = useState<DataStatus | 'all'>('all');
  const [participationFilter, setParticipationFilter] = useState<ParticipationStatus | 'all'>('all');

  // Metrics derived from runtime dataset
  const totalRecords = profiles.length;
  const bothUrlsCount = profiles.filter(p => p.linkedinUrl && (p.instagramUrl || p.instagramHandle)).length;
  const unverifiedLinksCount = profiles.filter(p => p.dataStatus === 'link_unverified').length;
  const invalidHandlesCount = profiles.filter(p => p.dataStatus === 'invalid_format_warning').length;
  const identityConfirmedCount = profiles.filter(p => p.verification?.identityCorrespondenceConfirmed).length;

  const filtered = profiles.filter(p => {
    if (dataStatusFilter !== 'all' && p.dataStatus !== dataStatusFilter) return false;
    if (participationFilter !== 'all' && p.participationStatus !== participationFilter) return false;

    if (searchFilter.trim().length > 0) {
      const q = searchFilter.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchHandle = p.instagramHandle ? p.instagramHandle.toLowerCase().includes(q) : false;
      const matchLinkedin = p.linkedinUrl ? p.linkedinUrl.toLowerCase().includes(q) : false;
      const matchSource = p.sourceUrl ? p.sourceUrl.toLowerCase().includes(q) : false;
      const matchId = p.id.toLowerCase().includes(q);
      const matchNotes = p.notes ? p.notes.toLowerCase().includes(q) : false;
      return matchName || matchHandle || matchLinkedin || matchSource || matchId || matchNotes;
    }
    return true;
  });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(profiles, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(profiles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the_test_profiles_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csvContent = exportToCsv(profiles);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the_test_profiles_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
              Data & Import
            </span>
            <span className="text-pink-300">•</span>
            <span className="text-xs text-purple-900/50 font-medium">
              {profiles.length} Active Records
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#1e1b2e] tracking-tight">
            Data Ledger & Import
          </h2>
          <p className="text-xs sm:text-sm text-purple-900/60 mt-0.5">
            Idempotent CSV/JSON imports, export tools, and schema governance.
          </p>
        </div>

        {/* Global Dataset Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-white font-bold text-xs shadow-sm shadow-pink-500/20 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import CSV / JSON</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-200 hover:bg-pink-50 text-purple-900 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-pink-500" />
            <span>Add Candidate</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-200 text-purple-900 hover:bg-pink-50 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            title="Export full ledger as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowJsonView(!showJsonView)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-200 text-purple-900 hover:bg-pink-50 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-purple-600" />
            <span>{showJsonView ? 'Hide JSON' : 'Inspect JSON'}</span>
          </button>

          <button
            onClick={onResetToSeed}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-200 text-rose-500 hover:bg-rose-50 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            title="Reset dataset back to original 16 seed records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Seed</span>
          </button>
        </div>
      </div>

      {/* Real-time Dataset Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-pink-100 rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-purple-900/60 block">Total Records</span>
          <span className="text-2xl font-bold text-[#1e1b2e]">{totalRecords}</span>
          <span className="text-[10px] text-purple-900/40 block mt-0.5">Sourced pool</span>
        </div>
        <div className="bg-white border border-pink-100 rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-purple-900/60 block">Both Social URLs</span>
          <span className="text-2xl font-bold text-pink-600">{bothUrlsCount}</span>
          <span className="text-[10px] text-purple-900/40 block mt-0.5">LinkedIn + IG</span>
        </div>
        <div className="bg-white border border-pink-100 rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-purple-900/60 block">Unverified Links</span>
          <span className="text-2xl font-bold text-purple-600">{unverifiedLinksCount}</span>
          <span className="text-[10px] text-purple-900/40 block mt-0.5">Constructed from handle</span>
        </div>
        <div className="bg-white border border-pink-100 rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-purple-900/60 block">Format Warnings</span>
          <span className="text-2xl font-bold text-rose-500">{invalidHandlesCount}</span>
          <span className="text-[10px] text-purple-900/40 block mt-0.5">URL withheld</span>
        </div>
        <div className="bg-white border border-pink-100 rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-purple-900/60 block">Identity Confirmed</span>
          <span className="text-2xl font-bold text-emerald-600">{identityConfirmedCount}</span>
          <span className="text-[10px] text-purple-900/40 block mt-0.5">Manual audit complete</span>
        </div>
      </div>

      {/* JSON Viewer Drawer if opened */}
      {showJsonView && (
        <div className="bg-[#121418] border border-neutral-800 rounded-xl p-5 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              <span>Exportable Typed JSON Dataset ({profiles.length} items)</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-xs font-mono-code text-neutral-300 border border-neutral-800 transition-colors"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <button
                onClick={handleDownloadJson}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-xs font-mono-code text-neutral-300 border border-neutral-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          </div>

          <pre className="bg-neutral-950 p-4 rounded-lg text-[11px] font-mono-code text-neutral-300 overflow-x-auto max-h-72 border border-neutral-800/80 leading-relaxed">
            {JSON.stringify(profiles, null, 2)}
          </pre>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-pink-100 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search table by name, LinkedIn, handle, or source URL..."
              className="w-full bg-pink-50/40 border border-pink-100 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#1e1b2e] placeholder-purple-900/40 focus:outline-none focus:border-pink-300 font-sans"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono-code">
            <span className="text-purple-900/60 flex items-center gap-1 flex-shrink-0 text-[11px]">
              <Filter className="w-3 h-3 text-purple-400" />
              <span>Status:</span>
            </span>

            <select
              value={dataStatusFilter}
              onChange={(e) => setDataStatusFilter(e.target.value as DataStatus | 'all')}
              className="bg-pink-50/40 border border-pink-100 rounded-xl p-2 text-purple-900 text-xs font-semibold focus:outline-none focus:border-pink-300"
            >
              <option value="all">All Data Statuses</option>
              <option value="user_supplied">user_supplied</option>
              <option value="link_unverified">link_unverified</option>
              <option value="verified">verified</option>
              <option value="invalid_format_warning">invalid_format_warning</option>
            </select>

            <select
              value={participationFilter}
              onChange={(e) => setParticipationFilter(e.target.value as ParticipationStatus | 'all')}
              className="bg-pink-50/40 border border-pink-100 rounded-xl p-2 text-purple-900 text-xs font-semibold focus:outline-none focus:border-pink-300"
            >
              <option value="all">All Participation</option>
              <option value="not_invited">not_invited</option>
              <option value="enrolled">enrolled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Centralized Table */}
      <div className="bg-white border border-pink-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-pink-100 bg-pink-50/50 text-purple-900/70 font-semibold">
                <th className="p-3">Record ID & Candidate</th>
                <th className="p-3">LinkedIn Link</th>
                <th className="p-3">Instagram Handle & URL</th>
                <th className="p-3">Source Evidence / Origin</th>
                <th className="p-3">Data Status</th>
                <th className="p-3">Identity Audit</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/70 text-purple-950">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-pink-50/30 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-[#1e1b2e] font-sans">{p.name}</div>
                    <div className="text-[10px] text-purple-900/50 font-mono-code">{p.id}</div>
                  </td>

                  <td className="p-3">
                    {p.linkedinUrl ? (
                      <SafeExternalLink
                        url={p.linkedinUrl}
                        label="LinkedIn Link"
                        type="linkedin"
                        isVerified={true}
                      />
                    ) : (
                      <span className="text-purple-900/40">Not provided</span>
                    )}
                  </td>

                  <td className="p-3">
                    {p.instagramHandle ? (
                      <div>
                        <div className="text-purple-900 font-medium">@{p.instagramHandle}</div>
                        {p.instagramUrl ? (
                          <SafeExternalLink
                            url={p.instagramUrl}
                            label="Instagram Link"
                            type="instagram"
                            isVerified={p.dataStatus === 'user_supplied' || p.dataStatus === 'verified'}
                          />
                        ) : (
                          <span className="text-[10px] text-rose-500 bg-rose-50 px-1 rounded border border-rose-200 inline-flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>URL withheld</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-purple-900/40">Not provided</span>
                    )}
                  </td>

                  <td className="p-3 max-w-[160px] truncate">
                    {p.sourceUrl ? (
                      <a
                        href={p.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-900/70 hover:text-pink-600 truncate inline-flex items-center gap-1"
                        title={p.sourceUrl}
                      >
                        <span className="truncate max-w-[120px]">{p.sourceUrl}</span>
                        <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-purple-900/40">Researcher direct</span>
                    )}
                  </td>

                  <td className="p-3">
                    <StatusBadge type="data" status={p.dataStatus} />
                  </td>

                  <td className="p-3">
                    {p.verification?.identityCorrespondenceConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Confirmed
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] text-purple-900/40 bg-pink-50/50 px-2 py-0.5 rounded-full border border-pink-100">
                        Unconfirmed
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setEditingProfile(p)}
                        className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold border border-pink-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Edit candidate record"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onSelectProfile(p)}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddProfileModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProfileAdded={onReload}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={onReload}
      />

      <EditProfileModal
        profile={editingProfile}
        isOpen={editingProfile !== null}
        onClose={() => setEditingProfile(null)}
        onProfileUpdated={onReload}
      />
    </div>
  );
};
