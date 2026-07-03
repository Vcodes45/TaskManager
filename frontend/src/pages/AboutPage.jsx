import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import logo from '../assets/logo.jpg';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] pt-16 px-4 pb-12 overflow-y-auto parallax-dashboard relative">
      <div className="max-w-4xl mx-auto space-y-12 relative z-10 py-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <img 
              src={logo} 
              alt="Kal Se Logo" 
              className="w-48 h-48 md:w-64 md:h-64 rounded-3xl shadow-2xl object-cover border-4 border-white/10"
            />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-text-primary"
          >
            Productivity starts... <span className="text-accent">Kal Se.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl text-text-secondary max-w-2xl mx-auto"
          >
            Embracing the human side of getting things done.
          </motion.p>
        </div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard className="p-8 md:p-10 space-y-6">
            <h2 className="text-2xl font-bold text-text-primary border-b border-border-light pb-4">
              Our Story & The Sloth
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed text-lg">
              <p>
                Let's be honest. We've all looked at a massive to-do list and thought, 
                <strong className="text-text-primary"> "I'll just start tomorrow."</strong> (Kal se).
              </p>
              <p>
                In a world obsessed with toxic hustle culture, grinding 24/7, and maximizing every waking second, 
                we decided to take a step back. Our mascot, the sleepy but organized sloth, perfectly represents 
                our philosophy. Holding a clipboard and a calendar, the sloth knows exactly what needs to be done—but 
                isn't going to stress out about it.
              </p>
              <p>
                <strong className="text-text-primary">Kal Se</strong> isn't just about delaying tasks; it's about 
                managing them at your own pace. It's a guilt-free productivity system that uses AI to help you 
                organize, prioritize, and eventually conquer your goals without burning out.
              </p>
              <p>
                Because sometimes, the best way to be productive is to simply accept that productivity starts... Kal Se.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <GlassCard className="p-6 text-center space-y-3 hover:-translate-y-1 transition-transform">
            <div className="text-3xl mb-4">🦥</div>
            <h3 className="font-bold text-text-primary text-lg">Guilt-Free Pacing</h3>
            <p className="text-text-secondary text-sm">Move tasks to tomorrow without the anxiety. We manage the backlog while you rest.</p>
          </GlassCard>
          
          <GlassCard className="p-6 text-center space-y-3 hover:-translate-y-1 transition-transform">
            <div className="text-3xl mb-4">🧠</div>
            <h3 className="font-bold text-text-primary text-lg">AI Prioritization</h3>
            <p className="text-text-secondary text-sm">Our AI figures out what actually needs your attention today and what can wait until "Kal".</p>
          </GlassCard>

          <GlassCard className="p-6 text-center space-y-3 hover:-translate-y-1 transition-transform">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="font-bold text-text-primary text-lg">Calm Organization</h3>
            <p className="text-text-secondary text-sm">A beautiful, distraction-free environment that makes checking off tasks feel natural.</p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
