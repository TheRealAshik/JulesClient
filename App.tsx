import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { SessionView } from './components/SessionView';
import { RepositoryView } from './components/RepositoryView';
import { Drawer } from './components/Drawer';
import * as JulesApi from './services/geminiService';
import { JulesActivity, JulesSource, JulesSession } from './types';
import { AlertCircle, Key, ChevronRight } from 'lucide-react';
import { SessionMode } from './components/InputArea';

export default function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [loginInput, setLoginInput] = useState('');
  const [sources, setSources] = useState<JulesSource[]>([]);
  const [currentSource, setCurrentSource] = useState<JulesSource | null>(null);
  
  const [currentSession, setCurrentSession] = useState<JulesSession | null>(null);
  const [sessions, setSessions] = useState<JulesSession[]>([]);
  const [activities, setActivities] = useState<JulesActivity[]>([]);
  
  const [view, setView] = useState<'home' | 'session' | 'repository'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Polling ref
  const pollInterval = useRef<number | null>(null);

  useEffect(() => {
    const key = localStorage.getItem('jules_api_key');
    if (key) {
        setApiKey(key);
        JulesApi.setApiKey(key);
        fetchSources();
        fetchSessions();
    }
  }, []);

  const handleSetKey = (key: string) => {
      localStorage.setItem('jules_api_key', key);
      setApiKey(key);
      JulesApi.setApiKey(key);
      fetchSources();
      fetchSessions();
  };

  const fetchSources = async () => {
      try {
          const list = await JulesApi.listSources();
          setSources(list);
          if (list.length > 0 && !currentSource) {
              setCurrentSource(list[0]);
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
      const list = await JulesApi.listSessions();
      setSessions(list);
  };

  const startPolling = useCallback((sessionName: string) => {
      if (pollInterval.current) clearInterval(pollInterval.current);
      
      // Immediate fetch
      JulesApi.listActivities(sessionName).then(setActivities);

      // Poll every 2s
      pollInterval.current = window.setInterval(async () => {
          const acts = await JulesApi.listActivities(sessionName);
          setActivities(acts);
          
          // Also check session status for outputs
          const sess = await JulesApi.getSession(sessionName);
          setCurrentSession(sess);
      }, 2000);
  }, []);

  const handleSendMessage = async (text: string, mode: SessionMode = 'START', branch: string = 'main') => {
      setError(null);
      setIsProcessing(true);

      try {
          if (!currentSession) {
              // CREATE NEW SESSION
              if (!currentSource) {
                  throw new Error("Please select a repository first.");
              }
              
              // Map UI Mode to API Options
              const requireApproval = mode === 'REVIEW' || mode === 'SCHEDULED' || mode === 'INTERACTIVE';

              const session = await JulesApi.createSession(text, currentSource.name, {
                  requirePlanApproval: requireApproval,
                  startingBranch: branch
              });
              
              setCurrentSession(session);
              setSessions(prev => [session, ...prev]);
              setView('session');
              startPolling(session.name);
          } else {
              // SEND MESSAGE TO EXISTING
              await JulesApi.sendMessage(currentSession.name, text);
              // Force immediate update
              const acts = await JulesApi.listActivities(currentSession.name);
              setActivities(acts);
          }
      } catch (e: any) {
          setError(e.message || "An error occurred");
      } finally {
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
      setView('session');
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
                      handleSetKey(loginInput);
                  }}>
                      <div className="relative mb-4">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                          <input 
                              name="key"
                              type="password" 
                              value={loginInput}
                              onChange={(e) => setLoginInput(e.target.value)}
                              placeholder="sk-..." 
                              aria-label="Jules API Key"
                              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                              autoFocus
                          />
                      </div>
                      <button
                          type="submit"
                          disabled={!loginInput.trim()}
                          className={`w-full font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                              !loginInput.trim()
                                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                      >
                          Enter App <ChevronRight size={16} />
                      </button>
                  </form>
              </div>
          </div>
      );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-textMain font-sans flex flex-col overflow-hidden">
      <Header 
        onOpenDrawer={() => setIsDrawerOpen(true)}
        currentSource={currentSource}
        sources={sources}
        onSourceChange={setCurrentSource}
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
              setView('repository');
              setIsDrawerOpen(false);
          }}
      />

      {view === 'home' && (
          <HomeView 
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
              error={error}
              currentSource={currentSource}
              onResetKey={() => {
                  localStorage.removeItem('jules_api_key');
                  setApiKey('');
              }}
          />
      )}

      {view === 'session' && currentSession && (
          <SessionView 
              session={currentSession}
              activities={activities}
              isProcessing={isProcessing}
              error={error}
              onSendMessage={(text) => handleSendMessage(text, 'START')} 
              onApprovePlan={handleApprovePlan}
          />
      )}

      {view === 'repository' && currentSource && (
          <RepositoryView 
              source={currentSource}
              sessions={sessions}
              onSelectSession={handleSelectSession}
              onCreateNew={() => {
                  setCurrentSession(null);
                  setView('home');
              }}
          />
      )}
    </div>
  );
}