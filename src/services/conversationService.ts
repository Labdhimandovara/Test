import type { ConversationSession, DialogueMessage } from '../types/conversation';
import type { Profile } from '../types/profile';

export class ConversationService {
  /**
   * Generates a preview simulated conversation between two candidate agents.
   * Prominently marked as AI-GENERATED / SIMULATED.
   */
  public generateSimulatedPreview(personA: Profile, personB: Profile): ConversationSession {
    const timestamp = new Date().toISOString();
    
    // Extract approved parameters safely
    const interestsA = personA.approvedInterests || ['creative tech', 'independent projects'];
    const interestsB = personB.approvedInterests || ['technology', 'collaborative ventures'];
    const topicA = interestsA[0] || 'innovative projects';
    const topicB = interestsB[0] || 'collaborative ventures';

    const cadenceA = personA.approvedPreferences?.communicationStyle || 'thoughtful asynchronous exchanges';
    const cadenceB = personB.approvedPreferences?.communicationStyle || 'measured, low-pressure communication';

    const intentA = personA.approvedPreferences?.relationshipIntent || 'mutual exploration';
    const intentB = personB.approvedPreferences?.relationshipIntent || 'aligned growth';

    const dealbreakersA = personA.approvedPreferences?.dealbreakers || ['High-pressure timelines'];
    const dealbreakerNotice = dealbreakersA.length > 0 ? `Confirmed zero conflict with boundary rule "${dealbreakersA[0]}".` : 'No dealbreakers triggered.';

    const messages: DialogueMessage[] = [
      {
        id: `msg_sim_01_${personA.id}`,
        senderAgentId: `agent_${personA.id}`,
        senderName: `Agent [${personA.name}]`,
        recipientAgentId: `agent_${personB.id}`,
        recipientName: `Agent [${personB.name}]`,
        intent: 'inquire',
        content: `Greetings. I represent ${personA.name} under explicit delegated consent. We are exploring compatibility for ${intentA}. Our approved interests include "${topicA}". Does your principal share interest in this domain?`,
        isAiGenerated: true,
        safetyAudited: true,
        timestamp,
      },
      {
        id: `msg_sim_02_${personB.id}`,
        senderAgentId: `agent_${personB.id}`,
        senderName: `Agent [${personB.name}]`,
        recipientAgentId: `agent_${personA.id}`,
        recipientName: `Agent [${personA.name}]`,
        intent: 'disclose',
        content: `Acknowledged. I represent ${personB.name}. Our approved profile focuses on ${intentB} with verified interest in "${topicB}". Our boundary protocol requires symmetric disclosure. What communication cadence does your principal prefer?`,
        isAiGenerated: true,
        safetyAudited: true,
        timestamp,
      },
      {
        id: `msg_sim_03_${personA.id}`,
        senderAgentId: `agent_${personA.id}`,
        senderName: `Agent [${personA.name}]`,
        recipientAgentId: `agent_${personB.id}`,
        recipientName: `Agent [${personB.name}]`,
        intent: 'boundary_check',
        content: `Our principal operates best with ${cadenceA}. ${dealbreakerNotice} How does this align with ${personB.name}'s preferred style (${cadenceB})?`,
        isAiGenerated: true,
        safetyAudited: true,
        timestamp,
      },
      {
        id: `msg_sim_04_${personB.id}`,
        senderAgentId: `agent_${personB.id}`,
        senderName: `Agent [${personB.name}]`,
        recipientAgentId: `agent_${personA.id}`,
        recipientName: `Agent [${personA.name}]`,
        intent: 'compatibility_verdict',
        content: `Negotiation audit successful. Dialogue boundary parameters satisfied without dealbreaker triggers. Preparing synthesis brief. External contact coordinates remain strictly locked pending mutual human authorization.`,
        isAiGenerated: true,
        safetyAudited: true,
        timestamp,
      },
    ];

    return {
      sessionId: `sim_session_${personA.id}_${personB.id}`,
      agentAId: `agent_${personA.id}`,
      agentBId: `agent_${personB.id}`,
      status: 'completed',
      messages,
      simulatedDisclaimer: 'NOTICE: This conversation is entirely AI-generated simulation. It does not represent actual statements, messages, or interaction between real people.',
    };
  }
}

export const conversationService = new ConversationService();
