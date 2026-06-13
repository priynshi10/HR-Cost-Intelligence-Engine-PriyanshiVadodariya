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
      const match = SIMULATED_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (match) {
        onLoginSuccess(match);
      } else {
        onLoginSuccess({
          id: 'custom-usr',
          name: email.split('@')[0].split('.').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          role: 'Corporate Administrator',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
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
    <div id="login-view" className="bg-[#FAF8F5] text-[#1F1A17] min-h-screen flex items-center justify-center font-sans px-4 relative overflow-hidden">
      
      {/* Glow effects */}
      <div className="absolute top-[20%] right-[-10%] w-[30rem] h-[30rem] bg-[#C8A27C]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[30rem] h-[30rem] bg-[#6F4E37]/3 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Floating Sparkles decorative */}
      <span className="absolute top-10 right-[15%] text-[#6F4E37] opacity-20"><Sparkles className="w-8 h-8 animate-pulse" /></span>

      <div className="w-full max-w-md bg-white border border-[#E8DDD0] p-8 rounded-2xl relative shadow-xl shadow-[#6F4E37]/2">
        
        {/* Back Link */}
        <button onClick={onBackToLanding} className="absolute -top-12 left-0 text-[#5E5248] hover:text-[#1F1A17] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer bg-transparent border-none">
          <ArrowLeft className="w-4 h-4" /> Back to Product Site
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-10 h-10 bg-[#6F4E37] rounded-lg flex items-center justify-center text-white font-bold mb-3 shadow-md">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1F1A17] tracking-tight font-display">Access WorkPulse AI</h2>
          <p className="text-xs text-[#5E5248] mt-1 font-medium">SaaS HR Cost Intelligence Console</p>
        </div>

        {/* Persona Select Rows */}
        <div className="mb-8 p-5 bg-[#F3EDE4]/50 rounded-xl border border-[#E8DDD0]">
          <span className="text-[10px] font-bold tracking-widest text-[#8D8176] uppercase block mb-3">SELECT SANDBOX DEMO PERSONA</span>
          <div className="space-y-2">
            {SIMULATED_PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePersonaSelect(p)}
                disabled={loading}
                className="w-full p-2.5 bg-white hover:bg-[#FAF8F5] border border-[#E8DDD0] hover:border-[#6F4E37] rounded-lg flex items-center gap-3 transition-all text-left text-xs text-[#5E5248] hover:text-[#1F1A17] relative group cursor-pointer"
              >
                <img src={p.avatarUrl} alt={p.name} className="w-7 h-7 rounded-full border border-[#E8DDD0] object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1F1A17] truncate text-xs leading-none">{p.name}</p>
                  <p className="text-[10px] text-[#8D8176] truncate leading-relaxed mt-0.5">{p.role}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#8D8176] group-hover:text-[#6F4E37] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6 text-[#8D8176] text-[10px] font-bold uppercase tracking-wider">
          <div className="flex-1 h-px bg-[#E8DDD0]"></div>
          <span>or sign in with credentials</span>
          <div className="flex-1 h-px bg-[#E8DDD0]"></div>
        </div>

        {/* Core Credentials Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold tracking-wider text-[#5E5248] uppercase block mb-1.5">Email address:</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D8176]" />
              <input
                type="email"
                placeholder="sarah.j@workpulse.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-white border border-[#E8DDD0] focus:border-[#6F4E37] rounded-lg py-2.5 pl-10 pr-4 text-xs text-[#1F1A17] focus:outline-none focus:ring-1 focus:ring-[#6F4E37]/30 transition-all placeholder:text-[#8D8176]/50"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold tracking-wider text-[#5E5248] uppercase">Password:</label>
              <a href="#" className="text-[10px] text-[#8D8176] hover:text-[#6F4E37] transition-colors font-bold">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D8176]" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-white border border-[#E8DDD0] focus:border-[#6F4E37] rounded-lg py-2.5 pl-10 pr-4 text-xs text-[#1F1A17] focus:outline-none focus:ring-1 focus:ring-[#6F4E37]/30 transition-all"
              />
            </div>
          </div>

          {errorText && (
            <p className="text-xs text-[#B85042] font-semibold">{errorText}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6F4E37] text-white hover:opacity-95 rounded-lg py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 cursor-pointer border-none"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
            ) : (
              <span>Access Secure Workspace</span>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-[#8D8176] font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#4F7942]" />
          <span>AES-256 Multi-tenant Sandbox Encryption</span>
        </div>
      </div>
    </div>
  );
}
