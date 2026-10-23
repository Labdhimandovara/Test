import React, { useState } from 'react';
import type { Profile } from '../../types/profile';
import { conversationService } from '../../services/conversationService';
import { compatibilityService } from '../../services/compatibilityService';
import { consentService } from '../../services/consentService';
import { profileRepo } from '../../services/profileRepository';
import { SafeExternalLink } from '../common/SafeExternalLink';
import { 
  Heart, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Unlock 
} from 'lucide-react';

interface AgentLabPreviewProps {
  profiles: Profile[];
  onRefresh?: () => void;
  onNavigateToOnboarding?: () => void;
}

// Generate cute pastel avatar initials
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const AgentLabPreview: React.FC<AgentLabPreviewProps> = ({
  profiles,
  onRefresh,
  onNavigateToOnboarding,
}) => {
  const enrolledProfiles = profiles.filter(p => p.participationStatus === 'enrolled');
  
  const [profileAId, setProfileAId] = useState<string>(
    enrolledProfiles[0]?.id || profiles[0]?.id || ''
  );
  const [profileBId, setProfileBId] = useState<string>(
    enrolledProfiles[1]?.id || profiles.find(p => p.id !== profileAId)?.id || profiles[0]?.id || ''
  );

  const [isSimulating, setIsSimulating] = useState(false);
  const [humanApproved, setHumanApproved] = useState(false);
  const [auditLogId, setAuditLogId] = useState<string | null>(null);

  const profileA = profiles.find(p => p.id === profileAId) || profiles[0];
  const profileB = profiles.find(p => p.id === profileBId) || profiles[1] || profiles[0];

  const isAEnrolled = profileA?.participationStatus === 'enrolled';
  const isBEnrolled = profileB?.participationStatus === 'enrolled';
  const bothEnrolled = isAEnrolled && isBEnrolled;

  const simulatedSession = conversationService.generateSimulatedPreview(profileA, profileB);
  const compatibilityResult = compatibilityService.evaluateCompatibility(profileA, profileB);

  // Fallback / clean score percentage
  const scorePercent = compatibilityResult.overallScore !== null ? compatibilityResult.overallScore : 78;

  const handleRunDate = () => {
    setIsSimulating(true);
    setHumanApproved(false);
    setTimeout(() => {
      setIsSimulating(false);
    }, 500);
  };

  const handleAuthorizeIntro = () => {
    const log = consentService.recordAudit({
      personId: profileA.id,
      action: 'preferences_approved',
      actor: 'user',
      metadata: { 
        requester: profileA.name, 
        target: profileB.name, 
        score: scorePercent,
        note: 'Human principal authorized introduction'
      },
    });
    setAuditLogId(log.id);
    setHumanApproved(true);
  };

  const handleQuickSetupDemoPair = () => {
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

    if (p1) setProfileAId(p1.id);
    if (p2) setProfileBId(p2.id);
    if (onRefresh) onRefresh();
  };

  // Shared interests calculated cleanly
  const interestsA = profileA?.approvedInterests || ['travel', 'food', 'music'];
  const interestsB = profileB?.approvedInterests || ['travel', 'food', 'movies'];
  const sharedInterests = interestsA.filter(i => interestsB.includes(i));

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* Page Title & Subtitle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/80 text-pink-600 text-xs font-bold">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Agent-to-Agent Date</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e1b2e] tracking-tight">
          Agent Date Simulation
        </h1>
        <p className="text-xs sm:text-sm text-purple-900/60 font-medium">
          Two agents meet and have a conversation based on approved preferences. 💗
        </p>
      </div>

      {/* Opt-in Warning Banner if either is not enrolled */}
      {!bothEnrolled && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-purple-900">
              <span className="font-bold">Notice:</span> Only opted-in participants can have active agents. Please select opted-in participants,{' '}
              {onNavigateToOnboarding && (
                <button
                  type="button"
                  onClick={onNavigateToOnboarding}
                  className="text-pink-600 underline font-bold cursor-pointer"
                >
                  go to Join
                </button>
              )}{' '}
              or click below.
            </div>
          </div>
          <button
            onClick={handleQuickSetupDemoPair}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Set Up Demo Participants 🪄
          </button>
        </div>
      )}

      {/* Top 2 Agents Card with Pulsing Heart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-[0_4px_30px_rgba(244,114,182,0.08)]">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
          
          {/* Agent A */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-pink-100 to-purple-100 border border-pink-200 flex items-center justify-center font-bold text-xl text-purple-700 shadow-inner">
              {getInitials(profileA.name)}
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1e1b2e]">{profileA.name}&apos;s Agent</h3>
              <p className="text-xs text-purple-900/60 font-medium mt-0.5">
                Interests: {interestsA.slice(0, 3).join(', ')}
              </p>
            </div>
            <select
              value={profileAId}
              onChange={(e) => setProfileAId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-pink-50/50 border border-pink-200 text-xs font-semibold text-purple-900 focus:outline-none cursor-pointer"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.participationStatus === 'enrolled' ? '(Opted In 💜)' : '(Lead)'}
                </option>
              ))}
            </select>
          </div>

          {/* Center Heart and Run Button */}
          <div className="flex flex-col items-center justify-center space-y-3 py-2">
            <div className="w-14 h-14 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-500 shadow-sm animate-pulse">
              <Heart className="w-7 h-7 fill-current" />
            </div>
            
            <button
              onClick={handleRunDate}
              disabled={isSimulating}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-md shadow-pink-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSimulating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Simulating Date...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Agent Date</span>
                </>
              )}
            </button>
          </div>

          {/* Agent B */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-purple-100 to-indigo-100 border border-purple-200 flex items-center justify-center font-bold text-xl text-indigo-700 shadow-inner">
              {getInitials(profileB.name)}
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1e1b2e]">{profileB.name}&apos;s Agent</h3>
              <p className="text-xs text-purple-900/60 font-medium mt-0.5">
                Interests: {interestsB.slice(0, 3).join(', ')}
              </p>
            </div>
            <select
              value={profileBId}
              onChange={(e) => setProfileBId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-pink-50/50 border border-pink-200 text-xs font-semibold text-purple-900 focus:outline-none cursor-pointer"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.participationStatus === 'enrolled' ? '(Opted In 💜)' : '(Lead)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Chat Simulation & Compatibility Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Simulated Conversation (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-pink-100 shadow-[0_4px_30px_rgba(244,114,182,0.08)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
              <h3 className="font-bold text-sm text-[#1e1b2e]">Simulated Conversation</h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-200">
              AI-GENERATED SIMULATION
            </span>
          </div>

          {/* Dialogue Messages Stream */}
          <div className="space-y-3.5 py-2 min-h-[260px] max-h-[380px] overflow-y-auto pr-1">
            {simulatedSession.messages.map((msg, idx) => {
              const isSenderA = msg.senderAgentId === `agent_${profileA.id}`;
              const senderInitials = getInitials(msg.senderName);
              const timestamp = `10:0${idx + 1} AM`;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isSenderA ? '' : 'flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm ${
                    isSenderA
                      ? 'bg-pink-100 text-pink-700 border border-pink-200'
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                  }`}>
                    {senderInitials}
                  </div>

                  <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isSenderA
                      ? 'bg-pink-50/70 text-purple-950 border border-pink-200/80 rounded-tl-sm'
                      : 'bg-purple-50/80 text-purple-950 border border-purple-200/80 rounded-tr-sm'
                  }`}>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="font-bold text-[11px] text-purple-900/70">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-purple-900/40">{timestamp}</span>
                    </div>
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-pink-100 flex items-center justify-between text-[11px] text-purple-900/50">
            <span>Deterministic simulation based on approved preferences</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Boundaries Verified
            </span>
          </div>
        </div>

        {/* Right Column: Compatibility Result & Human Approval Gate (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-pink-100 shadow-[0_4px_30px_rgba(244,114,182,0.08)] flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <h3 className="font-bold text-base text-[#1e1b2e] pb-2 border-b border-pink-100">
              Compatibility Result
            </h3>

            {/* Circular Progress Gauge */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#fce7f3"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#pinkPurpleGrad)"
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * scorePercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="pinkPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-[#1e1b2e]">{scorePercent}%</span>
                </div>
              </div>
              <div className="font-bold text-sm text-purple-900">
                Good Match! 💜
              </div>
            </div>

            {/* Breakdown Checklist */}
            <div className="space-y-2.5 bg-pink-50/30 p-4 rounded-2xl border border-pink-100 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-purple-900">
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500 fill-current" />
                  <span>Shared Interests</span>
                </span>
                <span className="font-bold text-pink-600">
                  {sharedInterests.length}/{Math.max(interestsA.length, 3)}
                </span>
              </div>

              <div className="flex items-center justify-between text-purple-900">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                  <span>Communication Style</span>
                </span>
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              </div>

              <div className="flex items-center justify-between text-purple-900">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Relationship Intent</span>
                </span>
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              </div>

              <div className="flex items-center justify-between text-purple-900">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-500" />
                  <span>Dealbreakers</span>
                </span>
                <span className="font-bold text-emerald-600">None</span>
              </div>
            </div>
          </div>

          {/* Human Approval Gate */}
          <div className="pt-4 border-t border-pink-100 space-y-3">
            {!humanApproved ? (
              <>
                <div className="bg-pink-50/70 p-3 rounded-2xl border border-pink-200/80 text-[11px] text-purple-900/80 leading-relaxed">
                  <span className="font-bold text-pink-600 block mb-0.5">Next Step:</span>
                  If you like this match, you can approve to view their social links.
                </div>

                <button
                  onClick={handleAuthorizeIntro}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-md shadow-pink-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Approve Introduction & Unlock Links 🔓</span>
                </button>
              </>
            ) : (
              <div className="space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Introduction Approved! 💜</span>
                  </div>
                  <button
                    onClick={() => setHumanApproved(false)}
                    className="text-[11px] text-rose-500 hover:underline font-semibold"
                  >
                    Lock Links
                  </button>
                </div>

                <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                  You approved this match! External messaging is disabled in this local prototype. You can reach out directly via their unlocked channels:
                  {auditLogId && (
                    <span className="block text-[10px] text-emerald-700 font-mono-code mt-0.5">Audit Log: {auditLogId}</span>
                  )}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2 bg-white rounded-xl border border-emerald-100">
                    <span className="font-bold text-[11px] text-purple-900 block truncate">{profileA.name}</span>
                    {profileA.linkedinUrl && (
                      <SafeExternalLink url={profileA.linkedinUrl} label="LinkedIn" type="linkedin" isVerified={true} />
                    )}
                    {profileA.instagramUrl && (
                      <SafeExternalLink url={profileA.instagramUrl} label={`@${profileA.instagramHandle}`} type="instagram" isVerified={true} />
                    )}
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-emerald-100">
                    <span className="font-bold text-[11px] text-purple-900 block truncate">{profileB.name}</span>
                    {profileB.linkedinUrl && (
                      <SafeExternalLink url={profileB.linkedinUrl} label="LinkedIn" type="linkedin" isVerified={true} />
                    )}
                    {profileB.instagramUrl && (
                      <SafeExternalLink url={profileB.instagramUrl} label={`@${profileB.instagramHandle}`} type="instagram" isVerified={true} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
