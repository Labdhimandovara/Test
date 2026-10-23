import React, { useState } from 'react';
import type { Profile, ApprovedPreferences } from '../../types/profile';
import { profileRepo } from '../../services/profileRepository';
import { consentService } from '../../services/consentService';
import { 
  Sparkles, 
  Check, 
  Heart, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Wand2, 
  ArrowRight
} from 'lucide-react';

interface ParticipantOnboardingViewProps {
  profiles: Profile[];
  currentProfileId?: string;
  onSelectCurrentProfile: (id: string) => void;
  onRefresh: () => void;
  onNavigateToAgent?: () => void;
}

const SUGGESTED_TAGS = ['travel', 'food', 'music', 'tech', 'movies', 'books', 'art', 'hiking', 'coffee'];

export const ParticipantOnboardingView: React.FC<ParticipantOnboardingViewProps> = ({
  profiles,
  currentProfileId,
  onSelectCurrentProfile,
  onRefresh,
  onNavigateToAgent,
}) => {
  const [selectedId, setSelectedId] = useState<string>(currentProfileId || profiles[0]?.id || '');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState('');

  // 3 Clear Consent Checkboxes
  const [consentPlatform, setConsentPlatform] = useState(false);
  const [consentAgent, setConsentAgent] = useState(false);
  const [consentWithdraw, setConsentWithdraw] = useState(false);

  // Preferences
  const [relationshipIntent, setRelationshipIntent] = useState('Open to explore');
  const [communicationStyle, setCommunicationStyle] = useState('Moderate (2-4 times/week)');
  const [interests, setInterests] = useState<string[]>(['travel', 'food', 'music']);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeProfile = profiles.find(p => p.id === (currentProfileId || selectedId));
  const isEnrolled = activeProfile?.participationStatus === 'enrolled';

  const handleAddTag = () => {
    if (newTagInput.trim() && !interests.includes(newTagInput.trim().toLowerCase())) {
      setInterests([...interests, newTagInput.trim().toLowerCase()]);
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setInterests(interests.filter(t => t !== tag));
  };

  const handleEnroll = () => {
    if (!consentPlatform || !consentAgent || !consentWithdraw) {
      setFeedback({
        type: 'error',
        message: 'Please check all 3 consent boxes to create your agent. 💜',
      });
      return;
    }

    let targetId = selectedId;

    if (isCreatingNew) {
      if (!newName.trim()) {
        setFeedback({ type: 'error', message: 'Please enter your name.' });
        return;
      }
      const res = profileRepo.addProfile({
        name: newName.trim(),
        sourceUrl: 'self_onboarded_local_demo',
        notes: 'Enrolled via simple onboarding.',
      });
      if (!res.success || !res.profile) {
        setFeedback({ type: 'error', message: res.error || 'Failed to create profile.' });
        return;
      }
      targetId = res.profile.id;
    }

    const preferences: ApprovedPreferences = {
      relationshipIntent,
      communicationStyle,
      dealbreakers: ['High-pressure timelines'],
      approvedBoundaryRules: ['Symmetric disclosure', 'Max 4 exchange rounds'],
      notes: 'Approved dating preferences supplied by participant.',
    };

    profileRepo.updateProfile(targetId, {
      participationStatus: 'enrolled',
      approvedPreferences: preferences,
      approvedInterests: interests,
      notes: 'Explicitly enrolled participant with calibrated agent.',
    });

    consentService.recordAudit({
      personId: targetId,
      action: 'terms_accepted',
      actor: 'user',
      metadata: { intent: relationshipIntent, interests },
    });

    onSelectCurrentProfile(targetId);
    onRefresh();
    setFeedback({
      type: 'success',
      message: `Yay! Your agent is ready to explore compatibility! ✨`,
    });
  };

  const handleWithdraw = () => {
    if (!activeProfile) return;
    if (window.confirm(`Withdraw consent for ${activeProfile.name}? Your agent will be paused and approved preferences cleared.`)) {
      profileRepo.updateProfile(activeProfile.id, {
        participationStatus: 'withdrawn',
        approvedPreferences: null,
        approvedInterests: null,
      });
      consentService.recordAudit({
        personId: activeProfile.id,
        action: 'consent_withdrawn',
        actor: 'user',
        metadata: { personId: activeProfile.id },
      });
      onRefresh();
      setFeedback({
        type: 'success',
        message: `Consent withdrawn for ${activeProfile.name}.`,
      });
    }
  };

  const handleSetupDemoPair = () => {
    const p1 = profiles[0];
    if (p1) {
      profileRepo.updateProfile(p1.id, {
        participationStatus: 'enrolled',
        approvedPreferences: {
          relationshipIntent: 'Open to explore',
          communicationStyle: 'Moderate (2-4 times/week)',
          dealbreakers: ['High-pressure timelines'],
          approvedBoundaryRules: ['Symmetric disclosure', 'Max 4 exchange rounds'],
        },
        approvedInterests: ['travel', 'food', 'music'],
      });
    }

    const p2 = profiles.find(p => p.name.includes('Jordan') || p.id !== p1?.id) || profiles[1];
    if (p2) {
      profileRepo.updateProfile(p2.id, {
        participationStatus: 'enrolled',
        approvedPreferences: {
          relationshipIntent: 'Open to explore',
          communicationStyle: 'Moderate (2-4 times/week)',
          dealbreakers: ['Smoking'],
          approvedBoundaryRules: ['Symmetric disclosure', 'Max 4 exchange rounds'],
        },
        approvedInterests: ['travel', 'food', 'movies'],
      });
    }

    if (p1) onSelectCurrentProfile(p1.id);
    onRefresh();
    setFeedback({
      type: 'success',
      message: 'Demo pair ready! Both participants have opted in with matching interests. 💗',
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/80 text-pink-600 text-xs font-bold">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Opt-In Onboarding</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#1e1b2e] tracking-tight">
          Join the Experiment 💜
        </h1>
        <p className="text-xs sm:text-sm text-purple-900/60 font-medium">
          Let your agent represent you. You stay in control.
        </p>
      </div>

      {/* Quick Demo Shortcut */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-pink-500/20">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#1e1b2e]">Fast Demo Setup</h4>
            <p className="text-[11px] text-purple-900/60">
              Instantly enroll 2 demo candidates with matching interests.
            </p>
          </div>
        </div>
        <button
          onClick={handleSetupDemoPair}
          className="px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-pink-600 text-xs font-bold hover:bg-pink-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          Set Up Demo Pair 🪄
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Stepper Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-[0_4px_30px_rgba(244,114,182,0.08)] space-y-8">
        
        {/* Step 1: Choose Your Profile */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-sm text-[#1e1b2e]">Choose Your Profile</h3>
          </div>

          {!isCreatingNew ? (
            <div className="space-y-2">
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  onSelectCurrentProfile(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl bg-pink-50/40 border border-pink-100 text-xs sm:text-sm text-[#1e1b2e] font-medium focus:outline-none focus:border-pink-300 cursor-pointer"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.participationStatus === 'enrolled' ? '(Already Opted In 💜)' : '(Research Lead)'}
                  </option>
                ))}
              </select>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="text-xs text-pink-600 font-semibold hover:underline cursor-pointer"
                >
                  + Or claim a new demo identity
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter your name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-pink-50/40 border border-pink-100 text-xs sm:text-sm text-[#1e1b2e] font-medium focus:outline-none focus:border-pink-300"
              />
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-purple-600 font-semibold hover:underline cursor-pointer"
                >
                  ← Select from existing research profiles
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Give Consent */}
        <div className="space-y-3 pt-6 border-t border-pink-100/80">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-sm text-[#1e1b2e]">Give Consent</h3>
          </div>

          <div className="space-y-2.5 bg-pink-50/30 p-4 rounded-2xl border border-pink-100">
            <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm text-purple-900 font-medium">
              <input
                type="checkbox"
                checked={consentPlatform}
                onChange={(e) => setConsentPlatform(e.target.checked)}
                className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400 accent-pink-500"
              />
              <span>I agree to participate in the platform.</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm text-purple-900 font-medium">
              <input
                type="checkbox"
                checked={consentAgent}
                onChange={(e) => setConsentAgent(e.target.checked)}
                className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400 accent-pink-500"
              />
              <span>I allow an AI agent to represent me.</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm text-purple-900 font-medium">
              <input
                type="checkbox"
                checked={consentWithdraw}
                onChange={(e) => setConsentWithdraw(e.target.checked)}
                className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400 accent-pink-500"
              />
              <span>I understand I can withdraw anytime.</span>
            </label>
          </div>
        </div>

        {/* Step 3: Set Your Preferences */}
        <div className="space-y-4 pt-6 border-t border-pink-100/80">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-sm text-[#1e1b2e]">Set Your Preferences</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-purple-900/70 mb-1">
                Relationship Intent
              </label>
              <select
                value={relationshipIntent}
                onChange={(e) => setRelationshipIntent(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-pink-50/40 border border-pink-100 text-xs sm:text-sm text-[#1e1b2e] font-medium focus:outline-none focus:border-pink-300 cursor-pointer"
              >
                <option value="Open to explore">Open to explore</option>
                <option value="Long-term partnership">Long-term partnership</option>
                <option value="Companionship & conversation">Companionship & conversation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-900/70 mb-1">
                Communication Style
              </label>
              <select
                value={communicationStyle}
                onChange={(e) => setCommunicationStyle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-pink-50/40 border border-pink-100 text-xs sm:text-sm text-[#1e1b2e] font-medium focus:outline-none focus:border-pink-300 cursor-pointer"
              >
                <option value="Moderate (2-4 times/week)">Moderate (2-4 times/week)</option>
                <option value="Thoughtful asynchronous (Paced)">Thoughtful asynchronous (Paced)</option>
                <option value="Direct & active daily">Direct & active daily</option>
              </select>
            </div>

            {/* Tags / Interests */}
            <div>
              <label className="block text-xs font-bold text-purple-900/70 mb-2">
                Your Interests (add tags)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {interests.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/70 text-pink-700 text-xs font-semibold border border-pink-200"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-pink-900 text-xs font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {showTagInput ? (
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="e.g. coffee"
                      className="px-2.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs text-purple-900 focus:outline-none w-24"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="text-xs text-pink-600 font-bold px-1.5"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTagInput(true)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-dashed border-pink-300 text-pink-600 text-xs font-semibold hover:bg-pink-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                )}
              </div>

              {/* Suggestions */}
              <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] text-purple-900/50">
                <span>Suggestions:</span>
                {SUGGESTED_TAGS.filter(t => !interests.includes(t)).slice(0, 4).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInterests([...interests, s])}
                    className="text-pink-600 hover:underline"
                  >
                    +{s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-6 border-t border-pink-100/80 space-y-3">
          <button
            onClick={handleEnroll}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-sm sm:text-base hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Create My Agent ✨</span>
          </button>

          {isEnrolled && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                This profile is currently opted in
              </span>
              <div className="flex items-center gap-3">
                {onNavigateToAgent && (
                  <button
                    type="button"
                    onClick={onNavigateToAgent}
                    className="text-xs text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View My Agent</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleWithdraw}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Withdraw
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
