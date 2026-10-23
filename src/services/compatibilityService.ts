import type { Profile } from '../types/profile';
import type { CompatibilityEvaluation, CompatibilityDimension } from '../types/compatibility';

export class CompatibilityService {
  /**
   * Evaluates compatibility strictly using approved preferences.
   * Invariant: Missing information MUST NOT be treated as a negative or positive signal (neutral).
   * No speculative psychological profiling or inferred traits.
   */
  public evaluateCompatibility(profileA: Profile, profileB: Profile): CompatibilityEvaluation {
    const dimensions: CompatibilityDimension[] = [];

    // 1. Shared Explicit Interests Dimension
    const interestsA = profileA.approvedInterests;
    const interestsB = profileB.approvedInterests;

    if (interestsA && interestsB && interestsA.length > 0 && interestsB.length > 0) {
      const setA = new Set(interestsA.map(i => i.toLowerCase().trim()));
      const shared = interestsB.filter(i => setA.has(i.toLowerCase().trim()));
      const jaccard = shared.length / (new Set([...interestsA, ...interestsB]).size);
      const score = Math.round(jaccard * 100);

      dimensions.push({
        name: 'Explicit Shared Interests',
        weight: 0.35,
        approvedDataPresent: true,
        score,
        explanation: `${shared.length} shared approved interests identified (${shared.join(', ')}).`,
      });
    } else {
      dimensions.push({
        name: 'Explicit Shared Interests',
        weight: 0.35,
        approvedDataPresent: false,
        score: null,
        explanation: 'Not provided by one or both participants. Neutral delta (0 penalty).',
      });
    }

    // 2. Communication Style Dimension
    const commA = profileA.approvedPreferences?.communicationStyle;
    const commB = profileB.approvedPreferences?.communicationStyle;

    if (commA && commB) {
      const match = commA.toLowerCase() === commB.toLowerCase();
      dimensions.push({
        name: 'Communication Pace Alignment',
        weight: 0.25,
        approvedDataPresent: true,
        score: match ? 100 : 50,
        explanation: match 
          ? `Both preferred "${commA}".`
          : `Different communication paces: "${commA}" vs "${commB}".`,
      });
    } else {
      dimensions.push({
        name: 'Communication Pace Alignment',
        weight: 0.25,
        approvedDataPresent: false,
        score: null,
        explanation: 'Communication preferences not provided. Neutral delta.',
      });
    }

    // 3. Relationship Intent Dimension
    const intentA = profileA.approvedPreferences?.relationshipIntent;
    const intentB = profileB.approvedPreferences?.relationshipIntent;

    if (intentA && intentB) {
      const match = intentA.toLowerCase() === intentB.toLowerCase();
      dimensions.push({
        name: 'Relationship Intent Alignment',
        weight: 0.40,
        approvedDataPresent: true,
        score: match ? 100 : 0,
        explanation: match
          ? `Both seeking "${intentA}".`
          : `Intent mismatch: "${intentA}" vs "${intentB}".`,
      });
    } else {
      dimensions.push({
        name: 'Relationship Intent Alignment',
        weight: 0.40,
        approvedDataPresent: false,
        score: null,
        explanation: 'Relationship intent not provided. Neutral delta.',
      });
    }

    // Compute overall score only across present dimensions
    const presentDimensions = dimensions.filter(d => d.approvedDataPresent && d.score !== null);
    const missingCount = dimensions.filter(d => !d.approvedDataPresent).length;

    let overallScore: number | null = null;
    if (presentDimensions.length > 0) {
      const totalWeight = presentDimensions.reduce((sum, d) => sum + d.weight, 0);
      const weightedSum = presentDimensions.reduce((sum, d) => sum + (d.score! * d.weight), 0);
      overallScore = Math.round(weightedSum / totalWeight);
    }

    const hasSufficientData = presentDimensions.length >= 2;

    return {
      id: `compat_${profileA.id}_${profileB.id}`,
      targetProfileAId: profileA.id,
      targetProfileBId: profileB.id,
      overallScore,
      evaluatedDimensions: dimensions,
      missingDataCount: missingCount,
      hasSufficientDataForRecommendation: hasSufficientData,
      humanReviewRequired: true,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const compatibilityService = new CompatibilityService();
