/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Sparkles, User, RefreshCw, Layers, ShieldCheck, Zap, ArrowRight, HelpCircle } from 'lucide-react';
import { PRE_BAKED_QUESTIONS } from '../data';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function CopilotView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: "Welcome to WorkPulse AI Copilot console. I am your strategic companion for analyzing corporate calendar spends and meeting performance. Ask me anything like:\n\n* 'How can we reduce meeting fatigue in the Engineering department?'\n* 'Analyze our Project Titan spend and suggest solutions.'\n* 'What are our largest unmapped calendar costs?'",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [generating, setGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generating]);

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
      // Connect to full-stack Express API route mapping Gemini 3.5 Flash server-side
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `cop-${Date.now()}`,
            sender: 'assistant',
            text: data.reply,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error('API server unreachable or key not configured');
      }
    } catch (error) {
      // Graceful fallback simulation
      setTimeout(() => {
        let fallbackReply = "I noticed the local backend is starting up or requires a GEMINI_API_KEY. Based on your current sandbox data files, here are my cost insights:\n\n";

        const lower = textToSend.toLowerCase();
        if (lower.includes('fatigue') || lower.includes('engineering') || lower.includes('reduce')) {
          fallbackReply += "### **Engineering Meeting Fatigue Diagnosis**\n" +
            "1. **Analysis**: Engineering shows **12.5k Weekly Alignment Hours**, with Team Omega spending **22 hours/week** in large recurrence syncs. This is causing a budget overrun of **$31.2k**.\n" +
            "2. **Recommendation**: Implement a **'No-Meeting Wednesday'** guideline and audit standard PMO attendee logs. Pruning silent observers by 40% will recover **$15,400 / month**.\n" +
            "3. **Proposed Action**: Consolidate the daily catchup into a weekly Slack status block to instantly reclaim senior engineering focus time.";
        } else if (lower.includes('titan') || lower.includes('project') || lower.includes('variance')) {
          fallbackReply += "### **Project Cost Variance Report**\n" +
            "1. **Current Spend**: Project Titan (Cloud Migration) spend to date is **$620k** vs. a **$900k baseline budget**, showing a burn deviation rate of **14.2%**.\n" +
            "2. **Risk Cause**: Large recurring DevOps alignment standups present excessive participant counts. The blended seniority rate is currently **$140/hr**.\n" +
            "3. **Resolution Option**: Move high-burden observers to asynchronous bi-monthly updates and allocate core engineering back to direct platform focus tasks.";
        } else if (lower.includes('waste') || lower.includes('unassigned') || lower.includes('unmapped')) {
          fallbackReply += "### **Unmapped Cost Audit**\n" +
            "1. **Unassigned discussions**: There are currently **12.4 hours ($1,800/wk)** of unmapped calendar events.\n" +
            "2. **Attribution Match**: Q4 Strategy Sync currently has **94% ML matching accuracy** with Platform R&D, and Architecture Review has **82% match**. Confirming these mappings will stabilize standard workforce metrics.\n" +
            "3. **Action Path**: Navigate to the **Project Attribution** screen to confirm AI suggested code links.";
        } else if (lower.includes('rate') || lower.includes('department') || lower.includes('salary')) {
          fallbackReply += "### **Burdened Department Rate Assessment**\n" +
            "1. **Engineering**: Blended composite rate is **$150/hr**. Senior L6 role costs **$220/hr**, Mid-level L4 costs **$140/hr**, and Junior L1 costs **$75/hr**.\n" +
            "2. **Product**: Blended rate is **$140/hr**, creating high alignment costs on cross-functional alignment calls.\n" +
            "3. **Optimization Path**: Adjust rate multipliers in the **Settings** menu to automatically recalculate future run rates.";
        } else {
          fallbackReply += "### **General WorkPulse AI Audit Overview**\n" +
            "Your simulated workspace contains **4 projects** costing **$2.2M** total, with **4 active cost anomalies** representing **$76.2k** in potential savings.\n\n" +
            "Ask me about:\n" +
            "- 'How to reduce meeting fatigue?'\n" +
            "- 'What are project rates?'\n" +
            "- 'Explain Project Titan budget variance.'";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `cop-${Date.now()}`,
            sender: 'assistant',
            text: fallbackReply,
            timestamp: new Date()
          }
        ]);
      }, 700);
    } finally {
      setGenerating(false);
    }
  };

  const parseText = (text: string) => {
    // Simple parsing for bold markup and markdown list structures to render elegantly
    return text.split('\n').map((line, idx) => {
      let content = line;
      
      // Header check
      if (line.startsWith('###')) {
        return <h4 key={idx} className="text-white font-bold mt-4 mb-2 text-sm">{line.replace('###', '').trim()}</h4>;
      }
      
      // Bold replacement
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        parts.push(line.substring(lastIndex, match.index));
        parts.push(<strong className="text-indigo-300 font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(line.substring(lastIndex));

      // Bullet check
      if (line.startsWith('*') || line.startsWith('-')) {
        return (
          <li key={idx} className="ml-4 list-disc text-zinc-300 text-xs mt-1 leading-relaxed">
            {parts.length > 1 ? parts : line.substring(1).trim()}
          </li>
        );
      }

      return <p key={idx} className="text-zinc-300 text-xs mt-2 leading-relaxed">{parts.length > 1 ? parts : content}</p>;
    });
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col justify-between bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden leading-normal">
      
      {/* Copilot Chat Header */}
      <div className="p-4 border-b border-zinc-900 bg-[#131315]/40 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-505/10 bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <h4 className="text-xs font-bold text-white">Executive Copilot</h4>
              <span className="inline-flex items-center text-[8px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded">GEMINI POWERED</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Real-time LLM-driven HR Cost Intelligence companion</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-[#09090b] px-2.5 py-1 rounded-lg border border-zinc-900">
          <Zap className="w-3.5 h-3.5 text-indigo-400" /> Secure Sandbox Session
        </div>
      </div>

      {/* Messages Panel Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar */}
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-xl text-xs flex flex-col justify-between ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-[#131315]/80 border border-zinc-900 text-zinc-300 rounded-tl-none'
                }`}
              >
                <div>
                  {isUser ? <p className="leading-relaxed">{msg.text}</p> : parseText(msg.text)}
                </div>
                <span className="text-[9px] text-zinc-550 font-mono font-semibold self-end mt-2 leading-none uppercase">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-7 h-7 rounded-full bg-zinc-805 bg-indigo-700 font-bold text-xs flex items-center justify-center text-white shrink-0 uppercase">
                  U
                </div>
              )}
            </div>
          );
        })}

        {/* Loading generation block */}
        {generating && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 bg-[#131315]/40 border border-zinc-905 rounded-2xl rounded-tl-none max-w-sm text-xs font-medium text-zinc-500 flex items-center gap-2">
              <span className="inline-block animate-bounce w-1.5 h-1.5 bg-indigo-400 rounded-full" style={{ animationDelay: '0ms' }}></span>
              <span className="inline-block animate-bounce w-1.5 h-1.5 bg-indigo-400 rounded-full" style={{ animationDelay: '200ms' }}></span>
              <span className="inline-block animate-bounce w-1.5 h-1.5 bg-indigo-400 rounded-full" style={{ animationDelay: '400ms' }}></span>
              <span>Thinking under cost-attribution lens...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Suggested prompts footers */}
      {messages.length === 1 && (
        <div className="px-5 pb-3 border-none flex flex-wrap gap-2 shrink-0">
          {PRE_BAKED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={generating}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 rounded-lg text-zinc-300 hover:text-white text-xs text-left transition-all max-w-xs truncate cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Text Input Footer */}
      <div className="p-4 border-t border-zinc-900 bg-[#131315]/40 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Query WorkPulse AI (e.g. Analyze Engineering expenditures...)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={generating}
            className="flex-1 bg-[#09090b] border border-zinc-900 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || generating}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 active:scale-95 cursor-pointer flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
