import React, { useState, useRef, useEffect } from 'react';
import { Plus, Rocket, ArrowRight, ChevronUp, Check, Clock, MessageSquare, FileSearch, Search, GitBranch, ChevronDown, Type, Zap, GitPullRequest } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JulesSource, AutomationMode } from '../types';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export type SessionMode = 'SCHEDULED' | 'INTERACTIVE' | 'REVIEW' | 'START';

export interface SessionCreateOptions {
    mode: SessionMode;
    branch?: string;
    title?: string;
    automationMode?: AutomationMode;
}

interface InputAreaProps {
    onSendMessage: (text: string, options: SessionCreateOptions) => void;
    isLoading: boolean;
    variant?: 'default' | 'chat';
    placeholder?: string;
    currentSource?: JulesSource | null;
}

export const InputArea: React.FC<InputAreaProps> = ({
    onSendMessage,
    isLoading,
    variant = 'default',
    placeholder,
    currentSource
}) => {
    const [input, setInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Modes
    const [selectedMode, setSelectedMode] = useState<SessionMode>('START');
    const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);

    // Branches
    const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
    const [branchSearch, setBranchSearch] = useState('');
    const [selectedBranch, setSelectedBranch] = useState<string>('main');

    // Session title (optional)
    const [sessionTitle, setSessionTitle] = useState('');
    const [showTitleInput, setShowTitleInput] = useState(false);

    // Automation mode
    const [automationMode, setAutomationMode] = useState<AutomationMode>('AUTO_CREATE_PR');

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Initialize selected branch
    useEffect(() => {
        if (currentSource?.githubRepo?.defaultBranch?.displayName) {
            setSelectedBranch(currentSource.githubRepo.defaultBranch.displayName);
        } else {
            setSelectedBranch('main');
        }
    }, [currentSource]);

    const handleSubmit = () => {
        if (!input.trim() || isLoading) return;
        onSendMessage(input, {
            mode: selectedMode,
            branch: selectedBranch,
            title: sessionTitle.trim() || undefined,
            automationMode
        });
        setInput('');
        setSessionTitle('');
        setShowTitleInput(false);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            if (variant === 'default') {
                setIsFocused(false);
                textareaRef.current.blur();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            if (variant === 'default') {
                if (isFocused || input.length > 0) {
                    const scrollHeight = textareaRef.current.scrollHeight;
                    textareaRef.current.style.height = `${Math.max(scrollHeight, 40)}px`;
                } else {
                    textareaRef.current.style.height = '24px';
                }
            } else {
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        }
    }, [input, isFocused, variant]);

    // Click outside handlers
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (!input.trim()) {
                    setIsFocused(false);
                }
                const target = event.target as Element;
                if (!target.closest('.branch-menu-trigger') && !target.closest('.branch-menu-dropdown')) {
                    setIsBranchMenuOpen(false);
                }
            }

            const target = event.target as Element;
            if (!target.closest('.mode-menu-trigger') && !target.closest('.mode-menu-dropdown')) {
                setIsModeMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [input]);

    const branches = currentSource?.githubRepo?.branches || [];
    const filteredBranches = branches.filter(b =>
        b.displayName.toLowerCase().includes(branchSearch.toLowerCase())
    );

    const isExpanded = isFocused || input.length > 0;

    // --- CHAT VARIANT (Compact floating bar) ---
    if (variant === 'chat') {
        return (
            <div className="w-full max-w-3xl mx-auto px-2 sm:px-4">
                <motion.div
                    layout
                    className={twMerge(
                        "relative flex items-end gap-2 bg-[#1c1c1f]/90 backdrop-blur-md border rounded-xl p-2 transition-colors duration-200",
                        isFocused ? 'border-zinc-500/50 ring-1 ring-zinc-500/20 shadow-2xl' : 'border-white/10 shadow-lg'
                    )}
                >
                    <button className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex-shrink-0">
                        <Plus size={20} />
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder || "Reply to Jules..."}
                        className="flex-1 bg-transparent border-none outline-none text-textMain placeholder:text-zinc-600 resize-none py-3 max-h-[200px] text-base leading-relaxed min-w-0 font-normal"
                        rows={1}
                    />

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        disabled={!input.trim() || isLoading}
                        className={twMerge(
                            "w-10 h-10 flex items-center justify-center rounded-lg transition-all mb-1 flex-shrink-0 duration-300",
                            input.trim()
                                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25'
                                : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                        )}
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight size={18} />}
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // --- DEFAULT VARIANT (Hero Card - Expandable with Linear Animation) ---
    return (
        <div
            ref={containerRef}
            className={twMerge(
                "relative w-full bg-[#141417] border flex flex-col cursor-text transition-all duration-200 ease-out",
                isExpanded
                    ? 'rounded-xl min-h-[160px] border-indigo-500/40 shadow-[0_4px_30px_-4px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20'
                    : 'rounded-xl min-h-[60px] border-white/10 shadow-sm hover:border-white/20 hover:bg-[#18181b]'
            )}
            onClick={() => {
                if (!isFocused) {
                    setIsFocused(true);
                    textareaRef.current?.focus();
                }
            }}
        >
            <div className={twMerge(
                "w-full transition-all duration-200 ease-out",
                isExpanded ? 'p-5 pb-2' : 'p-3 px-4'
            )}>
                <textarea
                    ref={textareaRef}
                    aria-label="Message input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    placeholder={placeholder}
                    className={twMerge(
                        "w-full bg-transparent border-none outline-none text-[#E4E4E7] placeholder:text-zinc-600 resize-none font-normal leading-relaxed transition-all duration-200 selection:bg-indigo-500/30",
                        isExpanded ? 'text-[16px]' : 'text-[15px]'
                    )}
                    rows={1}
                    style={{
                        height: isExpanded ? 'auto' : '24px',
                        minHeight: isExpanded ? '28px' : '24px'
                    }}
                />
            </div>

            {isExpanded && <div className="flex-1" />}

            {/* Footer Controls - Animated appearance */}
            <div className={twMerge(
                "flex items-center justify-between pointer-events-auto transition-all duration-200 ease-out bg-[#141417]/50 rounded-b-xl",
                isExpanded ? 'px-4 pb-4 pt-2 opacity-100 border-t border-white/5' : 'px-3 pb-3 opacity-100'
            )}>

                {/* Left: Attach, Title & Branch - Hidden when collapsed */}
                <div className={twMerge(
                    "flex items-center gap-2 transition-all duration-200 ease-out",
                    isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'
                )}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Add attachment"
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-[#1f1f23] hover:bg-[#2a2a2f] border border-white/10 text-zinc-400 hover:text-white transition-all duration-150"
                    >
                        <Plus size={15} />
                    </motion.button>

                    {/* Session Title Toggle/Input */}
                    {showTitleInput ? (
                        <div className="flex items-center gap-1.5 bg-[#1f1f23] border border-white/10 rounded-lg px-2 py-1 h-7">
                            <Type size={12} className="text-indigo-400 flex-shrink-0" />
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={sessionTitle}
                                onChange={(e) => setSessionTitle(e.target.value)}
                                placeholder="Session title..."
                                className="bg-transparent border-none outline-none text-[11px] text-zinc-300 placeholder:text-zinc-600 w-24 sm:w-32 font-mono"
                                autoFocus
                            />
                            <button
                                onClick={() => { setShowTitleInput(false); setSessionTitle(''); }}
                                className="text-zinc-500 hover:text-white transition-colors"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowTitleInput(true);
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 bg-[#1f1f23] hover:bg-[#2a2a2f] border border-white/10 rounded-lg text-[11px] font-mono text-zinc-400 hover:text-white transition-all duration-150 h-7"
                            title="Add session title"
                        >
                            <Type size={12} className="text-zinc-500" />
                            <span className="hidden sm:inline">Title</span>
                        </motion.button>
                    )}

                    {/* Branch Selector Pill */}
                    <div className="relative branch-menu-trigger">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsBranchMenuOpen(!isBranchMenuOpen);
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 bg-[#1f1f23] hover:bg-[#2a2a2f] border border-white/10 rounded-lg text-[11px] font-mono text-zinc-300 hover:text-white transition-all duration-150 h-7"
                        >
                            <GitBranch size={12} className="text-indigo-400 flex-shrink-0" />
                            <span className="max-w-[70px] sm:max-w-[100px] truncate">{selectedBranch}</span>
                            <ChevronDown size={10} className="text-zinc-500 flex-shrink-0" />
                        </motion.button>

                        <AnimatePresence>
                            {isBranchMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="branch-menu-dropdown absolute top-full left-0 mt-2 w-[260px] max-w-[calc(100vw-2rem)] bg-[#121215] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col ring-1 ring-black/50"
                                >
                                    <div className="p-2 border-b border-white/5 bg-[#0e0e11]">
                                        <div className="flex items-center gap-2 bg-[#18181b] border border-white/5 rounded-lg px-2.5 py-1.5">
                                            <Search size={12} className="text-zinc-500" />
                                            <input
                                                type="text"
                                                placeholder="Find a branch..."
                                                value={branchSearch}
                                                onChange={(e) => setBranchSearch(e.target.value)}
                                                className="bg-transparent border-none outline-none text-xs text-white placeholder:text-zinc-600 w-full font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[180px] overflow-y-auto p-1">
                                        {filteredBranches.map(branch => (
                                            <button
                                                key={branch.displayName}
                                                onClick={() => {
                                                    setSelectedBranch(branch.displayName);
                                                    setIsBranchMenuOpen(false);
                                                }}
                                                className={twMerge(
                                                    "w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-left rounded-lg transition-colors min-h-[36px]",
                                                    selectedBranch === branch.displayName ? 'bg-indigo-500/10 text-indigo-300' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                                )}
                                            >
                                                <div className={twMerge("w-1.5 h-1.5 rounded-full", selectedBranch === branch.displayName ? 'bg-indigo-400' : 'bg-transparent border border-zinc-600')} />
                                                <span className="truncate">{branch.displayName}</span>
                                                {selectedBranch === branch.displayName && <Check size={12} className="ml-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Mode & Send */}
                <div className="flex items-center gap-2">

                    {/* Mode Menu Trigger - Hidden when collapsed */}
                    <div className={twMerge(
                        "relative mode-menu-trigger transition-all duration-200 ease-out",
                        isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
                    )}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsModeMenuOpen(!isModeMenuOpen);
                            }}
                            className={twMerge(
                                "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-150 border h-7",
                                isModeMenuOpen
                                    ? 'bg-[#2a2a2f] text-white border-white/15'
                                    : 'bg-[#1f1f23] hover:bg-[#2a2a2f] text-zinc-400 hover:text-white border-white/10'
                            )}
                        >
                            <Rocket size={13} className={selectedMode === 'START' ? 'text-indigo-400' : ''} />
                            <ChevronUp size={11} className={`transition-transform duration-150 text-zinc-500 ${isModeMenuOpen ? 'rotate-180' : ''}`} />
                        </motion.button>

                        <AnimatePresence>
                            {isModeMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mode-menu-dropdown absolute top-full right-0 mt-2 w-[280px] max-w-[calc(100vw-2rem)] bg-[#121215] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/80"
                                >
                                    <div className="p-1.5 space-y-0.5">
                                        {['START', 'SCHEDULED', 'INTERACTIVE', 'REVIEW'].map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => { setSelectedMode(mode as SessionMode); setIsModeMenuOpen(false); }}
                                                className="w-full text-left p-2.5 rounded-lg hover:bg-white/5 group transition-colors flex items-start gap-3 min-h-[40px]"
                                            >
                                                <div className="mt-0.5 text-zinc-400 group-hover:text-white transition-colors">
                                                    {mode === 'START' && <Rocket size={16} />}
                                                    {mode === 'SCHEDULED' && <Clock size={16} />}
                                                    {mode === 'INTERACTIVE' && <MessageSquare size={16} />}
                                                    {mode === 'REVIEW' && <FileSearch size={16} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[13px] font-medium text-white">
                                                            {mode === 'START' ? 'Start immediately' :
                                                                mode === 'SCHEDULED' ? 'Scheduled task' :
                                                                    mode === 'INTERACTIVE' ? 'Interactive plan' : 'Review plan'}
                                                        </span>
                                                        {mode === 'SCHEDULED' && <span className="text-[9px] font-bold bg-[#6366F1]/20 text-[#818CF8] px-1.5 py-0.5 rounded tracking-wide">NEW</span>}
                                                    </div>
                                                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                                                        {mode === 'START' ? 'Begin execution without approval.' :
                                                            mode === 'SCHEDULED' ? "Delegate work while you're away." :
                                                                mode === 'INTERACTIVE' ? 'Discuss goals before executing.' :
                                                                    'Generate plan and wait for approval.'}
                                                    </p>
                                                </div>
                                                {selectedMode === mode && <Check size={14} className="text-indigo-400 mt-1" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Send Button - Always visible */}
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSubmit();
                        }}
                        disabled={!input.trim() || isLoading}
                        className={twMerge(
                            "w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150 flex-shrink-0",
                            input.trim()
                                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25'
                                : 'bg-[#252529] text-zinc-500 cursor-not-allowed border border-white/5'
                        )}
                    >
                        {isLoading ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <ArrowRight size={15} />
                        )}
                    </motion.button>
                </div>
            </div>
        </div>
    );
};
