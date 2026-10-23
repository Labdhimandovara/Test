import React from 'react';
import { Heart, Home, Users, UserPlus, Bot, Database } from 'lucide-react';

export type ActiveTab = 'overview' | 'directory' | 'onboarding' | 'my-agent' | 'agent-lab' | 'data-management';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  totalProfiles: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  totalProfiles,
}) => {
  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Home', icon: Home },
    { id: 'directory' as ActiveTab, label: 'People', icon: Users, badge: totalProfiles },
    { id: 'onboarding' as ActiveTab, label: 'Join', icon: UserPlus },
    { id: 'my-agent' as ActiveTab, label: 'My Agent', icon: Bot },
    { id: 'agent-lab' as ActiveTab, label: 'Dates', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-[0_2px_15px_rgba(244,114,182,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Cute Tagline */}
          <div 
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-editorial text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  THE TEST
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-pink-500 border border-pink-200">
                  Demo
                </span>
              </div>
              <p className="text-[11px] text-purple-900/60 font-medium hidden sm:block">
                Let your agent find the vibe ✨
              </p>
            </div>
          </div>

          {/* Centered Cute Navigation Pills */}
          <nav className="flex items-center gap-1 sm:gap-1.5 bg-pink-50/60 p-1 rounded-2xl border border-pink-100/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-500/25 scale-[1.02]'
                      : 'text-purple-900/70 hover:text-pink-600 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive && item.id === 'agent-lab' ? 'fill-current' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-pink-100 text-pink-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Clean Data Menu toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange('data-management')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeTab === 'data-management'
                  ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-sm'
                  : 'bg-white text-purple-800/60 border-purple-100/80 hover:bg-purple-50 hover:text-purple-700'
              }`}
              title="Advanced Data Import & Export"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Data & Import</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
