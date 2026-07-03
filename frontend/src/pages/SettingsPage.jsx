import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/useAppStore';
import GlassCard from '../components/ui/GlassCard';
import { FiMonitor, FiUser, FiBell, FiShield, FiCheck, FiCalendar } from 'react-icons/fi';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../services/api';

const themes = [
  { id: 'dark', name: 'Dark Mode', color: '#0a0a0f' },
  { id: 'light', name: 'Light Mode', color: '#f4f4f5' },
  { id: 'amoled', name: 'AMOLED Black', color: '#000000' },
  { id: 'ocean', name: 'Deep Ocean', color: '#083344' },
  { id: 'purple', name: 'Nebula', color: '#2e1065' },
  { id: 'forest', name: 'Midnight Forest', color: '#022c22' },
  { id: 'sunset', name: 'Sunset', color: '#451a03' }
];

export default function SettingsPage() {
  const { user, fetchProfile } = useAuth();
  const { settings, updateSettings } = useAppStore();
  const [activeTab, setActiveTab] = useState('appearance');
  const [isConnecting, setIsConnecting] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(!!user?.settings?.google_refresh_token);

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    prompt: 'consent',
    onSuccess: async (codeResponse) => {
      try {
        setIsConnecting(true);
        const res = await api.post(`/calendar/connect?auth_code=${codeResponse.code}`);
        if (res.data.has_refresh_token) {
          setCalendarConnected(true);
          if (fetchProfile) fetchProfile(); // Update user object in AuthContext
          alert('Google Calendar connected successfully!');
        }
      } catch (error) {
        alert('Failed to connect Google Calendar: ' + (error.response?.data?.detail || error.message));
      } finally {
        setIsConnecting(false);
      }
    },
    onError: errorResponse => console.log(errorResponse),
  });

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">Settings</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          {[
            { id: 'profile', label: 'Profile', icon: FiUser },
            { id: 'appearance', label: 'Appearance', icon: FiMonitor },
            { id: 'notifications', label: 'Notifications', icon: FiBell },
            { id: 'privacy', label: 'Privacy & Security', icon: FiShield },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-text-primary)]/5 hover:text-[var(--color-text-primary)] border border-transparent'
              }`}
            >
              <tab.icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard>
                <h2 className="text-xl font-bold mb-6">Theme Settings</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {themes.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => updateSettings({ theme: theme.id })}
                      className={`relative p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                        settings.theme === theme.id 
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                          : 'border-[var(--color-border-light)] hover:border-[var(--color-text-primary)]/30 bg-surface'
                      }`}
                    >
                      <div 
                        className="w-12 h-12 rounded-full border border-[var(--color-border)] shadow-inner" 
                        style={{ backgroundColor: theme.color }} 
                      />
                      <span className="text-sm font-medium">{theme.name}</span>
                      {settings.theme === theme.id && (
                        <div className="absolute top-2 right-2 text-primary">
                          <FiCheck size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </GlassCard>
              
              <GlassCard className="mt-6">
                <h2 className="text-xl font-bold mb-6">Pomodoro Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Work Duration (minutes)</label>
                    <input 
                      type="number" 
                      value={settings.workDuration}
                      onChange={(e) => updateSettings({ workDuration: parseInt(e.target.value) || 25 })}
                      className="bg-surface border border-[var(--color-border-light)] rounded-lg px-4 py-2 w-full max-w-[200px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Short Break (minutes)</label>
                    <input 
                      type="number" 
                      value={settings.shortBreakDuration}
                      onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) || 5 })}
                      className="bg-surface border border-[var(--color-border-light)] rounded-lg px-4 py-2 w-full max-w-[200px]"
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard>
                <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-3xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{user?.name}</h3>
                    <p className="text-[var(--color-text-secondary)]">{user?.email}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                      Premium Member
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Full Name</label>
                    <input type="text" readOnly value={user?.name || ''} className="bg-surface border border-[var(--color-border-light)] rounded-lg px-4 py-2 w-full opacity-70" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Email Address</label>
                    <input type="email" readOnly value={user?.email || ''} className="bg-surface border border-[var(--color-border-light)] rounded-lg px-4 py-2 w-full opacity-70" />
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-[var(--color-border-light)]">
                  <h3 className="text-lg font-bold mb-4">Integrations</h3>
                  <div className="flex items-center justify-between p-4 border border-[var(--color-border-light)] rounded-xl bg-surface">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <FiCalendar size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--color-text-primary)]">Google Calendar</h4>
                        <p className="text-sm text-[var(--color-text-secondary)]">Sync tasks directly to your calendar</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => googleLogin()}
                      disabled={isConnecting || calendarConnected}
                      className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {isConnecting ? 'Connecting...' : calendarConnected ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
          
          {(activeTab === 'notifications' || activeTab === 'privacy') && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="text-center py-20">
                <FiMonitor size={48} className="mx-auto text-[var(--color-text-muted)] mb-4" />
                <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                <p className="text-[var(--color-text-secondary)]">These settings will be available in the next update.</p>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
