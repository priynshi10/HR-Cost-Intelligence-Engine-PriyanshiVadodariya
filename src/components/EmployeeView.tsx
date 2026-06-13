/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Sparkles,
  Smile,
  AlertOctagon,
  Calendar,
  CheckCircle,
  ThumbsDown,
  ThumbsUp,
  Sliders,
  Play,
  Bookmark,
  TrendingDown,
  MessageSquare,
  Activity,
  Calculator,
  ChevronRight,
  Info
} from 'lucide-react';
import { Meeting, Persona } from '../types';

interface EmployeeViewProps {
  currentUser: Persona;
  meetings: Meeting[];
  onDisconnectCalendar: (provider: 'google' | 'outlook') => void;
  onInitiateOAuth: (provider: 'google' | 'outlook') => void;
  googleConnected: boolean;
  outlookConnected: boolean;
}

export default function EmployeeView({
  currentUser,
  meetings,
  onDisconnectCalendar,
  onInitiateOAuth,
  googleConnected,
  outlookConnected
}: EmployeeViewProps) {
  // Local state for submitted feedbacks to avoid losing state during session
  const [feedbacks, setFeedbacks] = useState<Record<string, { rating: number; tags: string[]; comment: string }>>({});
  const [activeFeedbackMeetingId, setActiveFeedbackMeetingId] = useState<string | null>(null);
  
  // Feedback form state
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customComment, setCustomComment] = useState<string>('');

  // Interactive Fatigue Slider Calculator States
  const [calcDuration, setCalcDuration] = useState<number>(60);
  const [calcAttendees, setCalcAttendees] = useState<number>(5);
  const [calcRoleSeniority, setCalcRoleSeniority] = useState<'l1' | 'l4' | 'l6'>('l4');
  const [calcDayOfWeek, setCalcDayOfWeek] = useState<'mon' | 'wed' | 'fri'>('wed');

  // Filter meetings that the active user participated in
  // In our static data, we map attendees by initials or email to see if they belong.
  // Let's matching by email or initials (using first letter of user's name name prefix or email)
  const myMeetings = useMemo(() => {
    return meetings.filter((m) => {
      if (!currentUser) return false;
      const myEmailPrefix = currentUser.email.split('@')[0].toLowerCase();
      
      // Match if they are on participant list
      const isPart = m.participants.some((p) => {
        const pEmailPrefix = p.email ? p.email.split('@')[0].toLowerCase() : '';
        const nameMatch = p.name.toLowerCase() === currentUser.name.toLowerCase();
        return nameMatch || (pEmailPrefix && pEmailPrefix === myEmailPrefix);
      });

      // Or if they are organizer
      const isOrg = m.organizerEmail?.split('@')[0].toLowerCase() === myEmailPrefix ||
                    m.organizerName?.toLowerCase() === currentUser.name.toLowerCase();
                    
      return isPart || isOrg;
    });
  }, [meetings, currentUser]);

  // Compute stats based on employee's matched meetings
  const myStats = useMemo(() => {
    let totalMinutes = 0;
    let approvedMinutes = 0;
    let personalCostShare = 0;

    myMeetings.forEach((m) => {
      totalMinutes += m.durationMinutes;
      if (m.status === 'approved') {
        approvedMinutes += m.durationMinutes;
      }
      
      // Personal cost share estimate: total cost divided by attendees count
      const numParticipants = m.participants.length || 1;
      personalCostShare += Math.round(m.costEstimate / numParticipants);
    });

    const totalHours = Number((totalMinutes / 60).toFixed(1));
    const meetingPercent = Math.min(Math.round((totalHours / 40) * 100), 100);
    const focusPercent = 100 - meetingPercent;

    // Determine stress category
    let fatigueScore = Math.min(Math.round(totalHours * 4.5 + (myMeetings.length * 3)), 100);
    let stressCategory: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
    let stressColorClass = 'text-emerald-400';
    let stressBg = 'bg-emerald-500/10 border-emerald-500/20';

    if (fatigueScore > 75) {
      stressCategory = 'Severe';
      stressColorClass = 'text-red-500';
      stressBg = 'bg-red-500/10 border-red-500/20';
    } else if (fatigueScore > 50) {
      stressCategory = 'High';
      stressColorClass = 'text-orange-400';
      stressBg = 'bg-orange-500/10 border-orange-500/20';
    } else if (fatigueScore > 25) {
      stressCategory = 'Moderate';
      stressColorClass = 'text-amber-400';
      stressBg = 'bg-amber-500/10 border-amber-500/20';
    }

    return {
      totalHours,
      meetingPercent,
      focusPercent,
      personalCostShare,
      fatigueScore,
      stressCategory,
      stressColorClass,
      stressBg
    };
  }, [myMeetings]);

  // Handle feedback submission
  const handleOpenFeedback = (meetingId: string) => {
    setActiveFeedbackMeetingId(meetingId);
    const existing = feedbacks[meetingId];
    if (existing) {
      setSelectedRating(existing.rating);
      setSelectedTags(existing.tags);
      setCustomComment(existing.comment);
    } else {
      setSelectedRating(5);
      setSelectedTags([]);
      setCustomComment('');
    }
  };

  const handleSaveFeedback = () => {
    if (!activeFeedbackMeetingId) return;
    setFeedbacks((prev) => ({
      ...prev,
      [activeFeedbackMeetingId]: {
        rating: selectedRating,
        tags: selectedTags,
        comment: customComment
      }
    }));
    setActiveFeedbackMeetingId(null);
  };

  const toggleFeedbackTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Live Fatigue Slider calculations
  const fatigueCalcResults = useMemo(() => {
    // 1. Hourly rate estimate: l1=$65, l4=$120, l6=$200
    const rateMap = { l1: 65, l4: 120, l6: 200 };
    const hourlyRate = rateMap[calcRoleSeniority];
    const durationHours = calcDuration / 60;
    
    // meeting spend estimate: (attendees * hourlyRate) * durationHours
    const calculatedSpend = Math.round(calcAttendees * hourlyRate * durationHours);
    
    // Fatigue Score algorithm: base factor of duration + size penalty + day multiplier
    let baseFatigue = (calcDuration / 10) * 4; // 1hr = 24 points
    let sizePenalty = calcAttendees > 10 ? 15 : calcAttendees > 5 ? 8 : 0;
    let dayMultiplier = calcDayOfWeek === 'mon' ? 1.25 : calcDayOfWeek === 'fri' ? 1.15 : 1.0;
    
    const computedScore = Math.min(Math.round((baseFatigue + sizePenalty) * dayMultiplier), 100);
    
    let advice = '';
    let healthStatus: 'healthy' | 'at_risk' | 'warning' = 'healthy';
    
    if (computedScore > 70) {
      advice = '⚠️ Severe focus leak risk! Consider clipping participants or reducing duration to 30 mins to avoid fatigue.';
      healthStatus = 'warning';
    } else if (computedScore > 40) {
      advice = '⚡ Moderate Fatigue. Try establishing a clear agenda or converting to a structured slack doc sync.';
      healthStatus = 'at_risk';
    } else {
      advice = '✅ Highly Efficient block. Low fatigue footprint. Perfect for high alignment.';
      healthStatus = 'healthy';
    }

    return {
      spend: calculatedSpend,
      score: computedScore,
      advice,
      healthStatus
    };
  }, [calcDuration, calcAttendees, calcRoleSeniority, calcDayOfWeek]);

  // Prebaked personal advice tailored to user's department
  const personalScheduleAdvice = useMemo(() => {
    const isEngineering = currentUser.role.toLowerCase().includes('eng') || currentUser.name === 'Marcus Thorne';
    const isHR = currentUser.role.toLowerCase().includes('hr') || currentUser.role.toLowerCase().includes('chro');

    if (isEngineering) {
      return [
        {
          id: 'tip-1',
          title: 'Wednesday Decompression block',
          description: 'You have 3 alignment synchronization hooks currently on Wednesday morning. Proposing shifting "Platform R&D review" to Thursday afternoon.',
          badge: 'Focus Recovery',
          severity: 'high'
        },
        {
          id: 'tip-2',
          title: 'Deep Work Block Discovered',
          description: 'Nice! Continuous 4-hour slot identified on Tuesday afternoon. We locked a calendar blocker automatically in your diary.',
          badge: 'Locked Focus Slot',
          severity: 'healthy'
        }
      ];
    }

    return [
      {
        id: 'tip-1',
        title: 'Meeting Duration Limiter',
        description: 'You held 4 meetings of 60 mins where agenda items were finished under 40 mins. Try changing default template to 45 mins.',
        badge: 'Template Pruning',
        severity: 'medium'
      },
      {
        id: 'tip-2',
        title: 'Reduce Large Alignment Bulks',
        description: 'The upcoming Compliance review contains 16 participants. Over 8 of them are classified as silent observers.',
        badge: 'Silent Observers Alert',
        severity: 'high'
      }
    ];
  }, [currentUser]);

  const recentlySyncAdminMeetings = useMemo(() => {
    return myMeetings.filter(m => m.isAdminUpdated);
  }, [myMeetings]);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title Grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded">My Employee WorkSpace</span>
            <span className="text-[10px] text-zinc-550 font-mono">ID: {currentUser.id}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Hello, {currentUser.name}!</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Explore your personalized schedule alignment, submit meeting productivity ratings, and protect your focus blocks.</p>
        </div>

        {/* Sync calendar buttons */}
        <div className="flex items-center gap-2">
          {(!googleConnected && !outlookConnected) ? (
            <button
              onClick={() => onInitiateOAuth('google')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Link Work Schedule</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#131315] border border-zinc-900 rounded-lg p-1 px-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold">CALENDAR SYNCED</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin overriding live notification banner */}
      {recentlySyncAdminMeetings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4.5 bg-indigo-500/10 border border-dashed border-indigo-500/40 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl"
        >
          <div className="flex gap-3.5 items-start">
            <div className="w-8.5 h-8.5 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5 border border-indigo-500/25">
              <Activity className="w-4.5 h-4.5 animate-pulse text-indigo-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex flex-wrap items-center gap-2 leading-none">
                <span>Enterprise Administration Sync Completed</span>
                <span className="bg-indigo-650/40 text-[9px] text-indigo-300 px-2 py-0.5 rounded font-extrabold uppercase tracking-widest border border-indigo-500/20 shrink-0 animate-pulse">Live</span>
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed mt-1.5">
                The Office of the Administration has directly synchronized or edited details for <strong>{recentlySyncAdminMeetings.length}</strong> group alignment meeting {recentlySyncAdminMeetings.length === 1 ? 'slot' : 'slots'} in your catalog. New hours, participants list (whom the meeting is with), and correct client attribution logs have been mapped live.
              </p>
            </div>
          </div>
          <span className="text-[9px] text-indigo-300 font-mono font-black tracking-widest p-1.5 px-3 rounded-lg bg-indigo-950/45 border border-indigo-900/60 leading-none shrink-0 uppercase select-none">
            SYNC OK
          </span>
        </motion.div>
      )}

      {/* KPI Cards Row (Tailored to employee) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Focus Score */}
        <div className="bg-zinc-950/40 p-5 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between h-40">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-[10px] font-bold tracking-wider uppercase">MY CURRENT FOCUS SCORE</span>
            <Smile className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">
              {myStats.focusPercent}%
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
              +6.3% <span className="text-zinc-500 font-light">restored focus blocks</span>
            </span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${myStats.focusPercent}%` }} />
          </div>
        </div>

        {/* Metric 2: Meetings hours */}
        <div className="bg-zinc-950/40 p-5 rounded-xl border border-zinc-900/80 hover:border-zinc-800 transition-all flex flex-col justify-between h-40">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-[10px] font-bold tracking-wider uppercase">WEEKLY SCHEDULE LOAD</span>
            <Clock className="w-4 h-4 text-[#818cf8]" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">
              {myStats.totalHours} <span className="text-xs text-zinc-500 font-normal">hrs</span>
            </h3>
            <span className="text-[10px] text-zinc-550 font-semibold mt-0.5 block truncate">
              Calculated across {myMeetings.length} synced meetings
            </span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-[#818cf8] h-full rounded-full" style={{ width: `${myStats.meetingPercent}%` }} />
          </div>
        </div>

        {/* Metric 3: Estimated cost impact of users' meeting overhead */}
        <div className="bg-zinc-950/40 p-5 rounded-xl border border-zinc-900/80 hover:border-zinc-800 transition-all flex flex-col justify-between h-40">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-[10px] font-bold tracking-wider uppercase">MY BUDGET COST SHARE</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">
              ${(myStats.personalCostShare).toLocaleString()}
            </h3>
            <span className="text-[10px] text-teal-400 font-semibold flex items-center gap-0.5 mt-0.5">
              -12.8% decrease <span className="text-zinc-500 font-light ml-0.5">from last week</span>
            </span>
          </div>
          <div className="w-full h-8 mt-2 opacity-50">
            <svg className="w-full h-full stroke-indigo-400 stroke-2 fill-none" viewBox="0 0 100 20">
              <path d="M0,18 L20,14 L40,15 L60,8 L80,12 L100,5"></path>
            </svg>
          </div>
        </div>

        {/* Metric 4: Fatigue index status */}
        <div className={`p-5 rounded-xl border ${myStats.stressBg} transition-all flex flex-col justify-between h-40`}>
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-[10px] font-bold tracking-wider uppercase">MEETING FATIGUE LEVEL</span>
            <AlertOctagon className={`w-4 h-4 ${myStats.stressColorClass}`} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">
              {myStats.fatigueScore}<span className="text-xs text-zinc-500 font-normal">/100</span>
            </h3>
            <span className={`text-[11px] font-extrabold flex items-center gap-1 mt-0.5 ${myStats.stressColorClass}`}>
              ● {myStats.stressCategory} Overrun
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-tight">
            Calculated fatigue metric based on duration, attendee numbers, and rest gaps.
          </p>
        </div>

      </div>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Meetings list with interactive feedback */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl lg:col-span-7 flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-base font-bold text-white">My Synced Meetings & Value Assessment</h4>
              <p className="text-[11px] text-zinc-500">Rate meeting productivity anonymously to alert administrators on team cost overheads.</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px] font-mono uppercase">
              {myMeetings.length} tracked items
            </span>
          </div>

          <div className="divide-y divide-zinc-900 max-h-[30rem] overflow-y-auto space-y-3 pr-1">
            {myMeetings.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950/20 rounded-xl border border-zinc-900/60 flex flex-col items-center justify-center space-y-2">
                <Calendar className="w-8 h-8 text-zinc-700" />
                <p className="text-xs font-semibold text-zinc-400">No synced meetings found in your scope.</p>
                <p className="text-[10px] text-zinc-600">Connect Google or Microsoft calendar in settings to crawl schedules.</p>
              </div>
            ) : (
              myMeetings.map((m) => {
                const isApproved = m.status === 'approved';
                const hasFeedback = feedbacks[m.id];
                
                // Format datetime
                let formattedTime = '';
                try {
                  const d = new Date(m.dateTime);
                  formattedTime = d.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  }) + ' at ' + d.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  });
                } catch(e) {
                  formattedTime = m.dateTime;
                }

                return (
                  <div key={m.id} className="pt-4 pb-4 first:pt-0 border-b border-zinc-900/40 last:border-0 group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-indigo-500' : 'bg-amber-500'}`}></span>
                        <h5 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{m.name}</h5>
                        {m.recurrence && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-900/80 border border-zinc-850 text-[8px] text-zinc-500 uppercase tracking-wide">{m.recurrence}</span>
                        )}
                        {m.isAdminUpdated && (
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-[8.5px] text-indigo-300 font-extrabold uppercase tracking-wide flex items-center gap-1 animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
                            Admin Scheduled
                          </span>
                        )}
                      </div>
                      
                      {/* Formatted scheduled timing block */}
                      <p className="text-[10px] text-zinc-400 font-medium">
                        <span className="text-zinc-550 font-bold uppercase tracking-wider text-[9px] mr-1.5">TIMING:</span>
                        <span className="font-mono text-zinc-300 font-semibold">{formattedTime}</span>
                        <span className="mx-2 text-zinc-700">|</span>
                        <span className="font-mono text-zinc-300">{m.durationMinutes} mins</span>
                      </p>

                      {/* Participant list with whom the meeting is */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[9.5px] text-zinc-550 font-extrabold uppercase tracking-wider">WHOME:</span>
                        <div className="flex flex-wrap gap-1">
                          {m.participants.map((person) => (
                            <span 
                              key={person.id} 
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-900 text-[10px] text-zinc-300 font-medium"
                              title={`${person.role} — ${person.department}`}
                            >
                              <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/15 font-bold text-indigo-400 text-[8.5px] flex items-center justify-center border border-indigo-500/10">
                                {person.initials}
                              </span>
                              <span>{person.name}</span>
                            </span>
                          ))}
                          {m.participants.length === 0 && (
                            <span className="text-[10px] text-zinc-650 italic">No other staff enrolled</span>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] text-indigo-400 font-bold mt-1">
                        Your private cost-share value: <span className="font-mono text-indigo-300">~${Math.round(m.costEstimate / (m.participants.length || 1))}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {hasFeedback ? (
                        <div className="flex items-center gap-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-1.5 px-3">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[10px] text-emerald-400 font-bold">Feedback Sent ({feedbacks[m.id].rating}★)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenFeedback(m.id)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-bold rounded-lg text-zinc-300 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          Rate Productivity
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Meeting fatigue & cost calculator & schedule advice */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Personalized Schedule advice */}
          <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-indigo-400 mb-4">
              <Sparkles className="w-4.5 h-4.5 text-violet-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">AI Personal Schedule Advisory</h4>
            </div>

            <div className="space-y-3.5">
              {personalScheduleAdvice.map((advice) => (
                <div key={advice.id} className="p-3 bg-[#111113] border border-zinc-900/80 rounded-xl leading-relaxed text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded uppercase">{advice.badge}</span>
                    <span className={`w-2 h-2 rounded-full ${advice.severity === 'high' ? 'bg-red-500' : 'bg-emerald-400'}`}></span>
                  </div>
                  <h5 className="font-bold text-white text-xs mb-0.5">{advice.title}</h5>
                  <p className="text-zinc-500 text-[11px] leading-snug">{advice.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Live Meeting Fatigue & Cost Calculator */}
          <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center gap-2 text-indigo-400 mb-3.5">
              <Calculator className="w-4.5 h-4.5 text-violet-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Fatigue & Cost Sandbox Simulator</h4>
            </div>

            <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed">
              Planning a new team alignment session? Slide parameters below to predict its corporate cost footprint and team exhaustion risk in real time.
            </p>

            <div className="space-y-3 font-sans text-xs">
              {/* Slider 1: Duration */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                  <span>Duration Minutes:</span>
                  <span className="text-white font-mono font-bold">{calcDuration} Min</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="180"
                  step="15"
                  value={calcDuration}
                  onChange={(e) => setCalcDuration(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-zinc-901 rounded-lg"
                />
              </div>

              {/* Slider 2: Attendees */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                  <span>Number of Attendees:</span>
                  <span className="text-white font-mono font-bold">{calcAttendees}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={calcAttendees}
                  onChange={(e) => setCalcAttendees(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-zinc-901 rounded-lg"
                />
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Staff Seniority:</label>
                  <select
                    className="w-full bg-[#111113] border border-zinc-900 rounded-lg py-1.5 px-2 text-[11px] text-white focus:outline-none focus:border-indigo-500 font-semibold"
                    value={calcRoleSeniority}
                    onChange={(e: any) => setCalcRoleSeniority(e.target.value)}
                  >
                    <option value="l1">IC Role (~$65/hr burden)</option>
                    <option value="l4">Lead Lead (~$120/hr burden)</option>
                    <option value="l6">VP Executive (~$200/hr burden)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Day of the Week:</label>
                  <select
                    className="w-full bg-[#111113] border border-zinc-900 rounded-lg py-1.5 px-2 text-[11px] text-white focus:outline-none focus:border-indigo-500 font-semibold"
                    value={calcDayOfWeek}
                    onChange={(e: any) => setCalcDayOfWeek(e.target.value)}
                  >
                    <option value="wed">Midweek (Wednesday)</option>
                    <option value="mon">Monday Morning</option>
                    <option value="fri">Friday Decompression</option>
                  </select>
                </div>
              </div>

              {/* Output block */}
              <div className="mt-4 p-4 bg-[#0d0d0f] rounded-xl border border-zinc-900/80 space-y-3 text-center">
                <div className="grid grid-cols-2 gap-2 divide-x divide-zinc-900/60 leading-tight">
                  <div className="pr-1 text-center">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">PROJECTED HOUR SPEND</p>
                    <p className="text-xl font-bold text-white font-mono mt-1">${fatigueCalcResults.spend}</p>
                  </div>
                  <div className="pl-1 text-center">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">FATIGUE INDEX</p>
                    <p className="text-xl font-bold text-indigo-400 font-mono mt-1">{fatigueCalcResults.score}<span className="text-xs text-zinc-500 font-normal">/100</span></p>
                  </div>
                </div>

                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      fatigueCalcResults.healthStatus === 'warning'
                        ? 'bg-red-500 animate-pulse'
                        : fatigueCalcResults.healthStatus === 'at_risk'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${fatigueCalcResults.score}%` }}
                  />
                </div>

                <p className="text-[10.5px] text-zinc-400 leading-normal font-semibold text-left">
                  {fatigueCalcResults.advice}
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* FEEDBACK ASSESSMENT DIALOG MODAL */}
      <AnimatePresence>
        {activeFeedbackMeetingId && (
          <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center z-50 p-4 leading-snug font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121215] border border-zinc-900 p-6 rounded-2xl w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setActiveFeedbackMeetingId(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-amber-400 mb-4">
                <MessageSquare className="w-4.5 h-4.5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Meeting Productivity Feedback</h3>
              </div>

              <div className="mb-4">
                <p className="text-xs font-bold text-white">
                  {meetings.find((m) => m.id === activeFeedbackMeetingId)?.name}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Your review remains entirely confidential. Helps optimize organizational workflows.</p>
              </div>

              <div className="space-y-4">
                {/* 1. Rating */}
                <div>
                  <label className="text-[10px] font-bold tracking-wider text-zinc-550 uppercase block mb-1">Productivity Score (1 - 5 stars):</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSelectedRating(val)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                          selectedRating === val
                            ? 'bg-amber-500 text-zinc-950 font-black'
                            : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        {val}★
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Rapid Tags Selector */}
                <div>
                  <label className="text-[10px] font-bold tracking-wider text-zinc-550 uppercase block mb-1.5">Rapid Feedback Tags:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Could be an email! 📨',
                      'Highly productive 🚀',
                      'No clear agenda 📝',
                      'Too many attendees 👥',
                      'Excellent focus & wrap-up ⭐',
                      'Lengthy introductions ⏳',
                      'Wrong target topic 🎯'
                    ].map((tag) => {
                      const selected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleFeedbackTag(tag)}
                          className={`text-[10px] font-semibold py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                            selected
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                              : 'bg-zinc-950 border-zinc-900 text-zinc-550 hover:border-zinc-800'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Text comment */}
                <div>
                  <label className="text-[10px] font-bold tracking-wider text-zinc-550 uppercase block mb-1">Confidential Notes / Suggestions:</label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#0a0a0c] border border-zinc-900 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 placeholder:text-zinc-700"
                    placeholder="e.g. Reduce default duration to 30 minutes, restrict attendees to active speakers..."
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2.5 justify-end mt-4">
                  <button
                    onClick={() => setActiveFeedbackMeetingId(null)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold rounded-lg text-xs cursor-pointer border-none"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleSaveFeedback}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-lg text-xs cursor-pointer border-none transition-all active:scale-95 shadow-lg shadow-amber-500/10"
                  >
                    Submit Confidential Review
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Simple placeholder close-modal icon
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
