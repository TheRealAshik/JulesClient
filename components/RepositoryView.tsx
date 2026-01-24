import React, { useState } from 'react';
import { JulesSource, JulesSession } from '../types';
import { 
    CheckCircle2, Code2, Book, Plus, LayoutGrid, 
    Terminal, Filter, Archive, CheckCircle, 
    Clock, Loader2
} from 'lucide-react';

interface RepositoryViewProps {
    source: JulesSource;
    sessions: JulesSession[];
    onSelectSession: (session: JulesSession) => void;
    onCreateNew: () => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({
    source,
    sessions,
    onSelectSession,
    onCreateNew
}) => {
    const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'archived'>('all');
    const [activeTab, setActiveTab] = useState<'overview' | 'environment' | 'knowledge'>('overview');

    // In a real app, you would filter sessions by source ID here.
    // For this mock, we'll just show all sessions to ensure UI is populated if sessions exist.
    const displaySessions = sessions; 

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050505] overflow-y-auto animate-in fade-in duration-300">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
                
                {/* Header Section */}
                <div className="flex flex-col gap-6 mb-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#18181B] border border-white/10 flex items-center justify-center text-zinc-400">
                             <Terminal size={24} />
                        </div>
                        <div>
                             <h1 className="text-2xl font-bold text-white tracking-tight">
                                {source.displayName || source.name.split('/').slice(-2).join('/')}
                             </h1>
                             <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                 <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 font-mono text-zinc-400">
                                    {source.githubRepo?.defaultBranch?.displayName || 'main'}
                                 </span>
                                 <span>•</span>
                                 <span>Updated recently</span>
                             </div>
                        </div>
                     </div>

                     {/* Tabs */}
                     <div className="flex items-center gap-2 border-b border-white/5 pb-0">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all relative top-[1px] border-x border-t
                                ${activeTab === 'overview' 
                                    ? 'bg-[#0E0E11] text-white border-white/5 border-b-[#0E0E11]' 
                                    : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300'}
                            `}
                        >
                            <div className={`rounded-full p-0.5 ${activeTab === 'overview' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-600'}`}>
                                <CheckCircle2 size={14} />
                            </div>
                            Overview
                        </button>
                        
                        <button 
                            onClick={() => setActiveTab('environment')}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all relative top-[1px] border-x border-t
                                ${activeTab === 'environment' 
                                    ? 'bg-[#0E0E11] text-white border-white/5 border-b-[#0E0E11]' 
                                    : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300'}
                            `}
                        >
                            <Code2 size={16} />
                            Environment
                        </button>
                        
                        <button 
                            onClick={() => setActiveTab('knowledge')}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all relative top-[1px] border-x border-t
                                ${activeTab === 'knowledge' 
                                    ? 'bg-[#0E0E11] text-white border-white/5 border-b-[#0E0E11]' 
                                    : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300'}
                            `}
                        >
                            <Book size={16} />
                            Knowledge
                        </button>
                     </div>
                </div>

                {/* Content Area */}
                <div className="bg-[#0E0E11] border border-white/5 rounded-b-2xl rounded-tr-2xl p-6 min-h-[500px]">
                    
                    {activeTab === 'overview' ? (
                        <>
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                                <div className="flex bg-[#18181B] p-1.5 rounded-xl border border-white/5">
                                    <FilterButton label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
                                    <FilterButton label="Scheduled" active={filter === 'scheduled'} onClick={() => setFilter('scheduled')} />
                                    <FilterButton label="Completed" active={filter === 'completed'} onClick={() => setFilter('completed')} />
                                    <FilterButton label="Archived" active={filter === 'archived'} onClick={() => setFilter('archived')} />
                                </div>

                                <button 
                                    onClick={onCreateNew}
                                    className="w-10 h-10 flex items-center justify-center bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 border border-white/10"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {/* Empty State / List */}
                            {displaySessions.length === 0 ? (
                                <div className="h-[400px] flex flex-col items-center justify-center bg-[#121215] border border-white/5 rounded-xl border-dashed">
                                    <div className="w-16 h-16 rounded-2xl bg-[#18181B] flex items-center justify-center text-zinc-600 mb-4 shadow-inner">
                                        <LayoutGrid size={32} />
                                    </div>
                                    <h3 className="text-zinc-400 font-medium text-sm">No active sessions</h3>
                                    <p className="text-zinc-600 text-xs mt-1">Once created, active sessions will show up here</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {displaySessions.map(session => (
                                        <button 
                                            key={session.name}
                                            onClick={() => onSelectSession(session)}
                                            className="group flex flex-col items-start p-4 bg-[#18181B] hover:bg-[#202024] border border-white/5 hover:border-white/10 rounded-xl transition-all text-left relative overflow-hidden"
                                        >
                                            <div className="flex w-full justify-between items-start mb-3 z-10">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                                                    <Terminal size={14} />
                                                </div>
                                                <div className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-zinc-500 border border-white/5">
                                                    {new Date(session.createTime).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <h3 className="text-zinc-200 font-medium text-sm line-clamp-2 mb-2 group-hover:text-white transition-colors z-10 leading-snug">
                                                {session.title || session.prompt}
                                            </h3>
                                            <div className="mt-auto flex items-center gap-2 text-xs text-zinc-500 z-10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                <span className="font-medium text-zinc-400">Active</span>
                                            </div>
                                            
                                            {/* Hover Glow */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                    
                                    {/* Create New Card (Placeholder style) */}
                                    <button 
                                        onClick={onCreateNew}
                                        className="group flex flex-col items-center justify-center p-4 bg-transparent border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 rounded-xl transition-all text-left border-dashed gap-3"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-indigo-500/20 text-zinc-500 group-hover:text-indigo-400 flex items-center justify-center transition-colors">
                                            <Plus size={18} />
                                        </div>
                                        <span className="text-xs font-medium text-zinc-500 group-hover:text-indigo-300">Create new session</span>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                                <Loader2 size={24} className="text-zinc-600 animate-spin" />
                            </div>
                            <span className="text-zinc-500 text-sm">Loading module...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const FilterButton = ({ label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            active ? 'bg-[#27272A] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
        }`}
    >
        {label}
    </button>
);