import React, { useState } from 'react';
import { Lightbulb, Clock, Zap, Palette, ShieldCheck, ListTodo, Rocket, MoreHorizontal, Circle, Settings, Info, CheckCircle2, Target } from 'lucide-react';
import { JulesSession } from '../types';

interface ProactiveSectionProps {
    sessions?: JulesSession[];
    onSelectSession?: (session: JulesSession) => void;
}

// Helper function to get readable status text
const getSessionStatusText = (state: JulesSession['state']): string => {
    switch (state) {
        case 'QUEUED': return 'Queued';
        case 'PLANNING': return 'Planning...';
        case 'AWAITING_PLAN_APPROVAL': return 'Jules is waiting for you to review...';
        case 'AWAITING_USER_FEEDBACK': return 'Jules needs your feedback...';
        case 'IN_PROGRESS': return 'Working on task...';
        case 'PAUSED': return 'Paused';
        case 'COMPLETED': return 'Completed';
        case 'FAILED': return 'Failed';
        default: return 'Unknown status';
    }
};

export const ProactiveSection: React.FC<ProactiveSectionProps> = ({ sessions = [], onSelectSession }) => {
    const [activeTab, setActiveTab] = useState('overview');

    // Filter active sessions
    const activeSessions = sessions.filter(s =>
        ['QUEUED', 'PLANNING', 'AWAITING_PLAN_APPROVAL', 'AWAITING_USER_FEEDBACK', 'IN_PROGRESS', 'PAUSED'].includes(s.state)
    );

    return (
        <div className="mt-4 space-y-6">

            {/* Tabs - Scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <TabButton label="Repo overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <TabButton label="Suggested" isActive={activeTab === 'suggested'} onClick={() => setActiveTab('suggested')} />
                <TabButton label="Scheduled" isActive={activeTab === 'scheduled'} onClick={() => setActiveTab('scheduled')} />
            </div>

            {/* Top Suggestions Card (Replacing Auto Find) */}
            <div className="bg-[#161619] rounded-xl p-5 border border-white/5 relative overflow-hidden group">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                        <Lightbulb className="text-zinc-100 mt-1" size={18} />
                        <h3 className="text-[15px] font-medium text-zinc-200 max-w-[240px] leading-snug">
                            Top suggestions to continuously improve your codebase
                        </h3>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                        <span className="hidden sm:inline">Configure suggestions</span>
                        <Settings size={14} />
                    </button>
                </div>

                {/* Content (Empty State) */}
                <div className="flex items-center gap-3 py-1 text-zinc-400">
                    <Info size={16} className="text-zinc-500" />
                    <span className="text-[13px]">No proactive suggestions found at this time.</span>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-1">
                    <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-medium">View more</button>
                </div>
            </div>

            {/* Sessions List Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <ListTodo size={18} className="text-zinc-100" />
                    <h2 className="text-[15px] font-medium text-white">Sessions</h2>
                </div>

                {activeSessions.length > 0 ? (
                    <div className="space-y-3">
                        {activeSessions.slice(0, 3).map(session => (
                            <div
                                key={session.name}
                                onClick={() => onSelectSession?.(session)}
                                className="bg-[#161619] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all cursor-pointer group shadow-sm"
                            >
                                <div className="flex flex-col gap-2">
                                    {/* Title Row */}
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                            <Target size={10} className="text-red-400" />
                                        </div>
                                        <span className="text-[15px] font-bold text-zinc-200 truncate uppercase tracking-wide">
                                            {session.title || 'UNTITLED SESSION'}
                                        </span>
                                    </div>

                                    {/* Status Row */}
                                    <div className="flex items-center justify-between pl-6 mt-1">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <CheckCircle2 size={14} className="text-indigo-400" />
                                            <span className="text-[13px] leading-snug text-zinc-400">
                                                {getSessionStatusText(session.state)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {(session.state === 'AWAITING_PLAN_APPROVAL' || session.state === 'AWAITING_USER_FEEDBACK') && (
                                                <button className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-lg text-xs font-medium transition-colors">
                                                    Review
                                                </button>
                                            )}
                                            <button className="text-zinc-600 hover:text-zinc-300 transition-colors p-1">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Footer Link */}
                                    <div className="pl-6 mt-2">
                                        <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">View more</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-zinc-500 text-sm px-1 py-4 text-center border border-dashed border-white/5 rounded-xl">
                        No active sessions
                    </div>
                )}
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