import type { HumanApprovalRequest, ConsentAuditLog } from '../types/consent';

export class ConsentService {
  private auditLogs: ConsentAuditLog[] = [];

  constructor() {
    this.recordAudit({
      personId: 'system_init',
      action: 'profile_imported',
      actor: 'research_team',
      metadata: { initialProfileCount: 16, note: 'Preliminary seed dataset initialized with not_invited status' },
    });
  }

  public recordAudit(log: Omit<ConsentAuditLog, 'id' | 'timestamp'>): ConsentAuditLog {
    const fullLog: ConsentAuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(fullLog);
    return fullLog;
  }

  public getAuditLogs(): ConsentAuditLog[] {
    return [...this.auditLogs];
  }

  public createApprovalRequest(
    requesterPersonId: string,
    targetPersonId: string,
    rationale: string,
    score: number
  ): HumanApprovalRequest {
    return {
      id: `appr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      requesterPersonId,
      targetPersonId,
      synthesizedRationale: rationale,
      compatibilityScore: score,
      status: 'pending_human_review',
      channelRevealed: false,
    };
  }

  public humanApprove(requestId: string): { success: boolean; channelRevealed: boolean } {
    this.recordAudit({
      personId: requestId,
      action: 'preferences_approved',
      actor: 'user',
      metadata: { requestId, decision: 'approved' },
    });
    return { success: true, channelRevealed: true };
  }
}

export const consentService = new ConsentService();
