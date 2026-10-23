import type { Profile } from '../types/profile';
import type { AgentProfile, AgentStatus, AgentBoundaryRules } from '../types/agent';

export class AgentService {
  /**
   * Determine agent operational readiness for a given profile.
   * Hard constraint: Never represent or analyze people without explicit consent and approved preferences.
   */
  public getAgentForProfile(profile: Profile): AgentProfile {
    const isEnrolled = profile.participationStatus === 'enrolled';
    const hasApprovedPrefs = profile.approvedPreferences !== null;

    let status: AgentStatus = 'uninitialized';
    if (!isEnrolled) {
      status = 'awaiting_human_consent';
    } else if (!hasApprovedPrefs) {
      status = 'uninitialized';
    } else {
      status = 'calibrated';
    }

    const defaultBoundaries: AgentBoundaryRules = {
      allowDirectContactRecommendation: false,
      maxExchangesPerPartner: 4,
      discloseFieldsOnlyIfReciprocated: true,
      strictDealbreakerFiltering: true,
    };

    return {
      agentId: `agent_${profile.id}`,
      targetPersonId: profile.id,
      status,
      // Strictly expose ONLY approved data, never speculative inferences
      authorizedInterests: profile.approvedInterests || [],
      authorizedPreferences: (profile.approvedPreferences as unknown as Record<string, unknown>) || {},
      boundaryRules: defaultBoundaries,
      consentTimestamp: isEnrolled ? profile.createdAt : undefined,
    };
  }

  /**
   * Explains protocol boundary guarantees
   */
  public getProtocolPrinciples(): string[] {
    return [
      'Zero Speculation: Agents represent only explicitly supplied and approved preferences.',
      'Symmetric Disclosure: Boundary-sensitive fields are only revealed if the partner reciprocates.',
      'Deterministic Evaluation: Missing data yields 0 score delta, never penalized or rewarded.',
      'Human Authorization Gate: Real introductions strictly require manual human approval.',
      'Transparent Attribution: All simulated dialogues are strictly labeled as AI-generated.',
    ];
  }
}

export const agentService = new AgentService();
