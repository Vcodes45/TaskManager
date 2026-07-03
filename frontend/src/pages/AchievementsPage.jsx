import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gamificationService } from '../services/statsService';
import { useAppStore } from '../store/useAppStore';
import GlassCard from '../components/ui/GlassCard';
import { FiAward, FiLock, FiStar } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userStats } = useAppStore();

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const data = await gamificationService.getAchievements();
        setAchievements(data.achievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const levelProgress = userStats.xp % 100;
  
  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">Achievements</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Track your progress and unlock badges</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <GlassCard className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-surface-elevated/80 to-surface">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-6">Current Level</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-primary flex items-center justify-center shadow-lg shadow-primary/20 border-4 border-surface">
                <span className="text-3xl font-bold text-[var(--color-text-primary)]">{userStats.level}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-lg">{userStats.xp} Total XP</span>
                  <span className="text-[var(--color-text-secondary)] text-sm">Level {userStats.level + 1}</span>
                </div>
                <div className="progress-bar-custom bg-[var(--color-text-primary)]/10 w-full h-3">
                  <div 
                    className="progress-bar-fill bg-gradient-to-r from-blue-400 to-primary" 
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mt-2">{100 - levelProgress} XP until next level</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-center items-center text-center">
          <div className="p-4 bg-[var(--color-warning-dim)] text-[var(--color-warning)] rounded-full mb-4">
            <FiStar size={32} />
          </div>
          <h3 className="text-xl font-bold mb-1">{userStats.current_streak} Day Streak</h3>
          <p className="text-[var(--color-text-secondary)] text-sm">Keep it up! Longest streak: {userStats.longest_streak}</p>
        </GlassCard>
      </div>

      <h2 className="text-2xl font-bold mb-6">Badges</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <GlassCard 
            key={achievement.id} 
            className={`transition-all ${achievement.unlocked_at ? 'border-primary/30 bg-primary/5 hover:border-primary/50' : 'opacity-60 grayscale'}`}
          >
            <div className="flex gap-4">
              <div className={`p-4 rounded-xl shrink-0 h-16 w-16 flex items-center justify-center ${
                achievement.unlocked_at 
                  ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 text-[var(--color-warning)] shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                  : 'bg-[var(--color-text-primary)]/5 text-[var(--color-text-muted)]'
              }`}>
                {achievement.unlocked_at ? <FiAward size={28} /> : <FiLock size={28} />}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight mb-1">{achievement.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-snug">{achievement.description}</p>
                {achievement.unlocked_at && (
                  <p className="text-[10px] text-primary mt-2 font-medium">
                    Unlocked {format(parseISO(achievement.unlocked_at), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
