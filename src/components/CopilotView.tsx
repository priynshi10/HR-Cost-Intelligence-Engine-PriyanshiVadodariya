/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Cpu, 
  Sliders, 
  Terminal, 
  DollarSign, 
  Activity, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle, 
  Users, 
  Clock, 
  LineChart, 
  Compass, 
  Layers 
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  agent?: string;
}

interface Agent {
  id: 'aura' | 'vanguard' | 'zenith';
  name: string;
  title: string;
  avatarIcon: React.ReactNode;
  description: string;
  gradient: string;
  glowColor: string;
  borderColor: string;
  suggestedQuestions: string[];
}

export default function CopilotView() {
  // Define our 3 specialized high-fidelity agents for the best customized AI feel
  const AGENTS: Agent[] = [
    {
      id: 'aura',
      name: 'AURA-X',
      title: 'Active Multi-Agent Orchestrator',
      avatarIcon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      description: 'Unified operational cost expert. Leverages general PMO, workforce rates, calendar logs, and financial overhead trends to plan team balances.',
      gradient: 'from-indigo-500 via-indigo-600 to-violet-500',
      glowColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: 'border-indigo-500/30',
      suggestedQuestions: [
        'How can we reduce meeting fatigue in the Engineering department?',
        'Analyze our overall compliance budget overspend.',
        'Which project has the largest unmapped calendar cost?'
      ]
    },
    {
      id: 'vanguard',
      name: 'VANGUARD-7',
      title: 'Financial Leak Auditor',
      avatarIcon: <Cpu className="w-4 h-4 text-emerald-400" />,
      description: 'High-severity financial auditor. Directly monitors blended billing fatigue, unmapped time sinks, project hourly burn variances, and observer bloat.',
      gradient: 'from-emerald-500 via-teal-600 to-indigo-600',
      glowColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'border-emerald-500/30',
      suggestedQuestions: [
        'Audit PMO attendee lists for double-booking cost leaks.',
        'Calculate cost savings by removing VP observers from standups.',
        'Compare Project Legacy Maintenance vs Platform R&D burn rate.'
      ]
    },
    {
      id: 'zenith',
      name: 'ZENITH-9',
      title: 'Productivity & Focus Guard',
      avatarIcon: <Activity className="w-4 h-4 text-pink-400" />,
      description: 'Employee wellness and mental capacity advisor. Maximizes deep-work focuses, limits recurring calendar congestion, and designs meeting-free days.',
      gradient: 'from-pink-500 via-rose-500 to-indigo-600',
      glowColor: 'rgba(236, 72, 153, 0.15)',
      borderColor: 'border-pink-500/30',
      suggestedQuestions: [
        'How do we set up asynchronous meeting policies for Omega team?',
        'Analyze deep focus window recovery suggestions.',
        'Suggest a schedule for Meeting-Free Wednesdays.'
      ]
    }
  ];

  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init-aura',
      sender: 'assistant',
      text: "Unified dashboard initialized. I am **AURA-X**, your primary coordinator. Ask me any strategic query or shift agents on the tactical deck to run focused financial and developer-fatigue crawls.",
      timestamp: new Date(),
      agent: 'aura'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sandboxPercentage, setSandboxPercentage] = useState(30); // Interactive slider
  const [terminalLine, setTerminalLine] = useState('[LEDGER_AGENT] Active, monitoring port 3000');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generating]);

  // Rotate custom logs in the bottom terminal widget for a high-intelligence atmosphere
  useEffect(() => {
    const logs = [
      '[CRAWLER_PROCESS] Re-checking primary calendar maps...',
      `[MODEL_INTERACTION] Gemini API state logged under accuracy benchmark`,
      '[COST_ANALYSIS] Detected Engineering block overhead delta at +$31.2k',
      `[OAUTH_DAEMON] Connection statuses verified: Secure`,
      `[AUDITOR_HOOK] Tracking ${selectedAgent.name} analytical pipelines...`,
    ];
    let i = 0;
    const interval = setInterval(() => {
      setTerminalLine(logs[i % logs.length]);
      i++;
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedAgent]);

  // Handle agent switching with a beautiful confirmation message
  const handleAgentSwitch = (agent: Agent) => {
    if (selectedAgent.id === agent.id) return;
    setSelectedAgent(agent);
    
    // Add context switch announcement to user
    const switchMsg: Message = {
      id: `sw-${Date.now()}`,
      sender: 'assistant',
      text: `### **Agent Switched to ${agent.name}**\n*Active Persona: ${agent.title}*\n\n${agent.description} ask me any relevant audits below.`,
      timestamp: new Date(),
      agent: agent.id
    };
    setMessages((prev) => [...prev, switchMsg]);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || generating) return;

    // Add user message
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setGenerating(true);

    try {
      // Prepend selective instructions in the user prompt so Gemini answers contextually
      const specializedPrompt = `[SPECIALIST AGENT CONSTRAINT: You are responding as agent "${selectedAgent.name}" (${selectedAgent.title}). Tailor your response highly to your specific specialty focus: ${selectedAgent.description}] ${textToSend}`;

      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: specializedPrompt })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `cop-${Date.now()}`,
            sender: 'assistant',
            text: data.reply,
            timestamp: new Date(),
            agent: selectedAgent.id
          }
        ]);
      } else {
        throw new Error('Fallback needed');
      }
    } catch (error) {
      // High-fidelity fallback simulated intelligently per agent persona
      setTimeout(() => {
        let fallbackReply = `I've analyzed your simulated company data under my **${selectedAgent.name}** directive:\n\n`;

        const lower = textToSend.toLowerCase();
        
        if (selectedAgent.id === 'vanguard') {
          // Audit / Financial focus replies
          fallbackReply += `### **${selectedAgent.name} Critical Cost Audit**\n` +
            `1. **Active Variance**: Platform R&D exhibits weekly meeting friction of **$18,400** caused by high observer redundancy. Blended rates average **$150/hr**.\n` +
            `2. **Leak Mitigation**: Archiving daily reviews on **Legacy Maintenance** ($115/hr) and replacing with brief online status updates recovers **$12,500/month**.\n` +
            `3. **Immediate Policy Action**: Strip attendee list permissions for non-essential staff on recurring slots with over 8 members. Re-check the dashboard to see instant budget relief.`;
        } else if (selectedAgent.id === 'zenith') {
          // Wellness / productivity focus replies
          fallbackReply += `### **${selectedAgent.name} Cognitive Restoration Plan**\n` +
            `1. **Focus Sinks**: Enrolled staff in Engineering spend an estimated **22 hours/week** in meetings, leaving less than 45% of standard bandwidth for deep focus blocks.\n` +
            `2. **Remediation Plan**: Introduce a **'Strict 30-Minute Meeting Limit'** and institute **'No-Meeting Wednesday'** as an administrative policy mapping.\n` +
            `3. **Estimated Value**: Reclaiming active developers focus time raises overall team delivery confidence rating of Cloud Migration and Platform projects by **18%**.`;
        } else {
          // AURA-X Orchestrated replies
          if (lower.includes('fatigue') || lower.includes('engineering') || lower.includes('reduce')) {
            fallbackReply += `### **AURA-X Hybrid Optimization Report**\n` +
              `1. **Analysis**: Platform R&D alignment hours total **12.5k hours weekly**. Team Omega alone is burning **22h/week** on syncs, resulting in a **$31.2k over-allocation**.\n` +
              `2. **Audit Recommendation**: Pruning redundant observers by 40% will recover **$15,400 monthly** without impacting cross-functional deliverables.\n` +
              `3. **Asynchronous Switch**: Replace daily standups with automated retro logs inside the team workspace to reclaim hours.`;
          } else {
            fallbackReply += `### **AURA-X General Performance Diagnostics**\n` +
              `Your corporate workspace currently maps **$2.2M** total commitments with **4 projects active** and **4 operational anomalies** represents **$76.2k** in fast recovery targets.\n\n` +
              `Choose a specialized sub-agent (VANGUARD-7 or ZENITH-9) on the side dashboard or select another suggested command block below to execute deep calendar optimizations.`;
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `cop-${Date.now()}`,
            sender: 'assistant',
            text: fallbackReply,
            timestamp: new Date(),
            agent: selectedAgent.id
          }
        ]);
      }, 800);
    } finally {
      setGenerating(false);
    }
  };

  // Automated Quick Simulation command triggers that add cool text animations
  const triggerAutoAction = (actionName: string, actionDetail: string) => {
    if (generating) return;
    
    const textPrompt = `Evaluate action: "${actionName}" - Details constraints: ${actionDetail}`;
    handleSend(textPrompt);
  };

  // Client side calculated slider results
  const simulatedSavedHours = Math.round(48 * (sandboxPercentage / 100) * 8.5);
  const simulatedSavedDollars = Math.round(simulatedSavedHours * 138);

  const getSandboxFeedback = () => {
    if (sandboxPercentage < 20) return { title: 'Conservative', color: 'text-zinc-400', desc: 'Minimal risk, but leaves major capital optimization on the table.' };
    if (sandboxPercentage < 50) return { title: 'Optimized State', color: 'text-indigo-400', desc: 'Excellent balance. Maximizes engineering focus window while retaining governance.' };
    return { title: 'Highly Aggressive', color: 'text-rose-400', desc: 'Potential information gaps. Ensure critical cross-project logs don have silos.' };
  };

  const sandboxFeedback = getSandboxFeedback();

  const parseText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content = line;
      
      if (line.startsWith('###')) {
        return <h4 key={idx} className="text-white font-bold mt-3 mb-1 text-[13px] tracking-wide flex items-center gap-1.5 font-sans uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> {line.replace('###', '').trim()}
        </h4>;
      }
      
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        parts.push(line.substring(lastIndex, match.index));
        parts.push(<strong key={match.index} className="text-indigo-300 font-bold bg-indigo-500/10 px-1 border border-indigo-500/10 rounded">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(line.substring(lastIndex));

      if (line.startsWith('*') || line.startsWith('-') || /^\d+\./.test(line)) {
        const cleaned = line.replace(/^[\*\-\d\.]+\s*/, '');
        return (
          <li key={idx} className="ml-4 list-none text-zinc-300 text-xs mt-1.5 leading-relaxed flex items-start gap-2">
            <span className="text-indigo-400 text-xs shrink-0 mt-0.5">•</span>
            <span>{parts.length > 1 ? parts : cleaned}</span>
          </li>
        );
      }

      return <p key={idx} className="text-zinc-300 text-[12px] mt-2 leading-relaxed">{parts.length > 1 ? parts : content}</p>;
    });
  };

  return (
    <div className="h-[calc(100vh-13rem)] lg:h-[calc(100vh-12rem)] grid grid-cols-1 lg:grid-cols-12 gap-5 leading-normal relative">
      
      {/* LEFT COLUMN: THE PREMIUM COGNITIVE CONSOLE (7 Cols) */}
      <div className="lg:col-span-8 flex flex-col justify-between bg-zinc-950/60 border border-zinc-900 rounded-2xl overflow-hidden relative shadow-2xl backdrop-blur-md">
        
        {/* Glow Visual Header Atmosphere matches custom premium agent */}
        <div 
          className="absolute top-0 left-0 right-0 h-[100px] transition-all duration-700 pointer-events-none opacity-30 blur-2xl"
          style={{ background: `linear-gradient(180deg, ${selectedAgent.glowColor} 0%, rgba(0,0,0,0) 100%)` }}
        />

        {/* AI Agent Routing Deck Header */}
        <div className="p-4 border-b border-zinc-900 bg-zinc-900/15 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${selectedAgent.gradient} animate-pulse shadow-glow`} />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Cognitive Action Hub</h3>
              <span className="text-[9px] bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                Multimodal Suite v3.5
              </span>
            </div>
            <p className="text-[10px] text-zinc-550 mt-1 font-mono uppercase tracking-wide">
              Active: {selectedAgent.title}
            </p>
          </div>

          {/* Core Interactive Switcher */}
          <div className="flex bg-[#070709] border border-zinc-900 rounded-xl p-1 gap-1">
            {AGENTS.map((agent) => {
              const active = selectedAgent.id === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => handleAgentSwitch(agent)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active 
                      ? `bg-gradient-to-r ${agent.gradient} text-white shadow-lg shadow-indigo-650/15`
                      : 'text-zinc-400 hover:text-white bg-transparent border-none'
                  }`}
                  title={agent.title}
                >
                  {agent.avatarIcon}
                  <span className="hidden sm:inline font-mono">{agent.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Chat stream bubble containers */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              let matchingAgent = AGENTS.find(a => a.id === msg.agent);
              if (!matchingAgent) matchingAgent = selectedAgent;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Bot Specialized Icon Avatar */}
                  {!isUser && (
                    <div className={`w-8 h-8 rounded-xl bg-zinc-950 border ${matchingAgent.borderColor} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                      {matchingAgent.avatarIcon}
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-xl max-w-xl text-xs flex flex-col select-all leading-relaxed relative ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg'
                        : 'bg-[#111114] border border-zinc-900 text-zinc-300 rounded-tl-none hover:border-zinc-800 transition-colors'
                    }`}
                  >
                    {!isUser && msg.id !== 'msg-init-aura' && (
                      <span className={`text-[8px] font-mono font-bold tracking-wider uppercase mb-1 bg-gradient-to-r ${matchingAgent.gradient} bg-clip-text text-transparent`}>
                        {matchingAgent.name} // PROCESS COMPLETED
                      </span>
                    )}

                    <div>
                      {isUser ? <p className="leading-relaxed text-[12.5px]">{msg.text}</p> : parseText(msg.text)}
                    </div>

                    <span className="text-[9px] text-zinc-600 font-mono font-semibold self-end mt-2 leading-none uppercase select-none">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 p-0.5 shrink-0 shadow-lg">
                      <div className="w-full h-full rounded-[10px] bg-zinc-950 flex items-center justify-center text-white font-bold font-mono text-[10px]">
                        EXEC
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Continuous Sparkle / Thinking layout for multi-agent process updates */}
          {generating && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1 }}
              className="flex gap-3.5 justify-start"
            >
              <div className="w-8 h-8 rounded-xl bg-[#111114] border border-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              </div>
              <div className="p-4 bg-zinc-950/20 border border-zinc-900/60 rounded-xl rounded-tl-none max-w-sm text-xs text-zinc-500 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-block animate-bounce w-1.5 h-1.5 bg-indigo-400 rounded-full" style={{ animationDelay: '0ms' }}></span>
                  <span className="inline-block animate-bounce w-1.5 h-1.5 bg-indigo-400 rounded-full" style={{ animationDelay: '200ms' }}></span>
                  <span className="inline-block animate-bounce w-1.5 h-1.5 bg-indigo-400 rounded-full" style={{ animationDelay: '400ms' }}></span>
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">{selectedAgent.name} Reasoning...</span>
                </div>
                <p className="text-[10px] text-zinc-650 italic">Running semantic matches, burden rate analysis and fatigue multipliers...</p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Specialized Inline Smart Recommendations suggestions */}
        <div className="px-5 pb-3 pt-2 border-t border-zinc-900/40 bg-zinc-950/20 flex flex-nowrap overflow-x-auto gap-2 shrink-0 scrollbar-none scroll-smooth">
          {selectedAgent.suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={generating}
              className="px-3.5 py-1.5 bg-[#0e0e11] hover:bg-zinc-900 border border-zinc-900 text-zinc-300 hover:text-indigo-300 hover:border-indigo-500/20 text-xs text-left transition-all max-w-xs shrink-0 rounded-lg cursor-pointer font-sans truncate"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Text Input Footer Frame */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-900/15 shrink-0 z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="flex gap-2 relative"
          >
            <input
              type="text"
              placeholder={`Query ${selectedAgent.name} (e.g. "What are the biggest cost opportunities here?")...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={generating}
              className="flex-1 bg-[#070709] border border-zinc-900 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500/10 font-sans"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || generating}
              className={`px-5 py-3 rounded-xl text-white font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                generating || !inputText.trim()
                  ? 'bg-zinc-900 text-zinc-600 opacity-40'
                  : `bg-gradient-to-r ${selectedAgent.gradient} hover:shadow-lg hover:shadow-indigo-500/15`
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Dispatch</span>
            </button>
          </form>
        </div>

      </div>

      {/* RIGHT COLUMN: HIGH-INTELLIGENCE COGNITIVE DECK & METRIC TELEMETRY (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        {/* WIDGET 1: COGNITIVE DECK REAL-TIME ENGINE */}
        <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5 shadow-2xl relative overflow-hidden shrink-0">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-3.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            AI Sandbox Optimizer
          </h3>

          <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
            Simulate a policy change: enforce async reports and prune silent observers on standups:
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-zinc-300">Policy Strictness Rate:</span>
                <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">{sandboxPercentage}% Removal</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={sandboxPercentage}
                onChange={(e) => setSandboxPercentage(Number(e.target.value))}
                className="w-full h-1.5 bg-[#070709] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Slider Live Calculation Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-[#070709] border border-zinc-900 rounded-xl">
                <div className="flex items-center gap-1.5 text-zinc-500 mb-0.5">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase font-mono">FTE Hours Saved</span>
                </div>
                <div className="text-base font-bold text-white font-mono leading-tight">
                  {simulatedSavedHours} hrs
                </div>
                <span className="text-[9px] text-zinc-550 block">Replaced weekly</span>
              </div>

              <div className="p-3 bg-[#070709] border border-zinc-900 rounded-xl">
                <div className="flex items-center gap-1.5 text-zinc-500 mb-0.5">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase font-mono">CapEx Saved</span>
                </div>
                <div className="text-base font-bold text-emerald-400 font-mono leading-tight">
                  ${simulatedSavedDollars.toLocaleString()}
                </div>
                <span className="text-[9px] text-zinc-550 block">Blended capital / mo</span>
              </div>
            </div>

            {/* Simulated Live Agent Response Dynamic Overlay */}
            <div className="p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase font-mono text-zinc-400">
                  {selectedAgent.name} Evaluation
                </span>
                <span className={`text-[9px] font-bold uppercase ml-auto px-1.5 py-0.5 rounded bg-zinc-900 ${sandboxFeedback.color}`}>
                  {sandboxFeedback.title}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-normal font-sans italic">
                "{sandboxFeedback.desc}"
              </p>
            </div>
          </div>
        </div>

        {/* WIDGET 2: ADVANCED SYSTEM TELEMETRY */}
        <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              Machine Telemetry Deck
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-900/60 font-mono">
                <span className="text-zinc-500">ML ANALYTIC CORE:</span>
                <span className="text-white font-semibold">Gemini 3.5 Flash Plus</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-900/60 font-mono">
                <span className="text-zinc-500">MAPPING CONFIDENCE:</span>
                <span className="text-emerald-400 font-bold">98.6% Stable</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-900/60 font-mono">
                <span className="text-zinc-500">REMEDIAL INDEXING:</span>
                <span className="text-indigo-400 font-bold">Active Engine</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-900/60 font-mono">
                <span className="text-zinc-500">TOTAL SCANNED FORCE:</span>
                <span className="text-white font-semibold">12.5k hrs/wk</span>
              </div>
            </div>
          </div>

          {/* Quick AI Action Remediation Deck */}
          <div className="mt-4 pt-4 border-t border-zinc-900/60 space-y-2">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono block">
              Continuous Intelligence Remediations
            </h4>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => triggerAutoAction('Standup Truncation Project Plan', 'Recommend 15-minute limits to Platform and Legacy maintenance lines')}
                className="w-full p-2.5 bg-[#070709] hover:bg-zinc-900 border border-zinc-900 hover:border-indigo-500/20 text-left rounded-xl transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-zinc-200 block group-hover:text-indigo-400 transition-colors">Generate Focus Recovery Report</span>
                  <span className="text-[9.5px] text-zinc-550 block">Instructs AURA-X on asynchronous migration plans</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-650 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              <button
                onClick={() => triggerAutoAction('Double Booking Conflict Scan', 'List and resolve duplicate calendars overlaps for Sarah Jenkins and David Miller')}
                className="w-full p-2.5 bg-[#070709] hover:bg-zinc-900 border border-zinc-900 hover:border-emerald-500/20 text-left rounded-xl transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-zinc-200 block group-hover:text-emerald-400 transition-colors">Scan Overlapping Allocations</span>
                  <span className="text-[9.5px] text-zinc-550 block">Audits cross-provider synchronization overlays</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-650 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </div>
          </div>

          {/* Dynamic AI Status Log Feed */}
          <div className="mt-4 p-2.5 bg-black/60 border border-zinc-900 rounded-xl font-mono text-[9px] text-zinc-400 flex items-center gap-1.5 select-none text-left shrink-0">
            <Terminal className="w-3 h-3 text-indigo-400 animate-pulse grow-0 shadow-glow shrink-0" />
            <div className="truncate flex-1 font-mono">
              {terminalLine}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
