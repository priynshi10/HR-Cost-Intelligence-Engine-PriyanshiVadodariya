/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Shield, Check, Palette, Sparkles, Sliders, Briefcase } from 'lucide-react';
import { Persona } from '../types';

interface ProfileModalProps {
  user: Persona;
  userRoleMode: 'admin' | 'employee';
  onUpdateUser: (updated: Persona) => void;
  onUpdateRoleMode: (mode: 'admin' | 'employee') => void;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBgrgH5nQ22jsTKdGO4IRCSqkNlNeIJl9qL8L1h2t16Rp48gUM3mYoQ7ps_D811mOpSGGA1CCxRGcf7h_N5J7EKBIX0Ox9Gqn3EjpctJoODFG0TWuy9ryN21nxFZ7irfjSdN6uzzF4sKxhUrtqeifFXCYq1FQ9EfmELQdKkfMCidEzgDr_dIkWMBh5WHfr1K7ECw1ZieYanMjWAtEGo7SWUY4qe5LnS8ve4sxmMAc5lBgHW-PDG7kR8N-JlHSyddavKL1YwuYR8vXw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCHpQraQFwkzM9JWpA73Vc2dMVqmDFOLoB6pJQwyYtJMVa5b3K2wXWXlm_Vrfi5HI3LfkqNngBG6CEMdeHmfvL2FJOPLtTER8Yp_FOGge35DabJ7ij0l75zSNGQKMqrB4KRcHSo_4X78_s7ac1wfcZE3r2i6-4812lzrDJEgkGW4DorMhuRumviAaoBi2WsbGfphcNuRvwtzC7sg5vZ2xDG529wYWVdr6cKvy2VAiPLSC1DaM8LrWUEX9493SogC1X54Khh5cVd_dY',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB8A2TwP5OoFyBIkwzstUmdvYL0du6z3FtoFal-8SWCuo8vyiVaAIBmIN468r3SjZJGyTnfpa0ADpFb_-oOP86u06KY61pgDZT00n4Prjg1eoTI3TNNvMG-uGvAOtZj_0YqHq9EXv39Y_EPKMvPKeNwVH8tJwo1Hz4xuUnjr8vcJcciGhBxy_6rPKT_ye3wtqOhuEx5NF0n217NUwb60oF2XkqtAxuPukg-2YrJAvCDp-AlFRJT6Wsm-MFS1rBJCYwaEvRjw2GOJio',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
];

export default function ProfileModal({
  user,
  userRoleMode,
  onUpdateUser,
  onUpdateRoleMode,
  onClose
}: ProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [activePresetTab, setActivePresetTab] = useState<'details' | 'avatar' | 'workspace'>('details');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    onUpdateUser({
      ...user,
      name,
      email,
      role,
      avatarUrl
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 1500);
  };

  return (
    <div id="profile-overlay" className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center z-50 p-4 leading-snug font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#0e0e11] border border-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden"
      >
        {/* Glow decoration */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-900 bg-[#131315]/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-600/10 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-widest uppercase">My Workspace Profile</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">Configure identity & interface view mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-900 px-4 bg-zinc-950/20">
          {[
            { id: 'details', label: 'Identity', icon: User },
            { id: 'avatar', label: 'Avatars', icon: Palette },
            { id: 'workspace', label: 'Roles & View', icon: Sliders }
          ].map((t) => {
            const IconComponent = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActivePresetTab(t.id as any)}
                className={`py-2 px-4 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activePresetTab === t.id
                    ? 'border-indigo-500 text-white font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="p-6 space-y-4 max-h-[26rem] overflow-y-auto">
          {activePresetTab === 'details' && (
            <div className="space-y-4">
              {/* Profile Avatar Quick View */}
              <div className="flex items-center gap-4 bg-zinc-950/25 p-4 rounded-xl border border-zinc-900/60">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-14 h-14 rounded-full border-2 border-zinc-900 object-cover"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{name || 'Unnamed Employee'}</h4>
                  <p className="text-xs text-indigo-400 font-semibold truncate uppercase tracking-wider">{role}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{email}</p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block mb-1">Full Name:</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-650" />
                    <input
                      type="text"
                      className="w-full bg-[#09090b] border border-zinc-900 focus:border-indigo-500 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block mb-1">Email Address:</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-650" />
                    <input
                      type="email"
                      className="w-full bg-[#09090b] border border-zinc-900 focus:border-indigo-500 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block mb-1">Corporate Position / Role:</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-650" />
                    <input
                      type="text"
                      className="w-full bg-[#09090b] border border-zinc-900 focus:border-indigo-500 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePresetTab === 'avatar' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white mb-1">Select Profile Photo</h4>
                <p className="text-[10px] text-zinc-500">Pick an enterprise illustration avatar or paste a custom link:</p>
              </div>

              <div className="grid grid-cols-6 gap-2.5">
                {PRESET_AVATARS.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => setAvatarUrl(avatar)}
                    className={`relative rounded-full aspect-square overflow-hidden border-2 cursor-pointer outline-none transition-all ${
                      avatarUrl === avatar ? 'border-indigo-500 scale-105' : 'border-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <img src={avatar} alt={`Avatar Preset ${index}`} className="w-full h-full object-cover" />
                    {avatarUrl === avatar && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block mb-1">Custom Image URL:</label>
                <input
                  type="text"
                  className="w-full bg-[#09090b] border border-zinc-900 focus:border-indigo-500 rounded-lg py-2 pl-3 pr-3 text-xs text-zinc-300 focus:outline-none"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="e.g. https://website.com/my-photo.jpg"
                />
              </div>
            </div>
          )}

          {activePresetTab === 'workspace' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-white mb-1">Role-Based System Layout</h4>
                <p className="text-[10px] text-zinc-500">Workspace changes the active interface dynamically based on chosen permissions:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Admin Role Button */}
                <button
                  type="button"
                  onClick={() => onUpdateRoleMode('admin')}
                  className={`p-4 bg-zinc-950/50 rounded-xl border text-left flex flex-col justify-between h-28 cursor-pointer transition-all ${
                    userRoleMode === 'admin'
                      ? 'border-indigo-500/80 bg-indigo-500/5 shadow-lg shadow-indigo-500/5'
                      : 'border-zinc-900 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#09090b] bg-indigo-400 px-1.5 py-0.5 rounded leading-none">Admin View</span>
                    {userRoleMode === 'admin' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white mt-1">SaaS Executive Cockpit</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">Full access to company-wide budgets, contractor rates, unmapped costs, and system settings.</p>
                  </div>
                </button>

                {/* Employee Role Button */}
                <button
                  type="button"
                  onClick={() => onUpdateRoleMode('employee')}
                  className={`p-4 bg-zinc-950/50 rounded-xl border text-left flex flex-col justify-between h-28 cursor-pointer transition-all ${
                    userRoleMode === 'employee'
                      ? 'border-indigo-500/80 bg-indigo-500/5 shadow-lg shadow-indigo-500/5'
                      : 'border-zinc-900 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#09090b] bg-amber-400 px-1.5 py-0.5 rounded leading-none">Employee View</span>
                    {userRoleMode === 'employee' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white mt-1">My Productivity Insights</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">Focus score tracking, meeting fatigue analyzers, anonymous meeting feedback submissions, and personal schedule tips.</p>
                  </div>
                </button>
              </div>

              {/* Secure sandbox note */}
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Toggle modes freely to experience WorkPulse AI as both a <strong>corporate administrator</strong> or an <strong>individual contributor employee</strong> immediately. All metrics dynamically update.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-900 bg-[#131115]/30 flex justify-between items-center gap-2">
          <p className="text-[10px] text-zinc-500 font-mono">SANDBOX SESSION SECURE</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer border-none transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer border-none flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-indigo-600/15"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
