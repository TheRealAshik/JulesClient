import React, { useState, useRef, useEffect } from 'react';
import { Settings, PanelLeft, ChevronDown, Check, Search, Command } from 'lucide-react';
import { JulesSource } from '../types';

interface HeaderProps {
    onOpenDrawer: () => void;
    currentSource?: JulesSource | null;
    sources: JulesSource[];
    onSourceChange: (source: JulesSource) => void;
    isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
    onOpenDrawer,
    currentSource,
    sources,
    onSourceChange,
    isLoading = false
}) => {
  const [isRepoOpen, setIsRepoOpen] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');
  const repoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (repoRef.current && !repoRef.current.contains(event.target as Node)) {
        setIsRepoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSources = sources.filter(s => 
    (s.displayName || s.name).toLowerCase().includes(repoSearch.toLowerCase())
  );

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all">
      {/* Left Section: Sidebar Trigger & Repo Selector */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenDrawer}
          aria-label="Toggle sidebar"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
        >
          <PanelLeft size={20} />
        </button>
        
        {/* Repo Pill (Matches Screenshot) */}
        <div className="relative" ref={repoRef}>
             <button 
                 onClick={() => setIsRepoOpen(!isRepoOpen)}
                 className="flex items-center gap-3 px-4 py-2 bg-[#18181B] hover:bg-[#27272A] border border-white/5 rounded-full transition-all group"
             >
                 <div className="w-5 h-5 rounded-full bg-[#5b21b6] flex items-center justify-center text-white">
                     <Command size={12} />
                 </div>
                 <span className="font-medium text-sm text-zinc-200 group-hover:text-white">
                    {currentSource ? (currentSource.displayName || currentSource.name.split('/').slice(-2).join('/')) : 'Select Repository'}
                 </span>
                 <ChevronDown size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
             </button>

             {isRepoOpen && (
                <div className="absolute top-full left-0 mt-2 w-[320px] bg-[#121215] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col ring-1 ring-black/50">
                    <div className="p-3 border-b border-white/5">
                        <div className="flex items-center gap-2 bg-[#09090b] border border-white/5 rounded-lg px-3 py-2 focus-within:border-white/20 transition-colors">
                            <Search size={14} className="text-zinc-500" />
                            <input 
                                autoFocus
                                type="text"
                                placeholder="Find a repository..."
                                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600 w-full"
                                value={repoSearch}
                                onChange={(e) => setRepoSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="py-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                        {filteredSources.map((source) => (
                            <button
                                key={source.name}
                                onClick={() => {
                                    onSourceChange(source);
                                    setIsRepoOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left
                                    ${currentSource?.name === source.name 
                                        ? 'bg-white/5 text-white' 
                                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'}
                                `}
                            >
                                <span className="truncate flex-1 font-mono">{source.displayName || source.name}</span>
                                {currentSource?.name === source.name && <Check size={14} className="text-indigo-400 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* Right Section: Configure */}
      <div className="flex items-center gap-2">
        <button 
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <span>Configure</span>
          <Settings size={16} />
        </button>
      </div>

      {/* Flux Loading Indicator */}
      <div 
        className={`
            absolute bottom-0 left-0 right-0 h-[2px] w-full overflow-hidden pointer-events-none transition-opacity duration-300 ease-out
            ${isLoading ? 'opacity-100' : 'opacity-0'}
        `}
        aria-hidden="true"
      >
          {/* Subtle Track */}
          <div className="absolute inset-0 bg-white/[0.03]" />
          
          {/* Moving Gradient Segment */}
          <div 
            className="absolute top-0 bottom-0 left-0 w-[40%] bg-gradient-to-r from-transparent via-[#818cf8] to-transparent rounded-full"
            style={{
                boxShadow: '0 0 10px 1px rgba(129, 140, 248, 0.4)',
                animation: 'flux-loading 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }}
          />
          <style>{`
            @keyframes flux-loading {
                0% { transform: translateX(-150%) scaleX(0.8); }
                50% { transform: translateX(100%) scaleX(1.2); }
                100% { transform: translateX(350%) scaleX(0.8); }
            }
          `}</style>
      </div>
    </header>
  );
};