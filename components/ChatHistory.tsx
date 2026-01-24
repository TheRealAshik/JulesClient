import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { JulesActivity, Step } from '../types';
import { 
    Check, CheckCircle2, CircleDashed, GitPullRequest, Terminal, 
    Loader2, Sparkles, GitMerge, ListTodo, ChevronRight, 
    ChevronDown, Copy, ExternalLink, FileDiff, FileText, Image as ImageIcon,
    Command, Clock
} from 'lucide-react';

interface ChatHistoryProps {
  activities: JulesActivity[];
  isStreaming: boolean;
  onApprovePlan: (activityId: string) => void;
  sessionOutputs?: Array<{ pullRequest?: { url: string; title: string; description: string } }>;
}

const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '';
    }
};

const getTextContent = (msg: any): string => {
    if (!msg) return "";
    if (typeof msg === 'string') return msg;
    if (msg.userMessage) return msg.userMessage;
    if (msg.agentMessage) return msg.agentMessage;
    if (msg.text) return msg.text;
    if (msg.prompt) return msg.prompt;
    if (msg.message) return msg.message;
    if (msg.content) return msg.content;
    if (msg.parts && Array.isArray(msg.parts)) {
        return msg.parts.map((p: any) => p.text || "").join("");
    }
    return "";
};

const MarkdownComponents = {
    // Custom styling for code blocks
    code({node, inline, className, children, ...props}: any) {
        const match = /language-(\w+)/.exec(className || '')
        if (!inline) {
            return (
                <div className="rounded-lg bg-[#000000]/30 border border-white/10 overflow-hidden my-3 w-full">
                    {match && (
                        <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{match[1]}</span>
                        </div>
                    )}
                    <pre className="p-3 overflow-x-auto text-sm text-zinc-300 font-mono custom-scrollbar">
                        <code className={className} {...props}>
                            {children}
                        </code>
                    </pre>
                </div>
            )
        }
        return (
            <code className="bg-white/10 rounded px-1.5 py-0.5 text-[0.9em] font-mono text-inherit break-all" {...props}>
                {children}
            </code>
        )
    },
    // Ensure links open in new tab
    a({node, children, ...props}: any) {
        return <a target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors break-all" {...props}>{children}</a>
    },
    // Style lists
    ul({children}: any) {
        return <ul className="list-disc pl-5 space-y-1 my-2 marker:text-zinc-500">{children}</ul>
    },
    ol({children}: any) {
        return <ol className="list-decimal pl-5 space-y-1 my-2 marker:text-zinc-500">{children}</li>
    },
    // Headers
    h1({children}: any) { return <h1 className="text-lg font-semibold mt-4 mb-2 text-zinc-100">{children}</h1> },
    h2({children}: any) { return <h2 className="text-base font-medium mt-3 mb-2 text-zinc-100">{children}</h2> },
    h3({children}: any) { return <h3 className="text-sm font-medium mt-3 mb-1 text-zinc-200">{children}</h3> },
    // Paragraph spacing
    p({children}: any) { return <p className="mb-2 last:mb-0 leading-relaxed break-words">{children}</p> },
    li({children}: any) { return <li className="pl-1 break-words leading-relaxed">{children}</li> }
};

const UserMessageBubble: React.FC<{ text: string, time?: string }> = ({ text, time }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLong = text.length > 300 || text.split('\n').length > 5;

    return (
        <div className="flex gap-4 justify-end w-full">
            <div className="flex flex-col items-end gap-1 max-w-full sm:max-w-[85%]">
                <div 
                    onClick={() => isLong && setIsExpanded(!isExpanded)}
                    className={`
                        group relative bg-[#27272A] text-white border border-white/5 rounded-[24px] px-5 py-3.5 text-[15px] leading-relaxed shadow-md
                        ${isLong ? 'cursor-pointer hover:bg-[#323236] transition-colors pr-10' : ''}
                        w-full
                    `}
                >
                    <div className={`
                        ${!isExpanded && isLong ? 'line-clamp-[8] overflow-hidden' : ''}
                        prose prose-invert prose-p:my-0 prose-pre:my-2 max-w-none break-words
                    `}>
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={MarkdownComponents}
                        >
                            {text}
                        </ReactMarkdown>
                    </div>
                    
                    {isLong && (
                        <div className="absolute top-4 right-4 text-zinc-400 group-hover:text-white transition-colors">
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                    )}
                </div>
                {time && <span className="text-[10px] text-zinc-600 font-mono px-1">{time}</span>}
            </div>
        </div>
    );
};

const PlanStepItem: React.FC<{ step: Step, index: number }> = ({ step, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-col gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5 select-none"
        >
            <div className="flex items-center gap-3">
                 <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#18181B] border border-white/10 flex items-center justify-center text-[10px] font-mono text-zinc-500 group-hover:border-indigo-500/50 group-hover:text-indigo-300 transition-colors">
                     {index + 1}
                 </div>
                 <span className="text-sm font-medium text-zinc-200 group-hover:text-white flex-1 leading-snug truncate">
                    {step.title || "Untitled Step"}
                 </span>
                 {isExpanded ? <ChevronDown size={14} className="text-zinc-500 group-hover:text-zinc-300 flex-shrink-0" /> : <ChevronRight size={14} className="text-zinc-500 group-hover:text-zinc-300 flex-shrink-0" />}
            </div>
            
            {isExpanded && (
                <div className="pl-9 text-sm text-zinc-400 leading-relaxed font-light animate-in fade-in slide-in-from-top-1 duration-200 cursor-text" onClick={e => e.stopPropagation()}>
                    <ReactMarkdown components={MarkdownComponents}>
                        {step.description}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    );
};

export const ChatHistory: React.FC<ChatHistoryProps> = ({ activities, isStreaming, onApprovePlan, sessionOutputs }) => {
  return (
    <div className="space-y-6 sm:space-y-8 px-2 sm:px-4">
      {activities.map((act) => {
        const timeString = formatTime(act.createTime);

        // --- 0. System Messages (Originator: system) ---
        if (act.originator === 'system' && !act.planGenerated && !act.userMessaged && !act.agentMessaged && act.description) {
            return (
                <div key={act.name} className="flex justify-center my-6 animate-in fade-in duration-500">
                     <span className="text-[11px] text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/5 font-medium tracking-wide text-center">
                        {act.description}
                     </span>
                </div>
            );
        }

        // --- 1. User Message ---
        if (act.userMessaged) {
            const userText = getTextContent(act.userMessaged);
            if (!userText) return null;
            return <UserMessageBubble key={act.name} text={userText} time={timeString} />;
        }

        // --- 2. Agent Message ---
        if (act.agentMessaged) {
            const agentText = getTextContent(act.agentMessaged) || "Thinking...";
            return (
                <div key={act.name} className="flex gap-4 sm:gap-5 justify-start group w-full">
                    <div className="w-8 h-8 rounded-full bg-[#18181B] flex-shrink-0 flex items-center justify-center border border-white/10 mt-1 shadow-sm">
                        <img src="https://jules.google/squid.png" alt="Jules" className="w-5 h-5 object-contain opacity-90" />
                    </div>
                    <div className="max-w-full sm:max-w-[90%] flex flex-col gap-1">
                        <div className="text-zinc-200 text-[15px] leading-relaxed pt-1.5 font-light">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={MarkdownComponents}
                            >
                                {agentText}
                            </ReactMarkdown>
                        </div>
                        {timeString && (
                            <div className="text-[10px] text-zinc-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                Jules • {timeString}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // --- 3. Plan Generated (Actionable) ---
        if (act.planGenerated) {
            const isApproved = activities.some(a => a.planApproved && a.createTime > act.createTime);
            
            return (
                <div key={act.name} className="flex gap-4 sm:gap-5 justify-start animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="w-8 h-8 flex-shrink-0" />
                    <div className="w-full max-w-xl bg-[#121215] border border-white/10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                        <div className="bg-[#18181B] px-5 py-3 border-b border-white/5 flex items-center justify-between">
                            <span className="text-sm font-medium text-white flex items-center gap-2">
                                <ListTodo size={16} className="text-indigo-400" />
                                Execution Plan
                            </span>
                            <span className="text-xs text-zinc-500 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                {act.planGenerated.plan?.steps?.length || 0} steps
                            </span>
                        </div>
                        <div className="p-2 space-y-1">
                            {act.planGenerated.plan?.steps ? (
                                act.planGenerated.plan.steps.map((step, i) => (
                                    <PlanStepItem key={i} step={step} index={i} />
                                ))
                            ) : (
                                <div className="p-4 text-sm italic text-zinc-500">Generating plan details...</div>
                            )}
                        </div>
                        <div className="p-4 bg-black/20 border-t border-white/5 flex justify-between items-center gap-4">
                            <span className="text-xs text-zinc-500 hidden sm:block">Review the plan before continuing.</span>
                            <div className="ml-auto w-full sm:w-auto">
                                {isApproved ? (
                                    <div className="flex justify-center sm:justify-end">
                                        <span className="flex items-center gap-2 text-xs font-medium text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                                            <Check size={12} /> Plan approved
                                        </span>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => onApprovePlan(act.name)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 active:scale-95"
                                    >
                                        Start Coding <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // --- 4. Progress Updates ---
        if (act.progressUpdated) {
             const title = act.progressUpdated.title || act.progressUpdated.status || "Processing";
             const description = act.progressUpdated.description;
             // Check if description is redundant (identical to title)
             const cleanTitle = title.trim().toLowerCase();
             const cleanDesc = description ? description.trim().toLowerCase() : "";
             const isRedundant = !description || cleanTitle === cleanDesc || cleanTitle.includes(cleanDesc);

             return (
                 <div key={act.name} className="flex gap-4 sm:gap-5 justify-start items-start animate-in fade-in duration-300">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-0.5">
                         {/* Empty aligner or small dot could go here */}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono bg-[#161619] px-3 py-2 rounded-xl border border-white/5 shadow-sm max-w-[85%] sm:max-w-xl hover:border-white/10 transition-colors">
                        <Loader2 size={14} className="animate-spin text-indigo-500 flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                            <span className="font-medium text-zinc-300 truncate">{title}</span>
                            {!isRedundant && (
                                <span className="text-zinc-500 font-sans truncate text-[10px] mt-0.5 opacity-80">{description}</span>
                            )}
                        </div>
                    </div>
                 </div>
             );
        }

        // --- 5. Session Completed ---
        if (act.sessionCompleted) {
             return (
                 <div key={act.name} className="flex justify-center my-8 animate-in fade-in zoom-in duration-700">
                      <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-gradient-to-b from-[#18181B] to-[#121215] border border-white/10 shadow-xl w-full max-w-sm mx-4">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 mb-1">
                              <CheckCircle2 size={20} />
                          </div>
                          <span className="text-sm font-medium text-white">Session Completed</span>
                          <span className="text-xs text-zinc-500 text-center">All tasks have been executed successfully.</span>
                      </div>
                 </div>
             );
        }

        // --- 6. Artifacts (Media, Bash, Git Patch) ---
        if (act.artifacts && act.artifacts.length > 0) {
             return act.artifacts.map((artifact, i) => {
                 // --- A. Bash Output ---
                 if (artifact.bashOutput) {
                     const { command, output, exitCode } = artifact.bashOutput;
                     const isSuccess = exitCode === 0;

                     return (
                        <div key={`${act.name}-bash-${i}`} className="flex gap-4 sm:gap-5 justify-start group animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center pt-1" />
                            <div className="w-full max-w-2xl">
                                <div className="flex items-center gap-2 mb-1.5 ml-1">
                                    <span className="text-[10px] font-mono text-zinc-500">{timeString}</span>
                                    {isSuccess ? (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-medium">Success</span>
                                    ) : (
                                         <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium">Exit {exitCode}</span>
                                    )}
                                </div>
                                
                                <div className="font-mono text-xs bg-[#09090b] border border-white/10 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/5 transition-all hover:border-white/20">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/5">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Terminal size={13} />
                                            <span className="font-medium text-zinc-300">Terminal</span>
                                        </div>
                                        <div className="flex gap-1.5 opacity-60">
                                            <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/20" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/20" />
                                            <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/20" />
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-3.5 space-y-3 overflow-x-auto custom-scrollbar">
                                        <div className="flex gap-2.5 min-w-max items-start">
                                            <span className="text-green-500 select-none font-bold mt-[1px]">➜</span>
                                            <span className="text-zinc-100 font-medium">{command}</span>
                                        </div>
                                        {output && (
                                            <div className="text-zinc-400/90 pl-5 whitespace-pre-wrap break-all leading-relaxed border-l-2 border-white/5 ml-0.5">
                                                {output}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                     );
                 }
                 
                 // --- B. Media (Images) ---
                 if (artifact.media) {
                     return (
                        <div key={`${act.name}-media-${i}`} className="flex gap-4 sm:gap-5 justify-start">
                             <div className="w-8 h-8 flex-shrink-0" />
                             <div className="group relative rounded-xl overflow-hidden border border-white/10 shadow-lg bg-[#121215] max-w-md w-full">
                                 {artifact.media.mimeType.startsWith('image/') ? (
                                     <img 
                                        src={`data:${artifact.media.mimeType};base64,${artifact.media.data}`} 
                                        alt="Generated Artifact" 
                                        className="w-full h-auto object-contain block"
                                     />
                                 ) : (
                                     <div className="p-8 flex flex-col items-center justify-center text-zinc-500 gap-2">
                                         <ImageIcon size={32} />
                                         <span className="text-xs">Unsupported Media Type: {artifact.media.mimeType}</span>
                                     </div>
                                 )}
                             </div>
                        </div>
                     );
                 }

                 // --- C. Git Patch (ChangeSet) ---
                 if (artifact.changeSet?.gitPatch) {
                     const patch = artifact.changeSet.gitPatch;
                     const diff = patch.unidiffPatch || "";
                     const commitMsg = patch.suggestedCommitMessage || "Update from Jules";
                     const sourceName = artifact.changeSet.source || "repository";
                     
                     return (
                        <div key={`${act.name}-changeset-${i}`} className="flex gap-4 sm:gap-5 justify-start group animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="w-8 h-8 flex-shrink-0" />
                            <div className="w-full max-w-2xl">
                                <div className="flex items-center gap-2 mb-1.5 ml-1">
                                    <span className="text-[10px] font-mono text-zinc-500">{timeString}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">Git Patch</span>
                                </div>

                                <div className="bg-[#121215] border border-white/10 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/5 transition-all hover:border-white/20">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-white/[0.03] to-transparent px-4 py-3 border-b border-white/5 flex items-start justify-between gap-4">
                                         <div className="flex items-start gap-3 overflow-hidden">
                                             <div className="mt-0.5 p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                                                 <FileDiff size={14} />
                                             </div>
                                             <div className="flex flex-col min-w-0">
                                                 <span className="text-zinc-200 font-medium text-sm truncate leading-snug">
                                                    {commitMsg}
                                                 </span>
                                                 <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5 truncate">
                                                    <Command size={10} />
                                                    <span className="truncate max-w-[200px]">{sourceName.split('/').slice(-2).join('/')}</span>
                                                 </div>
                                             </div>
                                         </div>
                                         
                                         <div className="flex items-center gap-2 flex-shrink-0">
                                             <span className="text-[10px] font-mono text-zinc-600 bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
                                                 {patch.baseCommitId ? patch.baseCommitId.substring(0, 7) : 'HEAD'}
                                             </span>
                                         </div>
                                    </div>

                                    {/* Diff View */}
                                    <div className="relative bg-[#0b0b0d]">
                                        <pre className="text-[11px] font-mono text-zinc-400 p-0 leading-5 overflow-x-auto custom-scrollbar max-h-[320px]">
                                            {diff.split('\n').map((line, lineIdx) => {
                                                if (line.startsWith('+++') || line.startsWith('---')) {
                                                    return <div key={lineIdx} className="px-4 text-zinc-500 bg-white/[0.02] min-w-max">{line}</div>;
                                                }
                                                if (line.startsWith('@@')) {
                                                    return <div key={lineIdx} className="px-4 text-purple-400/90 py-1 font-semibold bg-purple-500/5 border-y border-purple-500/5 my-1 min-w-max">{line}</div>;
                                                }
                                                if (line.startsWith('+')) {
                                                    return (
                                                        <div key={lineIdx} className="flex bg-green-500/[0.08] hover:bg-green-500/[0.12] transition-colors min-w-max">
                                                            <div className="w-6 text-center select-none text-green-700/50 flex-shrink-0">+</div>
                                                            <div className="text-green-300/90 px-2">{line.substring(1)}</div>
                                                        </div>
                                                    );
                                                }
                                                if (line.startsWith('-')) {
                                                    return (
                                                        <div key={lineIdx} className="flex bg-red-500/[0.08] hover:bg-red-500/[0.12] transition-colors min-w-max">
                                                            <div className="w-6 text-center select-none text-red-700/50 flex-shrink-0">-</div>
                                                            <div className="text-red-300/90 px-2">{line.substring(1)}</div>
                                                        </div>
                                                    );
                                                }
                                                return <div key={lineIdx} className="px-4 opacity-50 min-w-max">{line}</div>;
                                            })}
                                        </pre>
                                    </div>
                                    
                                    {/* Footer */}
                                    <div className="px-3 py-2 bg-white/[0.02] border-t border-white/5 flex justify-end">
                                        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1.5 px-2 py-1 hover:bg-white/5 rounded">
                                            Review Changes <ChevronRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                     );
                 }

                 return null;
             });
        }
        
        return null; 
      })}

      {/* --- Session Output (PR Card) --- */}
      {sessionOutputs && sessionOutputs.map((out, i) => (
          <div key={i} className="flex gap-4 sm:gap-5 justify-start animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-8 h-8 flex-shrink-0" />
                
                <div className="w-full max-w-lg bg-[#121215] border border-white/10 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                    {/* Header */}
                    <div className="bg-[#18181B] px-4 py-3 border-b border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <div className="relative flex h-2 w-2">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                             </div>
                             <span className="text-zinc-200 font-medium text-sm">Pull Request Ready</span>
                         </div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                        {/* Title Link */}
                        <a href={out.pullRequest?.url} target="_blank" rel="noreferrer" className="block group">
                            <div className="flex items-start gap-3">
                                 <div className="mt-0.5 p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                                    <GitPullRequest size={18} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors leading-snug break-words">
                                        {out.pullRequest?.title || "Untitled Pull Request"}
                                     </div>
                                     <div className="text-xs text-zinc-500 truncate mt-1 font-mono flex items-center gap-1">
                                        <span>#{out.pullRequest?.url.split('/').pop()}</span>
                                        <span>•</span>
                                        <span className="hover:underline truncate">{out.pullRequest?.url.replace('https://github.com/', '')}</span>
                                     </div>
                                 </div>
                                 <ExternalLink size={14} className="text-zinc-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
                            </div>
                        </a>
                        
                        {/* Description - Fixed height scrollable, NO MARKDOWN */}
                        {out.pullRequest?.description && (
                            <div className="relative rounded-lg bg-[#09090b] border border-white/5 p-3">
                                <div className="text-xs text-zinc-500 uppercase font-semibold mb-2 tracking-wider flex items-center gap-2">
                                    <FileText size={12} /> Description
                                </div>
                                <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[120px] overflow-y-auto custom-scrollbar pr-2 font-light break-words">
                                    {out.pullRequest.description}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Footer */}
                    <div className="px-4 py-3 bg-[#18181B]/50 border-t border-white/5 flex justify-between items-center gap-2">
                        <button 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            onClick={() => navigator.clipboard.writeText(out.pullRequest?.url || '')}
                        >
                            <Copy size={12} />
                            Copy Link
                        </button>
                        <div className="flex gap-2">
                            <a 
                                href={out.pullRequest?.url ? `${out.pullRequest.url}/files` : '#'} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                            >
                                <FileDiff size={12} />
                                Files
                            </a>
                            <a 
                                href={out.pullRequest?.url}
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                            >
                                <GitMerge size={12} />
                                Merge
                            </a>
                        </div>
                    </div>
                </div>
          </div>
      ))}

      {isStreaming && (
         <div className="flex gap-5 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-[#18181B] flex-shrink-0 border border-white/10 flex items-center justify-center mt-1">
                <img src="https://jules.google/squid.png" alt="Jules" className="w-4 h-4 object-contain opacity-70" />
            </div>
            <div className="flex items-center gap-1 pt-3">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce delay-150" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce delay-200" />
            </div>
         </div>
      )}
    </div>
  );
};