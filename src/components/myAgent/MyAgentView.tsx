import React, { useState } from 'react';
import type { Profile } from '../../types/profile';
import type { AgentProfile, AgentStatus } from '../../types/agent';
import { agentService } from '../../services/agentService';
import { 
  Sliders, 
  Play, 
  Pause, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface MyAgentViewProps {
  profiles: Profile[];
  currentProfileId?: string;
  onSelectCurrentProfile: (id: string) => void;
  onNavigateToOnboarding: () => void;
  onNavigateToLab: () => void;
  onRefresh?: () => void;
}

export const MyAgentView: React.FC<MyAgentViewProps> = ({
  profiles,
  currentProfileId,
  onSelectCurrentProfile,
  onNavigateToOnboarding,
  onNavigateToLab,
}) => {
  const activeProfile = profiles.find(p => p.id === currentProfileId) || profiles.find(p => p.participationStatus === 'enrolled') || profiles[0];
  const isEnrolled = activeProfile?.participationStatus === 'enrolled';

  const agent: AgentProfile = activeProfile ? agentService.getAgentForProfile(activeProfile) : {
    agentId: 'agent_unknown',
    targetPersonId: '',
    status: 'uninitialized',
    authorizedInterests: [],
    authorizedPreferences: {},
    boundaryRules: {
      allowDirectContactRecommendation: false,
      maxExchangesPerPartner: 4,
      discloseFieldsOnlyIfReciprocated: true,
      strictDealbreakerFiltering: true,
    },
  };

  const [agentStatus, setAgentStatus] = useState<AgentStatus>(
    isEnrolled ? 'exploring' : 'awaiting_human_consent'
  );
  
  // Boundary settings
  const [showInterests, setShowInterests] = useState(true);
  const [maxRounds, setMaxRounds] = useState(agent.boundaryRules.maxExchangesPerPartner || 4);
  const [stopOnDealbreakers, setStopOnDealbreakers] = useState(true);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleToggleStatus = () => {
    if (!isEnrolled) return;
    const next = agentStatus === 'exploring' ? 'paused' : 'exploring';
    setAgentStatus(next);
    setSaveNotice(next === 'exploring' ? 'Agent is now active & exploring! 💜' : 'Agent paused.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const interestsList = activeProfile?.approvedInterests || ['travel', 'food', 'music'];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Top Header & Profile Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
              Personal Agent
            </span>
            <span className="text-xs text-purple-900/50 font-medium">
              Autonomous Delegation
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e1b2e] tracking-tight">
            My Agent
          </h1>
          <p className="text-xs sm:text-sm text-purple-900/60 mt-0.5">
            Your agent only shares what you approve. You can pause anytime.
          </p>
        </div>

        {/* Profile Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-purple-900/60">Viewing:</label>
          <select
            value={activeProfile?.id}
            onChange={(e) => onSelectCurrentProfile(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-xs text-purple-900 font-semibold focus:outline-none focus:border-pink-300 shadow-sm cursor-pointer"
          >
            {profiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} {p.participationStatus === 'enrolled' ? '(Opted In 💜)' : '(Not Enrolled)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Save / Status Toast */}
      {saveNotice && (
        <div className="bg-purple-50 border border-purple-200 text-purple-800 rounded-2xl p-3.5 text-xs sm:text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {!isEnrolled && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1e1b2e]">{activeProfile?.name} has not opted in yet</h4>
              <p className="text-xs text-purple-900/60">
                To activate this agent and set dating preferences, please complete the simple onboarding.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToOnboarding}
            className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all shadow-sm shadow-pink-500/20 cursor-pointer whitespace-nowrap"
          >
            Go to Join →
          </button>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Cute Robot Speech Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-[0_4px_30px_rgba(244,114,182,0.08)] flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            
            {/* Robot Illustration and Speech Bubble */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-400 via-rose-400 to-purple-500 p-1 flex-shrink-0 shadow-md shadow-pink-500/20">
                <div className="w-full h-full bg-white/90 rounded-[22px] flex items-center justify-center">
                  {/* Cute Robot SVG Face */}
                  <svg className="w-12 h-12 text-pink-500" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="10" r="4" fill="#ec4899" />
                    <line x1="32" y1="14" x2="32" y2="20" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
                    <rect x="14" y="20" width="36" height="30" rx="10" fill="#fdf2f8" stroke="#ec4899" strokeWidth="2.5" />
                    <circle cx="26" cy="32" r="3.5" fill="#a855f7" />
                    <circle cx="38" cy="32" r="3.5" fill="#a855f7" />
                    <path d="M27 41C29.5 43 34.5 43 37 41" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="8" y="29" width="4" height="12" rx="2" fill="#ec4899" />
                    <rect x="52" y="29" width="4" height="12" rx="2" fill="#ec4899" />
                  </svg>
                </div>
              </div>

              {/* Cute Speech Bubble */}
              <div className="relative bg-pink-50/70 border border-pink-200/80 rounded-2xl p-4 text-xs sm:text-sm text-purple-900 leading-relaxed font-medium">
                <div className="absolute top-4 -left-2 w-3 h-3 bg-pink-50/70 border-l border-b border-pink-200/80 -rotate-45" />
                Hi! I&apos;ll explore compatible people for you based on your interests and preferences. 💜
              </div>
            </div>

            {/* Status Pill and Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/30 border border-pink-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-900/70">Agent State:</span>
                {isEnrolled ? (
                  agentStatus === 'exploring' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Exploring
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Paused
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                    Not Enrolled
                  </span>
                )}
              </div>

              {isEnrolled && (
                <button
                  onClick={handleToggleStatus}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    agentStatus === 'exploring'
                      ? 'bg-white text-purple-700 border-pink-200 hover:bg-pink-50'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent'
                  }`}
                >
                  {agentStatus === 'exploring' ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>Pause Agent</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Resume Exploring</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Approved Agent Memory */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-900/70 block">
                Approved Memory Topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {interestsList.map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-pink-100 text-[11px] text-purple-900/50 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-pink-500" />
            <span>Agent memory strictly isolated to approved topics.</span>
          </div>
        </div>

        {/* Right: My Settings Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-[0_4px_30px_rgba(244,114,182,0.08)] flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-pink-500" />
              <h3 className="font-bold text-base text-[#1e1b2e]">My Settings</h3>
            </div>

            <div className="space-y-4">
              {/* Setting 1: Show my interests */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-50/20 border border-pink-100">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1e1b2e]">Show my interests</h4>
                  <p className="text-[11px] text-purple-900/60">
                    Allow agent to discuss approved topics during dates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInterests(!showInterests)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    showInterests ? 'bg-gradient-to-r from-pink-500 to-rose-400' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      showInterests ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Setting 2: Max conversation rounds */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-50/20 border border-pink-100">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1e1b2e]">Max conversation rounds</h4>
                  <p className="text-[11px] text-purple-900/60">
                    Dialogue exchange limit per simulation.
                  </p>
                </div>
                <select
                  value={maxRounds}
                  onChange={(e) => setMaxRounds(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-bold text-purple-900 focus:outline-none"
                >
                  <option value={2}>2 rounds</option>
                  <option value={4}>4 rounds</option>
                  <option value={6}>6 rounds</option>
                </select>
              </div>

              {/* Setting 3: Stop if dealbreakers appear */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-50/20 border border-pink-100">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1e1b2e]">Stop if dealbreakers appear</h4>
                  <p className="text-[11px] text-purple-900/60">
                    Immediately abort date if dealbreaker is flagged.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStopOnDealbreakers(!stopOnDealbreakers)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    stopOnDealbreakers ? 'bg-gradient-to-r from-pink-500 to-rose-400' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      stopOnDealbreakers ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToLab}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs sm:text-sm hover:opacity-95 transition-all shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Run Agent Date Simulation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
