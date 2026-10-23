/**
 * Agent representation types
 *
 * Rules:
 * - Agents represent ONLY explicitly supplied or approved preferences, interests, boundaries.
 * - No inferred personality, speculative profiling, or fabricated intentions.
 */

export type AgentStatus =
  | 'uninitialized'         // No agent created (default for preliminary records)
  | 'awaiting_human_consent' // Profile exists but person has not consented
  | 'calibrated'            // Approved preferences loaded into agent memory
  | 'exploring'             // Actively seeking compatible peers
  | 'paused';               // Temporarily paused by human owner

export interface AgentBoundaryRules {
  allowDirectContactRecommendation: boolean;
  maxExchangesPerPartner: number;
  discloseFieldsOnlyIfReciprocated: boolean;
  strictDealbreakerFiltering: boolean;
}

export interface AgentProfile {
  agentId: string;
  targetPersonId: string;
  status: AgentStatus;
  authorizedInterests: string[];
  authorizedPreferences: Record<string, unknown>;
  boundaryRules: AgentBoundaryRules;
  lastNegotiationAt?: string;
  consentTimestamp?: string;
}

export interface AgentNegotiationTurn {
  turnIndex: number;
  senderAgentId: string;
  recipientAgentId: string;
  category: 'interest_inquiry' | 'preference_crosscheck' | 'boundary_audit' | 'synthesis';
  inquiry: string;
  response: string;
  isSimulated: true; // Strictly labeled
  timestamp: string;
}
