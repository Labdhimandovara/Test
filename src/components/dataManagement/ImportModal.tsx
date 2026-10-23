import React, { useState, useRef } from 'react';
import type { ImportBatchResult, ImportRowPreview } from '../../types/profile';
import { importService } from '../../services/importService';
import { profileRepo } from '../../services/profileRepository';
import { getSampleCsvTemplate, getSampleJsonTemplate } from '../../utils/csvParser';
import cohortResearchBatch from '../../data/cohortResearchBatch.json';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Sparkles,
  Info
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<ImportBatchResult | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'all' | 'valid' | 'duplicate' | 'conflict' | 'invalid'>('valid');
  const [showApifyGuide, setShowApifyGuide] = useState(false);
  const [importSummary, setImportSummary] = useState<{ added: number; duplicates: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setBatchResult(null);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processContent(text, file.name.endsWith('.json') ? 'json' : 'csv');
    };
    reader.onerror = () => {
      setParseError('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  const processContent = (text: string, hint?: 'csv' | 'json') => {
    const parseResult = importService.parseRawInput(text, hint);
    if (parseResult.error || parseResult.records.length === 0) {
      setParseError(parseResult.error || 'No records detected in file.');
      setBatchResult(null);
      return;
    }

    const currentProfiles = profileRepo.getAll();
    const result = importService.analyzeBatch(parseResult.records, currentProfiles);
    setBatchResult(result);
    setParseError(null);
  };

  const handleLoadCohortBatch = () => {
    setFileName('cohort_research_batch.json');
    setParseError(null);
    setBatchResult(null);
    setImportSummary(null);
    processContent(JSON.stringify(cohortResearchBatch, null, 2), 'json');
  };

  const handleConfirmImport = () => {
    if (!batchResult || batchResult.validRows.length === 0) return;

    const newProfiles = importService.convertPreviewsToProfiles(batchResult.validRows);
    const summary = profileRepo.bulkAddProfiles(newProfiles);

    setImportSummary({
      added: summary.addedCount,
      duplicates: summary.duplicateCount + batchResult.duplicateRows.length,
    });
    onImportComplete();
  };

  const handleDownloadTemplateCsv = () => {
    const csv = getSampleCsvTemplate();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'the_test_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplateJson = () => {
    const json = getSampleJsonTemplate();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'the_test_import_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetState = () => {
    setFileName('');
    setParseError(null);
    setBatchResult(null);
    setImportSummary(null);
  };

  const displayedRows: ImportRowPreview[] = (() => {
    if (!batchResult) return [];
    switch (activePreviewTab) {
      case 'valid':
        return batchResult.validRows;
      case 'duplicate':
        return batchResult.duplicateRows;
      case 'conflict':
        return batchResult.conflictRows;
      case 'invalid':
        return batchResult.invalidRows;
      case 'all':
      default:
        return [
          ...batchResult.validRows,
          ...batchResult.duplicateRows,
          ...batchResult.conflictRows,
          ...batchResult.invalidRows,
        ];
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#121418] border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-[#121418]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-white">
                Bulk Research Import (CSV & JSON)
              </h2>
              <p className="text-xs text-neutral-400">
                Idempotent ingestion pipeline for research candidate datasets.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs font-sans">
          {/* Post-Import Success Summary */}
          {importSummary ? (
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center text-emerald-300 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-white">
                Import Batch Completed Successfully
              </h3>
              <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                Added <strong className="text-emerald-400 font-mono-code">{importSummary.added}</strong> new candidates with safe default statuses (<code className="text-amber-300 font-mono-code">not_invited</code>, null dating preferences). <span className="font-mono-code">{importSummary.duplicates}</span> duplicate rows were safely skipped.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    resetState();
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors font-mono-code"
                >
                  Close & View Ledger
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top Controls: Upload & Template Downloads */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Upload Box */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="md:col-span-2 border-2 border-dashed border-neutral-800 hover:border-amber-500/60 rounded-xl p-5 text-center cursor-pointer transition-colors bg-neutral-950/40 flex flex-col items-center justify-center space-y-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-amber-400" />
                  <div>
                    <span className="text-white font-medium">Click to upload CSV or JSON file</span>
                    <span className="text-neutral-400 block text-[11px] mt-0.5">
                      Supports aliases: fullName, linkedinUrl, instagramUsername, sourceUrl
                    </span>
                  </div>
                  {fileName && (
                    <span className="text-[11px] font-mono-code text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                      Loaded: {fileName}
                    </span>
                  )}
                </div>

                {/* Templates & Guidance */}
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-mono-code uppercase text-neutral-400 block mb-1">
                      Templates & Schema
                    </span>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Download pre-formatted templates or view the Apify actor export schema mapping.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleLoadCohortBatch}
                      className="w-full py-2 px-3 rounded-lg bg-pink-50 hover:bg-pink-100 border border-pink-300 text-pink-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                      <span>Load Peer Cohort Batch (10 Verified Profiles)</span>
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={handleDownloadTemplateCsv}
                        className="flex-1 py-1.5 px-2 rounded bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-mono-code flex items-center justify-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3 text-amber-400" />
                        <span>CSV Template</span>
                      </button>
                      <button
                        onClick={handleDownloadTemplateJson}
                        className="flex-1 py-1.5 px-2 rounded bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-mono-code flex items-center justify-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3 text-amber-400" />
                        <span>JSON Template</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setShowApifyGuide(!showApifyGuide)}
                      className="w-full py-1.5 px-2 rounded bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-[11px] font-mono-code flex items-center justify-center gap-1 transition-colors"
                    >
                      <Info className="w-3 h-3 text-violet-400" />
                      <span>{showApifyGuide ? 'Hide Apify Guide' : 'Apify Schema Guide'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Apify Guide */}
              {showApifyGuide && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-violet-400 font-semibold font-mono-code">
                    <Info className="w-4 h-4" />
                    <span>Apify Actor Dataset Import Mapping</span>
                  </div>
                  <p className="text-neutral-400 leading-relaxed">
                    Datasets exported from lawful public Apify Actors (e.g. Instagram Scraper or LinkedIn Search) can be imported directly without requiring an API key. Supported column mappings:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono-code text-[11px]">
                    <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                      <span className="text-neutral-400 block">Apify Field:</span>
                      <span className="text-white">fullName / name</span>
                      <span className="text-amber-400 block mt-1">→ Person Name</span>
                    </div>
                    <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                      <span className="text-neutral-400 block">Apify Field:</span>
                      <span className="text-white">username / handle</span>
                      <span className="text-amber-400 block mt-1">→ IG Handle</span>
                    </div>
                    <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                      <span className="text-neutral-400 block">Apify Field:</span>
                      <span className="text-white">profileUrl / url</span>
                      <span className="text-amber-400 block mt-1">→ Social URL</span>
                    </div>
                    <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                      <span className="text-neutral-400 block">Apify Field:</span>
                      <span className="text-white">inputUrl / source</span>
                      <span className="text-amber-400 block mt-1">→ Source URL</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Callout */}
              {parseError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Batch Analysis Preview */}
              {batchResult && (
                <div className="space-y-3">
                  {/* Summary Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950/60 border border-neutral-800 p-3 rounded-xl">
                    <div className="flex items-center gap-2 font-mono-code text-xs">
                      <FileText className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-300 font-medium">Batch Analysis:</span>
                      <span className="text-white font-bold">{batchResult.totalRows} Total Rows</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 font-mono-code text-[11px]">
                      <button
                        onClick={() => setActivePreviewTab('valid')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          activePreviewTab === 'valid'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                        }`}
                      >
                        Ready ({batchResult.validRows.length})
                      </button>
                      <button
                        onClick={() => setActivePreviewTab('duplicate')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          activePreviewTab === 'duplicate'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-600/60'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                        }`}
                      >
                        Duplicates ({batchResult.duplicateRows.length})
                      </button>
                      <button
                        onClick={() => setActivePreviewTab('conflict')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          activePreviewTab === 'conflict'
                            ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-600/60'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                        }`}
                      >
                        Name Conflicts ({batchResult.conflictRows.length})
                      </button>
                      <button
                        onClick={() => setActivePreviewTab('invalid')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          activePreviewTab === 'invalid'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-600/60'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                        }`}
                      >
                        Invalid Syntax ({batchResult.invalidRows.length})
                      </button>
                    </div>
                  </div>

                  {/* Preview Rows Table */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-[11px] font-mono-code border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400">
                          <th className="p-2.5">Row</th>
                          <th className="p-2.5">Candidate Name</th>
                          <th className="p-2.5">LinkedIn</th>
                          <th className="p-2.5">Instagram</th>
                          <th className="p-2.5">Classification & Diagnostics</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                        {displayedRows.length > 0 ? (
                          displayedRows.map((row) => (
                            <tr key={row.rowIndex} className="hover:bg-neutral-900/30">
                              <td className="p-2.5 text-neutral-400 font-medium">#{row.rowIndex}</td>
                              <td className="p-2.5 font-sans font-semibold text-white">
                                {row.mappedName}
                              </td>
                              <td className="p-2.5 truncate max-w-[150px]">
                                {row.mappedLinkedinUrl || <span className="text-neutral-400">None</span>}
                              </td>
                              <td className="p-2.5 truncate max-w-[150px]">
                                {row.mappedInstagramHandle ? `@${row.mappedInstagramHandle}` : <span className="text-neutral-400">None</span>}
                              </td>
                              <td className="p-2.5">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                                  row.status === 'valid'
                                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                                    : row.status === 'duplicate'
                                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                                    : row.status === 'conflict_requires_review'
                                    ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/40'
                                    : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                                }`}>
                                  {row.statusReason}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-neutral-400">
                              No records found for category &ldquo;{activePreviewTab}&rdquo;.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-[#0f1115] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              resetState();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-mono-code transition-colors"
          >
            Cancel
          </button>

          {!importSummary && batchResult && (
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={batchResult.validRows.length === 0}
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs font-mono-code transition-colors flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Import {batchResult.validRows.length} Valid Candidates</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
