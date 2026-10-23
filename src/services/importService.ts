import type { 
  Profile, 
  DataStatus, 
  ImportRowPreview, 
  ImportBatchResult 
} from '../types/profile';
import { parseCsv } from '../utils/csvParser';

export class ImportService {
  /**
   * Parse either raw CSV string or JSON string into structured raw records.
   */
  public parseRawInput(content: string, formatHint?: 'csv' | 'json'): { records: Record<string, string>[]; error?: string } {
    const trimmed = content.trim();
    if (!trimmed) {
      return { records: [], error: 'Input file is empty' };
    }

    // Try parsing as JSON first if starting with [ or {
    if (formatHint === 'json' || trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        const array = Array.isArray(parsed) ? parsed : [parsed];
        const records = array.map(item => {
          const record: Record<string, string> = {};
          if (typeof item === 'object' && item !== null) {
            Object.entries(item).forEach(([k, v]) => {
              record[k] = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
            });
          }
          return record;
        });
        return { records };
      } catch (jsonErr) {
        if (formatHint === 'json') {
          return { records: [], error: `Invalid JSON format: ${(jsonErr as Error).message}` };
        }
      }
    }

    // Fall back to CSV parsing
    try {
      const records = parseCsv(trimmed);
      return { records };
    } catch (csvErr) {
      return { records: [], error: `Failed to parse CSV: ${(csvErr as Error).message}` };
    }
  }

  /**
   * Analyze raw records against existing repository profiles and generate preview with conflict detection.
   */
  public analyzeBatch(
    rawRecords: Record<string, string>[],
    existingProfiles: Profile[]
  ): ImportBatchResult {
    const validRows: ImportRowPreview[] = [];
    const duplicateRows: ImportRowPreview[] = [];
    const conflictRows: ImportRowPreview[] = [];
    const invalidRows: ImportRowPreview[] = [];

    // Tracks seen in-batch for deduplicating within the file itself
    const batchSeenLinkedin = new Set<string>();
    const batchSeenInstagram = new Set<string>();
    const batchSeenNames = new Set<string>();

    rawRecords.forEach((raw, idx) => {
      const mapped = this.mapAliases(raw);

      // Validation 1: Name must exist
      if (!mapped.name || mapped.name.trim().length === 0) {
        invalidRows.push({
          rowIndex: idx + 1,
          rawInput: raw,
          mappedName: '[Missing Name]',
          mappedLinkedinUrl: mapped.linkedinUrl,
          mappedInstagramHandle: mapped.instagramHandle,
          mappedInstagramUrl: mapped.instagramUrl,
          mappedSourceUrl: mapped.sourceUrl,
          mappedNotes: mapped.notes,
          status: 'invalid_syntax',
          statusReason: 'Full Name is required and missing from row.',
          dataStatus: 'link_unverified',
        });
        return;
      }

      const trimmedName = mapped.name.trim();
      const normLinkedin = mapped.linkedinUrl ? this.normalizeUrl(mapped.linkedinUrl) : null;
      const rawHandle = mapped.instagramHandle ? mapped.instagramHandle.trim().replace(/^@/, '') : null;
      const normHandle = rawHandle ? rawHandle.toLowerCase() : null;

      // Validation 2: URL syntax validation
      if (mapped.linkedinUrl && !this.isValidUrl(mapped.linkedinUrl)) {
        invalidRows.push({
          rowIndex: idx + 1,
          rawInput: raw,
          mappedName: trimmedName,
          mappedLinkedinUrl: mapped.linkedinUrl,
          mappedInstagramHandle: rawHandle,
          mappedInstagramUrl: mapped.instagramUrl,
          mappedSourceUrl: mapped.sourceUrl,
          mappedNotes: mapped.notes,
          status: 'invalid_syntax',
          statusReason: `Malformed LinkedIn URL syntax: "${mapped.linkedinUrl}".`,
          dataStatus: 'invalid_format_warning',
        });
        return;
      }

      // Validation 3: Instagram Handle syntax and URL construction
      let dataStatus: DataStatus = 'link_unverified';
      let resolvedInstagramUrl: string | null = null;
      const hasWildcardOrInvalidChars = rawHandle ? /[^a-zA-Z0-9._]/.test(rawHandle) : false;

      if (rawHandle) {
        if (hasWildcardOrInvalidChars) {
          dataStatus = 'invalid_format_warning';
          resolvedInstagramUrl = null; // Constraint: Never construct a URL containing invalid characters
        } else if (mapped.instagramUrl && mapped.instagramUrl.trim()) {
          if (this.isValidUrl(mapped.instagramUrl)) {
            resolvedInstagramUrl = mapped.instagramUrl.trim();
            dataStatus = 'user_supplied';
          } else {
            invalidRows.push({
              rowIndex: idx + 1,
              rawInput: raw,
              mappedName: trimmedName,
              mappedLinkedinUrl: mapped.linkedinUrl,
              mappedInstagramHandle: rawHandle,
              mappedInstagramUrl: mapped.instagramUrl,
              mappedSourceUrl: mapped.sourceUrl,
              mappedNotes: mapped.notes,
              status: 'invalid_syntax',
              statusReason: `Malformed Instagram URL: "${mapped.instagramUrl}".`,
              dataStatus: 'invalid_format_warning',
            });
            return;
          }
        } else {
          resolvedInstagramUrl = `https://www.instagram.com/${rawHandle}/`;
          dataStatus = 'link_unverified';
        }
      }

      // Check Deduplication 1: Normalized LinkedIn URL
      if (normLinkedin) {
        const existingLinkedin = existingProfiles.find(
          p => p.linkedinUrl && this.normalizeUrl(p.linkedinUrl) === normLinkedin
        );
        if (existingLinkedin || batchSeenLinkedin.has(normLinkedin)) {
          duplicateRows.push({
            rowIndex: idx + 1,
            rawInput: raw,
            mappedName: trimmedName,
            mappedLinkedinUrl: mapped.linkedinUrl,
            mappedInstagramHandle: rawHandle,
            mappedInstagramUrl: resolvedInstagramUrl,
            mappedSourceUrl: mapped.sourceUrl,
            mappedNotes: mapped.notes,
            status: 'duplicate',
            statusReason: `Duplicate LinkedIn profile matches existing record (${existingLinkedin?.name || 'earlier row in import'}).`,
            dataStatus,
            existingMatchProfileId: existingLinkedin?.id,
          });
          return;
        }
      }

      // Check Deduplication 2: Exact Normalized Instagram Handle
      if (normHandle && !hasWildcardOrInvalidChars) {
        const existingInstagram = existingProfiles.find(
          p => p.instagramHandle && p.instagramHandle.toLowerCase() === normHandle
        );
        if (existingInstagram || batchSeenInstagram.has(normHandle)) {
          duplicateRows.push({
            rowIndex: idx + 1,
            rawInput: raw,
            mappedName: trimmedName,
            mappedLinkedinUrl: mapped.linkedinUrl,
            mappedInstagramHandle: rawHandle,
            mappedInstagramUrl: resolvedInstagramUrl,
            mappedSourceUrl: mapped.sourceUrl,
            mappedNotes: mapped.notes,
            status: 'duplicate',
            statusReason: `Duplicate Instagram handle matches existing record (${existingInstagram?.name || 'earlier row in import'}).`,
            dataStatus,
            existingMatchProfileId: existingInstagram?.id,
          });
          return;
        }
      }

      // Check Deduplication 3: Name-only Collision (Requires Manual Review)
      // "Do not merge different people solely because their names are similar"
      const existingName = existingProfiles.find(
        p => p.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (existingName || batchSeenNames.has(trimmedName.toLowerCase())) {
        conflictRows.push({
          rowIndex: idx + 1,
          rawInput: raw,
          mappedName: trimmedName,
          mappedLinkedinUrl: mapped.linkedinUrl,
          mappedInstagramHandle: rawHandle,
          mappedInstagramUrl: resolvedInstagramUrl,
          mappedSourceUrl: mapped.sourceUrl,
          mappedNotes: mapped.notes,
          status: 'conflict_requires_review',
          statusReason: `Name "${trimmedName}" matches existing record (${existingName?.id || 'batch'}), but social profiles differ. Preserved for operator review.`,
          dataStatus,
          existingMatchProfileId: existingName?.id,
        });
        return;
      }

      // Record valid row
      if (normLinkedin) batchSeenLinkedin.add(normLinkedin);
      if (normHandle) batchSeenInstagram.add(normHandle);
      batchSeenNames.add(trimmedName.toLowerCase());

      const statusReason = hasWildcardOrInvalidChars
        ? 'Valid candidate; Instagram handle has wildcard/invalid characters (URL withheld).'
        : 'Valid record ready for import.';

      validRows.push({
        rowIndex: idx + 1,
        rawInput: raw,
        mappedName: trimmedName,
        mappedLinkedinUrl: mapped.linkedinUrl ? mapped.linkedinUrl.trim() : null,
        mappedInstagramHandle: rawHandle,
        mappedInstagramUrl: resolvedInstagramUrl,
        mappedSourceUrl: mapped.sourceUrl ? mapped.sourceUrl.trim() : null,
        mappedNotes: mapped.notes ? mapped.notes.trim() : null,
        status: 'valid',
        statusReason,
        dataStatus,
      });
    });

    return {
      totalRows: rawRecords.length,
      validRows,
      duplicateRows,
      conflictRows,
      invalidRows,
    };
  }

  /**
   * Converts verified ImportRowPreview rows into permanent Profile records with safe defaults.
   */
  public convertPreviewsToProfiles(previews: ImportRowPreview[]): Profile[] {
    const timestamp = new Date().toISOString();

    return previews.map(row => {
      return {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: row.mappedName,
        linkedinUrl: row.mappedLinkedinUrl,
        instagramHandle: row.mappedInstagramHandle,
        instagramUrl: row.mappedInstagramUrl,
        sourceUrl: row.mappedSourceUrl,
        dataStatus: row.dataStatus,
        participationStatus: 'not_invited', // Safe default: 100% not invited
        approvedPreferences: null,           // Safe default: No preferences
        approvedInterests: null,             // Safe default: No interests
        createdAt: timestamp,
        notes: row.mappedNotes || 'Imported via research pipeline batch.',
        verification: {
          identityCorrespondenceConfirmed: false,
          linkedin: row.mappedLinkedinUrl ? {
            stage: 'researcher_supplied',
            checkedAt: timestamp,
            verifiedBy: 'manual_researcher',
          } : undefined,
          instagram: row.mappedInstagramHandle ? {
            stage: row.dataStatus === 'invalid_format_warning' ? 'conflicting_or_invalid' : 'syntax_valid',
            checkedAt: timestamp,
            verifiedBy: 'syntax_validator',
          } : undefined,
        },
      };
    });
  }

  /**
   * Robust alias mapper supporting:
   * - Standard format (name, linkedinUrl, instagramHandle, instagramUrl, sourceUrl)
   * - Column aliases (fullName, full_name, linkedin, instagramUsername, ig_handle, username, etc.)
   * - Apify actor schemas (e.g. Apify Instagram actor: username, fullName, url, etc.)
   */
  private mapAliases(raw: Record<string, string>): {
    name: string | null;
    linkedinUrl: string | null;
    instagramHandle: string | null;
    instagramUrl: string | null;
    sourceUrl: string | null;
    notes: string | null;
  } {
    const lowerKeys: Record<string, string> = {};
    Object.keys(raw).forEach(k => {
      lowerKeys[k.toLowerCase().replace(/[\s_-]+/g, '')] = raw[k];
    });

    const getFirstValue = (candidates: string[]): string | null => {
      for (const c of candidates) {
        const normalized = c.toLowerCase().replace(/[\s_-]+/g, '');
        if (lowerKeys[normalized] && lowerKeys[normalized].trim().length > 0) {
          return lowerKeys[normalized].trim();
        }
      }
      return null;
    };

    const name = getFirstValue([
      'name',
      'fullname',
      'full_name',
      'nametext',
      'title',
      'personname',
      'displayname',
    ]);

    const linkedinUrl = getFirstValue([
      'linkedinurl',
      'linkedin',
      'linkedin_url',
      'profileurl',
      'linkedinprofileurl',
      'linkedinlink',
      'linkedinaddress',
    ]);

    const instagramHandle = getFirstValue([
      'instagramhandle',
      'instagramusername',
      'instagram_handle',
      'handle',
      'username',
      'ighandle',
      'ig_handle',
      'instagramuser',
      'instagram_user',
    ]);

    const instagramUrl = getFirstValue([
      'instagramurl',
      'instagram_url',
      'igurl',
      'ig_url',
      'instagramprofileurl',
      'instagramlink',
    ]);

    const sourceUrl = getFirstValue([
      'sourceurl',
      'source_url',
      'source',
      'originurl',
      'inputurl',
      'provenanceurl',
      'dataseturl',
    ]);

    const notes = getFirstValue([
      'notes',
      'notes_text',
      'description',
      'bio',
      'biography',
      'headline',
      'comment',
      'comments',
    ]);

    return {
      name,
      linkedinUrl,
      instagramHandle,
      instagramUrl,
      sourceUrl,
      notes,
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private normalizeUrl(url: string): string {
    return url.trim().toLowerCase().replace(/\/+$/, '');
  }
}

export const importService = new ImportService();
