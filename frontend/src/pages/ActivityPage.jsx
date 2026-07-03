import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { statsService } from '../services/statsService';
import GlassCard from '../components/ui/GlassCard';
import { format, parseISO } from 'date-fns';
import { FiActivity, FiChevronRight } from 'react-icons/fi';

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const fetchActivities = async (currentSkip) => {
    try {
      const data = await statsService.getActivities(currentSkip, limit);
      if (currentSkip === 0) {
        setActivities(data.activities);
      } else {
        setActivities(prev => [...prev, ...data.activities]);
      }
      setHasMore(data.activities.length === limit);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(0);
  }, []);

  const loadMore = () => {
    const nextSkip = skip + limit;
    setSkip(nextSkip);
    fetchActivities(nextSkip);
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">Activity Log</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Your detailed timeline of productivity</p>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-[var(--color-border-light)] bg-surface-elevated/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <FiActivity size={20} />
            </div>
            <h2 className="font-bold text-lg">Timeline</h2>
          </div>
          <span className="text-sm text-[var(--color-text-secondary)]">{activities.length} entries</span>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {activities.map((activity, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={activity.id} 
                className="flex items-start space-x-6 border-l-2 border-[var(--color-border-light)] pl-6 relative ml-3"
              >
                <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-surface border-4 border-primary"></div>
                <div className="bg-surface-elevated/30 border border-[var(--color-border-light)] rounded-xl p-4 flex-1 hover:border-[var(--color-border-light)] transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-[15px]">{activity.description}</p>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      +{activity.xp_earned} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {format(parseISO(activity.timestamp), 'EEEE, MMMM d, yyyy • h:mm a')}
                    </p>
                    <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider">{activity.action_type}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {activities.length === 0 && !loading && (
              <div className="text-center py-12 text-[var(--color-text-secondary)]">
                <FiActivity size={48} className="mx-auto mb-4 opacity-20" />
                <p>No activity recorded yet.</p>
              </div>
            )}
          </div>
          
          {hasMore && activities.length > 0 && (
            <div className="mt-10 text-center">
              <button 
                onClick={loadMore}
                className="px-6 py-2 rounded-full border border-[var(--color-border-light)] hover:border-primary/50 text-[var(--color-text-secondary)] hover:text-primary transition-all flex items-center justify-center gap-2 mx-auto"
              >
                Load More <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
