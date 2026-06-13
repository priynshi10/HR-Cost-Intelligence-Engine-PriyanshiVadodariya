/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, UserPlus, Trash, Sparkles, Check, Info, Briefcase, Plus } from 'lucide-react';
import { Meeting, Project, Participant } from '../types';
import { SIMULATED_PERSONAS } from '../data';

interface MeetingFormModalProps {
  meeting?: Meeting; // If provided, we are editing. If undefined, we are creating.
  projects: Project[];
  onSave: (meeting: Meeting) => void;
  onClose: () => void;
}

export default function MeetingFormModal({
  meeting,
  projects,
  onSave,
  onClose
}: MeetingFormModalProps) {
  const isEditing = !!meeting;

  // Local form states
  const [name, setName] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
  
  // Custom participant inputs
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState('Engineer');
  const [customDept, setCustomDept] = useState('Engineering');

  // Integration & Dispatch States
  const [syncToCalendar, setSyncToCalendar] = useState(true);
  const [notifyAttendees, setNotifyAttendees] = useState(true);

  // Load initial value
  useEffect(() => {
    if (meeting) {
      setName(meeting.name);
      // Format dateTime for datetime-local input (YYYY-MM-DDTHH:MM)
      try {
        const d = new Date(meeting.dateTime);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDateTime(formatted);
      } catch (err) {
        setDateTime(meeting.dateTime);
      }
      setDurationMinutes(meeting.durationMinutes);
      setSelectedProjectId(meeting.suggestedProjectId || 'unassigned');
      setSelectedParticipants(meeting.participants || []);
      setSyncToCalendar(meeting.syncToCalendar !== false);
      setNotifyAttendees(meeting.notifyAttendees !== false);
    } else {
      setName('');
      // Default to today + 1 hour, rounded to 30 mins
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setDateTime(formatted);
      setDurationMinutes(60);
      setSelectedProjectId(projects[0]?.id || 'unassigned');
      setSyncToCalendar(true);
      setNotifyAttendees(true);
      // Default with at least Alex Chen to make it feel populated
      const defaultPerson = SIMULATED_PERSONAS[0];
      if (defaultPerson) {
        setSelectedParticipants([{
          id: defaultPerson.id,
          name: defaultPerson.name,
          initials: defaultPerson.name.split(' ').map(n => n[0]).join(''),
          department: 'HR & People Operations',
          role: defaultPerson.role,
          email: defaultPerson.email
        }]);
      } else {
        setSelectedParticipants([]);
      }
    }
  }, [meeting, projects]);

  // Handle preset persona toggle
  const handleTogglePersona = (persona: typeof SIMULATED_PERSONAS[0]) => {
    const exists = selectedParticipants.some(p => p.email === persona.email || p.id === persona.id);
    if (exists) {
      setSelectedParticipants(prev => prev.filter(p => p.id !== persona.id && p.email !== persona.email));
    } else {
      setSelectedParticipants(prev => [
        ...prev,
        {
          id: persona.id,
          name: persona.name,
          initials: persona.name.split(' ').map(n => n[0]).join(''),
          department: persona.role.includes('HR') ? 'HR & People Operations' : 'Engineering',
          role: persona.role,
          email: persona.email
        }
      ]);
    }
  };

  // Add custom participant
  const handleAddCustomParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customEmail) return;

    const initials = customName
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newPart: Participant = {
      id: `custom-part-${Date.now()}`,
      name: customName,
      initials: initials || 'G',
      department: customDept,
      role: customRole,
      email: customEmail
    };

    setSelectedParticipants(prev => [...prev, newPart]);
    setCustomName('');
    setCustomEmail('');
  };

  // Remove participant
  const handleRemoveParticipant = (id: string) => {
    setSelectedParticipants(prev => prev.filter(p => p.id !== id));
  };

  // Live budget cost estimate calculator based on participant headcount & hourly rate averages
  const liveCostEstimate = useMemo(() => {
    let rate = 120; // default average blended rate
    const currentProj = projects.find(p => p.id === selectedProjectId);
    if (currentProj) {
      rate = currentProj.blendedHourlyRate;
    }
    const totalHours = durationMinutes / 60;
    const size = selectedParticipants.length || 1;
    return Math.round(size * rate * totalHours);
  }, [durationMinutes, selectedProjectId, selectedParticipants, projects]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const currentProj = projects.find(p => p.id === selectedProjectId);

    const finalMeeting: Meeting = {
      id: meeting?.id || `meet-custom-${Date.now()}`,
      name: name.trim(),
      durationMinutes: Number(durationMinutes),
      dateTime: dateTime,
      suggestedProjectId: selectedProjectId,
      suggestedProjectName: currentProj ? currentProj.name : 'Unassigned Cost',
      participants: selectedParticipants,
      departments: Array.from(new Set(selectedParticipants.map(p => p.department))),
      // Tag it as edited/curated so downstream UI highlights it
      confidence: 100, // 100% confidence because explicitly customized by admin
      costEstimate: liveCostEstimate,
      status: meeting?.status || 'approved', // default to approved for manual creation, keep status on edit
      organizerName: meeting?.organizerName || 'HR Console Admin',
      organizerEmail: meeting?.organizerEmail || 'admin@workpulse.ai',
      description: meeting?.description || 'Curated sandbox alignment block scheduled via Administration cockpit',
      sourceCalendar: meeting?.sourceCalendar || 'google',
      syncToCalendar: syncToCalendar,
      notifyAttendees: notifyAttendees
    };

    onSave(finalMeeting);
  };

  return (
    <div id="meeting-modal-overlay" className="fixed inset-0 bg-[#060608]/85 backdrop-blur-md flex items-center justify-center z-50 p-4 leading-snug font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0e0e11] border border-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]"
      >
        {/* Glow visual decoration */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-900 bg-[#131315]/50 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-400">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-widest uppercase">
                {isEditing ? 'Modify Synced Calendar Block' : 'Schedule Custom Alignment Block'}
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">
                {isEditing ? 'Updates instantly sync to enrolled employee views' : 'Direct manual injection of budget-assigned corporate events'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-900/60"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Main interactive split columns */}
        <form onSubmit={handleFormSubmit} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-y-auto">
          
          {/* LEFT SUB-COLUMN: Primary Form inputs (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Title / Subject */}
            <div>
              <label className="text-[10px] font-bold tracking-wider text-zinc-550 uppercase block mb-1">Meeting Name / Subject:</label>
              <input
                type="text"
                required
                placeholder="e.g. Platform Architecture Sync"
                className="w-full bg-[#070709] border border-zinc-900 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white placeholder:text-zinc-700 outline-none focus:ring-1 focus:ring-indigo-500/20 font-semibold"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Time & Duration grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold tracking-wider text-zinc-550 uppercase block mb-1">Date & Time:</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    required
                    className="w-full bg-[#070709] border border-zinc-900 focus:border-indigo-500 text-xs text-white rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500/20 font-mono"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-wider text-zinc-550 uppercase block mb-1">Duration minutes:</label>
                <select
                  className="w-full bg-[#070709] border border-zinc-900 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 font-bold"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes / 1 Hour</option>
                  <option value="90">90 Minutes</option>
                  <option value="120">120 Minutes / 2 Hours</option>
                  <option value="180">180 Minutes / 3 Hours</option>
                </select>
              </div>
            </div>

            {/* Project / Client attribution match */}
            <div>
              <label className="text-[10px] font-bold tracking-wider text-zinc-550 uppercase block mb-1">Financial Budget Code Assignment:</label>
              <select
                className="w-full bg-[#070709] border border-zinc-900 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 font-bold"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="unassigned">Unassigned Operations (Waste Center)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code}) — avg ${p.blendedHourlyRate}/hr rate
                  </option>
                ))}
              </select>
              <p className="text-[9.5px] text-zinc-500 mt-1 leading-snug">
                This meeting and its enrolled attendee participant load will debit this client category's budget cap automatically.
              </p>
            </div>

            {/* Calendar Integration Controls */}
            <div className="p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-3">
              <label className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase block font-mono">
                Outbound Synchronization Options
              </label>

              <div className="space-y-2.5 text-xs">
                {/* Toggle 1: Sync with Connected platforms */}
                <label className="flex items-start gap-2.5 cursor-pointer text-zinc-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-zinc-800 bg-[#070709] text-indigo-600 focus:ring-indigo-500/20"
                    checked={syncToCalendar}
                    onChange={(e) => setSyncToCalendar(e.target.checked)}
                  />
                  <div>
                    <span className="font-semibold block leading-tight">Write back & Sync with Google Calendar API</span>
                    <span className="text-[9.5px] text-zinc-500 block leading-normal">
                      Pushes this block to Google Calendar server-side to prevent duplicate indexing anomalies.
                    </span>
                  </div>
                </label>

                {/* Toggle 2: Notify attendees */}
                <label className="flex items-start gap-2.5 cursor-pointer text-zinc-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-zinc-800 bg-[#070709] text-indigo-600 focus:ring-indigo-500/20"
                    checked={notifyAttendees}
                    onChange={(e) => setNotifyAttendees(e.target.checked)}
                  />
                  <div>
                    <span className="font-semibold block leading-tight">Notify attendees & patch their schedules</span>
                    <span className="text-[9.5px] text-zinc-500 block leading-normal">
                      Dispatches silent invite notifications to the calendar manifests of {selectedParticipants.length ? selectedParticipants.length : 'selected'} enrolled company employees.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Live Financial Burden feedback widgets */}
            <div className="p-4 bg-zinc-950/70 border border-indigo-500/10 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Live Cost Impact Simulator</span>
                <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded uppercase">MAPPED AT 100% CONFIDENCE</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-zinc-500 text-[10.5px]">Enrolled attendees:</p>
                  <p className="text-sm font-bold text-white mt-0.5">{selectedParticipants.length} Employees</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-550 text-[10px]">Projected Cost Burden:</p>
                  <p className="text-xl font-bold text-white font-mono">${liveCostEstimate.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400" style={{ width: `${Math.min((liveCostEstimate / 2000) * 100, 100)}%` }}></div>
              </div>
            </div>

          </div>

          {/* RIGHT SUB-COLUMN: Participants and Whome selection (5 cols) */}
          <div className="md:col-span-5 space-y-4 border-t md:border-t-0 md:border-l border-zinc-900/80 pt-4 md:pt-0 md:pl-5">
            
            {/* Roster list */}
            <div>
              <label className="text-[10px] font-bold tracking-wider text-zinc-550 uppercase block mb-1">Company Staff Enrolled (Whome):</label>
              <p className="text-[10px] text-zinc-500 mb-2 leading-tight">Toggle simulated corporate roles to build the attendee manifest:</p>
              
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {SIMULATED_PERSONAS.map((person) => {
                  const isChecked = selectedParticipants.some(p => p.email === person.email || p.id === person.id);
                  return (
                    <button
                      type="button"
                      key={person.id}
                      onClick={() => handleTogglePersona(person)}
                      className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-indigo-500/5 border-indigo-500/50 text-white' 
                          : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={person.avatarUrl} alt={person.name} className="w-5 h-5 rounded-full object-cover border border-zinc-900" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold truncate leading-none">{person.name}</p>
                          <p className="text-[9px] text-zinc-550 truncate mt-0.5 leading-none">{person.role.split('/')[0]}</p>
                        </div>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all ${
                        isChecked ? 'bg-indigo-600 text-white' : 'border border-zinc-800'
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Attendee Injector */}
            <div className="border-t border-zinc-900/60 pt-3">
              <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block mb-2">Or Enroll Custom Attendee:</label>
              
              <div className="space-y-2 bg-[#08080a] p-3 rounded-xl border border-zinc-900">
                <input
                  type="text"
                  placeholder="Employee Full Name"
                  className="w-full bg-[#0e0e11] border border-zinc-900 focus:border-zinc-800 rounded p-1.5 text-[10.5px] text-white"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                
                <input
                  type="email"
                  placeholder="email@workpulse.ai"
                  className="w-full bg-[#0e0e11] border border-zinc-900 focus:border-zinc-800 rounded p-1.5 text-[10.5px] text-zinc-300"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-1 px-0.5">
                  <select
                    className="bg-[#0e0e11] border border-zinc-900 rounded p-1 text-[10px] text-zinc-400"
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value)}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Management">Product Mgmt</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Sales & Growth">Sales & Ops</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddCustomParticipant}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold py-1.5 flex items-center justify-center gap-1 active:scale-95 transition-all outline-none cursor-pointer border-none"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Enroll Staff</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Manifest List Display badging */}
            <div className="border-t border-zinc-900/60 pt-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 mb-2 uppercase">
                <span>Roster Manifest ({selectedParticipants.length})</span>
                <span className="text-[8.5px] text-indigo-400">SYNC READY</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                {selectedParticipants.map(part => (
                  <div
                    key={part.id}
                    className="p-1 px-2 bg-zinc-900/80 rounded-lg text-[10px] text-zinc-300 flex items-center gap-1.5 border border-zinc-850"
                  >
                    <span className="w-4 h-4 bg-zinc-950 font-bold text-[8px] rounded-full flex items-center justify-center text-indigo-400 font-mono">
                      {part.initials}
                    </span>
                    <span className="truncate max-w-[80px] font-semibold">{part.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(part.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer border-none bg-transparent h-fit p-0"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                {selectedParticipants.length === 0 && (
                  <p className="text-[10px] text-zinc-600 italic">No attendees enrolled. Please choose or add.</p>
                )}
              </div>
            </div>

          </div>

        </form>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-zinc-900 bg-[#131115]/30 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-zinc-550 hover:text-zinc-400 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <p className="text-[9.5px] font-mono leading-none">RE-MAPPING LEDGER CALCULATION COMPLETE</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer border-none transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFormSubmit}
              type="submit"
              disabled={selectedParticipants.length === 0 || !name.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Sync Changes' : 'Inject Meeting'}</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
