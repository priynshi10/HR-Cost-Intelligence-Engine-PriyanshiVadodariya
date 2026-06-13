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
import ProfileModal from './components/ProfileModal';
import EmployeeView from './components/EmployeeView';

type TabType = 'dashboard' | 'attribution' | 'analytics' | 'anomalies' | 'forecasting' | 'copilot' | 'settings';

export default function App() {
  // Navigation & session state
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentUser, setCurrentUser] = useState<Persona | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userRoleMode, setUserRoleMode] = useState<'admin' | 'employee'>('admin');

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

  const handleSaveMeeting = (updatedMeeting: Meeting) => {
    setMeetings((prev) => {
      const exists = prev.some((m) => m.id === updatedMeeting.id);
      if (exists) {
        return prev.map((m) => m.id === updatedMeeting.id ? { ...updatedMeeting, isAdminUpdated: true } : m);
      } else {
        return [{ ...updatedMeeting, isAdminUpdated: true }, ...prev];
      }
    });

    // Create a series of high-fidelity logs for calendar sync and employee notifications
    const newLogs: { timestamp: string; message: string; type: 'info' | 'success' | 'warn' | 'error' }[] = [];
    const timestamp = new Date().toISOString();

    // Standard override notification
    newLogs.push({
      timestamp,
      message: `[Corporate Ledger Sync] Manual overrides applied to event: "${updatedMeeting.name}". Total participants: ${updatedMeeting.participants.length}. Projected cost footprint: $${updatedMeeting.costEstimate}.`,
      type: 'success'
    });

    // Google Call sync notification
    if (updatedMeeting.syncToCalendar !== false) {
      newLogs.push({
        timestamp,
        message: `[Google Calendar API v3] Synced event detail mappings for "${updatedMeeting.name}" directly to primary corporate calendar. ID: gc-${updatedMeeting.id}.`,
        type: 'info'
      });
    }

    // Employee notify notification
    if (updatedMeeting.notifyAttendees !== false && updatedMeeting.participants.length > 0) {
      const attendeeListString = updatedMeeting.participants.map(p => p.name).join(', ');
      newLogs.push({
        timestamp,
        message: `[Mailing System] Dispatched automated calendar alerts & email invitations to ${updatedMeeting.participants.length} employees: [${attendeeListString}]. Synchronized successfully.`,
        type: 'success'
      });
    }

    setSyncLogs((prev) => [...newLogs, ...prev]);
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    setSyncLogs((prev) => [
      {
        timestamp: new Date().toISOString(),
        message: `[HR Admin Sync] Event ID: "${id}" was permanently removed from the corporate mapping database.`,
        type: 'warning'
      },
      ...prev
    ]);
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
    // Auto-initialize role mode based on corporate credentials
    const roleLower = selected.role.toLowerCase();
    const isAdmin = roleLower.includes('chro') || roleLower.includes('lead') || roleLower.includes('vp') || roleLower.includes('admin') || selected.id === 'p1' || selected.id === 'p2';
    setUserRoleMode(isAdmin ? 'admin' : 'employee');
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
      <div className="bg-[#FAF8F5] text-[#1F1A17] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-between selection:bg-[#6F4E37] selection:text-white leading-snug animate-fade-in relative overflow-hidden">
        
        {/* Decorative Background ambient elements using luxury Bronze & Soft Highlight */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#6F4E37]/5 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#C8A27C]/5 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center relative z-10">
          
          {/* Executive Header Lockup */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6F4E37] to-[#8B6B4A] flex items-center justify-center shadow-lg shadow-[#6F4E37]/15">
              <Activity className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-wider text-[#1F1A17] uppercase font-display">WorkPulse <span className="text-[#C8A27C]">AI</span></p>
              <span className="text-[10px] text-[#5E5248] uppercase tracking-widest font-extrabold block -mt-1 font-mono">Executive Intelligence Suite</span>
            </div>
          </div>

          {/* Top Multi-step Status Progress indicator */}
          <div className="flex items-center justify-center max-w-xl mx-auto mb-14 w-full px-4">
            <div className="flex items-center w-full">
              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border ${
                  onboardingStep >= 1
                    ? 'bg-[#6F4E37] text-white border-[#6F4E37] shadow-md shadow-[#6F4E37]/10'
                    : 'bg-white text-[#8D8176] border-[#E8DDD0]'
                }`}>
                  1
                </div>
                <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                  onboardingStep === 1 ? 'text-[#6F4E37]' : 'text-[#8D8176]'
                }`}>
                  Select Directory
                </span>
              </div>

              {/* Connector Line */}
              <div className="flex-1 h-[2px] bg-[#E8DDD0] relative -mt-5">
                <div className="absolute top-0 left-0 h-full bg-[#6F4E37] transition-all duration-500" style={{ width: onboardingStep > 1 ? '100%' : '0%' }} />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center flex-1 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border ${
                  onboardingStep >= 2
                    ? 'bg-[#6F4E37] text-white border-[#6F4E37] shadow-md shadow-[#6F4E37]/10'
                    : 'bg-white text-[#8D8176] border-[#E8DDD0]'
                }`}>
                  2
                </div>
                <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                  onboardingStep === 2 ? 'text-[#6F4E37]' : 'text-[#8D8176]'
                }`}>
                  Authorize Scope
                </span>
              </div>

              {/* Connector Line */}
              <div className="flex-1 h-[2px] bg-[#E8DDD0] relative -mt-5">
                <div className="absolute top-0 left-0 h-full bg-[#6F4E37] transition-all duration-500" style={{ width: onboardingStep > 2 ? '100%' : '0%' }} />
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center flex-1 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border ${
                  onboardingStep === 3
                    ? 'bg-[#6F4E37] text-white border-[#6F4E37] shadow-md shadow-[#6F4E37]/10'
                    : 'bg-white text-[#8D8176] border-[#E8DDD0]'
                }`}>
                  3
                </div>
                <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                  onboardingStep === 3 ? 'text-[#6F4E37]' : 'text-[#8D8176]'
                }`}>
                  Process Ingestion
                </span>
              </div>
            </div>
          </div>

          {/* Main Card workspace container wrapper */}
          <motion.div
            key={onboardingStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full bg-white border border-[#E8DDD0] rounded-3xl p-8 sm:p-12 shadow-xl shadow-[#6F4E37]/2 overflow-hidden relative animate-fade-in animate-duration-300"
          >
            
            {onboardingStep === 1 && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EDE4] border border-[#E8DDD0] text-[10px] font-bold text-[#6F4E37] uppercase tracking-widest animate-fade-in">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    STEP 1 of 3: Workspace Directory Alignment
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1F1A17] tracking-tight">
                    Synchronize Your Corporate Scheduling
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5E5248] max-w-xl mx-auto leading-relaxed">
                    Select the workspace calendar ecosystem used by your organization. WorkPulse automatically reads aggregate scheduling metadata to map real-time project burn rates.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Google Card */}
                  <button
                    onClick={() => {
                      setSelectedOnboardingProvider('google');
                      setOnboardingStep(2);
                    }}
                    className="p-6 sm:p-8 bg-white border border-[#E8DDD0] hover:border-[#6F4E37] rounded-2xl text-left transition-all hover:shadow-xl hover:shadow-[#6F4E37]/5 group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#6F4E37]/5 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E8DDD0] flex items-center justify-center font-bold text-lg text-[#6F4E37] mb-6 shadow-sm">
                      <span className="text-xl font-bold bg-gradient-to-r from-[#6F4E37] to-[#C8A27C] bg-clip-text text-transparent">G</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-[#1F1A17] group-hover:text-[#6F4E37] transition-colors flex items-center gap-1.5">
                        Google Workspace
                        <ChevronRight className="w-4 h-4 text-[#8D8176] group-hover:translate-x-1 transition-transform" />
                      </h4>
                      <p className="text-xs text-[#5E5248] leading-relaxed">
                        Connect corporate email domains securely utilizing Google's verified OAuth 2.0 Client protocol.
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-[#FAF8F5] space-y-2">
                      <span className="text-[9px] font-bold text-[#8D8176] uppercase tracking-wider block">CAPABILITIES:</span>
                      <ul className="text-[11px] text-[#5E5248] space-y-1.5 leading-normal">
                        <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942] shrink-0" /> Full Google Calendar API v3 integrations</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942] shrink-0" /> Cross-domain workspace indexing support</li>
                      </ul>
                    </div>
                  </button>

                  {/* Microsoft Card */}
                  <button
                    onClick={() => {
                      setSelectedOnboardingProvider('outlook');
                      setOnboardingStep(2);
                    }}
                    className="p-6 sm:p-8 bg-white border border-[#E8DDD0] hover:border-[#6F4E37] rounded-2xl text-left transition-all hover:shadow-xl hover:shadow-[#6F4E37]/5 group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#C8A27C]/5 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E8DDD0] flex items-center justify-center font-bold text-lg text-[#C8A27C] mb-6 shadow-sm">
                      <span className="text-xl font-bold bg-gradient-to-r from-[#C8A27C] to-[#E6C7A6] bg-clip-text text-transparent">O</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-[#1F1A17] group-hover:text-[#6F4E37] transition-colors flex items-center gap-1.5">
                        Microsoft Office 365
                        <ChevronRight className="w-4 h-4 text-[#8D8176] group-hover:translate-x-1 transition-transform" />
                      </h4>
                      <p className="text-xs text-[#5E5248] leading-relaxed">
                        Interface with employee calendars dynamically using standard corporate Office 365 Graph protocols.
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-[#FAF8F5] space-y-2">
                      <span className="text-[9px] font-bold text-[#8D8176] uppercase tracking-wider block">CAPABILITIES:</span>
                      <ul className="text-[11px] text-[#5E5248] space-y-1.5 leading-normal">
                        <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942] shrink-0" /> Azure Active Directory SSO & Mapping</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942] shrink-0" /> Microsoft Graph secure enterprise endpoints</li>
                      </ul>
                    </div>
                  </button>
                </div>

                {/* Premium Visual Workflow Illustration */}
                <div className="bg-[#F3EDE4]/60 border border-[#E8DDD0] rounded-2xl p-6 mt-8">
                  <span className="text-[10px] font-bold tracking-wider text-[#6F4E37] uppercase block mb-4 text-center">
                    REAL-TIME LEDGER SYNCHRONIZATION PIPELINE:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center text-[#1F1A17]">
                    <div className="space-y-1.5">
                      <div className="mx-auto w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6F4E37] border border-[#E8DDD0] shadow-sm">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <p className="text-[11px] font-bold">1. Calendar Ingest</p>
                      <p className="text-[9.5px] text-[#5E5248] leading-normal px-1">Gathers schedules from secure endpoints.</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="mx-auto w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#8B6B4A] border border-[#E8DDD0] shadow-sm">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <p className="text-[11px] font-bold">2. AI Attribution</p>
                      <p className="text-[9.5px] text-[#5E5248] leading-normal px-1">Maps events seamlessly to core projects.</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="mx-auto w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#C8A27C] border border-[#E8DDD0] shadow-sm">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <p className="text-[11px] font-bold">3. Cost Intelligence</p>
                      <p className="text-[9.5px] text-[#5E5248] leading-normal px-1">Calculates spent dollars with exact rates.</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="mx-auto w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6F4E37] border border-[#E8DDD0] shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <p className="text-[11px] font-bold">4. Executive Insights</p>
                      <p className="text-[9.5px] text-[#5E5248] leading-normal px-1">Minimizes meeting waste & highlights drag.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EDE4] border border-[#E8DDD0] text-[10px] font-bold text-[#5E5248] uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4F7942]" />
                    STEP 2 of 3: Secure Authorized Integrations
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1F1A17] tracking-tight">
                    Authorize Security Mappings
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5E5248] max-w-xl mx-auto leading-relaxed">
                    Confirm alignment with read-only schedule parameters. WorkPulse never processes primary raw email content, maintaining robust executive transparency and privacy standards.
                  </p>
                </div>

                <div className="p-8 bg-[#FAF8F5] border border-[#E8DDD0] rounded-2xl text-center space-y-6 max-w-xl mx-auto shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8DDD0] flex items-center justify-center mx-auto text-[#6F4E37] shadow-sm">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-[#1F1A17]">Read-Only Calendar Synchronization Scope</h4>
                    <p className="text-xs text-[#5E5248] max-w-md mx-auto leading-relaxed">
                      By authorizing, you permit WorkPulse to ingest event titles, participant counts, and duration metrics. All synced ledger info is end-to-end sandbox isolated.
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto pt-2">
                    <button
                      onClick={() => handleInitiateOAuth(selectedOnboardingProvider || 'google')}
                      className="w-full py-3 bg-[#6F4E37] text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:-translate-y-0.5 border-none"
                    >
                      <Zap className="w-4 h-4 text-white" />
                      Authorize & Connect
                    </button>
                  </div>
                </div>

                {/* Simulated skip/sandbox option for fast executive testability */}
                <div className="flex flex-col items-center justify-center space-y-3 border-t border-[#E8DDD0] pt-6 max-w-xl mx-auto">
                  <p className="text-xs text-[#8D8176] font-bold text-center">Testing inside the interactive preview? Load our prebuilt SaaS stream directly:</p>
                  <button
                    onClick={() => handleSimulateFirstLaunchOnboarding(selectedOnboardingProvider || 'google')}
                    className="px-6 py-3 bg-white hover:bg-[#FAF8F5] text-[#6F4E37] border border-[#E8DDD0] hover:border-[#8B6B4A] text-xs font-bold rounded-xl transition-all cursor-pointer hover:shadow-xs active:scale-[0.98]"
                  >
                    🚀 Speed-Run Onboarding with Sandbox Stream
                  </button>
                </div>

                <div className="flex justify-center pt-2">
                  <button 
                    onClick={() => setOnboardingStep(1)} 
                    className="text-xs text-[#8D8176] hover:text-[#6F4E37] font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none transition-colors"
                  >
                    &larr; Choose another scheduling provider
                  </button>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EDE4] border border-[#E8DDD0] text-[10px] font-bold text-[#6F4E37] uppercase tracking-widest">
                    <Activity className="w-3.5 h-3.5 text-[#C8A27C] animate-pulse" />
                    STEP 3 of 3: Syncing Executive Mappings
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1F1A17] tracking-tight">
                    Analyzing Cost Footprint Ledgers
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5E5248] max-w-xl mx-auto leading-relaxed">
                    Connecting socket tunnels to calculate employee rate cost estimates, tracking meeting duplication overlap on background.
                  </p>
                </div>

                <div className="p-6 sm:p-10 bg-white border border-[#E8DDD0] rounded-2xl space-y-6 max-w-xl mx-auto shadow-sm">
                  {/* Modern and Minimalist progress bar */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs font-bold text-[#1F1A17]">
                      <span>Processing Ledger Sync...</span>
                      <span className="text-[#6F4E37]">{onboardingProgress}%</span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] h-3.5 rounded-full overflow-hidden border border-[#E8DDD0] p-[2px]">
                      <div 
                        className="bg-gradient-to-r from-[#6F4E37] to-[#8B6B4A] h-full rounded-full transition-all duration-150" 
                        style={{ width: `${onboardingProgress}%` }} 
                      />
                    </div>
                  </div>

                  {/* Clean executive ingestion logs */}
                  <div className="border border-[#E8DDD0] bg-[#FAF8F5] rounded-xl p-4 space-y-2.5 max-h-44 overflow-y-auto">
                    {onboardingLogs.map((log, i) => (
                      <div key={i} className="flex gap-2.5 text-[11px] text-[#5E5248] font-medium leading-relaxed animate-fade-in text-left">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942] shrink-0 mt-0.5" />
                        <span>{log}</span>
                      </div>
                    ))}
                    {onboardingProgress < 100 && (
                      <div className="flex gap-2.5 text-[11px] text-[#8D8176] font-bold animate-pulse text-left justify-start">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent border-[#6F4E37] animate-spin shrink-0 mt-0.5" />
                        <span>Calculating workload burden rates and synchronization...</span>
                      </div>
                    )}
                  </div>

                  {onboardingProgress === 100 && (
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                      }}
                      className="w-full py-4 bg-[#6F4E37] hover:opacity-90 text-white font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-[#6F4E37]/10 flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform active:scale-95 border-none"
                    >
                      Enter Executive Cockpit &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

          </motion.div>

          {/* Luxury Security and Compliance Badges Footer */}
          <div className="max-w-5xl mx-auto pt-10 border-t border-[#E8DDD0]/60 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-[#5E5248] font-extrabold w-full mt-10">
            <div className="flex flex-wrap justify-center gap-4 text-[9.5px] uppercase font-bold text-[#8D8176]">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#4F7942]" /> SOC2 TYPE II COMPLIANT</span>
              <span className="text-[#E8DDD0]">•</span>
              <span>ISO 27001 KEY CRYPTO SECURE</span>
              <span className="text-[#E8DDD0]">•</span>
              <span>GDPR PRIVACY COMPLIANT</span>
              <span className="text-[#E8DDD0]">•</span>
              <span>256-BIT SHIELD ENCRYPTION</span>
            </div>
            <div className="font-mono text-[9px] uppercase tracking-wider">
              LEDGER VERIFICATION: CL-884-XE
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div id="workpulse-app-workspace" className="bg-[#FAF8F5] text-[#1F1A17] min-h-screen flex flex-col md:flex-row font-sans selection:bg-[#6F4E37] selection:text-white">
      
      {/* Mobile Top Bar Navigation */}
      <div className="md:hidden flex items-center justify-between px-6 h-16 border-b border-[#E8DDD0] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#6F4E37]" />
          <span className="text-sm font-bold text-[#1F1A17] uppercase tracking-tight font-display">WorkPulse AI</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#5E5248] hover:text-[#1F1A17]">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Main Persistent Sidebar */}
      <aside
        className={`fixed md:sticky top-16 md:top-0 left-0 w-64 h-[calc(100vh-4rem)] md:h-screen bg-[#F3EDE4]/95 border-r border-[#E8DDD0] p-5 flex flex-col justify-between z-20 transition-transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="hidden md:flex items-center gap-3 border-b border-[#E8DDD0] pb-5">
            <div className="w-8 h-8 rounded-lg bg-[#6F4E37] flex items-center justify-center text-white font-bold shadow-sm">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-[#1F1A17] leading-none font-display">WorkPulse AI</p>
              <span className="text-[9px] text-[#8B6B4A] uppercase tracking-widest font-extrabold font-mono">HR INTEL SYSTEM</span>
            </div>
          </div>

          {/* User Profile Card */}
          {currentUser && (
            <button
              onClick={() => setProfileOpen(true)}
              className="p-3 bg-white hover:bg-[#FAF8F5] border border-[#E8DDD0] hover:border-[#6F4E37] rounded-xl flex items-center gap-3 w-full text-left transition-all active:scale-[0.98] group cursor-pointer border-none"
              title="Click to Open Profile Configuration"
            >
              <img
                referrerPolicy="no-referrer"
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border border-[#E8DDD0] object-cover group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-1">
                  <p className="text-[#1F1A17] text-xs font-bold truncate">{currentUser.name}</p>
                </div>
                <p className="text-[10px] text-[#5E5248] truncate mt-0.5">{currentUser.role}</p>
                <span className="text-[8.5px] text-[#8B6B4A] font-bold uppercase tracking-wider block mt-1 opacity-70 group-hover:opacity-100 transition-opacity">View Profile &rarr;</span>
              </div>
            </button>
          )}

          {/* SaaS View Mode Switcher */}
          <div className="p-2.5 bg-white border border-[#E8DDD0] rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[9px] font-bold text-[#8D8176] uppercase tracking-widest leading-none px-1">
              <span>View Interface Mode</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${userRoleMode === 'admin' ? 'bg-[#FAF8F5] text-[#6F4E37]' : 'bg-[#FAF8F5] text-[#8B6B4A]'}`}>
                {userRoleMode === 'admin' ? 'Admin Suite' : 'Employee Hub'}
              </span>
            </div>
            <div className="flex bg-[#FAF8F5] p-0.5 rounded-lg border border-[#E8DDD0]">
              <button
                type="button"
                onClick={() => {
                  setUserRoleMode('admin');
                  if (activeTab !== 'dashboard' && activeTab !== 'copilot' && activeTab !== 'settings') {
                    setActiveTab('dashboard');
                  }
                }}
                className={`flex-1 py-1 text-[9px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer border-none ${
                  userRoleMode === 'admin'
                    ? 'bg-[#6F4E37] text-white shadow-sm'
                    : 'text-[#8D8176] hover:text-[#1F1A17] bg-transparent'
                }`}
              >
                Admin Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserRoleMode('employee');
                  if (activeTab !== 'dashboard' && activeTab !== 'copilot' && activeTab !== 'settings') {
                    setActiveTab('dashboard');
                  }
                }}
                className={`flex-1 py-1 text-[9px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer border-none ${
                  userRoleMode === 'employee'
                    ? 'bg-[#8B6B4A] text-white shadow-sm'
                    : 'text-[#8D8176] hover:text-[#1F1A17] bg-transparent'
                }`}
              >
                Employee Mode
              </button>
            </div>
          </div>

          {/* Navigation link indexes */}
          <nav className="space-y-1 text-xs font-semibold">
            
            {/* Tab: Dashboard / Employee Insights */}
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer border-none ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#6F4E37] font-bold border-l-2 border-[#C8A27C]'
                  : 'text-[#5E5248] hover:text-[#1F1A17] hover:bg-white/40 bg-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>{userRoleMode === 'admin' ? 'Executive Cockpit' : 'My Employee Insights'}</span>
              </div>
            </button>

            {/* Admin-only elements */}
            {userRoleMode === 'admin' && (
              <>
                {/* Tab: Attribution sync */}
                <button
                  onClick={() => {
                    setActiveTab('attribution');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer border-none ${
                    activeTab === 'attribution'
                      ? 'bg-white text-[#6F4E37] font-bold border-l-2 border-[#C8A27C] shadow-xs'
                      : 'text-[#5E5248] hover:text-[#1F1A17] hover:bg-white/40 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Link2 className="w-4 h-4" />
                    <span>Project Attribution</span>
                  </div>
                  {pendingLinkCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#6F4E37]/10 text-[#6F4E37] font-bold font-mono text-[9px]">
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
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer border-none ${
                    activeTab === 'analytics'
                      ? 'bg-white text-[#6F4E37] font-bold border-l-2 border-[#C8A27C] shadow-xs'
                      : 'text-[#5E5248] hover:text-[#1F1A17] hover:bg-white/40 bg-transparent'
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
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer border-none ${
                    activeTab === 'anomalies'
                      ? 'bg-white text-[#6F4E37] font-bold border-l-2 border-[#C8A27C] shadow-xs'
                      : 'text-[#5E5248] hover:text-[#1F1A17] hover:bg-white/40 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Anomaly Center</span>
                  </div>
                  {activeAlertsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#B85042]/10 text-[#B85042] font-bold font-mono text-[9px]">
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
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer border-none ${
                    activeTab === 'forecasting'
                      ? 'bg-white text-[#6F4E37] font-bold border-l-2 border-[#C8A27C] shadow-xs'
                      : 'text-[#5E5248] hover:text-[#1F1A17] hover:bg-white/40 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LineChart className="w-4 h-4" />
                    <span>What-If Simulator</span>
                  </div>
                </button>
              </>
            )}

            {/* Tab: Executive AI Copilot */}
            <button
              onClick={() => {
                setActiveTab('copilot');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer border-none ${
                activeTab === 'copilot'
                  ? 'bg-white text-[#6F4E37] font-bold border-l-2 border-[#C8A27C] shadow-xs'
                  : 'text-[#5E5248] hover:text-[#1F1A17] hover:bg-white/40 bg-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#C8A27C]" />
                <span>Executive Copilot</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#C8A27C] animate-pulse"></span>
            </button>

            {/* Tab: Custom system settings rules */}
            <button
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer border-none ${
                activeTab === 'settings'
                  ? 'bg-white text-[#6F4E37] font-bold border-l-2 border-[#C8A27C] shadow-xs'
                  : 'text-[#5E5248] hover:text-[#1F1A17] hover:bg-white/40 bg-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <SettingsIcon className="w-4 h-4" />
                <span>{userRoleMode === 'admin' ? 'System Settings' : 'Personal Settings'}</span>
              </div>
            </button>

          </nav>
        </div>

        {/* Sidebar Footer Logout layout */}
        <button
          onClick={handleLogout}
          className="w-full p-2.5 text-left text-xs font-semibold text-[#8D8176] hover:text-[#B85042] hover:bg-white/40 rounded-lg flex items-center gap-2.5 transition-all mt-auto border-none cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Workspace</span>
        </button>
      </aside>

      {/* Main Workspace Frame panel overlay */}
      <main className="flex-1 min-w-0 p-6 md:p-8 space-y-6">
        
        {/* Render actual child tab view */}
        {activeTab === 'dashboard' && (
          userRoleMode === 'admin' ? (
            <DashboardView
              projects={projects}
              meetings={meetings}
              anomalies={anomalies}
              onNavigate={(tag) => setActiveTab(tag as any)}
              onOpenResolveAnomaly={handleGoToResolveAnomaly}
              onOpenStrategyPlanner={() => setStrategyPlannerOpen(true)}
            />
          ) : (
            <EmployeeView
              currentUser={currentUser!}
              meetings={meetings}
              onDisconnectCalendar={handleDisconnectCalendar}
              onInitiateOAuth={handleInitiateOAuth}
              googleConnected={settings.googleCalendarConnected}
              outlookConnected={settings.outlookConnected}
            />
          )
        )}

        {activeTab === 'attribution' && (
          <AttributionView
            meetings={meetings}
            projects={projects}
            onApproveMeeting={handleApproveMeeting}
            onDiscardMeeting={handleDiscardMeeting}
            onUpdateProjectMatch={handleUpdateProjectMatch}
            onSaveMeeting={handleSaveMeeting}
            onDeleteMeeting={handleDeleteMeeting}
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

      {profileOpen && currentUser && (
        <ProfileModal
          user={currentUser}
          userRoleMode={userRoleMode}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
          }}
          onUpdateRoleMode={(mode) => {
            setUserRoleMode(mode);
            if (mode === 'employee' && activeTab !== 'dashboard' && activeTab !== 'copilot' && activeTab !== 'settings') {
              setActiveTab('dashboard');
            }
          }}
          onClose={() => setProfileOpen(false)}
        />
      )}

    </div>
  );
}
