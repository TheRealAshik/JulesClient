import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown, ChevronRight, MoreHorizontal, Github, FileText, CheckCircle2, Disc, ArrowUp } from 'lucide-react';
import { JulesSession, JulesSource } from '../types';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: JulesSession[];
    sources: JulesSource[];
    currentSessionId?: string;
    currentSourceId?: string;
    onSelectSession: (session: JulesSession) => void;
    onSelectSource: (source: JulesSource) => void;
}

export const Drawer: React.FC<DrawerProps> = ({ 
    isOpen, 
    onClose, 
    sessions, 
    sources, 
    currentSessionId,
    currentSourceId,
    onSelectSession,
    onSelectSource
}) => {
    const [isSessionsOpen, setIsSessionsOpen] = useState(true);
    const [isCodebasesOpen, setIsCodebasesOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter logic
    const filteredSessions = sessions.filter(session => {
        const query = searchQuery.toLowerCase();
        return (session.title?.toLowerCase().includes(query) || 
                session.prompt?.toLowerCase().includes(query));
    });

    const filteredSources = sources.filter(source => {
        const query = searchQuery.toLowerCase();
        const displayName = source.displayName || source.name;
        return displayName.toLowerCase().includes(query);
    });

    // Auto-expand on search
    useEffect(() => {
        if (searchQuery) {
            setIsSessionsOpen(true);
            setIsCodebasesOpen(true);
        }
    }, [searchQuery]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
            
            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 w-[320px] bg-[#0E0E11] z-50 flex flex-col border-r border-white/5 animate-in slide-in-from-left duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <img src="https://jules.google/squid.png" alt="Logo" className="w-6 h-6 object-contain opacity-80" />
                        <span className="font-semibold text-lg text-white tracking-tight">jules</span>
                    </div>
                    <button onClick={onClose} aria-label="Close sidebar" className="p-1 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search repositories & sessions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#161619] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:bg-[#1E1E22] transition-all"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-2 space-y-2 pb-4 custom-scrollbar">
                    
                    {/* Recent Sessions */}
                    <div className="py-2">
                        <button 
                            onClick={() => setIsSessionsOpen(!isSessionsOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 text-zinc-400 hover:text-white transition-colors group"
                        >
                            <span className="text-sm font-medium group-hover:text-zinc-200">Recent sessions</span>
                            <div className="flex items-center gap-2">
                                {searchQuery && filteredSessions.length > 0 && (
                                    <span className="text-[10px] bg-white/10 px-1.5 rounded text-zinc-300">{filteredSessions.length}</span>
                                )}
                                {isSessionsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                        </button>
                        
                        {isSessionsOpen && (
                            <div className="mt-1 space-y-0.5">
                                {filteredSessions.length === 0 && (
                                    <div className="px-4 py-2 text-xs text-zinc-600 italic">
                                        {searchQuery ? 'No matching sessions' : 'No recent sessions'}
                                    </div>
                                )}
                                {filteredSessions.map((session) => (
                                    <button 
                                        key={session.name}
                                        onClick={() => {
                                            onSelectSession(session);
                                            onClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group ${currentSessionId === session.name ? 'bg-white/5' : ''}`}
                                    >
                                        <CheckCircle2 size={16} className={`${currentSessionId === session.name ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-500'} flex-shrink-0 transition-colors`} />
                                        <span className={`text-sm truncate text-left flex-1 font-light ${currentSessionId === session.name ? 'text-white' : 'text-zinc-300'}`}>
                                            {session.title || session.prompt}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Codebases */}
                    <div className="py-2">
                        <button 
                            onClick={() => setIsCodebasesOpen(!isCodebasesOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 text-zinc-400 hover:text-white transition-colors group"
                        >
                            <span className="text-sm font-medium group-hover:text-zinc-200">Repositories</span>
                             <div className="flex items-center gap-2">
                                {searchQuery && filteredSources.length > 0 && (
                                    <span className="text-[10px] bg-white/10 px-1.5 rounded text-zinc-300">{filteredSources.length}</span>
                                )}
                                {isCodebasesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                        </button>

                        {isCodebasesOpen && (
                            <div className="mt-1 space-y-0.5">
                                {filteredSources.length === 0 && (
                                    <div className="px-4 py-2 text-xs text-zinc-600 italic">
                                        {searchQuery ? 'No matching repositories' : 'No repositories connected'}
                                    </div>
                                )}
                                {filteredSources.map((source) => {
                                    const isSelected = currentSourceId === source.name;
                                    return (
                                        <button 
                                            key={source.name}
                                            onClick={() => {
                                                onSelectSource(source);
                                                onClose();
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group ${isSelected ? 'bg-white/5' : ''}`}
                                        >
                                            <Github size={16} className={`${isSelected ? 'text-white' : 'text-zinc-400'} flex-shrink-0`} />
                                            <div className="flex flex-col items-start flex-1 min-w-0">
                                                <span className={`text-sm truncate w-full ${isSelected ? 'text-white font-medium' : 'text-zinc-400'}`}>
                                                    {source.displayName || source.name.split('/').slice(-2).join('/')}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                                                    1
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-[#0E0E11]">
                    <div className="mb-4">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs text-zinc-500">Daily session limit (12/100)</span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden w-full">
                            <div className="h-full bg-[#3F3F46] w-[12%] rounded-full" />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-[#161619] hover:bg-[#1E1E22] border border-white/5 py-2 rounded-lg text-sm text-zinc-300 transition-colors">
                            <FileText size={14} />
                            Docs
                        </button>
                        <button aria-label="Join Discord" className="w-10 h-10 flex items-center justify-center bg-[#161619] hover:bg-[#1E1E22] border border-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
                           <Disc size={18} />
                        </button>
                         <button onClick={onClose} aria-label="Close sidebar" className="w-10 h-10 flex items-center justify-center bg-[#161619] hover:bg-[#1E1E22] border border-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
                           <X size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};