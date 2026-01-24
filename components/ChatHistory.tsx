import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { JulesActivity, Step } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, CheckCircle2, CircleDashed, GitPullRequest, Terminal,
    Loader2, Sparkles, GitMerge, ListTodo, ChevronRight,
    ChevronDown, Copy, ExternalLink, FileDiff, FileText, Image as ImageIcon,
    Command, Clock, Bot, Download, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { twMerge } from 'tailwind-merge';

interface ChatHistoryProps {
    activities: JulesActivity[];
    isStreaming: boolean;
    onApprovePlan: (activityId: string) => void;
    sessionOutputs?: Array<{ pullRequest?: { url: string; title: string; description: string } }>;
    sessionPrompt?: string;
    sessionCreateTime?: string;
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
    // Handle nested message fields and their snake_case variants
    const content =
        msg.userMessage || msg.user_message ||
        msg.agentMessage || msg.agent_message ||
        msg.text || msg.message || msg.content ||
        msg.prompt || "";

    if (content) return content;

    if (msg.parts && Array.isArray(msg.parts)) {
        return msg.parts.map((p: any) => p.text || "").join("");
    }
    return "";
};

const MarkdownComponents = {
    code({ node, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '')
        // If there is a language match, treat as block code
        if (match) {
            return (
                <div className="rounded-lg bg-[#000000]/40 border border-white/10 overflow-hidden my-3 w-full shadow-inner">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{match[1]}</span>
                    </div>
                    <pre className="p-3 overflow-x-auto text-sm text-zinc-300 font-mono custom-scrollbar">
                        <code className={className} {...props}>
                            {children}
                        </code>
                    </pre>
                </div>
            )
        }
        // Otherwise treat as inline code
        return (
            <code className={twMerge("bg-white/10 rounded px-1.5 py-0.5 text-[0.9em] font-mono text-zinc-200 break-all", className)} {...props}>
                {children}
            </code>
        )
    },
    a({ node, children, ...props }: any) {
        return <a target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors break-all" {...props}>{children}</a>
    },
    ul({ children }: any) { return <ul className="list-disc pl-5 space-y-1 my-2 marker:text-zinc-500">{children}</ul> },
    ol({ children }: any) { return <ol className="list-decimal pl-5 space-y-1 my-2 marker:text-zinc-500">{children}</ol> },
    h1({ children }: any) { return <h1 className="text-lg font-semibold mt-4 mb-2 text-zinc-100">{children}</h1> },
    h2({ children }: any) { return <h2 className="text-base font-medium mt-3 mb-2 text-zinc-100">{children}</h2> },
    h3({ children }: any) { return <h3 className="text-sm font-medium mt-3 mb-1 text-zinc-200">{children}</h3> },
    p({ children }: any) { return <p className="mb-2 last:mb-0 leading-relaxed break-words">{children}</p> },
    li({ children }: any) { return <li className="pl-1 break-words leading-relaxed">{children}</li> },
    // Use fragment for pre to avoid nested pre tags when we render block code
    pre({ children }: any) { return <>{children}</> }
};

const UserMessageBubble: React.FC<{ text: string, time?: string }> = ({ text, time }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLong = text.length > 300 || text.split('\n').length > 5;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 sm:gap-4 justify-end w-full"
        >
            <div className="flex flex-col items-end gap-1 max-w-[90%] sm:max-w-[75%]">
                <div
                    onClick={() => isLong && setIsExpanded(!isExpanded)}
                    className={twMerge(
                        "group relative bg-[#27272A] text-white border border-white/5 rounded-[20px] sm:rounded-[24px] px-4 py-3 sm:px-5 sm:py-3.5 text-[15px] leading-relaxed shadow-lg",
                        isLong && "cursor-pointer hover:bg-[#323236] transition-colors pr-10"
                    )}
                >
                    <div className={twMerge(
                        !isExpanded && isLong && 'line-clamp-[8] overflow-hidden',
                        "prose prose-invert prose-p:my-0 prose-pre:my-2 max-w-none break-words"
                    )}>
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
        </motion.div>
    );
};

const PlanStepItem: React.FC<{ step: Step, index: number }> = ({ step, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            layout
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
                <ChevronDown size={14} className={twMerge("text-zinc-500 group-hover:text-zinc-300 flex-shrink-0 transition-transform", isExpanded && "rotate-180")} />
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-9 text-sm text-zinc-400 leading-relaxed font-light overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <ReactMarkdown components={MarkdownComponents}>
                            {step.description}
                        </ReactMarkdown>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const CommandArtifact: React.FC<{ command: string, output?: string }> = ({ command, output }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full max-w-2xl">
            <div
                className={twMerge(
                    "font-mono text-xs bg-[#09090b] border border-white/10 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/5 transition-all hover:border-white/20",
                    isExpanded ? "border-white/20" : ""
                )}
            >
                {/* Header - Click to toggle */}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between px-3 py-2.5 bg-white/[0.02] border-b border-white/5 cursor-pointer hover:bg-white/[0.05] transition-colors group"
                >
                    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                        <Terminal size={14} className="text-zinc-500 flex-shrink-0" />
                        <div className="flex items-center gap-2 min-w-0 truncate">
                            <span className="text-green-500 font-bold">➜</span>
                            <span className="font-medium text-zinc-300 truncate">{command}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pl-3 flex-shrink-0">
                        {!isExpanded && output && (
                            <span className="text-[10px] text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                Output
                            </span>
                        )}
                        <ChevronDown
                            size={14}
                            className={twMerge(
                                "text-zinc-500 transition-transform duration-200",
                                isExpanded && "rotate-180"
                            )}
                        />
                    </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-3.5 overflow-x-auto custom-scrollbar max-h-[400px] border-t border-white/5 bg-black/20">
                                {output ? (
                                    <div className="text-zinc-400/90 whitespace-pre-wrap break-all leading-relaxed font-mono text-xs">
                                        {output}
                                    </div>
                                ) : (
                                    <span className="text-zinc-600 italic">No output</span>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const CodeChangeArtifact: React.FC<{ changeSet?: any }> = ({ changeSet }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!changeSet?.gitPatch?.unidiffPatch) return null;

    return (
        <div className="w-full max-w-2xl">
            <div
                className={twMerge(
                    "bg-[#09090b] border border-white/10 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/5 transition-all hover:border-white/20",
                    isExpanded ? "border-white/20" : ""
                )}
            >
                {/* Header - Click to toggle */}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between px-3 py-2.5 bg-white/[0.02] border-b border-white/5 cursor-pointer hover:bg-white/[0.05] transition-colors group"
                >
                    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                        <FileDiff size={14} className="text-zinc-500 flex-shrink-0" />
                        <div className="flex items-center gap-2 min-w-0 truncate">
                            <span className="font-medium text-zinc-300 truncate font-mono text-xs">
                                {changeSet.gitPatch?.suggestedCommitMessage || "Code Changes Proposed"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pl-3 flex-shrink-0">
                        {!isExpanded && (
                            <span className="text-[10px] text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                View Diff
                            </span>
                        )}
                        <ChevronDown
                            size={14}
                            className={twMerge(
                                "text-zinc-500 transition-transform duration-200",
                                isExpanded && "rotate-180"
                            )}
                        />
                    </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-0 overflow-x-auto custom-scrollbar max-h-[500px] border-t border-white/5 bg-[#0d0d10]">
                                <pre className="p-3 font-mono text-xs leading-relaxed">
                                    {changeSet.gitPatch.unidiffPatch.split('\n').map((line: string, i: number) => {
                                        let color = "text-zinc-400";
                                        let bg = "transparent";

                                        if (line.startsWith('+') && !line.startsWith('+++')) {
                                            color = "text-green-400";
                                            bg = "bg-green-500/5";
                                        } else if (line.startsWith('-') && !line.startsWith('---')) {
                                            color = "text-red-400";
                                            bg = "bg-red-500/5";
                                        } else if (line.startsWith('@@')) {
                                            color = "text-indigo-400";
                                        }

                                        return (
                                            <div key={i} className={`${bg} px-2 -mx-2 w-full`}>
                                                <span className={`${color} inline-block min-w-full`}>{line}</span>
                                            </div>
                                        );
                                    })}
                                </pre>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const CompactSessionCompleted: React.FC = () => {
    React.useEffect(() => {
        const end = Date.now() + 1000;
        const colors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1'];

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center my-6"
        >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 shadow-lg shadow-green-500/10 backdrop-blur-sm">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-xs font-medium text-green-100">Session Completed Successfully</span>
            </div>
        </motion.div>
    );
};

export const ChatHistory: React.FC<ChatHistoryProps> = ({ activities, isStreaming, onApprovePlan, sessionOutputs, sessionPrompt, sessionCreateTime }) => {
    // Check if the initial prompt is already represented in activities
    const hasInitialPromptInActivities = activities.some(act => {
        const userText = act.userMessaged ? getTextContent(act.userMessaged) : (act.userMessage ? getTextContent(act.userMessage) : "");
        return userText && sessionPrompt && (userText.trim() === sessionPrompt.trim() || sessionPrompt.trim().includes(userText.trim()));
    });

    return (
        <div className="space-y-6 sm:space-y-8 px-2 sm:px-4">
            <AnimatePresence initial={false}>
                {/* 0. Initial Prompt (if not in activities) */}
                {sessionPrompt && !hasInitialPromptInActivities && (
                    <UserMessageBubble
                        key="initial-prompt"
                        text={sessionPrompt}
                        time={formatTime(sessionCreateTime)}
                    />
                )}

                {activities.map((act) => {
                    const timeString = formatTime(act.createTime);
                    const items: React.ReactNode[] = [];

                    // --- 0. System Messages ---
                    if (act.originator === 'system' && !act.planGenerated && !act.userMessaged && !act.agentMessaged && act.description) {
                        items.push(
                            <motion.div
                                key="system"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex justify-center my-6"
                            >
                                <span className="text-[11px] text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/5 font-medium tracking-wide text-center">
                                    {act.description}
                                </span>
                            </motion.div>
                        );
                    }

                    // --- 1. User Message ---
                    if (act.userMessaged || act.userMessage) {
                        const userText = getTextContent(act.userMessaged || act.userMessage);
                        if (userText) {
                            items.push(<UserMessageBubble key="user" text={userText} time={timeString} />);
                        }
                    }

                    // --- 2. Agent Message ---
                    if (act.agentMessaged || act.agentMessage) {
                        const agentText = getTextContent(act.agentMessaged || act.agentMessage) || "Thinking...";
                        items.push(
                            <motion.div
                                key="agent"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex gap-3 sm:gap-5 justify-start group w-full"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#18181B] flex-shrink-0 flex items-center justify-center border border-white/10 mt-1 shadow-sm">
                                    <Bot size={18} className="text-indigo-400" />
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
                            </motion.div>
                        );
                    }

                    // --- 3. Plan Generated ---
                    if (act.planGenerated) {
                        const isApproved = activities.some(a => a.planApproved && a.createTime > act.createTime);
                        items.push(
                            <motion.div
                                key="plan"
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="flex gap-3 sm:gap-5 justify-start"
                            >
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
                            </motion.div>
                        );
                    }

                    // --- 4. Artifacts ---
                    if (act.artifacts && act.artifacts.length > 0) {
                        act.artifacts.forEach((artifact, i) => {
                            if (artifact.bashOutput) {
                                items.push(
                                    <motion.div
                                        key={`art-${i}-bash`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3 sm:gap-5 justify-start"
                                    >
                                        <div className="w-8 h-8 flex-shrink-0" />
                                        <CommandArtifact
                                            command={artifact.bashOutput.command}
                                            output={artifact.bashOutput.output}
                                        />
                                    </motion.div>
                                );
                            }

                            if (artifact.media) {
                                items.push(
                                    <motion.div
                                        key={`art-${i}-media`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3 sm:gap-5 justify-start"
                                    >
                                        <div className="w-8 h-8 flex-shrink-0" />
                                        <div className="max-w-xl rounded-xl overflow-hidden border border-white/10 shadow-lg bg-[#0E0E11] group">
                                            <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5">
                                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                    <ImageIcon size={12} />
                                                    <span>Generated Artifact</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`data:${artifact.media.mimeType};base64,${artifact.media.data}`}
                                                        download={`artifact-${i}.${artifact.media.mimeType.split('/')[1] || 'png'}`}
                                                        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 hover:bg-white/10 rounded"
                                                        title="Download"
                                                    >
                                                        <Download size={14} />
                                                    </a>
                                                    <a
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const win = window.open();
                                                            win?.document.write(
                                                                `<iframe src="data:${artifact.media.mimeType};base64,${artifact.media.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                                                            );
                                                        }}
                                                        href="#"
                                                        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 hover:bg-white/10 rounded"
                                                        title="Open in new window"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="relative bg-[#18181b] flex justify-center p-2">
                                                <img
                                                    src={`data:${artifact.media.mimeType};base64,${artifact.media.data}`}
                                                    alt="Jules generated artifact"
                                                    className="w-full h-auto object-contain max-h-[400px]"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            }

                            if (artifact.changeSet) {
                                items.push(
                                    <motion.div
                                        key={`art-${i}-diff`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3 sm:gap-5 justify-start"
                                    >
                                        <div className="w-8 h-8 flex-shrink-0" />
                                        <CodeChangeArtifact changeSet={artifact.changeSet} />
                                    </motion.div>
                                );
                            }
                        });
                    }

                    // --- 5. Progress Updates ---
                    if (act.progressUpdated) {
                        const progress = act.progressUpdated;
                        const title = progress.title || progress.progress_title || progress.status || progress.status_update || act.description || "Processing";
                        const description = progress.description || progress.progress_description || progress.text || progress.message;
                        const cleanTitle = title.trim().toLowerCase();
                        const cleanDesc = description ? description.trim().toLowerCase() : "";
                        const isRedundant = !description || cleanTitle === cleanDesc || cleanTitle.includes(cleanDesc);

                        // Only spin if this is the most recent progress/agent action
                        const activitiesAfter = activities.slice(activities.indexOf(act) + 1);
                        const isCurrentlyActive = !activitiesAfter.some(a =>
                            a.progressUpdated || a.agentMessage || a.agentMessaged ||
                            a.planGenerated || a.sessionCompleted || a.sessionFailed
                        );

                        items.push(
                            <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 sm:gap-5 justify-start items-start">
                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-0.5" />
                                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono bg-[#161619] px-3 py-2 rounded-xl border border-white/5 shadow-sm max-w-[90%] sm:max-w-xl hover:border-white/10 transition-colors">
                                    <Loader2
                                        size={14}
                                        className={twMerge(
                                            "text-indigo-500 flex-shrink-0",
                                            isCurrentlyActive && "animate-spin"
                                        )}
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium text-zinc-300 transition-colors">
                                            {title}
                                        </span>
                                        {!isRedundant && (
                                            <span className="text-zinc-500 font-sans truncate text-[10px] mt-0.5 opacity-80">{description}</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }

                    // --- 6. Session Completed ---
                    if (act.sessionCompleted) {
                        items.push(<CompactSessionCompleted key="completed" />);
                    }

                    if (items.length === 0) return null;
                    return <React.Fragment key={act.name}>{items}</React.Fragment>;
                })}

                {/* Session Outputs */}
                {sessionOutputs && sessionOutputs.map((out, i) => (
                    <motion.div
                        key={`out-${i}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-4 sm:gap-5 justify-start"
                    >
                        <div className="w-8 h-8 flex-shrink-0" />
                        <div className="w-full max-w-lg bg-[#121215] border border-white/10 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                            {/* ... (Existing PR Card Content) ... */}
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
                                <a href={out.pullRequest?.url} target="_blank" rel="noreferrer" className="block group">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                                            <GitPullRequest size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors leading-snug break-words">
                                                {out.pullRequest?.title || "Untitled Pull Request"}
                                            </div>
                                            {out.pullRequest?.description && (
                                                <div className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                                    {out.pullRequest.description}
                                                </div>
                                            )}
                                            <div className="text-xs text-zinc-500 truncate mt-1 font-mono flex items-center gap-1">
                                                <span>#{out.pullRequest?.url.split('/').pop()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {isStreaming && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-5"
                    >
                        <div className="w-8 h-8 rounded-full bg-[#18181B] flex-shrink-0 border border-white/10 flex items-center justify-center mt-1">
                            <Bot size={18} className="text-indigo-400 opacity-70" />
                        </div>
                        <div className="flex items-center gap-1.5 pt-3">
                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};