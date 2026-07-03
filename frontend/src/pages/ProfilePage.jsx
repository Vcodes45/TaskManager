import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToastStore } from '../components/ui/ToastManager';
import GlassCard from '../components/ui/GlassCard';
import { FiCamera, FiSave, FiUser, FiMail, FiEdit2 } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profile_picture: user?.profile_picture || ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast({ type: 'error', title: 'File too large', message: 'Please upload an image smaller than 2MB.' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profile_picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      addToast({ type: 'success', title: 'Profile Updated', message: 'Your profile has been saved successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast({ type: 'error', title: 'Update Failed', message: 'Could not update your profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">Your Profile</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Manage your personal information and display picture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Picture */}
        <div className="md:col-span-1">
          <GlassCard className="flex flex-col items-center text-center p-6">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-2xl shadow-primary/20 bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-4xl font-bold text-[var(--color-text-primary)] relative">
                {formData.profile_picture ? (
                  <img 
                    src={formData.profile_picture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
                
                {/* Upload Overlay */}
                <div 
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiCamera size={24} className="mb-1" />
                  <span className="text-xs font-medium">Change</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">{user?.email}</p>
            
            <div className="flex gap-2 justify-center w-full">
              <div className="bg-surface border border-[var(--color-border-light)] rounded-xl p-3 flex-1">
                <p className="text-xs text-[var(--color-text-secondary)] mb-1">Level</p>
                <p className="font-bold text-lg text-primary">{user?.level}</p>
              </div>
              <div className="bg-surface border border-[var(--color-border-light)] rounded-xl p-3 flex-1">
                <p className="text-xs text-[var(--color-text-secondary)] mb-1">Streak</p>
                <p className="font-bold text-lg text-[var(--color-warning)]">{user?.current_streak}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2">
          <GlassCard>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FiEdit2 className="text-primary" /> Edit Details
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                    <FiUser size={14} /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface border-[var(--color-border-light)] rounded-xl px-4 py-3 focus:border-primary transition-colors text-[var(--color-text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                    <FiMail size={14} /> Email Address (Read-Only)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-surface/50 border-[var(--color-border-light)] rounded-xl px-4 py-3 text-[var(--color-text-secondary)] cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Bio / About Me
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us a bit about yourself..."
                  className="w-full bg-surface border-[var(--color-border-light)] rounded-xl px-4 py-3 focus:border-primary transition-colors text-[var(--color-text-primary)] resize-none"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--color-border-light)]">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-[var(--color-text-primary)] px-6 py-2.5 rounded-xl transition shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FiSave />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
