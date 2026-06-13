/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, AlertTriangle, CheckCircle2, RefreshCw, Sparkles, Server, Sliders, Play, X, UserCheck } from 'lucide-react';
import { Anomaly } from '../types';

interface AnomalyViewProps {
  anomalies: Anomaly[];
  onResolveAnomaly: (anomalyId: string, status: 'reviewed' | 'resolved') => void;
  selectedDefaultAnomaly: Anomaly | null;
  onClearSelectedDefaultAnomaly: () => void;
}

export default function AnomalyView({
  anomalies,
  onResolveAnomaly,
  selectedDefaultAnomaly,
  onClearSelectedDefaultAnomaly
}: AnomalyViewProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'triggered' | 'resolved' | 'all'>('triggered');
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);

  // Auto focus selected default anomaly if passed
  React.useEffect(() => {
    if (selectedDefaultAnomaly) {
      setSelectedAnomalyId(selectedDefaultAnomaly.id);
    }
  }, [selectedDefaultAnomaly]);

  const stats = {
    critical: anomalies.filter((a) => a.severity === 'critical' && a.status === 'triggered').length,
    high: anomalies.filter((a) => a.severity === 'high' && a.status === 'triggered').length,
    medium: anomalies.filter((a) => a.severity === 'medium' && a.status === 'triggered').length,
    totalActive: anomalies.filter((a) => a.status === 'triggered').length
  };

  const filtered = anomalies.filter((a) => {
    const sevMatch = filterSeverity === 'all' || a.severity === filterSeverity;
    const tabMatch =
      activeTab === 'all' ||
      (activeTab === 'triggered' && a.status === 'triggered') ||
      (activeTab === 'resolved' && (a.status === 'resolved' || a.status === 'reviewed'));
    return sevMatch && tabMatch;
  });

  const handleResolve = (id: string, actionType: 'reviewed' | 'resolved') => {
    onResolveAnomaly(id, actionType);
    setSelectedAnomalyId(null);
    onClearSelectedDefaultAnomaly();
  };

  const focusedAnomaly = anomalies.find((a) => a.id === selectedAnomalyId);

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Security & Anomaly Center</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Automated detection of resource leakage, meeting overruns, and unmapped workforce hours.</p>
        </div>

        {/* Severity counts row */}
        <div className="flex gap-2 text-xs">
          <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-bold">
            {stats.critical} Critical Alerts
          </div>
          <div className="px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-300 rounded-lg font-bold">
            {stats.high} High Severity
          </div>
          <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg font-bold">
            {stats.totalActive} Total Active Threats
          </div>
        </div>
      </div>

      {/* Grid: Left is warning log list, Right is deep resolution workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Warning Log list */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Header tabs */}
          <div className="bg-zinc-950/40 p-4 border border-zinc-900 rounded-2xl flex justify-between items-center flex-wrap gap-4 text-xs font-semibold">
            <div className="flex gap-2">
              {(['triggered', 'resolved', 'all'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1.5 rounded-lg transition-transform active:scale-95 cursor-pointer uppercase tracking-wider ${
                    activeTab === t ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {t === 'triggered' ? 'Active Alerts' : t === 'resolved' ? 'Archive resolved' : 'All audits'}
                </button>
              ))}
            </div>

            <div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-zinc-90 w-36 bg-zinc-900 border border-zinc-850 rounded-lg px-2 py-1 text-zinc-300 outline-none focus:border-indigo-500 text-xs"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical Only</option>
                <option value="high">High Severity</option>
                <option value="medium">Medium Severity</option>
                <option value="low">Low Severity</option>
              </select>
            </div>
          </div>

          {/* Log index list */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 bg-zinc-950/20 border border-zinc-900 rounded-2xl">
                No verified cost anomalies or threshold violations discovered.
              </div>
            ) : (
              filtered.map((anom) => {
                const isFocused = selectedAnomalyId === anom.id;
                const isCrit = anom.severity === 'critical';
                const isHigh = anom.severity === 'high';
                const isMedium = anom.severity === 'medium';

                return (
                  <div
                    key={anom.id}
                    onClick={() => setSelectedAnomalyId(anom.id)}
                    className={`p-4 bg-zinc-950/40 border rounded-2xl transition-all cursor-pointer flex justify-between items-start ${
                      isFocused
                        ? 'border-indigo-500 ring-1 ring-indigo-500/20 bg-indigo-950/5'
                        : 'border-zinc-900 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex gap-3.5 items-start min-w-0 pr-4">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isCrit
                            ? 'bg-red-500/10 text-red-400'
                            : isHigh
                            ? 'bg-amber-400/10 text-amber-300'
                            : isMedium
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-emerald-500/10 text-emerald-300'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 leading-tight">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider ${
                            isCrit ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-zinc-500'
                          }`}
                        >
                          {anom.severity} PRIORITY • {anom.department}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate mt-0.5">{anom.title}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-1 leading-relaxed">{anom.description}</p>
                      </div>
                    </div>

                    <div className="text-right leading-none shrink-0 font-medium font-mono text-zinc-400">
                      <p className="text-sm font-black text-red-400/90 leading-none">+${(anom.costDelta / 1000).toFixed(1)}k</p>
                      <span className="text-[9px] text-zinc-550 block mt-1.5 uppercase tracking-wider font-bold">SAVINGS: ${(anom.potentialMonthlySavings/1000).toFixed(1)}k/mo</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Deep resolution workspace panel */}
        <div className="lg:col-span-5">
          {focusedAnomaly ? (
            <div className="bg-zinc-950/40 border border-indigo-500/10 bg-indigo-950/5 p-5 rounded-2xl space-y-5 relative">
              
              <button
                onClick={() => setSelectedAnomalyId(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest">AI Audit Deep-Dive</h3>
              </div>

              <div>
                <span className="text-[9px] text-zinc-550 uppercase tracking-widest block font-bold">Threat Target</span>
                <h4 className="text-base font-bold text-white mt-0.5">{focusedAnomaly.title}</h4>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{focusedAnomaly.description}</p>
              </div>

              {/* Specs box */}
              <div className="p-3.5 bg-[#131315]/80 rounded-xl border border-zinc-900 text-xs space-y-2.5">
                <div className="flex justify-between leading-none">
                  <span className="text-zinc-500">Department:</span>
                  <span className="font-bold text-zinc-300">{focusedAnomaly.department}</span>
                </div>
                <div className="flex justify-between leading-none">
                  <span className="text-zinc-500">Excess Weekly Cost:</span>
                  <span className="font-bold text-red-400/90 font-mono">+${focusedAnomaly.costDelta.toLocaleString()}</span>
                </div>
                <div className="flex justify-between leading-none">
                  <span className="text-zinc-500">Trigger Date:</span>
                  <span className="text-zinc-400 font-mono">{new Date(focusedAnomaly.triggerDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between leading-none">
                  <span className="text-zinc-500">Matched Epic:</span>
                  <span className="text-indigo-400 font-semibold">{focusedAnomaly.associatedProjectName || 'Uncoded'}</span>
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="p-4 bg-indigo-950/10 border border-indigo-500/20 rounded-xl">
                <div className="flex items-center gap-1.5 text-indigo-300 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Recommendation Protocol</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {focusedAnomaly.recommendationAction}
                </p>
              </div>

              {/* Action buttons */}
              {focusedAnomaly.status === 'triggered' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(focusedAnomaly.id, 'reviewed')}
                    className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-c rounded-xl text-xs font-bold text-zinc-300 active:scale-95 transition-all cursor-pointer"
                  >
                    Acknowledge Alert
                  </button>
                  <button
                    onClick={() => handleResolve(focusedAnomaly.id, 'resolved')}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black active:scale-95 transition-all shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Apply AI Resolution
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-4 h-4" /> This alert is successfully flagged as resolved!
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center h-64">
              <ShieldAlert className="w-8 h-8 text-zinc-700 mb-3" />
              <p className="text-xs">Select an anomaly event to trigger full AI resolution scripts and cost recovery workflows.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
