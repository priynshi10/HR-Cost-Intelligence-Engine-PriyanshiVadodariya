/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, RefreshCw, Layers, CheckCircle2, Trash, Link2, HelpCircle, ShieldAlert, Sparkles, Filter, ChevronRight, X } from 'lucide-react';
import { Meeting, Project } from '../types';

interface AttributionViewProps {
  meetings: Meeting[];
  projects: Project[];
  onApproveMeeting: (id: string, projectId: string) => void;
  onDiscardMeeting: (id: string, reason: string) => void;
  onUpdateProjectMatch: (id: string, projectId: string) => void;
}

export default function AttributionView({
  meetings,
  projects,
  onApproveMeeting,
  onDiscardMeeting,
  onUpdateProjectMatch
}: AttributionViewProps) {
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'discarded'>('all');
  const [syncing, setSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Sync Status: Live Up-to-date');

  // Review waste state
  const [wasteReviewLimit, setWasteReviewLimit] = useState(false);
  const [discardModalId, setDiscardModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('General operational alignment alignment');

  const triggerSync = () => {
    setSyncing(true);
    setLastSyncText('Syncing new calendar activities...');
    setTimeout(() => {
      setSyncing(false);
      setLastSyncText('Last synced: Just now');
    }, 1500);
  };

  // Filter criteria
  const filteredMeetings = meetings.filter((m) => {
    const projMatch = filterProject === 'all' || m.suggestedProjectId === filterProject;
    const statMatch = filterStatus === 'all' || m.status === filterStatus;
    const wasteMatch = !wasteReviewLimit || m.confidence < 50;
    return projMatch && statMatch && wasteMatch;
  });

  const handleApprove = (mId: string, pId: string) => {
    onApproveMeeting(mId, pId);
  };

  const handleOpenDiscard = (mId: string) => {
    setDiscardModalId(mId);
  };

  const handleConfirmDiscard = () => {
    if (discardModalId) {
      onDiscardMeeting(discardModalId, rejectionReason);
      setDiscardModalId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Project Attribution Center</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Link corporate meeting slots and shared alignments to correct client or internal budget codes.</p>
        </div>

        {/* Integration Status widget */}
        <div className="flex items-center gap-4 p-3 bg-zinc-950/40 rounded-xl border border-zinc-900 text-xs">
          <div className="flex items-center gap-2 pr-4 border-r border-zinc-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <div>
              <p className="font-bold text-white">Google Calendar</p>
              <p className="text-[9px] text-zinc-500 uppercase">SYNCHRONIZED</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pr-4 border-r border-zinc-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <div>
              <p className="font-bold text-white">Outlook</p>
              <p className="text-[9px] text-zinc-500 uppercase">SYNCHRONIZED</p>
            </div>
          </div>
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-all select-none disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {lastSyncText && (
        <div className="p-2.5 bg-zinc-900/40 border border-zinc-900 rounded-lg text-xs flex justify-between items-center text-zinc-400">
          <span>{lastSyncText}</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">SANDBOX SIMULATED WORKSPACE</span>
        </div>
      )}

      {/* Waste Indicator & Heatmap Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Waste Widget */}
        <div className="md:col-span-4 p-5 bg-zinc-950/50 hover:bg-zinc-950/80 border border-zinc-900 hover:border-violet-500/25 rounded-2xl flex flex-col justify-between transition-all">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-400">
              <Layers className="w-5 h-5" />
            </div>
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">UNMAPPED MEETING HOURS</span>
            <h3 className="text-3xl font-black text-violet-400 mt-1">12.4h</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Unlinked discussions with weak match indicators this week. Consolidating duplicates would save up to $1,800/wk.
            </p>
          </div>
          <button
            onClick={() => setWasteReviewLimit(!wasteReviewLimit)}
            className={`mt-4 w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
              wasteReviewLimit
                ? 'bg-violet-700 text-white'
                : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-violet-300'
            }`}
          >
            {wasteReviewLimit ? 'Showing low-confidence files' : 'Highlight Low-Confidence Only'}
          </button>
        </div>

        {/* Dynamic Project Heatmap Mock */}
        <div className="md:col-span-8 p-5 bg-[#131315]/40 border border-zinc-900 rounded-2xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-sm font-bold text-white">Daily Cost Density Index</h4>
              <p className="text-[11px] text-zinc-500">Distribution of calendar spend across days of the week.</p>
            </div>
            <span className="text-[10px] text-zinc-600 font-mono">Q3 CALENDAR MAPPER</span>
          </div>

          <div className="grid grid-cols-7 gap-3 h-24 items-end text-center">
            {[
              { day: 'Mon', h: '60%', count: 8 },
              { day: 'Tue', h: '85%', count: 12 },
              { day: 'Wed', h: '40%', count: 4, label: 'Low Day' },
              { day: 'Thu', h: '75%', count: 10 },
              { day: 'Fri', h: '95%', count: 15 },
              { day: 'Sat', h: '5%', count: 0 },
              { day: 'Sun', h: '5%', count: 0 }
            ].map((d, index) => (
              <div key={index} className="flex flex-col gap-2 h-full justify-end">
                <div
                  className={`rounded-md transition-all duration-550 relative group ${
                    d.day === 'Wed' ? 'bg-indigo-500/80 hover:bg-indigo-400' : 'bg-zinc-900 hover:bg-zinc-800'
                  }`}
                  style={{ height: d.h }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-950 p-1.5 border border-zinc-800 rounded shadow-xl text-[9px] text-white z-20 whitespace-nowrap min-w-[70px]">
                    <span className="font-bold">{d.count} meetings</span>
                    <br />Cost: ${(d.count * 180).toFixed(0)}
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main Attribution Grid Table */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden">
        
        {/* Table Filters header */}
        <div className="p-4 border-b border-zinc-900 bg-[#131315]/40 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-300">Filter suggested codes:</span>
          </div>

          <div className="flex gap-3">
            <div>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-1.5 px-3 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Suggested Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-1.5 px-3 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All States</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="discarded">Discarded Waste</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile responsive scroll view */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-900/30 text-zinc-500 font-bold uppercase tracking-widest border-b border-zinc-900">
                <th className="px-6 py-4">Calendar Sync Title</th>
                <th className="px-6 py-4">Seniority / Guests</th>
                <th className="px-6 py-4">Total Minutes</th>
                <th className="px-6 py-4">AI Suggested Project Match</th>
                <th className="px-6 py-4 text-center">Confidence</th>
                <th className="px-6 py-4 text-right">Confirmation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredMeetings.length === 0 ? (
                <tr>
                  <td colspan="6" className="p-12 text-center text-zinc-500">
                    No verified attribution records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredMeetings.map((m) => {
                  const isPending = m.status === 'pending';
                  const isApproved = m.status === 'approved';
                  const isDiscarded = m.status === 'discarded';

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-[#131315]/40 transition-colors group ${
                        isDiscarded ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{m.name}</span>
                          <span className="text-[10px] text-zinc-500 mt-0.5">
                            {new Date(m.dateTime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                            {m.participants.slice(0, 3).map((p, pidx) => (
                              <div
                                key={pidx}
                                className="w-6 h-6 rounded-full border border-zinc-950 bg-zinc-800 text-[9px] font-bold flex items-center justify-center text-zinc-300"
                                title={`${p.name} - ${p.role} (${p.department})`}
                              >
                                {p.initials}
                              </div>
                            ))}
                            {m.participants.length > 3 && (
                              <div className="w-6 h-6 rounded-full border border-zinc-950 bg-[#131315] text-[9px] font-bold flex items-center justify-center text-indigo-400">
                                +{m.participants.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            {m.participants[0]?.department}
                            {m.participants.length > 1 ? ` & ${m.participants.length - 1} others` : ''}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-zinc-350">{m.durationMinutes} mins</span>
                        <p className="text-[10px] text-emerald-400 font-bold mt-0.5">${m.costEstimate}</p>
                      </td>

                      <td className="px-6 py-4">
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={m.suggestedProjectId}
                              onChange={(e) => onUpdateProjectMatch(m.id, e.target.value)}
                              className="bg-[#131315] border border-zinc-800 rounded py-1 px-2 text-xs text-indigo-300 outline-none focus:border-indigo-500"
                            >
                              <option value="unassigned">Unassigned Waste</option>
                              {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded inline-block text-[11px] font-semibold ${
                              isApproved
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-300 border border-red-500/20 shadow-neutral-700/10'
                            }`}
                          >
                            {m.suggestedProjectName}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-16 bg-zinc-900 h-1 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                m.confidence > 80 ? 'bg-emerald-400' : m.confidence > 50 ? 'bg-indigo-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${m.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-[9px] text-zinc-500 font-bold">{m.confidence}% matcher</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(m.id, m.suggestedProjectId)}
                              className="px-2.5 py-1 bg-indigo-500 text-[#09090b] hover:bg-indigo-400 rounded font-bold text-[10px] active:scale-95 transition-transform cursor-pointer"
                              title="Approve sync suggestions"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenDiscard(m.id)}
                              className="p-1 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 rounded transition-colors"
                              title="Exclude as unmapped waste"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-600 italic">
                            {isApproved ? 'Approved Link' : `Discarded: ${m.rejectionReason || 'Exempt'}`}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection/Discard Modal Overlay Dialog */}
      {discardModalId && (
        <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setDiscardModalId(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-3 mb-4 text-red-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">Exclude Attribution Record</h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Exclude this meeting from billable research and project hours. Set the audit reason:
            </p>

            <div className="space-y-4">
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs bg-[#09090b] border border-zinc-900 focus:border-red-500 rounded-lg p-2.5 text-white outline-none"
              />

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setDiscardModalId(null)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleConfirmDiscard}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold"
                >
                  Confirm Exclusion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
