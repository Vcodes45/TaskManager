import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { taskService } from '../services/taskService';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import GlassCard from '../components/ui/GlassCard';

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await taskService.getTasks();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const pendingCount = tasks.filter(t => t.status === 'Pending' || t.status === 'Todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  
  const pieData = [
    { name: 'Completed', value: completedCount, color: '#10b981' },
    { name: 'In Progress', value: inProgressCount, color: '#3b82f6' },
    { name: 'Pending', value: pendingCount, color: '#8b5cf6' },
  ];

  const dummyBarData = [
    { name: 'Mon', tasks: 4 },
    { name: 'Tue', tasks: 7 },
    { name: 'Wed', tasks: 2 },
    { name: 'Thu', tasks: 9 },
    { name: 'Fri', tasks: 5 },
    { name: 'Sat', tasks: 1 },
    { name: 'Sun', tasks: 3 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">Analytics</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Detailed productivity insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="col-span-1 h-[300px] flex flex-col">
          <h2 className="text-xl font-bold mb-4">Task Distribution</h2>
          <div className="flex-1 w-full h-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#12121a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold">{tasks.length}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Total</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="col-span-2 h-[300px] flex flex-col">
          <h2 className="text-xl font-bold mb-4">Weekly Output</h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dummyBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#12121a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="tasks" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
