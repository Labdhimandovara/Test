/**
 * Centralized typed profile dataset interfaces
 *
 * Requirements:
 * - Separate sourced profile information from user-approved dating preferences
 * - Nullable fields where data is unavailable
 * - Sourced profiles must never imply consent or active enrollment
 * - Explicit verification stages for each social link
 */

export type DataStatus = 
  | 'user_supplied'            // Explicitly provided in original input
  | 'link_unverified'          // Constructed from handle, pending confirmation
  | 'verified'                 // Manually or systematically confirmed valid
  | 'invalid_format_warning';   // Handle contains invalid/wildcard characters, URL withheld

export type ParticipationStatus =
  | 'not_invited'       // Preliminary research record; zero contact or enrollment
  | 'invited'           // Formal invitation extended, awaiting response
  | 'consent_pending'   // Consent document reviewed, awaiting signature
  | 'enrolled'          // Explicit written consent given, agent representation authorized
  | 'withdrawn';        // Participant revoked consent or exited study

export type LinkVerificationStage =
  | 'researcher_supplied'       // Raw link/handle supplied by researcher
  | 'syntax_valid'              // Syntactically well-formed URL/handle format
  | 'checked_reachable'         // Verified reachable / active link
  | 'identity_confirmed'        // Identity correspondence confirmed by reliable public evidence
  | 'unverified'                // Inferred or unverified
  | 'conflicting_or_invalid';   // Conflicts detected or invalid characters

export interface LinkVerificationDetail {
  stage: LinkVerificationStage;
  checkedAt?: string;
  verifiedBy?: 'manual_researcher' | 'syntax_validator' | 'apify_pipeline';
  sourceEvidence?: string;
  notes?: string;
}

export interface ProfileVerificationSummary {
  linkedin?: LinkVerificationDetail;
  instagram?: LinkVerificationDetail;
  identityCorrespondenceConfirmed: boolean;
  manualReviewNotes?: string;
  lastAuditedAt?: string;
}

export interface ApprovedPreferences {
  relationshipIntent?: string;
  communicationStyle?: string;
  preferredRadiusKm?: number;
  dealbreakers?: string[];
  approvedBoundaryRules?: string[];
  notes?: string;
}

export interface Profile {
  id: string;
  name: string;
  linkedinUrl: string | null;
  instagramHandle: string | null;
  instagramUrl: string | null;
  sourceUrl?: string | null;
  dataStatus: DataStatus;
  participationStatus: ParticipationStatus;
  approvedPreferences: ApprovedPreferences | null;
  approvedInterests: string[] | null;
  createdAt: string;
  notes?: string;
  verification?: ProfileVerificationSummary;
}

export interface NewProfileInput {
  name: string;
  linkedinUrl?: string;
  instagramHandle?: string;
  instagramUrl?: string;
  sourceUrl?: string;
  notes?: string;
  verification?: ProfileVerificationSummary;
}

export interface UpdateProfileInput {
  name?: string;
  linkedinUrl?: string | null;
  instagramHandle?: string | null;
  instagramUrl?: string | null;
  sourceUrl?: string | null;
  dataStatus?: DataStatus;
  participationStatus?: ParticipationStatus;
  approvedPreferences?: ApprovedPreferences | null;
  approvedInterests?: string[] | null;
  notes?: string;
  verification?: ProfileVerificationSummary;
}

// Bulk import structures
export type ImportRowStatus = 'valid' | 'duplicate' | 'conflict_requires_review' | 'invalid_syntax';

export interface ImportRowPreview {
  rowIndex: number;
  rawInput: Record<string, string>;
  mappedName: string;
  mappedLinkedinUrl: string | null;
  mappedInstagramHandle: string | null;
  mappedInstagramUrl: string | null;
  mappedSourceUrl: string | null;
  mappedNotes: string | null;
  status: ImportRowStatus;
  statusReason: string;
  dataStatus: DataStatus;
  existingMatchProfileId?: string;
}

export interface ImportBatchResult {
  totalRows: number;
  validRows: ImportRowPreview[];
  duplicateRows: ImportRowPreview[];
  conflictRows: ImportRowPreview[];
  invalidRows: ImportRowPreview[];
}
