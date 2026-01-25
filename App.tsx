import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { SessionView } from './components/SessionView';
import { RepositoryView } from './components/RepositoryView';
import { Drawer } from './components/Drawer';
import * as JulesApi from './services/geminiService';
import { JulesActivity, JulesSource, JulesSession, AutomationMode } from './types';
import { AlertCircle, Key, ChevronRight } from 'lucide-react';
import { SessionMode, SessionCreateOptions } from './components/InputArea';

export default function App() {
    const [apiKey, setApiKey] = useState<string>('');
    const [sources, setSources] = useState<JulesSource[]>([]);
    const [currentSource, setCurrentSource] = useState<JulesSource | null>(null);

    const [currentSession, setCurrentSession] = useState<JulesSession | null>(null);
    const [sessions, setSessions] = useState<JulesSession[]>([]);
    const [activities, setActivities] = useState<JulesActivity[]>([]);

    const navigate = useNavigate();
    const location = useLocation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Polling ref
    const pollInterval = useRef<number | null>(null);
    const activitiesRef = useRef<JulesActivity[]>([]);

    useEffect(() => {
        const key = localStorage.getItem('jules_api_key');
        if (key) {
            setApiKey(key);
            JulesApi.setApiKey(key);
            fetchSources();
            fetchSessions();
        }
    }, []);

    // Sync state with URL params
    useEffect(() => {
        const syncWithUrl = async () => {
            const pathParts = location.pathname.split('/');

            // Handle Session route
            if (pathParts[1] === 'session' && pathParts[2]) {
                const sessName = `sessions/${pathParts[2]}`;
                if (!currentSession || currentSession.name !== sessName) {
                    try {
                        const sess = await JulesApi.getSession(sessName);
                        setCurrentSession(sess);
                        startPolling(sess.name);
                    } catch (e) {
                        console.error("Failed to load session from URL", e);
                    }
                }
            }
            // Handle Repository route
            else if (pathParts[1] === 'repository') {
                const repoName = location.pathname.replace('/repository/', 'sources/');
                if (!currentSource || currentSource.name !== repoName) {
                    // We need sources to be loaded first
                    if (sources.length > 0) {
                        const found = sources.find(s => s.name === repoName);
                        if (found) setCurrentSource(found);
                    }
                }
            }
        };

        if (apiKey) syncWithUrl();
    }, [location.pathname, apiKey, sources.length]);

    const handleSetKey = (key: string) => {
        localStorage.setItem('jules_api_key', key);
        setApiKey(key);
        JulesApi.setApiKey(key);
        fetchSources();
        fetchSessions();
    };

    const fetchSources = async () => {
        try {
            const response = await JulesApi.listSources();
            setSources(response.sources);
            if (response.sources.length > 0 && !currentSource) {
                setCurrentSource(response.sources[0]);
            }
        } catch (e) {
            console.error(e);
            // If 401, reset key
            if (e instanceof Error && e.message.includes('Invalid API Key')) {
                setError("Invalid API Key. Please reset.");
            }
        }
    };

    const fetchSessions = async () => {
        const response = await JulesApi.listSessions();
        setSessions(response.sessions);
    };

    const startPolling = useCallback((sessionName: string) => {
        if (pollInterval.current) clearInterval(pollInterval.current);

        // Immediate fetch
        JulesApi.listActivities(sessionName).then(response => {
            activitiesRef.current = response.activities;
            setActivities(response.activities);
        });

        // Poll every 2s
        pollInterval.current = window.setInterval(async () => {
            const response = await JulesApi.listActivities(sessionName);
            activitiesRef.current = response.activities;
            setActivities(response.activities);

            // Also check session status for outputs and state
            const sess = await JulesApi.getSession(sessionName);
            setCurrentSession(sess);

            // Use API state to determine if processing
            // Active states: QUEUED, PLANNING, IN_PROGRESS
            // Waiting states: AWAITING_PLAN_APPROVAL, AWAITING_USER_FEEDBACK, PAUSED
            // Terminal states: COMPLETED, FAILED
            const isActive = ['QUEUED', 'PLANNING', 'IN_PROGRESS'].includes(sess.state);
            setIsProcessing(isActive);
        }, 2000);
    }, []);

    const handleSendMessage = async (text: string, options: SessionCreateOptions) => {
        setError(null);
        setIsProcessing(true);

        try {
            if (!currentSession) {
                // CREATE NEW SESSION
                if (!currentSource) {
                    throw new Error("Please select a repository first.");
                }

                // Map UI Mode to API Options
                const requireApproval = options.mode === 'REVIEW' || options.mode === 'SCHEDULED' || options.mode === 'INTERACTIVE';

                const session = await JulesApi.createSession(text, currentSource.name, {
                    title: options.title,
                    requirePlanApproval: requireApproval,
                    startingBranch: options.branch || 'main',
                    automationMode: options.automationMode || 'AUTO_CREATE_PR'
                });

                setCurrentSession(session);
                setSessions(prev => [session, ...prev]);
                navigate(`/session/${session.name.replace('sessions/', '')}`);
                startPolling(session.name);
            } else {
                // Optimistic Update: Show the message immediately
                const optimisticActivity: JulesActivity = {
                    name: `temp-${Date.now()}`,
                    createTime: new Date().toISOString(),
                    originator: 'user',
                    userMessage: { text: text },
                    description: 'User message'
                };
                setActivities(prev => [...prev, optimisticActivity]);

                // SEND MESSAGE TO EXISTING SESSION
                await JulesApi.sendMessage(currentSession.name, text);

                // Note: We do NOT force an immediate fetch here because it might
                // return the old list (race condition) and overwrite our optimistic message.
                // We let the existing poller sync the state eventually.
            }
        } catch (e: any) {
            setError(e.message || "An error occurred");
            setIsProcessing(false);
        }
    };

    const handleApprovePlan = async (activityName: string) => {
        if (!currentSession) return;
        setIsProcessing(true);
        try {
            await JulesApi.approvePlan(currentSession.name);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSelectSession = (session: JulesSession) => {
        setCurrentSession(session);
        navigate(`/session/${session.name.replace('sessions/', '')}`);
        setIsDrawerOpen(false);
        startPolling(session.name);
    };

    // Cleanup polling on unmount or session switch
    useEffect(() => {
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, []);

    if (!apiKey) {
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
                        const form = e.target as HTMLFormElement;
                        const input = form.elements.namedItem('key') as HTMLInputElement;
                        handleSetKey(input.value);
                    }}>
                        <div className="relative mb-4">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                name="key"
                                type="password"
                                placeholder="sk-..."
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                            Enter App <ChevronRight size={16} />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] w-full bg-[#0c0c0c] text-textMain font-sans flex flex-col overflow-hidden">
            <Header
                onOpenDrawer={() => setIsDrawerOpen(true)}
                currentSource={currentSource}
                sources={sources}
                onSourceChange={(source) => {
                    setCurrentSource(source);
                    navigate(`/repository/${source.name.replace('sources/', '')}`);
                }}
                isLoading={isProcessing}
            />

            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                sessions={sessions}
                sources={sources}
                currentSessionId={currentSession?.name}
                currentSourceId={currentSource?.name}
                onSelectSession={handleSelectSession}
                onSelectSource={(source) => {
                    setCurrentSource(source);
                    navigate(`/repository/${source.name.replace('sources/', '')}`);
                    setIsDrawerOpen(false);
                }}
            />

            <Routes>
                <Route path="/" element={
                    <HomeView
                        onSendMessage={handleSendMessage}
                        isProcessing={isProcessing}
                        error={error}
                        currentSource={currentSource}
                        onResetKey={() => {
                            localStorage.removeItem('jules_api_key');
                            setApiKey('');
                        }}
                        sessions={sessions}
                        onSelectSession={handleSelectSession}
                    />
                } />

                <Route path="/session/:sessionId" element={
                    currentSession ? (
                        <SessionView
                            session={currentSession}
                            activities={activities}
                            isProcessing={isProcessing}
                            error={error}
                            onSendMessage={(text) => handleSendMessage(text, { mode: 'START' })}
                            onApprovePlan={handleApprovePlan}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-zinc-500">
                            Loading session...
                        </div>
                    )
                } />

                <Route path="/repository/*" element={
                    currentSource ? (
                        <RepositoryView
                            source={currentSource}
                            sessions={sessions}
                            onSelectSession={handleSelectSession}
                            onCreateNew={() => {
                                setCurrentSession(null);
                                navigate('/');
                            }}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-zinc-500">
                            Loading repository...
                        </div>
                    )
                } />
            </Routes>
        </div>
    );
}