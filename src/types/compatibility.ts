/**
 * Compatibility evaluation types
 *
 * Rules:
 * - Based strictly on explicitly approved preferences and relevant shared interests.
 * - Missing information MUST NOT be treated as a negative or positive signal (neutral score delta = 0).
 * - No speculative psychological profiling or inferred traits.
 */

export interface CompatibilityDimension {
  name: string;
  weight: number;
  approvedDataPresent: boolean;
  score: number | null; // null if unprovided
  explanation: string;
}

export interface CompatibilityEvaluation {
  id: string;
  targetProfileAId: string;
  targetProfileBId: string;
  overallScore: number | null; // calculated only across present dimensions
  evaluatedDimensions: CompatibilityDimension[];
  missingDataCount: number;
  hasSufficientDataForRecommendation: boolean;
  humanReviewRequired: true;
  generatedAt: string;
}
