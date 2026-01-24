import React from 'react';
import { InputArea, SessionMode } from './InputArea';
import { ProactiveSection } from './ProactiveSection';
import { Box, Terminal, Code, AlertCircle } from 'lucide-react';
import { JulesSource } from '../types';

interface HomeViewProps {
    onSendMessage: (text: string, mode: SessionMode, branch?: string) => void;
    isProcessing: boolean;
    error: string | null;
    currentSource: JulesSource | null;
    onResetKey: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
    onSendMessage,
    isProcessing,
    error,
    currentSource,
    onResetKey
}) => {
    return (
        <div className="flex-1 flex flex-col w-full overflow-y-auto scroll-smooth">
            {/* Dynamic Centering Container with safe top margin */}
            <div className="w-full max-w-[700px] m-auto flex flex-col items-center animate-in fade-in duration-500 px-4 pt-12 pb-[calc(3rem+env(safe-area-inset-bottom))] sm:pt-20">

                {!currentSource && (
                    <div className="w-full text-amber-500 mb-6 flex items-center gap-3 text-sm bg-amber-500/10 px-4 py-3 rounded-xl border border-amber-500/20">
                        <AlertCircle size={18} />
                        <span>No repositories found. Ensure the Jules App is installed on your GitHub.</span>
                    </div>
                )}

                {/* Main Input Card - The "Hero" */}
                {/* z-index ensures it stays on top during expansion animations */}
                <div className="w-full mb-8 relative z-20">
                    <InputArea
                        onSendMessage={onSendMessage}
                        isLoading={isProcessing}
                        variant="default"
                        placeholder="Describe a task or fix..."
                        currentSource={currentSource}
                    />

                    {error && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </div>

                {/* Proactive Section (Cards below) */}
                <div className="w-full z-10">
                    <ProactiveSection />
                </div>

                {/* Footer Actions */}
                <div className="w-full mt-12 flex flex-wrap justify-between items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                        <ActionButton icon={<Box size={14} />} label="Render" />
                        <ActionButton icon={<Terminal size={14} />} label="CLI" />
                        <ActionButton icon={<Code size={14} />} label="API" />
                    </div>

                    <button
                        onClick={onResetKey}
                        className="text-xs text-zinc-600 hover:text-zinc-400 underline underline-offset-2 decoration-zinc-800"
                    >
                        Reset Key
                    </button>
                </div>
            </div>
        </div>
    );
};

const ActionButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1E1E22] hover:bg-[#27272A] border border-white/5 rounded-lg text-xs font-mono text-textMuted hover:text-white transition-all">
        {icon}
        <span>{label}</span>
    </button>
);