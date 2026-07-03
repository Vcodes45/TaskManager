import { useState, useEffect } from 'react';
import { FiClock, FiGlobe } from 'react-icons/fi';
import GlassCard from './GlassCard';

const API_KEY = 'wEfjstyAQrMJ1lq113taVOpwGM2J9pYzvu8osiDy';

const COMMON_TIMEZONES = [
  { label: 'Local Time', value: 'local' },
  { label: 'New York', value: 'America/New_York' },
  { label: 'London', value: 'Europe/London' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Sydney', value: 'Australia/Sydney' },
  { label: 'Dubai', value: 'Asia/Dubai' },
  { label: 'India', value: 'Asia/Kolkata' },
];

export default function WorldClock() {
  const [selectedZone, setSelectedZone] = useState('local');
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [offsetTime, setOffsetTime] = useState(null); // The exact Date object synced to the timezone

  // Fetch timezone data when selection changes (if not local)
  useEffect(() => {
    let interval;
    
    if (selectedZone === 'local') {
      setOffsetTime(null);
      // Just run a standard local clock
      interval = setInterval(() => {
        setTime(new Date());
      }, 1000);
    } else {
      // Fetch from API Ninjas
      const fetchTimezone = async () => {
        setLoading(true);
        try {
          const response = await fetch(`https://api.api-ninjas.com/v1/timezone?timezone=${selectedZone}`, {
            headers: {
              'X-Api-Key': API_KEY
            }
          });
          const data = await response.json();
          if (data && data.datetime) {
            // data.datetime format is usually "YYYY-MM-DD HH:MM:SS"
            // We parse it into a local date object so we can tick it
            const parsedDate = new Date(data.datetime);
            setOffsetTime(parsedDate);
            setTime(parsedDate);
          }
        } catch (error) {
          console.error("Failed to fetch timezone from API Ninjas", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTimezone();
      
      // Tick the clock locally after fetching the initial time
      interval = setInterval(() => {
        setOffsetTime(prev => {
          if (!prev) return prev;
          const newTime = new Date(prev.getTime() + 1000);
          setTime(newTime);
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [selectedZone]);

  // Format the time for display
  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return { time: `${hours}:${minutes}:${seconds}`, ampm };
  };

  const formatted = formatTime(time);

  return (
    <GlassCard className="flex flex-col h-full bg-gradient-to-br from-surface-elevated to-surface">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
            <FiGlobe size={18} />
          </div>
          <h2 className="font-semibold">World Clock</h2>
        </div>
        
        <select 
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="bg-surface border border-[var(--color-border-light)] text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-primary text-[var(--color-text-secondary)]"
        >
          {COMMON_TIMEZONES.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {loading ? (
          <div className="animate-pulse w-32 h-10 bg-[var(--color-text-primary)]/5 rounded-lg"></div>
        ) : (
          <div className="text-center">
            <div className="text-4xl font-mono font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">
              {formatted.time}
              <span className="text-lg ml-2 text-[var(--color-text-muted)]">{formatted.ampm}</span>
            </div>
            {selectedZone !== 'local' && (
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Synced via API Ninjas
              </p>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
