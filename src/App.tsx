/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  AlertTriangle,
  Sparkles,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Zap,
  Activity,
  LineChart
} from 'lucide-react';

import {
  SIMULATED_PERSONAS,
  INITIAL_MEETINGS,
  INITIAL_PROJECTS,
  INITIAL_ANOMALIES,
  INITIAL_SETTINGS
} from './data';
import { Meeting, Project, Anomaly, Persona, SystemSettings } from './types';

// Firebase integration for Google Calendar Authentication
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

// Child view imports
import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import AttributionView from './components/AttributionView';
import AnalyticsView from './components/AnalyticsView';
import AnomalyView from './components/AnomalyView';
import ForecastingView from './components/ForecastingView';
import CopilotView from './components/CopilotView';
import SettingsView from './components/SettingsView';

type TabType = 'dashboard' | 'attribution' | 'analytics' | 'anomalies' | 'forecasting' | 'copilot' | 'settings';

export default function App() {
  // Navigation & session state
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentUser, setCurrentUser] = useState<Persona | null>(null);

  // Core application resources (enables read-write active edits!)
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(INITIAL_ANOMALIES);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);

  // Integration States
  const [syncLogs, setSyncLogs] = useState<{ timestamp: string; message: string; type: 'info' | 'success' | 'warn' | 'error' }[]>([
    { timestamp: new Date().toISOString(), message: "Corporate Ledger daemon initialized. Ready for calendar channel integrations.", type: "info" }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [onboardingProgress, setOnboardingProgress] = useState<number>(0);
  const [onboardingLogs, setOnboardingLogs] = useState<string[]>([]);
  const [selectedOnboardingProvider, setSelectedOnboardingProvider] = useState<'google' | 'outlook' | null>(null);

  // Handlers for dynamic calendar synchronization & OAuth Redirection
  const handleManualSync = async (provider: 'google' | 'outlook') => {
    setIsSyncing(true);
    const nowIso = new Date().toISOString();
    setSyncLogs((prev) => [
      { timestamp: nowIso, message: `Triggering manual synchronized crawl for ${provider === 'google' ? 'Google Calendar' : 'Outlook Calendar'} channel...`, type: 'info' },
      ...prev
    ]);

    try {
      const response = await fetch('/api/sync-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });

      if (!response.ok) {
        throw new Error('Endpoint returned error status');
      }

      const data = await response.json();
      
      // Update logs in reverse chronological order
      setSyncLogs((prev) => [...data.logs, ...prev]);

      // Prepend newly imported meetings, tagging their sourceCalendar
      setMeetings((prev) => {
        const merged = data.meetings.map((m: any) => ({
          ...m,
          status: 'pending' as const
        }));
        const prevFiltered = prev.filter(p => !merged.some((n: any) => n.id === p.id));
        return [...merged, ...prevFiltered];
      });

      // Update settings state
      setSettings((prev) => ({
        ...prev,
        googleCalendarConnected: provider === 'google' ? true : prev.googleCalendarConnected,
        outlookConnected: provider === 'outlook' ? true : prev.outlookConnected,
        googleCalendarLastSync: provider === 'google' ? data.lastSyncTime : prev.googleCalendarLastSync,
        outlookLastSync: provider === 'outlook' ? data.lastSyncTime : prev.outlookLastSync,
        googleImportedCount: provider === 'google' ? data.importedCount : prev.googleImportedCount,
        outlookImportedCount: provider === 'outlook' ? data.importedCount : prev.outlookImportedCount,
        syncHealth: 'healthy'
      }));

      // Dynamically add imported cost onto associated projects to reflect immediate impact
      const newlyImportedCosts = data.meetings.reduce((acc: Record<string, number>, m: any) => {
        acc[m.suggestedProjectId] = (acc[m.suggestedProjectId] || 0) + m.costEstimate;
        return acc;
      }, {});

      setProjects((prevProjects) => {
        return prevProjects.map((p) => {
          const matchingCost = newlyImportedCosts[p.id] || 0;
          return {
            ...p,
            costToDate: p.costToDate + matchingCost
          };
        });
      });

    } catch (err: any) {
      console.warn("Manual sync warning:", err);
      setSyncLogs((prev) => [
        { timestamp: new Date().toISOString(), message: `Crawl authentication warning: ${err.message || 'Connection refused'}`, type: 'error' },
        ...prev
      ]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleInitiateOAuth = async (provider: 'google' | 'outlook') => {
    try {
      if (provider === 'google') {
        const googleProvider = new GoogleAuthProvider();
        // Request Google Calendar Readonly Scope
        googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
        
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        
        console.log("Firebase google sign in success, retrieved token:", token);
        
        const isCurrentlyBothDisconnected = !settings.googleCalendarConnected && !settings.outlookConnected;
        if (isCurrentlyBothDisconnected) {
          handleSimulateFirstLaunchOnboarding('google');
        } else {
          handleManualSync('google');
        }
        return;
      }

      const urlEndpoint = '/api/auth/outlook/url';
      const response = await fetch(urlEndpoint);
      if (!response.ok) {
        throw new Error('Failed to retrieve authorization URL');
      }
      const { url } = await response.json();

      // Open provider callback window in popup
      const authWindow = window.open(
        url,
        'oauth_connect_popup',
        'width=600,height=700,status=no,resizable=yes,scrollbars=yes'
      );

      if (!authWindow) {
        alert('Please allow popups to authorize calendar integrations with Google Calendar OAuth 2.0.');
      }
    } catch (err: any) {
      console.warn("Initiated authorization tunnel error:", err.message);
      alert(`Authorization failed: ${err.message || 'Unknown integration error credentials'}`);
    }
  };

  const handleDisconnectCalendar = (provider: 'google' | 'outlook') => {
    setSettings((prev) => ({
      ...prev,
      googleCalendarConnected: provider === 'google' ? false : prev.googleCalendarConnected,
      outlookConnected: provider === 'outlook' ? false : prev.outlookConnected,
      googleImportedCount: provider === 'google' ? 0 : prev.googleImportedCount,
      outlookImportedCount: provider === 'outlook' ? 0 : prev.outlookImportedCount,
      syncHealth: (!prev.googleCalendarConnected && !prev.outlookConnected) ? 'disconnected' : 'healthy'
    }));

    // Prune meetings imported from this specific provider
    setMeetings((prev) => prev.filter((m) => m.sourceCalendar !== provider));

    setSyncLogs((prev) => [
      {
        timestamp: new Date().toISOString(),
        message: `Revoked token access credentials for ${provider === 'google' ? 'Google Calendar' : 'Outlook Calendar'}. Purged indexed items.`,
        type: 'warn'
      },
      ...prev
    ]);
  };

  const handleSimulateFirstLaunchOnboarding = async (provider: 'google' | 'outlook') => {
    setOnboardingStep(3); // Go straight to indexing progress
    setOnboardingProgress(0);
    setOnboardingLogs([]);

    const messages = [
      { threshold: 10, msg: `Establishing secure SSL socket tunnels for ${provider === 'google' ? 'Google Calendar API' : 'Microsoft Graph API'}...` },
      { threshold: 30, msg: "Synchronizing workspace organization and email mappings..." },
      { threshold: 60, msg: "Crawl in progress: Indexing metadata (Title, Organizer, Attendees, Links)..." },
      { threshold: 85, msg: "Cost lens ML synthesis: Applying burdened seniority rate matrices to computed raw meetings..." },
      { threshold: 100, msg: "Successfully indexed meeting logs and completed ledger import!" }
    ];

    const interval = setInterval(() => {
      setOnboardingProgress((prev) => {
        const next = Math.min(prev + 5, 100);
        
        // Push logging messages as progress proceeds
        messages.forEach((m) => {
          if (next >= m.threshold) {
            setOnboardingLogs((logs) => {
              if (logs.includes(m.msg)) return logs;
              return [...logs, m.msg];
            });
          }
        });

        if (next === 100) {
          clearInterval(interval);
          // Auto load and append meetings
          handleCompletedOnboardingImport(provider);
        }
        return next;
      });
    }, 100);
  };

  const handleCompletedOnboardingImport = async (provider: 'google' | 'outlook') => {
    try {
      const response = await fetch('/api/sync-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      if (response.ok) {
        const data = await response.json();
        
        // Add dynamic imported meetings
        setMeetings((prev) => {
          const merged = data.meetings.map((m: any) => ({
            ...m,
            status: 'pending' as const
          }));
          const prevFiltered = prev.filter(p => !merged.some((n: any) => n.id === p.id));
          return [...merged, ...prevFiltered];
        });

        // Set Settings
        setSettings((prev) => ({
          ...prev,
          googleCalendarConnected: provider === 'google' ? true : prev.googleCalendarConnected,
          outlookConnected: provider === 'outlook' ? true : prev.outlookConnected,
          googleCalendarLastSync: provider === 'google' ? data.lastSyncTime : prev.googleCalendarLastSync,
          outlookLastSync: provider === 'outlook' ? data.lastSyncTime : prev.outlookLastSync,
          googleImportedCount: provider === 'google' ? data.importedCount : prev.googleImportedCount,
          outlookImportedCount: provider === 'outlook' ? data.importedCount : prev.outlookImportedCount,
          syncHealth: 'healthy'
        }));

        setSyncLogs((prev) => [...data.logs, ...prev]);

        // Add to project costs
        const newlyImportedCosts = data.meetings.reduce((acc: Record<string, number>, m: any) => {
          acc[m.suggestedProjectId] = (acc[m.suggestedProjectId] || 0) + m.costEstimate;
          return acc;
        }, {});

        setProjects((prevProjects) => {
          return prevProjects.map((p) => {
            const matchingCost = newlyImportedCosts[p.id] || 0;
            return {
              ...p,
              costToDate: p.costToDate + matchingCost
            };
          });
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Listen for callback redirects from OAuth popup onSuccess
  useEffect(() => {
    const handleMessageEvent = (event: MessageEvent) => {
      const origin = event.origin;
      // Allow local development and container redirects
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('0.0.0.0')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const targetProvider = selectedOnboardingProvider || (!settings.googleCalendarConnected ? 'google' : 'outlook');
        const isCurrentlyBothDisconnected = !settings.googleCalendarConnected && !settings.outlookConnected;
        
        if (isCurrentlyBothDisconnected) {
          // Onboarding stream loader
          handleSimulateFirstLaunchOnboarding(targetProvider);
        } else {
          // General settings sync triggers
          handleManualSync(targetProvider);
        }
      }
    };
    window.addEventListener('message', handleMessageEvent);
    return () => window.removeEventListener('message', handleMessageEvent);
  }, [settings, selectedOnboardingProvider]);

  // Cross-tab interaction highlights
  const [focusedAnomaly, setFocusedAnomaly] = useState<Anomaly | null>(null);
  const [strategyPlannerOpen, setStrategyPlannerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handlers for Sandbox ledger updates
  const handleApproveMeeting = (id: string, projectId: string) => {
    // 1. Locate and update meeting status
    let matchCost = 0;
    let matchProjName = 'Unassigned';
    
    const updatedMeetings = meetings.map((m) => {
      if (m.id === id) {
        matchCost = m.costEstimate;
        // Verify projection match
        const foundProj = projects.find((p) => p.id === projectId);
        matchProjName = foundProj ? foundProj.name : m.suggestedProjectName;
        return {
          ...m,
          status: 'approved' as const,
          suggestedProjectId: projectId,
          suggestedProjectName: matchProjName
        };
      }
      return m;
    });
    setMeetings(updatedMeetings);

    // 2. Add cost delta directly onto target project spending
    if (projectId !== 'unassigned') {
      const updatedProjects = projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            costToDate: p.costToDate + matchCost
          };
        }
        return p;
      });
      setProjects(updatedProjects);
    }
  };

  const handleDiscardMeeting = (id: string, reason: string) => {
    const updatedMeetings = meetings.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          status: 'discarded' as const,
          rejectionReason: reason
        };
      }
      return m;
    });
    setMeetings(updatedMeetings);
  };

  const handleUpdateProjectMatch = (id: string, projectId: string) => {
    const foundProj = projects.find((p) => p.id === projectId);
    const updated = meetings.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          suggestedProjectId: projectId,
          suggestedProjectName: foundProj ? foundProj.name : 'Unassigned Waste'
        };
      }
      return m;
    });
    setMeetings(updated);
  };

  const handleResolveAnomaly = (anomalyId: string, statusType: 'reviewed' | 'resolved') => {
    // Solve anomaly
    const resolved = anomalies.map((a) => {
      if (a.id === anomalyId) {
        return { ...a, status: statusType as any };
      }
      return a;
    });
    setAnomalies(resolved);
  };

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
  };

  // Login handler
  const handleLoginSuccess = (selected: Persona) => {
    setCurrentUser(selected);
    setCurrentView('app');
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
  };

  // Navigation utilities
  const handleGoToResolveAnomaly = (anom: Anomaly) => {
    setFocusedAnomaly(anom);
    setActiveTab('anomalies');
  };

  // Pending counts
  const pendingLinkCount = meetings.filter((m) => m.status === 'pending').length;
  const activeAlertsCount = anomalies.filter((a) => a.status === 'triggered').length;

  if (currentView === 'landing') {
    return (
      <LandingView
        onEnterApp={() => {
          // Bypasses straight to first prebaked user
          setCurrentUser(SIMULATED_PERSONAS[0]);
          setCurrentView('app');
        }}
        onEnterLogin={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  const requiresOnboarding = !settings.googleCalendarConnected && !settings.outlookConnected;

  if (currentView === 'app' && requiresOnboarding) {
    return (
      <div className="bg-[#09090b] text-[#e5e1e4] min-h-screen flex items-center justify-center font-sans p-6 selection:bg-indigo-500 selection:text-white leading-snug">
        <div className="w-full max-w-4xl bg-[#0d0d0f] border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 animate-fade-in">
          
          {/* Left Hero Sidebar decoration */}
          <div className="md:col-span-4 bg-gradient-to-b from-[#16151a] to-[#09090b] p-8 border-r border-[#1f1f25] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-zinc-950 font-black">
                  <Activity className="w-4.5 h-4.5 text-zinc-950" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-wider">WorkPulse AI</span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2 tracking-tight">Active Calendar Onboarding</h2>
                <p className="text-xs text-zinc-450 leading-relaxed font-semibold">Connect your corporate schedule directory to start recalculating team costs and unearthing meeting leaks.</p>
              </div>
            </div>

            <div className="space-y-4 pt-10">
              <div className="flex gap-3 items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${onboardingStep >= 1 ? 'bg-indigo-600 text-white font-mono' : 'bg-zinc-900 text-zinc-550 font-mono'}`}>1</div>
                <span className={`text-[11px] font-semibold ${onboardingStep === 1 ? 'text-white' : 'text-zinc-550'}`}>Workspace Directory Selection</span>
              </div>
              <div className="flex gap-3 items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${onboardingStep >= 2 ? 'bg-indigo-600 text-white font-mono' : 'bg-zinc-900 text-zinc-550 font-mono'}`}>2</div>
                <span className={`text-[11px] font-semibold ${onboardingStep === 2 ? 'text-white' : 'text-zinc-550'}`}>Directory Authentication</span>
              </div>
              <div className="flex gap-3 items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${onboardingStep >= 3 ? 'bg-indigo-600 text-white font-mono' : 'bg-zinc-900 text-zinc-550 font-mono'}`}>3</div>
                <span className={`text-[11px] font-semibold ${onboardingStep === 3 ? 'text-white' : 'text-zinc-550'}`}>Synthesis Ingestion Engine</span>
              </div>
            </div>

            <div className="text-[10px] text-zinc-600 font-mono">
              SECURE SOC2 COMPLIANT
            </div>
          </div>

          {/* Right Main Panel */}
          <div className="md:col-span-8 p-8 md:p-10 flex flex-col justify-between space-y-6">
            
            {onboardingStep === 1 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-mono text-indigo-400 font-bold block mb-1">STEP 1 OF 3</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">Select your Workspace Schedule Provider</h3>
                  <p className="text-xs text-zinc-400 mt-1 font-semibold">Choose the engine where your organization coordinates meetings, sprints, and calendars:</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Google Card */}
                  <button
                    onClick={() => {
                      setSelectedOnboardingProvider('google');
                      setOnboardingStep(2);
                    }}
                    className="p-5 bg-[#121214] hover:bg-[#16171d] border border-zinc-900 hover:border-indigo-500/40 rounded-2xl text-left transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold mb-3 font-mono text-sm leading-none">G</div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400">Google Calendar</h4>
                    <p className="text-[11px] text-zinc-550 mt-1 leading-normal font-medium">Connect corporate mailboxes via Google Secure OAuth 2.0 Client.</p>
                  </button>

                  {/* Outlook Card */}
                  <button
                    onClick={() => {
                      setSelectedOnboardingProvider('outlook');
                      setOnboardingStep(2);
                    }}
                    className="p-5 bg-[#121214] hover:bg-[#16171d] border border-zinc-900 hover:border-indigo-500/40 rounded-2xl text-left transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold mb-3 font-mono text-sm leading-none">M</div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400">Microsoft Outlook</h4>
                    <p className="text-[11px] text-zinc-550 mt-1 leading-normal font-medium">Link with corporate directories via Microsoft Graph API.</p>
                  </button>
                </div>

                {/* Scope list validation */}
                <div className="bg-[#131115]/30 border border-zinc-900 rounded-2xl p-4 space-y-2.5">
                  <span className="text-[9px] font-bold tracking-wider font-mono text-indigo-400 uppercase">SYNCHRONIZED OCCURRENCE METADATA SCOPE:</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 font-semibold">
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Title & Subject</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Description & Notes</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Host & Organizer</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Attendee list / emails</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Duration minutes</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Recurrence pattern</div>
                    <div className="flex items-center gap-1.5 border-t border-b border-transparent py-0.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Google Meet/Teams links</div>
                  </div>
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-mono text-indigo-400 font-bold block mb-1">STEP 2 OF 3</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Authorize Security Token integration
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 font-medium">
                    Establish secure protocols to read corporate organization schedules and meetings data safely:
                  </p>
                </div>

                <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-400">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">OAuth Secure Protocol Ingest</h4>
                    <p className="text-[11px] text-zinc-450 mt-1 max-w-sm mx-auto leading-relaxed font-semibold">
                      WorkPulse integrates directly with {selectedOnboardingProvider === 'google' ? 'Google Calendar OAuth client' : 'Microsoft Azure Graph interface'}. We request readonly scopes.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                    <button
                      onClick={() => handleInitiateOAuth(selectedOnboardingProvider || 'google')}
                      className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 select-none border-none font-sans"
                    >
                      Connect Calendar Channel
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-2 border-t border-zinc-900/60 pt-4">
                  <p className="text-[10px] text-zinc-450 font-semibold text-center">Testing inside the sandbox? Accelerate by instant-loading static corporate streams:</p>
                  <button
                    onClick={() => handleSimulateFirstLaunchOnboarding(selectedOnboardingProvider || 'google')}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-indigo-455 border border-zinc-800 hover:border-zinc-700 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    🚀 Skip & Ingest Sandbox Calendar stream
                  </button>
                </div>

                <div className="flex justify-start">
                  <button onClick={() => setOnboardingStep(1)} className="text-xs text-zinc-550 hover:text-white flex items-center gap-1 cursor-pointer bg-transparent border-none">
                    &larr; Choose another provider
                  </button>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-6 font-sans">
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-mono text-indigo-400 font-bold block mb-1">STEP 3 OF 3</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">Indexing & Synthesizing Workforce Costs</h3>
                  <p className="text-xs text-zinc-450 mt-1 font-semibold">Establishing socket tunnels and calculating seniority rates metrics in backend:</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-indigo-400 font-bold">Ledger Crawl Progress:</span>
                    <span className="text-white font-bold">{onboardingProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                    <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-100" style={{ width: `${onboardingProgress}%` }} />
                  </div>
                </div>

                {/* Terminal sync logs */}
                <div className="bg-black border border-zinc-900 p-4 rounded-xl font-mono text-[9px] text-zinc-400 space-y-2 max-h-48 overflow-y-auto leading-relaxed text-left">
                  {onboardingLogs.map((log, i) => (
                    <div key={i} className="flex gap-2 text-emerald-400">
                      <span className="text-zinc-650 font-semibold font-sans">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {onboardingProgress < 100 && (
                    <div className="text-indigo-300 animate-pulse">&gt; Sync running. Integrating indices...</div>
                  )}
                </div>

                {onboardingProgress === 100 && (
                  <button
                    onClick={() => {
                      // Finalize onboarding view! Settings connected variables are already modified.
                      // Navigation goes straight to main dashboard cockpit
                      setActiveTab('dashboard');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform active:scale-95 border-none"
                  >
                    Unlock Executive Cockpit &rarr;
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-between items-center text-[10px] text-zinc-600 border-t border-zinc-900/40 pt-4">
              <span className="font-semibold uppercase tracking-wider font-mono">WORKPULSE ENTERPRISE SYSTEM</span>
              <span>VERIFICATION PIN: CL-884-AX</span>
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div id="workpulse-app-workspace" className="bg-[#09090b] text-[#e5e1e4] min-h-screen flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Mobile Top Bar Navigation */}
      <div className="md:hidden flex items-center justify-between px-6 h-16 border-b border-zinc-900 bg-[#131315]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-black text-white uppercase tracking-tight">WorkPulse AI</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-400 hover:text-white">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Main Persistent Sidebar */}
      <aside
        className={`fixed md:sticky top-16 md:top-0 left-0 w-64 h-[calc(100vh-4rem)] md:h-screen bg-[#0d0d0f] border-r border-zinc-900/60 p-5 flex flex-col justify-between z-20 transition-transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="hidden md:flex items-center gap-3 border-b border-zinc-900/40 pb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-[#09090b] font-black">
              <Activity className="w-4.5 h-4.5 text-indigo-95 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight text-white leading-none">WorkPulse AI</p>
              <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold font-mono">HR INTEL SYSTEM</span>
            </div>
          </div>

          {/* User Profile Card */}
          {currentUser && (
            <div className="p-3 bg-[#131315]/75 border border-zinc-900 rounded-xl flex items-center gap-3">
              <img
                referrerPolicy="no-referrer"
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border border-zinc-800 object-cover"
              />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-white text-xs font-bold truncate">{currentUser.name}</p>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5">{currentUser.role}</p>
              </div>
            </div>
          )}

          {/* Navigation link indexes */}
          <nav className="space-y-1 text-xs font-semibold">
            
            {/* Tab: Dashboard */}
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-zinc-900 text-white font-bold border-l-2 border-indigo-500'
                  : 'text-zinc-400 hover:text-white hover:bg-[#131115]/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Executive Cockpit</span>
              </div>
            </button>

            {/* Tab: Attribution sync */}
            <button
              onClick={() => {
                setActiveTab('attribution');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'attribution'
                  ? 'bg-zinc-900 text-white font-bold border-l-2 border-indigo-505'
                  : 'text-zinc-400 hover:text-white hover:bg-[#131115]/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Link2 className="w-4 h-4" />
                <span>Project Attribution</span>
              </div>
              {pendingLinkCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-bold font-mono text-[9px]">
                  {pendingLinkCount}
                </span>
              )}
            </button>

            {/* Tab: Analytics spend breakdown */}
            <button
              onClick={() => {
                setActiveTab('analytics');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-zinc-900 text-white font-bold border-l-2 border-indigo-500'
                  : 'text-zinc-400 hover:text-white hover:bg-[#131115]/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Cost Analytics</span>
              </div>
            </button>

            {/* Tab: Security anomalies */}
            <button
              onClick={() => {
                setActiveTab('anomalies');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'anomalies'
                  ? 'bg-zinc-900 text-white font-bold border-l-2 border-indigo-500'
                  : 'text-zinc-400 hover:text-white hover:bg-[#131115]/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Anomaly Center</span>
              </div>
              {activeAlertsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 font-bold font-mono text-[9px]">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            {/* Tab: Forecasting What if */}
            <button
              onClick={() => {
                setActiveTab('forecasting');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'forecasting'
                  ? 'bg-zinc-900 text-white font-bold border-l-2 border-indigo-500'
                  : 'text-zinc-400 hover:text-white hover:bg-[#131115]/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LineChart className="w-4 h-4" />
                <span>What-If Simulator</span>
              </div>
            </button>

            {/* Tab: Executive AI Copilot */}
            <button
              onClick={() => {
                setActiveTab('copilot');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'copilot'
                  ? 'bg-zinc-900 text-white font-bold border-l-2 border-indigo-500'
                  : 'text-zinc-400 hover:text-white hover:bg-[#131115]/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Executive Copilot</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            </button>

            {/* Tab: Custom system settings rules */}
            <button
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-zinc-900 text-white font-bold border-l-2 border-indigo-500'
                  : 'text-zinc-400 hover:text-white hover:bg-[#131115]/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <SettingsIcon className="w-4 h-4" />
                <span>System Settings</span>
              </div>
            </button>

          </nav>
        </div>

        {/* Sidebar Footer Logout layout */}
        <button
          onClick={handleLogout}
          className="w-full p-2.5 text-left text-xs font-semibold text-zinc-550 hover:text-red-400 hover:bg-[#131315]/30 rounded-lg flex items-center gap-2.5 transition-all mt-auto border-none cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Workspace</span>
        </button>
      </aside>

      {/* Main Workspace Frame panel overlay */}
      <main className="flex-1 min-w-0 p-6 md:p-8 space-y-6">
        
        {/* Render actual child tab view */}
        {activeTab === 'dashboard' && (
          <DashboardView
            projects={projects}
            meetings={meetings}
            anomalies={anomalies}
            onNavigate={(tag) => setActiveTab(tag as any)}
            onOpenResolveAnomaly={handleGoToResolveAnomaly}
            onOpenStrategyPlanner={() => setStrategyPlannerOpen(true)}
          />
        )}

        {activeTab === 'attribution' && (
          <AttributionView
            meetings={meetings}
            projects={projects}
            onApproveMeeting={handleApproveMeeting}
            onDiscardMeeting={handleDiscardMeeting}
            onUpdateProjectMatch={handleUpdateProjectMatch}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView projects={projects} settings={settings} />
        )}

        {activeTab === 'anomalies' && (
          <AnomalyView
            anomalies={anomalies}
            onResolveAnomaly={handleResolveAnomaly}
            selectedDefaultAnomaly={focusedAnomaly}
            onClearSelectedDefaultAnomaly={() => setFocusedAnomaly(null)}
          />
        )}

        {activeTab === 'forecasting' && (
          <ForecastingView projects={projects} />
        )}

        {activeTab === 'copilot' && <CopilotView />}

        {activeTab === 'settings' && (
          <SettingsView 
            settings={settings} 
            onUpdateSettings={handleUpdateSettings}
            onManualSync={handleManualSync}
            syncLogs={syncLogs}
            isSyncing={isSyncing}
            onInitiateOAuth={handleInitiateOAuth}
            onDisconnectCalendar={handleDisconnectCalendar}
          />
        )}

      </main>

      {/* Strategic AI Planner Modal Overlay in Dashboard */}
      {strategyPlannerOpen && (
        <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center z-50 p-4 leading-normal">
          <div className="bg-[#131315] border border-zinc-900/80 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setStrategyPlannerOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="flex items-center gap-2 text-indigo-400 mb-4">
              <Sparkles className="w-4.5 h-4.5 text-violet-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider">AI Optimization Audit Strategy</h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Our automated analysis has designed three optimization protocols that can be implemented to recover personnel cost overhead:
            </p>

            <div className="space-y-3">
              
              <div className="p-3 bg-zinc-950/70 border border-zinc-900 rounded-xl flex gap-3 text-xs leading-relaxed">
                <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 font-bold font-mono">01</div>
                <div>
                  <p className="font-bold text-white mb-0.5">Define Coordinated "No-Meeting Wednesdays"</p>
                  <p className="text-zinc-500 text-[11px]">Guarantees uninterrupted development workdays for engineers. Reduces overall meeting bulk creep by 15%.</p>
                </div>
              </div>

              <div className="p-3 bg-zinc-950/70 border border-zinc-900 rounded-xl flex gap-3 text-xs leading-relaxed">
                <div className="w-6 h-6 rounded bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0 font-bold font-mono">02</div>
                <div>
                  <p className="font-bold text-white mb-0.5">Enforce Silent Observer Limiters (PMO Calls)</p>
                  <p className="text-zinc-500 text-[11px]">Restricts alignment participation to active speakers, automatically clipping non-essential audience clocks by 30%.</p>
                </div>
              </div>

              <div className="p-3 bg-zinc-950/70 border border-zinc-900 rounded-xl flex gap-3 text-xs leading-relaxed">
                <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 font-bold font-mono">03</div>
                <div>
                  <p className="font-bold text-white mb-0.5">Automate Contractor Standup Review Rules</p>
                  <p className="text-zinc-500 text-[11px]">Triggers warnings in the Security Center whenever a contractor sync exceeds $4,000 in weekly burn value.</p>
                </div>
              </div>

            </div>

            <div className="flex gap-2.5 justify-end mt-6">
              <button
                onClick={() => setStrategyPlannerOpen(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setStrategyPlannerOpen(false);
                  setActiveTab('copilot');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold active:scale-95 transition-transform cursor-pointer"
              >
                Query Executive Copilot
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
