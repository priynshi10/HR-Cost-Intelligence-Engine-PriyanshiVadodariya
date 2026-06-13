/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sliders, 
  Save, 
  ToggleLeft, 
  ToggleRight, 
  Calendar, 
  Sparkles, 
  Plus, 
  Trash2, 
  HelpCircle, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  Shield, 
  CheckCircle2, 
  Info, 
  CheckSquare, 
  Square,
  Activity,
  ArrowRight,
  Database
} from 'lucide-react';
import { SystemSettings, DepartmentRate } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onManualSync: (provider: 'google' | 'outlook') => Promise<void>;
  syncLogs: { timestamp: string; message: string; type: 'info' | 'success' | 'warn' | 'error' }[];
  isSyncing: boolean;
  onInitiateOAuth: (provider: 'google' | 'outlook') => void;
  onDisconnectCalendar: (provider: 'google' | 'outlook') => void;
}

export default function SettingsView({ 
  settings, 
  onUpdateSettings,
  onManualSync,
  syncLogs,
  isSyncing,
  onInitiateOAuth,
  onDisconnectCalendar
}: SettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'integrations'>('integrations');

  // Rules form states
  const [syncInterval, setSyncInterval] = useState(settings.syncIntervalMinutes);
  const [ignoredText, setIgnoredText] = useState('');
  const [ignoredKeywords, setIgnoredKeywords] = useState<string[]>(settings.ignoredKeywords);
  const [rates, setRates] = useState<DepartmentRate[]>(settings.departmentRates);
  const [anomalyPerc, setAnomalyPerc] = useState(settings.anomalyThresholdPercentage);
  const [anomalyAmt, setAnomalyAmt] = useState(settings.anomalyThresholdWeeklyAmount);
  const [autoDaily, setAutoDaily] = useState(settings.automaticDailySync);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync parameters checkboxes
  const syncedFields = [
    { label: 'Meeting Title', desc: 'Syncs subject headers for lexical project mapping.' },
    { label: 'Description & Memo', desc: 'Queries text body for task context.' },
    { label: 'Host/Organizer', desc: 'Tracks host seniority metrics automatically.' },
    { label: 'Attendees list', desc: 'Calculates active composite labor burn rate.' },
    { label: 'Duration minutes', desc: 'Primary metric for meeting force overhead.' },
    { label: 'Recurrence factor', desc: 'Categorizes daily, weekly, or monthly cadences.' },
    { label: 'Meeting Links tags', desc: 'Includes Google Meet/Teams metadata hooks.' }
  ];

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (ignoredText.trim() && !ignoredKeywords.includes(ignoredText.trim().toLowerCase())) {
      setIgnoredKeywords([...ignoredKeywords, ignoredText.trim().toLowerCase()]);
      setIgnoredText('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setIgnoredKeywords(ignoredKeywords.filter((k) => k !== kw));
  };

  const handleUpdateRate = (deptName: string, field: 'blendedRate' | 'l6Rate' | 'l4Rate' | 'l1Rate', val: number) => {
    const updated = rates.map((r) => {
      if (r.department === deptName) {
        return { ...r, [field]: val };
      }
      return r;
    });
    setRates(updated);
  };

  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      syncIntervalMinutes: syncInterval,
      ignoredKeywords: ignoredKeywords,
      departmentRates: rates,
      anomalyThresholdPercentage: anomalyPerc,
      anomalyThresholdWeeklyAmount: anomalyAmt,
      automaticDailySync: autoDaily
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl leading-snug">
      
      {/* Page Title & Sub-Tab Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            Settings & Control Panel
          </h2>
          <p className="text-xs text-zinc-400 font-medium">
            Manage your synchronized HR calendar channels, seniority blended rates, and active governance thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#131315] p-1 rounded-xl border border-zinc-900">
          <button
            onClick={() => setActiveSubTab('integrations')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer select-none ${
              activeSubTab === 'integrations'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            🔌 Calendar Integrations
          </button>
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer select-none ${
              activeSubTab === 'rules'
                ? 'bg-zinc-800 text-indigo-400 font-bold shadow-sm'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            ⚙️ Platform Rules / Rates
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div id="settings-save-alert" className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400 shrink-0" /> 
          Application configuration overrides saved successfully!
        </div>
      )}

      {/* 1. CALENDAR INTEGRATIONS WORKSPACE PAGE */}
      {activeSubTab === 'integrations' && (
        <div className="space-y-6">
          
          {/* Health Status Dashboard Area */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-950 to-[#111113] border border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">CONNECTION HEALTH</span>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  (settings.googleCalendarConnected || settings.outlookConnected) ? 'bg-emerald-400 animate-pulse' : 'bg-red-500 animate-pulse'
                }`} />
                <h3 className="text-sm font-bold text-white">
                  {(settings.googleCalendarConnected || settings.outlookConnected) ? 'Active Sync Connection Established' : 'No Calendars Connected'}
                </h3>
              </div>
              <p className="text-[11px] text-zinc-500 max-w-xl">
                {(settings.googleCalendarConnected || settings.outlookConnected) 
                  ? 'Your directory is connected to secure authorization tokens. Re-indexing occurrences ensures accurate employee burn tracking.' 
                  : 'Start by authenticating either Google Calendar or Outlook Calendar to synchronize meeting data for ML attribution models.'}
              </p>
            </div>

            {/* Manual Fast Sync Controls */}
            <div className="flex gap-2 shrink-0">
              {(settings.googleCalendarConnected || settings.outlookConnected) && (
                <button
                  onClick={() => onManualSync(settings.googleCalendarConnected ? 'google' : 'outlook')}
                  disabled={isSyncing}
                  className="px-3.5 py-2 bg-indigo-600/10 hover:bg-indigo-650/40 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Force Real-Time Sync'}
                </button>
              )}
            </div>
          </div>

          {/* Sync Connection Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Google Calendar Card */}
            <div className={`p-5 rounded-3xl border transition-all ${
              settings.googleCalendarConnected 
                ? 'bg-[#181a1f] border-indigo-500/30' 
                : 'bg-zinc-950/40 border-zinc-900'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold font-mono text-xs">G</div>
                    <span className="text-xs font-black text-white">Google Calendar OAuth 2.0</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Sync with Google Workspace calendar events.</p>
                </div>
                
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                  settings.googleCalendarConnected 
                    ? 'bg-emerald-500/15 text-emerald-400' 
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {settings.googleCalendarConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {settings.googleCalendarConnected ? (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-zinc-800/50 py-3 font-semibold">
                    <div>
                      <p className="text-zinc-500 text-[9px] uppercase font-mono">Last Sync Run</p>
                      <p className="text-zinc-300 mt-0.5 truncate text-[11px]">
                        {settings.googleCalendarLastSync 
                          ? new Date(settings.googleCalendarLastSync).toLocaleTimeString() 
                          : 'Pending first sync'}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[9px] uppercase font-mono">Meetings Imported</p>
                      <p className="text-indigo-400 font-mono mt-0.5 text-xs">{settings.googleImportedCount} active</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onManualSync('google')}
                      disabled={isSyncing}
                      className="flex-1 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      {isSyncing ? 'Syncing...' : 'Sync Google Calendar'}
                    </button>
                    <button
                      onClick={() => onDisconnectCalendar('google')}
                      className="px-3 py-2 bg-transparent hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg text-xs font-bold border border-zinc-800 hover:border-red-500/20 transition-all cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 space-y-4">
                  <p className="text-[11px] text-zinc-500 leading-relaxed bg-[#131315]/40 p-3 rounded-xl border border-zinc-900/50">
                    Required to connect through Google API Consent Client. Integrates real-time events, room coordinates, and participant metadata.
                  </p>
                  
                  {/* Google OAuth Button */}
                  <button
                    onClick={() => onInitiateOAuth('google')}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 text-xs font-bold text-zinc-200 hover:text-white rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    Connect Google Calendar
                  </button>
                </div>
              )}
            </div>

            {/* Microsoft Outlook Card */}
            <div className={`p-5 rounded-3xl border transition-all ${
              settings.outlookConnected 
                ? 'bg-[#181a1f] border-indigo-500/30' 
                : 'bg-zinc-950/40 border-zinc-900'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold font-mono text-xs">M</div>
                    <span className="text-xs font-black text-white">Microsoft Outlook Integration</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Sync with Microsoft Graph O365 organizer flows.</p>
                </div>
                
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                  settings.outlookConnected 
                    ? 'bg-emerald-500/15 text-emerald-400' 
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {settings.outlookConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {settings.outlookConnected ? (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-zinc-800/50 py-3 font-semibold">
                    <div>
                      <p className="text-zinc-500 text-[9px] uppercase font-mono">Last Sync Run</p>
                      <p className="text-zinc-300 mt-0.5 truncate text-[11px]">
                        {settings.outlookLastSync 
                          ? new Date(settings.outlookLastSync).toLocaleTimeString() 
                          : 'Pending first sync'}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[9px] uppercase font-mono">Meetings Imported</p>
                      <p className="text-indigo-400 font-mono mt-0.5 text-xs">{settings.outlookImportedCount} active</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onManualSync('outlook')}
                      disabled={isSyncing}
                      className="flex-1 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      {isSyncing ? 'Syncing...' : 'Sync Outlook Calendar'}
                    </button>
                    <button
                      onClick={() => onDisconnectCalendar('outlook')}
                      className="px-3 py-2 bg-transparent hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg text-xs font-bold border border-zinc-800 hover:border-red-500/20 transition-all cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 space-y-4">
                  <p className="text-[11px] text-zinc-500 leading-relaxed bg-[#131315]/40 p-3 rounded-xl border border-zinc-900/50">
                    Integrate your Microsoft Enterprise tenant account. Imports organizational standups, recurrence logs, and remote hook coordinates.
                  </p>
                  
                  {/* Outlook OAuth link */}
                  <button
                    onClick={() => onInitiateOAuth('outlook')}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 text-xs font-bold text-zinc-200 hover:text-white rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-indigo-400" />
                    Connect Microsoft Outlook
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Sync Frequency parameters & Metadata Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Automatic vs Manual Sync configurations */}
            <div className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Sliders className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Global Sync Rules</span>
              </div>

              <div className="space-y-4 text-xs font-semibold pt-2">
                
                <div className="flex justify-between items-center bg-[#131315]/40 p-3 rounded-xl border border-zinc-900">
                  <div>
                    <p className="font-bold text-white">Automatic Daily Synchronization</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Executes automatically at 12:00 AM UTC daily.</p>
                  </div>
                  <button 
                    onClick={() => setAutoDaily(!autoDaily)} 
                    className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {autoDaily ? <ToggleRight className="w-8 h-8 text-indigo-400" /> : <ToggleLeft className="w-8 h-8 text-zinc-650" />}
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Interval Frequency Sync:</span>
                    <span className="text-indigo-300 font-mono font-black">{syncInterval} Minutes</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="360"
                    step="15"
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-900 appearance-none rounded cursor-pointer accent-indigo-500"
                  />
                  <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">
                    Adjust how frequently our daemon background process sweeps integrated mailboxes to update the AI executive cockpit dashboard.
                  </p>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Sync Rules
                </button>

              </div>
            </div>

            {/* Checkbox fields sync list */}
            <div className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <CheckSquare className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Metadata Field Sync Checks</span>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {syncedFields.map((field, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start bg-[#131315]/40 p-2.5 rounded-xl border border-zinc-900/60 text-xs">
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block text-[11px]">{field.label}</span>
                      <span className="text-[10px] text-zinc-500 block leading-tight">{field.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sync import diagnostics logs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <Database className="w-4 h-4 text-indigo-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest font-mono">Sync Diagnostics & Import Logs</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                (settings.googleCalendarConnected || settings.outlookConnected) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {(settings.googleCalendarConnected || settings.outlookConnected) ? 'SYNC STATUS: HEALTHY' : 'SYNC STATUS: OFFLINE'}
              </span>
            </div>

            {/* Diagnostic Logs console scrollable window */}
            <div className="bg-black/85 border border-zinc-900 rounded-2xl p-4 font-mono text-[10px] text-zinc-400 leading-relaxed space-y-2.5 max-h-56 overflow-y-auto">
              {syncLogs.length > 0 ? (
                syncLogs.map((log, index) => {
                  let colorClass = 'text-zinc-400';
                  if (log.type === 'success') colorClass = 'text-emerald-400';
                  if (log.type === 'warn') colorClass = 'text-amber-400';
                  if (log.type === 'error') colorClass = 'text-red-400';
                  return (
                    <div key={index} className="flex gap-2 flex-wrap sm:flex-nowrap border-b border-zinc-950/60 pb-1.5 justify-start">
                      <span className="text-indigo-400 shrink-0 font-semibold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className={colorClass}>{log.message}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-zinc-650 text-center py-6">
                  &gt; Diagnostics inactive. Please connect a corporate calendar and trigger a manually initiated sync.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 2. PLATFORM RULES & SENIORITY RATES CONFIGURATION PAGE */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Anomaly Triggers block */}
            <div className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <AlertTriangle className="w-4 h-4 text-violet-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Anomaly Threshold Triggers</span>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">Deviation Percentage threshold:</span>
                    <span className="text-indigo-300 font-mono font-black">{anomalyPerc}% variance</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={anomalyPerc}
                    onChange={(e) => setAnomalyPerc(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-900 appearance-none rounded cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">Absolute meeting cost limit:</span>
                    <span className="text-indigo-300 font-mono font-black">${anomalyAmt.toLocaleString()} / week</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={anomalyAmt}
                    onChange={(e) => setAnomalyAmt(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-900 appearance-none rounded cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Ignored tag names */}
            <div className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-3xl space-y-4">
              <div>
                <p className="text-xs font-bold text-white">Excluded Calendar Filter Flags</p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Meetings containing these words inside their subject lines are automatically pruned and ignored from corporate expense statistics.
                </p>
              </div>

              <form onSubmit={handleAddKeyword} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. personal blocker, flight, offline swim"
                  value={ignoredText}
                  onChange={(e) => setIgnoredText(e.target.value)}
                  className="flex-1 bg-[#131315] border border-zinc-900 rounded-xl p-2.5 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-200 rounded-xl flex items-center gap-1 cursor-pointer">
                  <Plus className="w-4 h-4 text-zinc-400" /> Exclude
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {ignoredKeywords.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-[#131315] border border-zinc-900 rounded-lg text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                    {tag}
                    <button type="button" onClick={() => handleRemoveKeyword(tag)} className="text-zinc-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Seniority Rate parameters */}
          <div className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sliders className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Seniority Hourly Rate Grid</span>
            </div>

            <p className="text-xs text-zinc-550 max-w-2xl font-medium leading-relaxed">
              Enter fully burdened composite hourly values (including salaries, stock, welfare benefits, and operational overhead) to calculate accurate expenditure results:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-semibold border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-widest font-black text-[9px]">
                    <th className="py-3 px-2">Department Vertical</th>
                    <th className="py-3 px-2 text-center">Blended Hourly</th>
                    <th className="py-3 px-2 text-center">L6 Executive ($)</th>
                    <th className="py-3 px-2 text-center">L4 Senior ($)</th>
                    <th className="py-3 px-2 text-center">L1 Junior ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 font-mono">
                  {rates.map((dept) => (
                    <tr key={dept.department} className="hover:bg-zinc-950/20 text-xs">
                      <td className="py-3 px-2 font-bold font-sans text-zinc-350 truncate">{dept.department}</td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          value={dept.blendedRate}
                          onChange={(e) => handleUpdateRate(dept.department, 'blendedRate', Number(e.target.value))}
                          className="w-16 bg-[#131315] border border-zinc-900 focus:border-indigo-500 rounded-lg text-center p-1.5 text-zinc-300 text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          value={dept.l6Rate}
                          onChange={(e) => handleUpdateRate(dept.department, 'l6Rate', Number(e.target.value))}
                          className="w-16 bg-[#131315] border border-zinc-900 focus:border-indigo-500 rounded-lg text-center p-1.5 text-zinc-300 text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          value={dept.l4Rate}
                          onChange={(e) => handleUpdateRate(dept.department, 'l4Rate', Number(e.target.value))}
                          className="w-16 bg-[#131315] border border-zinc-900 focus:border-indigo-500 rounded-lg text-center p-1.5 text-zinc-300 text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          value={dept.l1Rate}
                          onChange={(e) => handleUpdateRate(dept.department, 'l1Rate', Number(e.target.value))}
                          className="w-16 bg-[#131315] border border-zinc-900 focus:border-indigo-500 rounded-lg text-center p-1.5 text-zinc-300 text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer selection:none text-nowrap"
              >
                <Save className="w-4 h-4" /> Save Configuration Grid
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
