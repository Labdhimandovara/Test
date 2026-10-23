import { useState, useCallback } from 'react';
import { profileRepo } from './services/profileRepository';
import type { Profile, DataStatus } from './types/profile';
import { Header, type ActiveTab } from './components/common/Header';
import { LandingOverview } from './components/overview/LandingOverview';
import { PeopleDirectory } from './components/directory/PeopleDirectory';
import { PersonDetailModal } from './components/detail/PersonDetailModal';
import { EditProfileModal } from './components/dataManagement/EditProfileModal';
import { AgentLabPreview } from './components/agentLab/AgentLabPreview';
import { DataManagementView } from './components/dataManagement/DataManagementView';
import { ParticipantOnboardingView } from './components/onboarding/ParticipantOnboardingView';
import { MyAgentView } from './components/myAgent/MyAgentView';
import { Shield, Heart } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [profiles, setProfiles] = useState<Profile[]>(() => profileRepo.getAll());
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [claimedProfileId, setClaimedProfileId] = useState<string>(() => {
    const enrolled = profileRepo.getAll().find(p => p.participationStatus === 'enrolled');
    return enrolled?.id || profileRepo.getAll()[0]?.id || '';
  });

  const refreshProfiles = useCallback(() => {
    const updated = profileRepo.getAll();
    setProfiles(updated);
    if (selectedProfile) {
      const refreshedSelected = updated.find(p => p.id === selectedProfile.id);
      setSelectedProfile(refreshedSelected || null);
    }
  }, [selectedProfile]);

  const handleUpdateStatus = (id: string, newStatus: DataStatus) => {
    profileRepo.updateDataStatus(id, newStatus);
    refreshProfiles();
  };

  const handleConfirmIdentity = (id: string, confirmed: boolean, notes?: string) => {
    const profile = profileRepo.getById(id);
    if (profile) {
      profileRepo.updateProfile(id, {
        verification: {
          ...profile.verification,
          identityCorrespondenceConfirmed: confirmed,
          manualReviewNotes: notes || profile.verification?.manualReviewNotes,
          lastAuditedAt: new Date().toISOString(),
        },
      });
      refreshProfiles();
    }
  };

  const handleResetToSeed = () => {
    if (window.confirm('Reset dataset to the authentic 26 candidate records? Any manual changes will be reset.')) {
      profileRepo.resetToSeedData();
      refreshProfiles();
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7fc] text-[#1e1b2e] flex flex-col justify-between selection:bg-pink-500/20 selection:text-pink-600">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalProfiles={profiles.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <LandingOverview
            profiles={profiles}
            onNavigate={setActiveTab}
            onRefresh={refreshProfiles}
          />
        )}

        {activeTab === 'directory' && (
          <PeopleDirectory
            profiles={profiles}
            onSelectProfile={setSelectedProfile}
            onRefresh={refreshProfiles}
            onNavigateToOnboarding={() => setActiveTab('onboarding')}
          />
        )}

        {activeTab === 'onboarding' && (
          <ParticipantOnboardingView
            profiles={profiles}
            currentProfileId={claimedProfileId}
            onSelectCurrentProfile={setClaimedProfileId}
            onRefresh={refreshProfiles}
            onNavigateToAgent={() => setActiveTab('my-agent')}
          />
        )}

        {activeTab === 'my-agent' && (
          <MyAgentView
            profiles={profiles}
            currentProfileId={claimedProfileId}
            onSelectCurrentProfile={setClaimedProfileId}
            onNavigateToOnboarding={() => setActiveTab('onboarding')}
            onNavigateToLab={() => setActiveTab('agent-lab')}
            onRefresh={refreshProfiles}
          />
        )}

        {activeTab === 'agent-lab' && (
          <AgentLabPreview
            profiles={profiles}
            onRefresh={refreshProfiles}
            onNavigateToOnboarding={() => setActiveTab('onboarding')}
          />
        )}

        {activeTab === 'data-management' && (
          <DataManagementView
            profiles={profiles}
            onReload={refreshProfiles}
            onResetToSeed={handleResetToSeed}
            onSelectProfile={setSelectedProfile}
          />
        )}
      </main>

      {/* Person Detail Inspection Modal */}
      <PersonDetailModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onUpdateStatus={handleUpdateStatus}
        onEditProfile={(p) => setEditingProfile(p)}
        onConfirmIdentity={handleConfirmIdentity}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        profile={editingProfile}
        isOpen={editingProfile !== null}
        onClose={() => setEditingProfile(null)}
        onProfileUpdated={refreshProfiles}
      />

      {/* Cute Friendly Footer */}
      <footer className="border-t border-pink-100 bg-white/80 backdrop-blur-sm py-6 text-xs text-purple-900/60 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
              <Heart className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              THE TEST
            </span>
            <span className="text-pink-300">|</span>
            <span>Let your agent find the vibe 💗</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Shield className="w-3.5 h-3.5" />
              <span>Ethical AI Guardrails Enforced</span>
            </span>
            <span className="hidden md:inline text-pink-200">•</span>
            <span className="flex items-center gap-1 text-pink-600">
              <span>Human Approval Always Required</span>
              <Heart className="w-3 h-3 fill-current ml-0.5" />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
