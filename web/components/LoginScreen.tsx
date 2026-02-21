import React, { useState } from 'react';
import { Key, ChevronRight } from 'lucide-react';

interface LoginScreenProps {
    onSetKey: (key: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSetKey }) => {
    const [tempKey, setTempKey] = useState('');

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#161619] border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <img src="https://jules.google/squid.png" alt="Jules" className="w-12 h-12 opacity-80" />
                </div>
                <h2 className="text-xl font-medium text-center text-white mb-2">Welcome to Jules Client</h2>
                <p className="text-zinc-500 text-center text-sm mb-6">Enter your API Key to access your Jules agent.</p>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSetKey(tempKey);
                }}>
                    <div className="mb-4">
                        <label htmlFor="apiKey" className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
                            API Key <span className="text-indigo-500">*</span>
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                id="apiKey"
                                name="key"
                                type="password"
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                autoFocus
                                required
                                aria-required="true"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!tempKey.trim()}
                        className={`
                            w-full font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2
                            ${!tempKey.trim()
                                ? 'bg-[#27272a] text-zinc-500 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'}
                        `}
                    >
                        Enter App <ChevronRight size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};
