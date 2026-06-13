/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, ShieldCheck, Mail, Lock, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { SIMULATED_PERSONAS } from '../data';
import { Persona } from '../types';

interface LoginViewProps {
  onLoginSuccess: (selectedPersona: Persona) => void;
  onBackToLanding: () => void;
}

export default function LoginView({ onLoginSuccess, onBackToLanding }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorText('Please enter your email address');
      return;
    }
    setLoading(true);
    setErrorText('');
    setTimeout(() => {
      // Find a matching prebaked role or create standard one
      const match = SIMULATED_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (match) {
        onLoginSuccess(match);
      } else {
        onLoginSuccess({
          id: 'custom-usr',
          name: email.split('@')[0].split('.').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          role: 'Corporate Administrator',
          avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgrgH5nQ22jsTKdGO4IRCSqkNlNeIJl9qL8L1h2t16Rp48gUM3mYoQ7ps_D811mOpSGGA1CCxRGcf7h_N5J7EKBIX0Ox9Gqn3EjpctJoODFG0TWuy9ryN21nxFZ7irfjSdN6uzzF4sKxhUrtqeifFXCYq1FQ9EfmELQdKkfMCidEzgDr_dIkWMBh5WHfr1K7ECw1ZieYanMjWAtEGo7SWUY4qe5LnS8ve4sxmMAc5lBgHW-PDG7kR8N-JlHSyddavKL1YwuYR8vXw',
          email: email
        });
      }
      setLoading(false);
    }, 800);
  };

  const handlePersonaSelect = (persona: Persona) => {
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(persona);
      setLoading(false);
    }, 400);
  };

  return (
    <div id="login-view" className="bg-[#09090b] text-[#e5e1e4] min-h-screen flex items-center justify-center font-sans px-4 relative overflow-hidden">
      
      {/* Glow effects */}
      <div className="absolute top-[20%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[30rem] h-[30rem] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Floating Sparkles decorative */}
      <span className="absolute top-10 right-[15%] text-indigo-500 opacity-20"><Sparkles className="w-8 h-8 animate-pulse" /></span>

      <div className="w-full max-w-md bg-zinc-950/40 border border-zinc-900/80 p-8 rounded-2xl backdrop-blur-xl relative">
        
        {/* Back Link */}
        <button onClick={onBackToLanding} className="absolute -top-12 left-0 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Product Site
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-[#09090b] font-bold mb-3 shadow-lg shadow-indigo-500/10">
            <Activity className="w-6 h-6 text-indigo-950 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Access WorkPulse AI</h2>
          <p className="text-xs text-zinc-500 mt-1">SaaS HR Cost Intelligence Console</p>
        </div>

        {/* Persona Select Rows */}
        <div className="mb-8 p-4 bg-[#131315]/50 rounded-xl border border-zinc-900">
          <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase block mb-3">SELECT SANDBOX DEMO PERSONA</span>
          <div className="space-y-2">
            {SIMULATED_PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePersonaSelect(p)}
                disabled={loading}
                className="w-full p-2.5 bg-zinc-950/60 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 rounded-lg flex items-center gap-3 transition-all text-left text-xs text-zinc-300 hover:text-white relative group"
              >
                <img src={p.avatarUrl} alt={p.name} className="w-7 h-7 rounded-full border border-zinc-800 object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate text-xs leading-none">{p.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate leading-relaxed mt-0.5">{p.role}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6 text-zinc-600 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex-1 h-px bg-zinc-900"></div>
          <span>or sign in with credentials</span>
          <div className="flex-1 h-px bg-zinc-900"></div>
        </div>

        {/* Core Credentials Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase block mb-1.5">Email address:</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                placeholder="e.g. sarah.j@workpulse.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-[#09090b] border border-zinc-900 focus:border-indigo-500/50 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Password:</label>
              <a href="#" className="text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-[#09090b] border border-zinc-900 focus:border-indigo-500/50 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          {errorText && (
            <p className="text-xs text-red-400 font-medium">{errorText}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 border-none active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
            ) : (
              <span>Access Secure Workspace</span>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>AES-256 Multi-tenant Sandbox Encryption</span>
        </div>
      </div>
    </div>
  );
}
