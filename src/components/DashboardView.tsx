/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, AlertTriangle, Sparkles, Clock, Users, ArrowRight, DollarSign, Calendar, ChevronRight, Play } from 'lucide-react';
import { Meeting, Project, Anomaly } from '../types';

interface DashboardViewProps {
  projects: Project[];
  meetings: Meeting[];
  anomalies: Anomaly[];
  onNavigate: (tab: string) => void;
  onOpenResolveAnomaly: (anomaly: Anomaly) => void;
  onOpenStrategyPlanner: () => void;
}

export default function DashboardView({
  projects,
  meetings,
  anomalies,
  onNavigate,
  onOpenResolveAnomaly,
  onOpenStrategyPlanner
}: DashboardViewProps) {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute total dynamic stats
  const totalSpend = projects.reduce((sum, p) => sum + p.costToDate, 0);
  const totalFtes = projects.reduce((sum, p) => sum + p.fteCount, 0);
  const totalWeeklyBurn = meetings
    .filter((m) => m.status === 'approved' || m.status === 'pending')
    .reduce((sum, m) => sum + m.costEstimate, 0);

  const pendingCount = meetings.filter((m) => m.status === 'pending').length;
  const activeAnomalyCount = anomalies.filter((a) => a.status === 'triggered').length;

  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Aggregate spend/budget dynamically across all projects:
  const monthlyData = months.map((month) => {
    let spend = 0;
    let budget = 0;
    projects.forEach((proj) => {
      const hist = proj.historyMonthly?.find((h) => h.month === month);
      if (hist) {
        spend += hist.spend;
        budget += hist.budget;
      } else {
        spend += proj.costToDate / 6;
        budget += proj.budget / 6;
      }
    });
    return { month, spend, budget };
  });

  const maxVal = Math.max(...monthlyData.map((d) => Math.max(d.spend, d.budget))) * 1.15 || 100000;

  const width = 1000;
  const height = 320;
  const left = 55;
  const right = 55;
  const top = 30;
  const bottom = 40;

  const chartW = width - left - right;
  const chartH = height - top - bottom;

  const points = monthlyData.map((d, index) => {
    const x = left + (index / (months.length - 1)) * chartW;
    const ySpend = height - bottom - (d.spend / maxVal) * chartH;
    const yBudget = height - bottom - (d.budget / maxVal) * chartH;
    return { x, ySpend, yBudget, ...d };
  });

  const actualSpendPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.ySpend.toFixed(1)}`).join(' ');
  const actualSpendArea = `${actualSpendPath} L ${points[points.length - 1].x.toFixed(1)} ${(height - bottom).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - bottom).toFixed(1)} Z`;
  const budgetPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yBudget.toFixed(1)}`).join(' ');

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title Grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Executive Cockpit</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Real-time expenditure tracking across synchronized enterprise calendar activity.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#131315] p-1 rounded-lg border border-zinc-900">
          {(['daily', 'weekly', 'monthly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all uppercase tracking-wider ${
                timeframe === t
                  ? 'bg-zinc-800 text-indigo-400 shadow-sm'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Spend */}
        <div className="bg-zinc-950/40 p-5 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between h-40">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-[10px] font-bold tracking-wider uppercase">SYNCHRONIZED HR SPEND</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">
              ${(totalSpend / 1000000).toFixed(1)}M
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
              +4.2% <span className="text-zinc-500 font-light">vs. last month</span>
            </span>
          </div>
          <div className="w-full h-8 mt-2 opacity-60">
            <svg className="w-full h-full stroke-indigo-400 stroke-2 fill-none" viewBox="0 0 100 20">
              <path d="M0,15 L10,12 L20,18 L30,10 L40,14 L50,8 L60,11 L70,5 L80,9 L90,3 L100,6"></path>
            </svg>
          </div>
        </div>

        {/* Metric 2: Meeting Hours */}
        <div className="bg-zinc-950/40 p-5 rounded-xl border border-zinc-900/80 hover:border-zinc-800 transition-all flex flex-col justify-between h-40">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-[10px] font-bold tracking-wider uppercase">WEEKLY ALIGNMENT TIME</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">12.5k<span className="text-xs text-zinc-500 font-normal">hrs</span></h3>
            <span className="text-[10px] text-red-400 font-bold flex items-center gap-0.5 mt-0.5">
              +12% <span className="text-zinc-500 font-light">meeting bulk creep</span>
            </span>
          </div>
          <div className="w-full h-8 mt-2 opacity-60">
            <svg className="w-full h-full stroke-violet-400 stroke-2 fill-none" viewBox="0 0 100 20">
              <path d="M0,5 L10,8 L20,3 L30,12 L40,9 L50,15 L60,13 L70,18 L80,14 L90,16 L100,9"></path>
            </svg>
          </div>
        </div>

        {/* Metric 3: Active Headcount allocated */}
        <div className="bg-zinc-950/40 p-5 rounded-xl border border-zinc-900/80 hover:border-zinc-800 transition-all flex flex-col justify-between h-40">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-[10px] font-bold tracking-wider uppercase">TRACKED FTE FORCE</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">{totalFtes}</h3>
            <span className="text-[10px] text-teal-400 font-bold flex items-center gap-0.5 mt-0.5">
              96.8% <span className="text-zinc-500 font-light">allocation accuracy</span>
            </span>
          </div>
          <div className="w-full h-8 mt-2 opacity-60">
            <svg className="w-full h-full stroke-teal-400 stroke-2 fill-none" viewBox="0 0 100 20">
              <path d="M0,10 L10,10 L20,10 L30,11 L40,10 L50,10 L60,9 L70,10 L80,10 L90,10 L100,10"></path>
            </svg>
          </div>
        </div>

        {/* Metric 4: Potential Savings */}
        <div className="p-5 rounded-xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/55 transition-all flex flex-col justify-between h-40">
          <div className="flex justify-between items-start text-indigo-400">
            <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-300">POTENTIAL SAVINGS</span>
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">$420k</h3>
            <span className="text-[10px] text-indigo-300 font-semibold mt-0.5 block flex items-center gap-1">
              Active Optimization Possible <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-full h-8 mt-2 opacity-60">
            <svg className="w-full h-full stroke-indigo-300 stroke-2 fill-none" viewBox="0 0 100 20">
              <path d="M0,18 L20,15 L40,10 L60,12 L80,5 L100,2"></path>
            </svg>
          </div>
        </div>

      </div>

      {/* Main Core Layout Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Column Left: Visual Cost Trends Graph */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl lg:col-span-8 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-base font-bold text-white">Cost Trends vs. Budget Target</h4>
              <p className="text-[11px] text-zinc-500">Comparison of actual allocated calendar spend vs. projected Q3 target goal.</p>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> Actual Spend
              </span>
              <span className="flex items-center gap-1.5 text-zinc-550">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span> Budget Goal
              </span>
            </div>
          </div>

          <div className="relative w-full h-64 mt-4">
            {/* Grid Line Accents */}
            <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none opacity-10">
              <div className="w-full h-px bg-zinc-400"></div>
              <div className="w-full h-px bg-zinc-400"></div>
              <div className="w-full h-px bg-zinc-400"></div>
              <div className="w-full h-px bg-zinc-400"></div>
              <div className="w-full h-px bg-zinc-400"></div>
            </div>

            {/* SVG curves */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 1000 320">
              {/* Gradients */}
              <defs>
                <linearGradient id="curve-area" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#6F4E37', stopOpacity: 0.25 }} />
                  <stop offset="100%" style={{ stopColor: '#6F4E37', stopOpacity: 0 }} />
                </linearGradient>
              </defs>

              {/* Budget curve (dashed) */}
              <path
                d={budgetPath}
                fill="none"
                stroke="#8D8176"
                strokeDasharray="6,4"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />

              {/* Actual Spend Area */}
              <path
                d={actualSpendArea}
                fill="url(#curve-area)"
                className="transition-all duration-300"
              />

              {/* Actual Spend Line */}
              <path
                d={actualSpendPath}
                fill="none"
                stroke="#6F4E37"
                strokeWidth="4"
                strokeLinecap="round"
                className="transition-all duration-300"
              />

              {/* Dynamic highlights & triggers */}
              {points.map((p, idx) => (
                <g key={idx} className="cursor-pointer">
                  {/* Invisible larger hover zone */}
                  <circle
                    cx={p.x}
                    cy={p.ySpend}
                    r="16"
                    fill="transparent"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                  {/* Outer glow during hover */}
                  {hoveredIdx === idx && (
                    <circle
                      cx={p.x}
                      cy={p.ySpend}
                      r="10"
                      fill="#6F4E37"
                      opacity="0.15"
                    />
                  )}
                  {/* Main Point circle */}
                  <circle
                    cx={p.x}
                    cy={p.ySpend}
                    r={hoveredIdx === idx ? "6.5" : "4.5"}
                    fill={hoveredIdx === idx ? "#6F4E37" : "#8B6B4A"}
                    stroke="#FAF8F5"
                    strokeWidth="2.5"
                    className="transition-all duration-150"
                  />
                </g>
              ))}
            </svg>

            {/* Dynamic Hover Tooltip Box */}
            {hoveredIdx !== null && hoveredPoint && (
              <div 
                className="absolute p-3 bg-white border border-[#E8DDD0] rounded-xl shadow-xl text-left pointer-events-none z-10 transition-all duration-150 animate-fade-in"
                style={{
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  top: `${Math.max(20, hoveredPoint.ySpend - 105)}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <p className="text-[9px] text-[#8D8176] font-mono font-black uppercase tracking-wider">{hoveredPoint.month} LEDGER SUMMARY</p>
                <div className="mt-1.5 space-y-1">
                  <p className="text-xs text-[#1F1A17] font-black leading-none">
                    Actual: <span className="text-[#6F4E37] font-mono font-bold">${(hoveredPoint.spend / 1000).toFixed(0)}k</span>
                  </p>
                  <p className="text-[11px] text-[#5E5248] leading-none">
                    Target: <span className="font-mono text-[#8D8176] font-semibold">${(hoveredPoint.budget / 1000).toFixed(0)}k</span>
                  </p>
                  <p className={`text-[10px] font-black uppercase tracking-wide leading-none mt-1 ${hoveredPoint.spend > hoveredPoint.budget ? 'text-[#B85042]' : 'text-[#4F7942]'}`}>
                    {hoveredPoint.spend > hoveredPoint.budget 
                      ? `+$${((hoveredPoint.spend - hoveredPoint.budget)/1000).toFixed(0)}k overrun` 
                      : `-$${((hoveredPoint.budget - hoveredPoint.spend)/1000).toFixed(0)}k saved`}
                  </p>
                </div>
              </div>
            )}

            {/* Default Helpful static hint displayed if nothing is hovered */}
            {hoveredIdx === null && (
              <div className="absolute top-3 right-4 px-2 py-1 bg-[#FAF8F5]/80 border border-[#E8DDD0]/50 rounded-md text-[9px] text-[#8D8176] font-medium tracking-wide flex items-center gap-1.5 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B6B4A] animate-pulse"></span>
                <span>Hover lines to drill down monthly details</span>
              </div>
            )}
          </div>

          <div className="flex justify-between text-[11px] text-zinc-500 uppercase tracking-widest mt-6 px-1 font-mono">
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>

        </div>

        {/* Column Right: AI recommendation / Strategy */}
        <div className="border border-indigo-500/10 bg-indigo-950/10 p-5 rounded-2xl lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-6">
              <Sparkles className="w-4 h-4" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Strategic HR Insights</h4>
            </div>

            <div className="space-y-4">
              
              <div className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">Underutilized engineering allocation</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Cloud Migration spend is exceeding baseline budget targets by <strong>14.2%</strong>. Transitioning 3 engineers from maintenance syncs would optimize Project Alpha timeline by 18 days.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0"></span>
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">DevOps meeting bulk detected</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Infrastructure crew members show a <strong>12% rise</strong> in recurring standalone events. Establish sync guidelines to free $12.5k next cycle.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">High-accuracy automatic mapping</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    <strong>94%</strong> of synchronized calendar events have been successfully linked to cost objects. Review <strong>{pendingCount}</strong> unclassified items.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <button
            onClick={onOpenStrategyPlanner}
            className="mt-6 w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-indigo-300 rounded-xl transition-all cursor-pointer select-none active:scale-95"
          >
            Access Strategy Planner
          </button>
        </div>

      </div>

      {/* Row Footer bento cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Project Distribution */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl md:col-span-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Project Spends Allocation</h4>
          <div className="space-y-4">
            {projects.map((proj) => {
              const percentage = ((proj.costToDate / totalSpend) * 100).toFixed(0);
              return (
                <div key={proj.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs leading-none">
                    <span className="font-bold text-zinc-300">{proj.name}</span>
                    <span className="text-zinc-500">${(proj.costToDate / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Classification Confidence radial chart */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl md:col-span-3 flex flex-col items-center justify-center text-center">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Attribution Confidence</h4>
          
          <div className="relative w-28 h-28 flex items-center justify-center mt-2">
            {/* SVG circle gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" fill="transparent" stroke="#18181b" strokeWidth="8" />
              <circle
                cx="56"
                cy="56"
                r="48"
                fill="transparent"
                stroke="#818cf8"
                strokeWidth="8"
                strokeDasharray="301.6"
                strokeDashoffset="18"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-2xl font-black text-white">94%</span>
              <span className="text-[9px] text-zinc-500 font-semibold uppercase mt-0.5">Confidence</span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 mt-4 leading-relaxed">
            ML classifier rate matching corporate titles to correct code structures.
          </p>
        </div>

        {/* Anomalies Detected Drilldown */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl md:col-span-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Critical Alerts Feed</h4>
            <button
              onClick={() => onNavigate('anomalies')}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 leading-none"
            >
              View Dashboard <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {anomalies.slice(0, 3).map((anom) => (
              <div
                key={anom.id}
                onClick={() => onOpenResolveAnomaly(anom)}
                className="group p-2.5 bg-zinc-950/70 border border-zinc-900 hover:border-red-500/25 rounded-xl flex items-center gap-3 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-200 truncate group-hover:text-red-300 transition-colors">{anom.title}</p>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{anom.department} • Weekly Overrun: <span className="font-bold text-red-400/90">${(anom.costDelta / 1000).toFixed(1)}k</span></p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-300 transition-colors" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
