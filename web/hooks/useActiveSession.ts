import { useState, useRef, useCallback, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { JulesSession, JulesActivity, JulesSource } from '../types';
import { SessionCreateOptions } from '../components/InputArea';

interface SessionListActions {
    addSession: (session: JulesSession) => void;
    updateSession: (name: string, session: JulesSession) => void;
    removeSession: (name: string) => void;
}

export function useActiveSession(
    service: GeminiService | null,
    currentSource: JulesSource | null,
    navigate: (path: string) => void,
    sessionListActions: SessionListActions
) {
    const [currentSession, setCurrentSession] = useState<JulesSession | null>(null);
    const [activities, setActivities] = useState<JulesActivity[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activePollingSession = useRef<string | null>(null);
    const activitiesRef = useRef<JulesActivity[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const startPolling = useCallback((sessionName: string) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        activePollingSession.current = sessionName;
        const newController = new AbortController();
        abortControllerRef.current = newController;

        // Reset activities if switching sessions
        if (activitiesRef.current.length > 0 && !activitiesRef.current[0].name.startsWith(sessionName)) {
            activitiesRef.current = [];
            setActivities([]);
        }

        const runStream = async (signal: AbortSignal) => {
            if (activePollingSession.current !== sessionName || !service) return;

            try {
                const stream = service.streamActivities(sessionName);

                for await (const activity of stream) {
                    if (signal.aborted) {
                        break;
                    }

                    // Check if it's already in the ref
                    const existingIndex = activitiesRef.current.findIndex(a => a.name === activity.name);

                    if (existingIndex >= 0) {
                       // Update existing activity
                       activitiesRef.current[existingIndex] = activity;
                    } else {
                       // Add new activity
                       activitiesRef.current = [...activitiesRef.current, activity];
                    }

                    setActivities([...activitiesRef.current]);

                    // Sync the session state based on new activities
                    const isTerminal = activity.sessionCompleted || activity.sessionFailed;
                    const requiresAction = activity.planGenerated || activity.userMessaged;

                    if (isTerminal || requiresAction) {
                        const updatedSession = await service.getSession(sessionName);
                        if (!signal.aborted) {
                            setCurrentSession(prev => {
                                if (!prev || prev.state !== updatedSession.state || prev.outputs?.length !== updatedSession.outputs?.length) {
                                    return updatedSession;
                                }
                                return prev;
                            });

                            const isActive = ['QUEUED', 'PLANNING', 'IN_PROGRESS'].includes(updatedSession.state);
                            setIsProcessing(isActive);
                        }
                    } else {
                         // Keep isProcessing true during intermediate updates to reflect ongoing work
                         setIsProcessing(true);
                    }
                }
            } catch (e: any) {
                if (!signal.aborted) {
                    console.error("Streaming error", e);
                }
            }
        };

        runStream(newController.signal);
    }, [service]);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            activePollingSession.current = null;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const handleSendMessage = useCallback(async (text: string, options: SessionCreateOptions) => {
        setError(null);
        setIsProcessing(true);

        try {
            if (!service) throw new Error("API service not initialized");
            if (!currentSession) {
                // CREATE NEW SESSION
                if (!currentSource) {
                    throw new Error("Please select a repository first.");
                }

                // Map UI Mode to API Options
                const requireApproval = options.mode === 'REVIEW' || options.mode === 'SCHEDULED' || options.mode === 'INTERACTIVE';

                const session = await service.createSession(text, currentSource.name, {
                    title: options.title,
                    requirePlanApproval: requireApproval,
                    startingBranch: options.branch || 'main',
                    automationMode: options.automationMode || 'AUTO_CREATE_PR'
                });

                setCurrentSession(session);
                sessionListActions.addSession(session);
                navigate(`/session/${session.name.replace('sessions/', '')}`);
                startPolling(session.name);
            } else {
                // SEND MESSAGE TO EXISTING SESSION
                await service.sendMessage(currentSession.name, text);
                // Streaming will handle isProcessing based on session.state from API
            }
        } catch (e: any) {
            setError(e.message || "An error occurred");
            setIsProcessing(false);
        }
    }, [currentSession, currentSource, navigate, startPolling, sessionListActions, service]);

    const handleApprovePlan = useCallback(async (activityName: string) => {
        if (!currentSession || !service) return;
        setIsProcessing(true);
        try {
            await service.approvePlan(currentSession.name);
            // Re-fetch the session immediately to reflect state change
            const updated = await service.getSession(currentSession.name);
            setCurrentSession(updated);
            const isActive = ['QUEUED', 'PLANNING', 'IN_PROGRESS'].includes(updated.state);
            setIsProcessing(isActive);
        } catch (e: any) {
            setError(e.message);
            setIsProcessing(false);
        }
    }, [currentSession, service]);

    const handleSelectSession = useCallback((session: JulesSession) => {
        setCurrentSession(session);
        navigate(`/session/${session.name.replace('sessions/', '')}`);
        startPolling(session.name);
    }, [navigate, startPolling]);

    const handleDeleteSession = useCallback(async (sessionName: string) => {
        if (!service) return;
        try {
            await service.deleteSession(sessionName);
            sessionListActions.removeSession(sessionName);

            // If the deleted session is the current one, redirect to home
            if (currentSession?.name === sessionName) {
                setCurrentSession(null);
                setActivities([]);
                navigate('/');
            }
        } catch (e: any) {
            setError(e.message || "Failed to delete session");
        }
    }, [currentSession, navigate, sessionListActions, service]);

    const handleUpdateSession = useCallback(async (sessionName: string, updates: Partial<JulesSession>, updateMask: string[]) => {
        if (!service) return;
        try {
            const updated = await service.updateSession(sessionName, updates, updateMask);
            sessionListActions.updateSession(sessionName, updated);
            if (currentSession?.name === sessionName) {
                setCurrentSession(updated);
            }
        } catch (e: any) {
            setError(e.message || "Failed to update session");
        }
    }, [currentSession, sessionListActions, service]);

    return {
        currentSession,
        setCurrentSession, // Exposed for URL syncing or manual setting
        activities,
        isProcessing,
        error,
        setError,
        startPolling,
        handleSendMessage,
        handleApprovePlan,
        handleSelectSession,
        handleDeleteSession,
        handleUpdateSession
    };
}
