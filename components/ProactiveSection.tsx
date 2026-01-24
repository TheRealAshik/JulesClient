import React, { useState } from 'react';
import { Lightbulb, Clock, Zap, Palette, ShieldCheck, ListTodo, Rocket, MoreHorizontal } from 'lucide-react';

export const ProactiveSection: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="mt-4 space-y-6">
      
      {/* Tabs - Scrollable on mobile */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          <TabButton label="Repo overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <TabButton label="Suggested" isActive={activeTab === 'suggested'} onClick={() => setActiveTab('suggested')} />
          <TabButton label="Scheduled" isActive={activeTab === 'scheduled'} onClick={() => setActiveTab('scheduled')} />
      </div>

      {/* Auto Find Issues Toggle Card - Improved Hierarchy */}
      <div className="bg-[#161619] rounded-xl p-4 border border-white/5 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
             <div className="w-10 h-10 rounded-full bg-[#1e1e22] border border-white/5 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Lightbulb size={20} />
             </div>
             <div className="flex flex-col">
                 <div className="text-[15px] font-medium text-zinc-100 leading-snug">
                    Automatically find issues
                 </div>
                 <div className="text-xs text-zinc-500">
                    Scan codebase for bugs & improvements
                 </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <span className="text-xs font-mono text-zinc-600 hidden sm:block">0/5</span>
             <button 
               onClick={() => setIsEnabled(!isEnabled)}
               className={`
                  w-11 h-6 rounded-full relative transition-colors duration-300 ease-in-out focus:outline-none 
                  ${isEnabled ? 'bg-indigo-600' : 'bg-[#27272a]'}
               `}
             >
                <span 
                    className={`
                        absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300
                        ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
                    `} 
                />
             </button>
          </div>
      </div>

      {/* Sessions Section */}
      <div className="space-y-3">
         <div className="flex items-center gap-2 px-1">
            <ListTodo size={16} className="text-zinc-500" />
            <h2 className="text-sm font-medium text-textMuted">Sessions</h2>
         </div>

         {/* Active Session Card */}
         <div className="bg-[#161619] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all cursor-pointer group shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                        <Rocket size={16} />
                    </div>
                    <span className="text-sm font-medium text-zinc-200 truncate">ROLE: Senior Engineer Bot</span>
                </div>
                <button className="text-zinc-500 hover:text-white transition-colors">
                    <MoreHorizontal size={16} />
                </button>
            </div>
            
            <div className="flex items-center justify-between gap-4 pl-1">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" />
                    </div>
                    <span className="font-medium">Running Tests...</span>
                </div>
                
                {/* Progress Bar */}
                <div className="flex-1 max-w-[120px] h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[60%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                </div>
            </div>
         </div>
      </div>

      {/* Schedule Section */}
      <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
             <Clock size={16} className="text-zinc-500" />
             <h2 className="text-sm font-medium text-textMuted">Schedule</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full">
             <CategoryPill icon={<Zap size={14} />} label="Performance" />
             <CategoryPill icon={<Palette size={14} />} label="Design" />
             <CategoryPill icon={<ShieldCheck size={14} />} label="Security" />
          </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`
            px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0
            ${isActive 
                ? 'bg-[#27272A] text-white border border-white/10 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
        `}
    >
        {label}
    </button>
);

const CategoryPill: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <button className="
        flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap
        bg-[#161619] text-zinc-400 border-white/5 hover:bg-[#1E1E22] hover:text-zinc-200 hover:border-white/10 active:scale-95
    ">
        {icon}
        <span>{label}</span>
    </button>
);