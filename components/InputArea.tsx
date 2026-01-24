import React, { useState, useRef, useEffect } from 'react';
import { Plus, Rocket, ArrowRight, ChevronUp, Check, Clock, MessageSquare, FileSearch, Zap, Palette, ShieldCheck, Search, GitBranch, ChevronDown } from 'lucide-react';
import { JulesSource } from '../types';

export type SessionMode = 'SCHEDULED' | 'INTERACTIVE' | 'REVIEW' | 'START';

interface InputAreaProps {
  onSendMessage: (text: string, mode: SessionMode, branch?: string) => void;
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

  // Filter Toggles (Visual only)
  const [filters, setFilters] = useState({ performance: false, design: false, security: false });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);

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
    onSendMessage(input, selectedMode, selectedBranch);
    setInput('');
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
          // If expanded (focused or has text), let it grow. Otherwise small.
          if (isFocused || input.length > 0) {
             const scrollHeight = textareaRef.current.scrollHeight;
             textareaRef.current.style.height = `${Math.max(scrollHeight, 40)}px`;
          } else {
             textareaRef.current.style.height = '28px';
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
         // Only collapse if input is empty
         if (!input.trim()) {
             setIsFocused(false);
         }
         
         if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
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

  // Filter branches
  const branches = currentSource?.githubRepo?.branches || [];
  const filteredBranches = branches.filter(b => 
      b.displayName.toLowerCase().includes(branchSearch.toLowerCase())
  );
  
  const isExpanded = isFocused || input.length > 0;

  // --- CHAT VARIANT (Compact floating bar) ---
  if (variant === 'chat') {
      return (
        <div className="w-full max-w-3xl mx-auto px-2 sm:px-4">
            <div 
                className={`
                    relative flex items-end gap-2 bg-[#1c1c1f] border 
                    rounded-[26px] p-2 transition-all duration-200 ease-out
                    ${isFocused ? 'border-zinc-600 ring-1 ring-zinc-700/50 shadow-2xl' : 'border-white/10 shadow-lg'}
                `}
            >
                <button className="p-2.5 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5 flex-shrink-0">
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
                    className="flex-1 bg-transparent border-none outline-none text-textMain placeholder:text-zinc-600 resize-none py-3 max-h-[200px] text-[15px] leading-relaxed min-w-0 font-normal custom-scrollbar"
                    rows={1}
                />

                <button 
                    onClick={handleSubmit}
                    disabled={!input.trim() || isLoading}
                    className={`
                        p-2 rounded-full transition-all mb-1 flex-shrink-0 duration-300
                        ${input.trim() 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg' 
                            : 'bg-white/5 text-zinc-600 cursor-not-allowed'}
                    `}
                >
                     {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight size={18} />}
                </button>
            </div>
        </div>
      );
  }

  // --- DEFAULT VARIANT (Hero Card - Expandable) ---
  return (
    <div 
      ref={containerRef}
      className={`
        relative w-full bg-[#18181B] border
        flex flex-col cursor-text transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
        rounded-[32px] overflow-hidden
        ${isExpanded 
            ? 'min-h-[200px] border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/5' 
            : 'min-h-[140px] border-white/5 shadow-xl hover:border-white/10'}
      `}
      onClick={() => {
         if (!isFocused) {
            setIsFocused(true);
            textareaRef.current?.focus();
         }
      }}
    >
      <div className={`
        w-full transition-all duration-500 ease-out
        ${isExpanded ? 'p-6' : 'p-6'}
      `}>
          <textarea
            ref={textareaRef}
            aria-label="Message input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className={`
                w-full bg-transparent border-none outline-none text-[#E4E4E7] placeholder:text-[#52525B] resize-none font-normal leading-relaxed
                transition-all duration-300
                ${isExpanded ? 'text-[16px]' : 'text-[16px]'}
            `}
            rows={1}
            style={{ 
                height: isExpanded ? 'auto' : '28px',
                minHeight: '28px' 
            }}
          />
      </div>

      {/* Spacer to push controls to bottom */}
      <div className="flex-1" />

      {/* Footer Controls */}
      <div 
        className={`
            px-5 pb-5 pt-2 flex items-center justify-between pointer-events-auto transition-all duration-300
            ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'} 
        `}
      >
          
          {/* Left: Attach & Branch */}
          <div className="flex items-center gap-3">
            <button 
              aria-label="Add attachment"
              className={`
                w-9 h-9 flex items-center justify-center rounded-xl bg-[#27272A] hover:bg-[#323235] border border-white/5 text-zinc-400 hover:text-white transition-colors
                ${!isExpanded && !input.trim() ? 'bg-opacity-50' : ''}
              `}
            >
              <Plus size={18} />
            </button>

            {/* Branch Selector Pill */}
            <div className="relative" ref={branchRef}>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsBranchMenuOpen(!isBranchMenuOpen);
                    }}
                    className={`
                        flex items-center gap-2 px-3 py-2 bg-[#27272A] hover:bg-[#323235] border border-white/5 rounded-xl text-xs font-mono text-zinc-300 hover:text-white transition-colors h-9
                        ${!isExpanded && !input.trim() ? 'bg-opacity-50' : ''}
                    `}
                >
                    <GitBranch size={14} className="text-indigo-400" />
                    <span className="max-w-[120px] truncate">{selectedBranch}</span>
                    <ChevronDown size={12} className="text-zinc-500" />
                </button>

                {isBranchMenuOpen && (
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-full left-0 mb-2 w-[280px] bg-[#121215] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 ring-1 ring-black/50"
                    >
                        <div className="p-2 border-b border-white/5 bg-[#0e0e11]">
                            <div className="flex items-center gap-2 bg-[#18181b] border border-white/5 rounded-lg px-2.5 py-1.5">
                                <Search size={12} className="text-zinc-500" />
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Find a branch..."
                                    value={branchSearch}
                                    onChange={(e) => setBranchSearch(e.target.value)}
                                    className="bg-transparent border-none outline-none text-xs text-white placeholder:text-zinc-600 w-full font-mono"
                                />
                            </div>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                            {filteredBranches.map(branch => (
                                <button
                                    key={branch.displayName}
                                    onClick={() => {
                                        setSelectedBranch(branch.displayName);
                                        setIsBranchMenuOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-left rounded-lg transition-colors
                                        ${selectedBranch === branch.displayName ? 'bg-indigo-500/10 text-indigo-300' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}
                                    `}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedBranch === branch.displayName ? 'bg-indigo-400' : 'bg-transparent border border-zinc-600'}`} />
                                    <span className="truncate">{branch.displayName}</span>
                                    {selectedBranch === branch.displayName && <Check size={12} className="ml-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* Right: Mode & Send */}
          <div className="flex items-center gap-2">
            
            {/* Mode Menu Trigger */}
            <div className="relative mode-menu-trigger">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsModeMenuOpen(!isModeMenuOpen);
                    }}
                    className={`
                        flex items-center gap-2 px-3 py-2 rounded-xl transition-all border h-9
                        ${isModeMenuOpen 
                            ? 'bg-[#3F3F46] text-white border-white/10' 
                            : 'bg-[#27272A] hover:bg-[#323235] text-zinc-400 hover:text-white border-white/5'}
                        ${!isExpanded && !input.trim() ? 'bg-opacity-50' : ''}
                    `}
                >
                   <Rocket size={16} className={selectedMode === 'START' ? 'text-indigo-400' : ''} />
                   <ChevronUp size={14} className={`transition-transform duration-200 text-zinc-500 ${isModeMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isModeMenuOpen && (
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="mode-menu-dropdown absolute bottom-full right-0 mb-2 w-[85vw] sm:w-[340px] max-w-[340px] bg-[#121215] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/80 origin-bottom-right"
                    >
                        <div className="p-2 space-y-1">
                            {['START', 'SCHEDULED', 'INTERACTIVE', 'REVIEW'].map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => { setSelectedMode(mode as SessionMode); setIsModeMenuOpen(false); }} 
                                    className="w-full text-left p-3 rounded-xl hover:bg-white/5 group transition-colors flex items-start gap-4"
                                >
                                    <div className="mt-0.5 text-zinc-400 group-hover:text-white transition-colors">
                                        {mode === 'START' && <Rocket size={18} />}
                                        {mode === 'SCHEDULED' && <Clock size={18} />}
                                        {mode === 'INTERACTIVE' && <MessageSquare size={18} />}
                                        {mode === 'REVIEW' && <FileSearch size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[14px] font-medium text-white">
                                                {mode === 'START' ? 'Start immediately' : 
                                                 mode === 'SCHEDULED' ? 'Scheduled task' :
                                                 mode === 'INTERACTIVE' ? 'Interactive plan' : 'Review plan'}
                                            </span>
                                            {mode === 'SCHEDULED' && <span className="text-[10px] font-bold bg-[#6366F1]/20 text-[#818CF8] px-1.5 py-0.5 rounded-[4px] tracking-wide">NEW</span>}
                                        </div>
                                        <p className="text-[13px] text-zinc-500 mt-0.5">
                                            {mode === 'START' ? 'Begin execution without approval.' :
                                             mode === 'SCHEDULED' ? "Delegate work to Jules while you're away." :
                                             mode === 'INTERACTIVE' ? 'Discuss goals before executing plan.' :
                                             'Generate plan and wait for approval.'}
                                        </p>
                                    </div>
                                    {selectedMode === mode && <Check size={16} className="text-indigo-400 mt-1" />}
                                </button>
                            ))}
                        </div>
                        <div className="p-3 bg-[#09090b]/50 border-t border-white/5 flex gap-2">
                             <FilterButton icon={<Zap size={14} />} label="Performance" active={filters.performance} onClick={() => setFilters(prev => ({...prev, performance: !prev.performance}))} />
                             <FilterButton icon={<Palette size={14} />} label="Design" active={filters.design} onClick={() => setFilters(prev => ({...prev, design: !prev.design}))} />
                             <FilterButton icon={<ShieldCheck size={14} />} label="Security" active={filters.security} onClick={() => setFilters(prev => ({...prev, security: !prev.security}))} />
                        </div>
                    </div>
                )}
            </div>

            {/* Send Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleSubmit();
              }}
              disabled={!input.trim() || isLoading}
              className={`
                w-9 h-9 flex items-center justify-center rounded-full border transition-all flex-shrink-0
                ${input.trim() 
                    ? 'bg-white text-black border-white hover:bg-zinc-200' 
                    : 'bg-[#3F3F46] text-zinc-500 border-white/5 cursor-not-allowed bg-opacity-50'}
              `}
            >
              {isLoading ? (
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-300 rounded-full animate-spin" />
              ) : (
                  <ArrowRight size={18} />
              )}
            </button>
          </div>
      </div>
    </div>
  );
};

const FilterButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors border
            ${active 
                ? 'bg-[#3F3F46] text-white border-zinc-600' 
                : 'bg-transparent text-zinc-500 border-zinc-700 hover:text-zinc-300 hover:border-zinc-600'}
        `}
    >
        {icon} {label}
    </button>
);