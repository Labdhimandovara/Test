/**
 * Conversation Service Types
 *
 * Rules:
 * - Agent conversations must be explicitly labeled as AI-generated.
 * - Never portray simulated dialogue as real conversation between people.
 */

export interface DialogueMessage {
  id: string;
  senderAgentId: string;
  senderName: string;
  recipientAgentId: string;
  recipientName: string;
  intent: 'inquire' | 'disclose' | 'boundary_check' | 'compatibility_verdict';
  content: string;
  isAiGenerated: true;
  safetyAudited: boolean;
  timestamp: string;
}

export interface ConversationSession {
  sessionId: string;
  agentAId: string;
  agentBId: string;
  status: 'active' | 'completed' | 'blocked_by_boundary';
  messages: DialogueMessage[];
  simulatedDisclaimer: string;
}
