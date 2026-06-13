/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, HelpCircle, Activity, Sparkles, SlidersHorizontal, ArrowUpRight, TrendingDown, BookOpen, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Project, SystemSettings } from '../types';

interface AnalyticsViewProps {
  projects: Project[];
  settings: SystemSettings;
}

export default function AnalyticsView({ projects, settings }: AnalyticsViewProps) {
  const [deptFilter, setDeptFilter] = useState('all');
  const [rangeFilter, setRangeFilter] = useState('30d');
  const [levelFilter, setLevelFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>('proj-1'); // Default expand first row

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const [hoveredNode, setHoveredNode] = useState<{ projName: string; month: string; spend: number; x: number; y: number } | null>(null);

  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const proj1 = projects[0] || { name: 'Platform R&D', historyMonthly: [], costToDate: 840000 };
  const proj2 = projects[1] || { name: 'Cloud Migration', historyMonthly: [], costToDate: 620000 };

  const proj1Data = months.map(m => {
    const found = proj1.historyMonthly?.find(h => h.month === m);
    return { month: m, spend: found ? found.spend : (proj1.costToDate / 6) };
  });

  const proj2Data = months.map(m => {
    const found = proj2.historyMonthly?.find(h => h.month === m);
    return { month: m, spend: found ? found.spend : (proj2.costToDate / 6) };
  });

  const maxVal = Math.max(...proj1Data.map(d => d.spend), ...proj2Data.map(d => d.spend)) * 1.15 || 100000;

  const width = 800;
  const height = 200;
  const left = 45;
  const right = 45;
  const top = 25;
  const bottom = 30;

  const chartW = width - left - right;
  const chartH = height - top - bottom;

  const proj1Points = proj1Data.map((d, index) => {
    const x = left + (index / (months.length - 1)) * chartW;
    const y = height - bottom - (d.spend / maxVal) * chartH;
    return { x, y, ...d };
  });

  const proj2Points = proj2Data.map((d, index) => {
    const x = left + (index / (months.length - 1)) * chartW;
    const y = height - bottom - (d.spend / maxVal) * chartH;
    return { x, y, ...d };
  });

  const path1 = proj1Points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const path2 = proj2Points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // Simulated Leaderboard records
  const leaderboard = [
    { team: 'Neon Core Engine', dept: 'Engineering', score: 9.2, status: 'stellar', color: 'text-teal-400' },
    { team: 'Platform R&D Apex', dept: 'Engineering', score: 8.4, status: 'efficient', color: 'text-indigo-400' },
    { team: 'Cloud Infrastructure Migration', dept: 'Engineering', score: 7.1, status: 'moderate', color: 'text-zinc-300' },
    { team: 'Strategic Sales Operations', dept: 'Sales & Growth', score: 5.6, status: 'review_needed', color: 'text-amber-400' },
    { team: 'Legacy Maintenance Syncs', dept: 'Engineering', score: 4.1, status: 'warning', color: 'text-red-400' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Workforce Cost Analytics</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Granular audits representing personnel time investment across strategic business verticals.</p>
      </div>

      {/* Advanced Filters Block */}
      <div className="p-4 bg-zinc-950/40 rounded-2xl border border-zinc-900 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
        
        {/* Filter 1: Department */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block">Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-[#131315] border border-zinc-900 rounded-lg p-2 text-zinc-300 focus:outline-none focus:border-indigo-500 text-xs"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product Management</option>
            <option value="Design">Design</option>
            <option value="Sales">Sales & Growth</option>
          </select>
        </div>

        {/* Filter 2: Time Range */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block">Time Frame:</span>
          <select
            value={rangeFilter}
            onChange={(e) => setRangeFilter(e.target.value)}
            className="w-full bg-[#131315] border border-zinc-900 rounded-lg p-2 text-zinc-300 focus:outline-none focus:border-indigo-500 text-xs"
          >
            <option value="30d">Last 30 Days</option>
            <option value="q3">Q3 Academic Quarter</option>
            <option value="ytd">Year to Date (YTD)</option>
          </select>
        </div>

        {/* Filter 3: Level Seniority */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block">Personnel seniority:</span>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full bg-[#131315] border border-zinc-900 rounded-lg p-2 text-zinc-300 focus:outline-none focus:border-indigo-500 text-xs"
          >
            <option value="all">All Seniority Tiers</option>
            <option value="l6">L6+ Directors & Staff</option>
            <option value="l4">L4-L5 Mid-Senior</option>
            <option value="l1">L1-L3 Junior Associates</option>
          </select>
        </div>

        {/* Filter 4: Refresh Status */}
        <div className="flex items-end">
          <button className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-2 transition-all">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Re-apply Custom Criteria
          </button>
        </div>

      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Curve visualization (Apollo vs Titan) */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl lg:col-span-8 flex flex-col justify-between relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-sm font-bold text-white">Project Cost Trajectory</h4>
              <p className="text-[11px] text-zinc-500">Trailing trajectory of weekly expenditure burn.</p>
            </div>
            
            <div className="flex gap-4 text-[10px] tracking-wider uppercase font-bold text-zinc-400 font-mono">
              <span className="text-[#6F4E37]">● {proj1.name}</span>
              <span className="text-[#8B6B4A]">-- {proj2.name}</span>
            </div>
          </div>

          <div className="relative w-full h-48 mt-2">
            {/* SVG lines */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 800 200">
              {/* Curve 1 */}
              <path
                d={path1}
                fill="none"
                stroke="#6F4E37"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              {/* Curve 2 */}
              <path
                d={path2}
                fill="none"
                stroke="#8B6B4A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="6,4"
                className="transition-all duration-300"
              />

              {/* Interaction triggers for Curve 1 */}
              {proj1Points.map((p, idx) => (
                <g key={`p1-${idx}`} className="cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="14"
                    fill="transparent"
                    onMouseEnter={() => setHoveredNode({ projName: proj1.name, month: p.month, spend: p.spend, x: p.x, y: p.y })}
                    onMouseLeave={() => setHoveredNode(null)}
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredNode?.projName === proj1.name && hoveredNode?.month === p.month ? "5.5" : "3.5"}
                    fill="#6F4E37"
                    stroke="#FAF8F5"
                    strokeWidth="1.5"
                    className="transition-all duration-150"
                  />
                </g>
              ))}

              {/* Interaction triggers for Curve 2 */}
              {proj2Points.map((p, idx) => (
                <g key={`p2-${idx}`} className="cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="14"
                    fill="transparent"
                    onMouseEnter={() => setHoveredNode({ projName: proj2.name, month: p.month, spend: p.spend, x: p.x, y: p.y })}
                    onMouseLeave={() => setHoveredNode(null)}
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredNode?.projName === proj2.name && hoveredNode?.month === p.month ? "5.5" : "3.5"}
                    fill="#8B6B4A"
                    stroke="#FAF8F5"
                    strokeWidth="1.5"
                    className="transition-all duration-150"
                  />
                </g>
              ))}
            </svg>

            {/* Float Tooltip */}
            {hoveredNode && (
              <div 
                className="absolute p-2 bg-white border border-[#E8DDD0] rounded-lg shadow-lg text-left pointer-events-none z-10 animate-fade-in text-[11px]"
                style={{
                  left: `${(hoveredNode.x / width) * 100}%`,
                  top: `${Math.max(10, hoveredNode.y - 75)}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <p className="font-extrabold text-[#1F1A17]">{hoveredNode.projName}</p>
                <p className="text-zinc-500 font-medium">Month: <span className="text-[#1F1A17] font-semibold">{hoveredNode.month}</span></p>
                <p className="text-[#6F4E37] font-bold">Spend: ${(hoveredNode.spend / 1000).toFixed(0)}k</p>
              </div>
            )}
          </div>

          <div className="flex justify-between text-[10px] text-zinc-550 uppercase font-bold mt-4 font-mono px-1">
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>

        {/* Leadership ROI table */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl lg:col-span-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Department ROI Leaderboard</h4>
            
            <div className="space-y-2.5">
              {leaderboard.map((item, index) => (
                <div key={index} className="p-2.5 bg-zinc-950 border border-zinc-900/60 rounded-xl flex items-center justify-between text-xs hover:border-zinc-800 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-zinc-650">#{index+1}</span>
                    <div>
                      <p className="font-bold text-zinc-200 truncate max-w-[130px]">{item.team}</p>
                      <p className="text-[10px] text-zinc-500">{item.dept}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black font-mono text-sm leading-none ${item.color}`}>{item.score}</p>
                    <span className="text-[8px] tracking-wider uppercase text-zinc-500 font-bold">ROI SCORE</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button className="mt-4 text-xs font-bold text-center text-indigo-400 hover:text-indigo-300 w-full">
            Review Leaderboard Methodology
          </button>
        </div>

      </div>

      {/* Expandable Project Breakdown table */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden leading-snug">
        <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-[#131315]/20">
          <div>
            <h4 className="text-sm font-bold text-white">Granular Project Breakdown</h4>
            <p className="text-[11px] text-zinc-500">Drill down into targeted epic structures to reveal true blended rates and automated cost optimizations.</p>
          </div>
          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-bold">
            Interactive Drilldown Active
          </span>
        </div>

        <div className="divide-y divide-zinc-900 text-xs">
          {projects.map((proj) => {
            const isExpanded = expandedId === proj.id;
            const isAtRisk = proj.status === 'at_risk';
            const isCritical = proj.status === 'critical';

            return (
              <div key={proj.id} className="transition-all">
                {/* Header Row */}
                <div
                  onClick={() => handleToggleExpand(proj.id)}
                  className="p-4 flex items-center justify-between hover:bg-[#131315]/40 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-zinc-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm">{proj.name}</span>
                      <span className="text-[10px] text-zinc-550 block font-mono">CODE: {proj.code} • Owner: {proj.owner}</span>
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="flex items-center gap-8 text-right font-medium">
                    <div className="hidden sm:block">
                      <p className="text-zinc-500 uppercase text-[9px] font-bold">FTES</p>
                      <p className="text-zinc-300 font-bold">{proj.fteCount} Active</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 uppercase text-[9px] font-bold">Cost committed</p>
                      <p className="text-zinc-200 font-black">${(proj.costToDate / 1000).toFixed(0)}k</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 uppercase text-[9px] font-bold">Attribution state</p>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase inline-block ${
                          isAtRisk
                            ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                            : isCritical
                            ? 'bg-red-400/10 text-red-300 border border-red-400/20'
                            : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                        }`}
                      >
                        {proj.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Accordion Panel */}
                {isExpanded && (
                  <div className="p-5 bg-zinc-950/70 border-t border-zinc-900/60 grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Panel 1: Department allocations progress blocks */}
                    <div className="p-4 bg-[#131315] rounded-xl border border-zinc-900">
                      <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-3">Department Personnel Mix</p>
                      <div className="space-y-3">
                        {proj.departmentAllocations.map((alloc, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-zinc-350">{alloc.department}</span>
                              <span className="font-bold text-white font-mono">{alloc.percentage}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${alloc.percentage}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Panel 2: Rates & Burn stats */}
                    <div className="p-4 bg-[#131315] rounded-xl border border-zinc-900 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-2">Hourly Cost Analysis</p>
                        <div className="space-y-3 mt-1.5">
                          <div className="flex justify-between text-xs leading-none">
                            <span className="text-zinc-500">Blended Rate:</span>
                            <span className="font-black text-white font-mono">${proj.blendedHourlyRate}/hr</span>
                          </div>
                          <div className="flex justify-between text-xs leading-none">
                            <span className="text-zinc-500">Full Budget Limit:</span>
                            <span className="font-bold text-zinc-305 font-mono">${(proj.budget / 1000).toFixed(0)}k</span>
                          </div>
                          <div className="flex justify-between text-xs leading-none">
                            <span className="text-zinc-500">Burn to budget index:</span>
                            <span className="font-bold text-indigo-400 font-mono">{((proj.costToDate / proj.budget) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500 leading-none">
                        <span>Average Monthly Burn:</span>
                        <span className="font-bold text-emerald-400">+ $120k/mo</span>
                      </div>
                    </div>

                    {/* Panel 3: AI Advisor advice box */}
                    <div className="p-4 bg-indigo-505/5 border border-indigo-500/15 rounded-xl bg-indigo-950/5 hover:border-indigo-500/25 transition-all">
                      <div className="flex items-center gap-1.5 text-indigo-400 mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">AI Optimizer Advice</span>
                      </div>
                      
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {isCritical ? (
                          "Legacy Overhead warning: 90% of meetings involve repetitive Q&A sessions. Recommending consolidation of daily alignment syncs into a 15-minute weekly retro. Expected monthly workforce savings: $15,000."
                        ) : isAtRisk ? (
                          "Trajectory Risk: Cloud Migration is exceeding baseline due to high-salaried VP presence on weekly PMO standups. Removing non-essential observers will adjust burn by 14%."
                        ) : (
                          "Platform research mapping looks healthy. The seniority tier matches industry standards. Continue current weekly sync setup; no critical action required."
                        )}
                      </p>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
