import React from 'react';
import type { Profile } from '../../types/profile';
import type { ActiveTab } from '../common/Header';
import { profileRepo } from '../../services/profileRepository';
import { 
  Users, 
  Heart, 
  UserCheck, 
  MessageSquare, 
  ArrowRight, 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  CheckCircle2, 
  Lock,
  Play,
  Terminal,
  HelpCircle,
  Wand2
} from 'lucide-react';

interface LandingOverviewProps {
  profiles: Profile[];
  onNavigate: (tab: ActiveTab) => void;
  onRefresh?: () => void;
}

export const LandingOverview: React.FC<LandingOverviewProps> = ({
  profiles,
  onNavigate,
  onRefresh,
}) => {
  const totalCount = profiles.length;
  const optedInCount = profiles.filter(p => p.participationStatus === 'enrolled').length;
  const notInvitedCount = profiles.filter(p => p.participationStatus !== 'enrolled').length;
  const simulationsCount = optedInCount >= 2 ? 1 : 0;

  const handleQuickSetup = () => {
    const p1 = profiles[0];
    if (p1) {
      profileRepo.updateProfile(p1.id, {
        participationStatus: 'enrolled',
        approvedPreferences: {
          relationshipIntent: 'Open to explore',
          communicationStyle: 'Moderate (2-4 times/week)',
          dealbreakers: ['High-pressure timelines'],
          approvedBoundaryRules: ['Symmetric disclosure', 'Max 4 exchange rounds'],
          notes: 'Demo participant 1 calibrated.',
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
          notes: 'Demo participant 2 calibrated.',
        },
        approvedInterests: ['travel', 'food', 'movies'],
      });
    }

    if (onRefresh) onRefresh();
  };

  const steps = [
    {
      num: '1',
      title: 'Meet People',
      desc: 'Browse 26 real research records. Only opted-in people can date.',
      icon: Users,
      color: 'from-pink-500 to-rose-400',
    },
    {
      num: '2',
      title: 'Agent Chats',
      desc: 'Your AI agent introduces you and asks questions based on your approved interests.',
      icon: Bot,
      color: 'from-purple-500 to-pink-500',
    },
    {
      num: '3',
      title: 'Find Compatibility',
      desc: 'See transparent score breakdowns with zero guesswork on missing info.',
      icon: Heart,
      color: 'from-rose-400 to-pink-600',
    },
    {
      num: '4',
      title: 'You Decide',
      desc: 'Nothing happens without you. Both humans must approve before any intro.',
      icon: CheckCircle2,
      color: 'from-purple-600 to-indigo-500',
    },
  ];

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/90 via-pink-50/50 to-purple-50/40 border border-pink-100 p-8 sm:p-14 text-center shadow-[0_10px_40px_rgba(244,114,182,0.1)]">
        {/* Playful Floating Hearts */}
        <div className="absolute top-8 left-10 text-pink-300 text-3xl animate-float opacity-70">💗</div>
        <div className="absolute top-16 right-12 text-purple-300 text-2xl animate-float opacity-70 [animation-delay:1.5s]">💜</div>
        <div className="absolute bottom-10 left-16 text-pink-400 text-xl animate-float opacity-60 [animation-delay:0.8s]">✨</div>
        <div className="absolute bottom-12 right-20 text-rose-300 text-2xl animate-float opacity-70 [animation-delay:2s]">💕</div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200/60 text-pink-600 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Agentic Dating Laboratory</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1e1b2e] leading-[1.15]">
            Agents date. <br />
            <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              You decide.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-purple-900/70 font-medium max-w-xl mx-auto leading-relaxed">
            Let your agent find the vibe 💗. Your AI agent explores compatibility on your behalf, while you stay in full control.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('agent-lab')}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold text-base hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-pink-500/30 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {optedInCount < 2 && (
              <button
                onClick={handleQuickSetup}
                className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-white border border-pink-200 text-purple-800 font-semibold text-sm hover:bg-pink-50/70 transition-all shadow-sm cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-pink-500" />
                <span>Set Up 2 Demo Participants</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Clean Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-pink-100/80">
          <div className="bg-white/80 rounded-2xl p-4 border border-pink-100 shadow-sm text-center">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-[#1e1b2e]">{totalCount}</div>
            <div className="text-xs font-medium text-purple-900/60 mt-0.5">People</div>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-pink-100 shadow-sm text-center">
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-2">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div className="text-2xl font-bold text-pink-600">{optedInCount}</div>
            <div className="text-xs font-medium text-purple-900/60 mt-0.5">Opted In</div>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-pink-100 shadow-sm text-center">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-2">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-[#1e1b2e]">{notInvitedCount}</div>
            <div className="text-xs font-medium text-purple-900/60 mt-0.5">Not Invited</div>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-pink-100 shadow-sm text-center">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-[#1e1b2e]">{simulationsCount}</div>
            <div className="text-xs font-medium text-purple-900/60 mt-0.5">Simulations</div>
          </div>
        </div>
      </section>

      {/* The 4 Simple Steps */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold text-[#1e1b2e]">How THE TEST Works</h2>
          <p className="text-xs sm:text-sm text-purple-900/60">
            Four simple, transparent steps from candidate discovery to human introduction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div 
                key={s.num}
                className="bg-white rounded-2xl p-6 border border-pink-100/90 shadow-[0_4px_20px_rgba(244,114,182,0.06)] hover:shadow-[0_8px_30px_rgba(244,114,182,0.12)] transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 font-bold text-xs flex items-center justify-center">
                    {s.num}
                  </span>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center shadow-sm`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-bold text-base text-[#1e1b2e]">{s.title}</h3>
                <p className="text-xs text-purple-900/70 leading-relaxed font-normal">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Beginner-Friendly 3-Card Guide */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
            <Terminal className="w-4 h-4" />
            <span>How to Run (It&apos;s Easy!)</span>
          </div>
          <ol className="text-xs text-purple-900/80 space-y-2 list-decimal list-inside leading-relaxed font-medium">
            <li>Open terminal in the project folder</li>
            <li>Run: <code className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-mono-code text-[11px]">npm install</code></li>
            <li>Run: <code className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-mono-code text-[11px]">npm run dev</code></li>
            <li>Open in browser: <code className="bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded font-mono-code text-[11px]">http://localhost:5173/</code></li>
          </ol>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-pink-600 font-bold text-sm">
            <Play className="w-4 h-4 fill-current" />
            <span>How to Check (2 Minutes)</span>
          </div>
          <ol className="text-xs text-purple-900/80 space-y-2 list-decimal list-inside leading-relaxed font-medium">
            <li>Go to <strong>People</strong> → see all 26 peer records</li>
            <li>Go to <strong>Join</strong> → opt in or click 1-click demo setup</li>
            <li>Go to <strong>My Agent</strong> → check exploring status</li>
            <li>Go to <strong>Dates</strong> → run simulation & see results</li>
            <li>Click <strong>Approve Introduction</strong> to unlock links</li>
          </ol>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <HelpCircle className="w-4 h-4" />
            <span>If You Face Any Issue</span>
          </div>
          <ul className="text-xs text-purple-900/80 space-y-2 leading-relaxed font-medium">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Make sure you ran <code className="font-mono-code text-[11px]">npm install</code></span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Server must be running (<code className="font-mono-code text-[11px]">npm run dev</code>)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Open the correct link: <code className="font-mono-code text-[11px]">http://localhost:5173/</code></span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Run <code className="font-mono-code text-[11px]">npm test</code> for automated checks</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Honest Privacy & Architecture Notice */}
      <section className="bg-pink-50/70 border border-pink-200/70 rounded-2xl p-5 sm:p-6 text-purple-900/80 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1e1b2e]">Ethical Safeguards & Disclosures</h4>
            <p className="text-xs text-purple-900/70 mt-0.5">
              This is a local prototype. Preliminary research records remain uninvited until explicit consent is given. Agent conversations are simulated, and human approval is strictly required before any introduction.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-purple-700 border border-pink-200 flex items-center gap-1">
            <Lock className="w-3 h-3 text-pink-500" />
            Zero Inferred Data
          </span>
        </div>
      </section>
    </div>
  );
};
