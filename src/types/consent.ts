/**
 * Human Consent & Approval Types
 *
 * Rules:
 * - Any real introduction or message to another person requires appropriate human approval.
 * - Humans retain final veto and authorization over all dating interactions.
 */

export interface HumanApprovalRequest {
  id: string;
  requesterPersonId: string;
  targetPersonId: string;
  synthesizedRationale: string;
  compatibilityScore: number;
  status: 'pending_human_review' | 'approved_by_user' | 'declined_by_user';
  humanApprovedAt?: string;
  channelRevealed: boolean;
}

export interface ConsentAuditLog {
  id: string;
  personId: string;
  action: 'profile_imported' | 'invite_dispatched' | 'terms_accepted' | 'preferences_approved' | 'consent_withdrawn';
  actor: 'research_team' | 'user';
  timestamp: string;
  metadata?: Record<string, unknown>;
}
