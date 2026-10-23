import { INITIAL_PROFILES } from '../data/seedProfiles';
import type { 
  Profile, 
  NewProfileInput, 
  UpdateProfileInput, 
  DataStatus, 
  ParticipationStatus,
  LinkVerificationDetail 
} from '../types/profile';

const STORAGE_KEY = 'the_test_profiles_v1';

export interface ProfileFilterOptions {
  searchQuery?: string;
  dataStatus?: DataStatus | 'all';
  participationStatus?: ParticipationStatus | 'all';
}

export interface ProfileSummaryCounts {
  total: number;
  bothUrlsCount: number;
  unverifiedLinksCount: number;
  invalidHandlesCount: number;
  userSuppliedCount: number;
  verifiedCount: number;
  enrolledCount: number;
  identityConfirmedCount: number;
}

export class ProfileRepository {
  private profiles: Profile[];

  constructor() {
    this.profiles = this.loadProfiles();
  }

  private loadProfiles(): Profile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Profile[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge to ensure all 16 initial seed profiles are preserved
          const existingIds = new Set(parsed.map(p => p.id));
          const missingInitials = INITIAL_PROFILES.filter(p => !existingIds.has(p.id));
          return [...parsed, ...missingInitials];
        }
      }
    } catch {
      // Fallback if localStorage is unavailable
    }
    return [...INITIAL_PROFILES];
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profiles));
    } catch {
      // Storage quota or disabled in sandbox environment
    }
  }

  public getAll(): Profile[] {
    return [...this.profiles];
  }

  public getById(id: string): Profile | undefined {
    return this.profiles.find(p => p.id === id);
  }

  public query(options: ProfileFilterOptions = {}): Profile[] {
    let result = [...this.profiles];

    if (options.dataStatus && options.dataStatus !== 'all') {
      result = result.filter(p => p.dataStatus === options.dataStatus);
    }

    if (options.participationStatus && options.participationStatus !== 'all') {
      result = result.filter(p => p.participationStatus === options.participationStatus);
    }

    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.instagramHandle && p.instagramHandle.toLowerCase().includes(q)) ||
        (p.linkedinUrl && p.linkedinUrl.toLowerCase().includes(q)) ||
        (p.sourceUrl && p.sourceUrl.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public getCounts(): ProfileSummaryCounts {
    const total = this.profiles.length;
    let bothUrlsCount = 0;
    let unverifiedLinksCount = 0;
    let invalidHandlesCount = 0;
    let userSuppliedCount = 0;
    let verifiedCount = 0;
    let enrolledCount = 0;
    let identityConfirmedCount = 0;

    for (const p of this.profiles) {
      if (p.linkedinUrl && (p.instagramUrl || p.instagramHandle)) {
        bothUrlsCount++;
      }
      if (p.dataStatus === 'link_unverified') {
        unverifiedLinksCount++;
      }
      if (p.dataStatus === 'invalid_format_warning') {
        invalidHandlesCount++;
      }
      if (p.dataStatus === 'user_supplied') {
        userSuppliedCount++;
      }
      if (p.dataStatus === 'verified') {
        verifiedCount++;
      }
      if (p.participationStatus === 'enrolled') {
        enrolledCount++;
      }
      if (p.verification?.identityCorrespondenceConfirmed) {
        identityConfirmedCount++;
      }
    }

    return {
      total,
      bothUrlsCount,
      unverifiedLinksCount,
      invalidHandlesCount,
      userSuppliedCount,
      verifiedCount,
      enrolledCount,
      identityConfirmedCount,
    };
  }

  public addProfile(input: NewProfileInput): { success: boolean; profile?: Profile; error?: string } {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Name is required' };
    }

    const normalizedLinkedin = input.linkedinUrl ? this.normalizeUrl(input.linkedinUrl) : null;
    const normalizedHandle = input.instagramHandle ? input.instagramHandle.trim().toLowerCase().replace(/^@/, '') : null;

    // Deduplication check:
    // 1. Same normalized LinkedIn URL
    // 2. Same normalized Instagram handle
    // 3. Same name (flagged to prevent silent duplication)
    const duplicate = this.profiles.find(p => {
      const sameLinkedin = normalizedLinkedin && p.linkedinUrl && this.normalizeUrl(p.linkedinUrl) === normalizedLinkedin;
      const sameHandle = normalizedHandle && p.instagramHandle && p.instagramHandle.toLowerCase() === normalizedHandle;
      const sameName = p.name.toLowerCase() === trimmedName.toLowerCase();
      return sameLinkedin || sameHandle || sameName;
    });

    if (duplicate) {
      return { 
        success: false, 
        error: `Duplicate profile detected: matches existing record for "${duplicate.name}".` 
      };
    }

    // Handle validation: check for invalid characters
    let dataStatus: DataStatus = 'user_supplied';
    let instagramUrl: string | null = null;

    if (normalizedHandle) {
      const hasInvalidChars = /[^a-zA-Z0-9._]/.test(normalizedHandle);
      if (hasInvalidChars) {
        dataStatus = 'invalid_format_warning';
        instagramUrl = null; // Do not construct URL with potentially invalid characters
      } else if (input.instagramUrl && input.instagramUrl.trim()) {
        instagramUrl = input.instagramUrl.trim();
        dataStatus = 'user_supplied';
      } else {
        instagramUrl = `https://www.instagram.com/${normalizedHandle}/`;
        dataStatus = 'link_unverified';
      }
    }

    const newProfile: Profile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      linkedinUrl: input.linkedinUrl ? input.linkedinUrl.trim() : null,
      instagramHandle: normalizedHandle,
      instagramUrl,
      sourceUrl: input.sourceUrl ? input.sourceUrl.trim() : null,
      dataStatus,
      participationStatus: 'not_invited', // Sourced profiles default to not_invited
      approvedPreferences: null,           // No preferences until human supplies them
      approvedInterests: null,
      createdAt: new Date().toISOString(),
      notes: input.notes ? input.notes.trim() : 'Added via data management interface.',
      verification: input.verification || {
        identityCorrespondenceConfirmed: false,
        linkedin: input.linkedinUrl ? { stage: 'researcher_supplied', checkedAt: new Date().toISOString() } : undefined,
        instagram: normalizedHandle ? { stage: dataStatus === 'invalid_format_warning' ? 'conflicting_or_invalid' : 'syntax_valid', checkedAt: new Date().toISOString() } : undefined,
      },
    };

    this.profiles = [newProfile, ...this.profiles];
    this.persist();

    return { success: true, profile: newProfile };
  }

  public updateProfile(id: string, updates: UpdateProfileInput): { success: boolean; profile?: Profile; error?: string } {
    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx === -1) {
      return { success: false, error: 'Profile not found' };
    }

    const current = this.profiles[idx];

    // Deduplication check for updates: ensure new LinkedIn/Handle doesn't collide with another profile
    if (updates.linkedinUrl) {
      const normUpdatedLinkedin = this.normalizeUrl(updates.linkedinUrl);
      const collision = this.profiles.find(
        p => p.id !== id && p.linkedinUrl && this.normalizeUrl(p.linkedinUrl) === normUpdatedLinkedin
      );
      if (collision) {
        return { success: false, error: `LinkedIn URL already belongs to "${collision.name}".` };
      }
    }

    if (updates.instagramHandle) {
      const normUpdatedHandle = updates.instagramHandle.trim().toLowerCase().replace(/^@/, '');
      const collision = this.profiles.find(
        p => p.id !== id && p.instagramHandle && p.instagramHandle.toLowerCase() === normUpdatedHandle
      );
      if (collision) {
        return { success: false, error: `Instagram handle already belongs to "${collision.name}".` };
      }
    }

    // Determine dataStatus and URL if handle changed
    let resolvedInstagramUrl = updates.instagramUrl !== undefined ? updates.instagramUrl : current.instagramUrl;
    let resolvedDataStatus = updates.dataStatus || current.dataStatus;

    if (updates.instagramHandle !== undefined) {
      const handle = updates.instagramHandle ? updates.instagramHandle.trim().replace(/^@/, '') : null;
      if (handle) {
        const hasInvalidChars = /[^a-zA-Z0-9._]/.test(handle);
        if (hasInvalidChars) {
          resolvedDataStatus = 'invalid_format_warning';
          resolvedInstagramUrl = null;
        } else if (resolvedInstagramUrl && resolvedInstagramUrl.trim()) {
          // Keep explicit URL
        } else {
          resolvedInstagramUrl = `https://www.instagram.com/${handle}/`;
          if (resolvedDataStatus !== 'verified') {
            resolvedDataStatus = 'link_unverified';
          }
        }
      } else {
        resolvedInstagramUrl = null;
      }
    }

    const updatedProfile: Profile = {
      ...current,
      name: updates.name !== undefined ? updates.name.trim() : current.name,
      linkedinUrl: updates.linkedinUrl !== undefined ? updates.linkedinUrl?.trim() || null : current.linkedinUrl,
      instagramHandle: updates.instagramHandle !== undefined ? updates.instagramHandle?.trim().replace(/^@/, '') || null : current.instagramHandle,
      instagramUrl: resolvedInstagramUrl,
      sourceUrl: updates.sourceUrl !== undefined ? updates.sourceUrl?.trim() || null : current.sourceUrl,
      dataStatus: resolvedDataStatus,
      participationStatus: updates.participationStatus || current.participationStatus,
      approvedPreferences: updates.approvedPreferences !== undefined ? updates.approvedPreferences : current.approvedPreferences,
      approvedInterests: updates.approvedInterests !== undefined ? updates.approvedInterests : current.approvedInterests,
      notes: updates.notes !== undefined ? updates.notes?.trim() || undefined : current.notes,
      verification: updates.verification !== undefined ? updates.verification : current.verification,
    };

    this.profiles[idx] = updatedProfile;
    this.persist();

    return { success: true, profile: updatedProfile };
  }

  public updateVerificationDetail(
    id: string,
    channel: 'linkedin' | 'instagram',
    detail: Partial<LinkVerificationDetail>
  ): boolean {
    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx === -1) return false;

    const current = this.profiles[idx];
    const existingVerif = current.verification || { identityCorrespondenceConfirmed: false };
    const currentChannelVerif = existingVerif[channel] || { stage: 'unverified' };

    const updatedChannelVerif: LinkVerificationDetail = {
      ...currentChannelVerif,
      ...detail,
      checkedAt: new Date().toISOString(),
    };

    const newVerification = {
      ...existingVerif,
      [channel]: updatedChannelVerif,
      lastAuditedAt: new Date().toISOString(),
    };

    this.profiles[idx] = {
      ...current,
      verification: newVerification,
    };

    this.persist();
    return true;
  }

  public bulkAddProfiles(newProfiles: Profile[]): { addedCount: number; duplicateCount: number } {
    let addedCount = 0;
    let duplicateCount = 0;

    for (const p of newProfiles) {
      const normLinkedin = p.linkedinUrl ? this.normalizeUrl(p.linkedinUrl) : null;
      const normHandle = p.instagramHandle ? p.instagramHandle.toLowerCase() : null;

      const isDup = this.profiles.some(existing => {
        const sameLinkedin = normLinkedin && existing.linkedinUrl && this.normalizeUrl(existing.linkedinUrl) === normLinkedin;
        const sameHandle = normHandle && existing.instagramHandle && existing.instagramHandle.toLowerCase() === normHandle;
        return sameLinkedin || sameHandle;
      });

      if (isDup) {
        duplicateCount++;
      } else {
        this.profiles.push(p);
        addedCount++;
      }
    }

    this.persist();
    return { addedCount, duplicateCount };
  }

  public updateDataStatus(id: string, status: DataStatus): boolean {
    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.profiles[idx] = {
      ...this.profiles[idx],
      dataStatus: status,
    };
    this.persist();
    return true;
  }

  public resetToSeedData(): Profile[] {
    this.profiles = [...INITIAL_PROFILES];
    this.persist();
    return [...this.profiles];
  }

  private normalizeUrl(url: string): string {
    return url.trim().toLowerCase().replace(/\/+$/, '');
  }
}

// Singleton repository instance for application-wide consistency
export const profileRepo = new ProfileRepository();
