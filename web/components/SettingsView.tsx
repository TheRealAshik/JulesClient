import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Layout, Sliders } from 'lucide-react';

interface SettingsViewProps {
    defaultCardCollapsed: boolean;
    onToggleDefaultCardCollapsed: (collapsed: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
    defaultCardCollapsed,
    onToggleDefaultCardCollapsed
}) => {
    return (
        <div className="flex-1 flex flex-col h-full bg-[#0c0c0c] text-zinc-200 overflow-y-auto">
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-b border-white/5 bg-[#0E0E11]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center gap-4">
                <Link to="/" className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-lg font-semibold text-white">Settings</h1>
            </div>

            <div className="max-w-3xl mx-auto w-full p-4 sm:p-8 space-y-8">

                {/* Section: Appearance */}
                <div className="space-y-4">
                    <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Monitor size={14} /> Appearance
                    </h2>

                    <div className="bg-[#161619] border border-white/5 rounded-xl overflow-hidden">
                        {/* Default Card State Setting */}
                        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="text-base font-medium text-white">Default Card State</div>
                                <div className="text-sm text-zinc-400">
                                    Choose whether large items (commands, code changes) appear expanded or collapsed by default.
                                    <br className="hidden sm:block" />
                                    Collapsing them can improve performance when viewing long sessions.
                                </div>
                            </div>

                            <div className="flex items-center bg-black/40 p-1 rounded-lg border border-white/5 flex-shrink-0">
                                <button
                                    onClick={() => onToggleDefaultCardCollapsed(false)}
                                    className={`
                                        px-3 py-1.5 rounded-md text-xs font-medium transition-all
                                        ${!defaultCardCollapsed
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                        }
                                    `}
                                >
                                    Expanded
                                </button>
                                <button
                                    onClick={() => onToggleDefaultCardCollapsed(true)}
                                    className={`
                                        px-3 py-1.5 rounded-md text-xs font-medium transition-all
                                        ${defaultCardCollapsed
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                        }
                                    `}
                                >
                                    Collapsed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: About */}
                <div className="space-y-4">
                    <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Sliders size={14} /> About
                    </h2>

                    <div className="bg-[#161619] border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-300">Client Version</span>
                                <span className="text-sm font-mono text-zinc-500">v0.1.0-alpha</span>
                            </div>
                        </div>
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-300">Theme</span>
                                <span className="text-sm text-zinc-500">Dark (System)</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
