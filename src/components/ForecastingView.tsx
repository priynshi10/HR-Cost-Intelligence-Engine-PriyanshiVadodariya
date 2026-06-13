/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Sparkles, Sliders, Play, Calculator, HelpCircle, ArrowRightLeft, DollarSign, Activity } from 'lucide-react';
import { Project } from '../types';

interface ForecastingViewProps {
  projects: Project[];
}

export default function ForecastingView({ projects }: ForecastingViewProps) {
  // Simulator Sliders state
  const [headcountChange, setHeadcountChange] = useState<number>(10); // % change (-20 to +50)
  const [salaryChange, setSalaryChange] = useState<number>(3); // % change (-15 to +20)
  const [meetingReduction, setMeetingReduction] = useState<number>(20); // % decrease (0 to 50)

  // Current Base stats
  const baselineCost = 14200000; // $14.2M baseline
  
  // Dynamic live calculation
  // Workforce growth factor
  const headcountFactor = 1 + headcountChange / 100;
  // Wage adjust factor
  const salaryFactor = 1 + salaryChange / 100;
  // Meeting reduction saves cost (we assume meetings represent roughly 15% of total personnel expenditures)
  const meetingSavingsRate = (meetingReduction / 100) * 0.15;
  const meetingFactor = 1 - meetingSavingsRate;

  // Final calculated projection
  const projectedCost = Math.round(baselineCost * headcountFactor * salaryFactor * meetingFactor);
  const costDelta = projectedCost - baselineCost;
  const percentageDelta = ((projectedCost - baselineCost) / baselineCost) * 100;
  const savingsAmount = costDelta < 0 ? Math.abs(costDelta) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Forecasting & What-If Simulator</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Model strategic expansion plans, labor increments, or organizational restructures using real-time sync multipliers.</p>
      </div>

      {/* Main split-view simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Sliders panel */}
        <div className="lg:col-span-4 bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between leading-snug">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-6">
              <Sliders className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Interactive Modifiers</h3>
            </div>

            <div className="space-y-6">
              
              {/* Slider 1: Headcount */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-bold">Planned Headcount:</span>
                  <span className={`font-black font-mono px-2 py-0.5 rounded ${headcountChange >= 0 ? 'text-indigo-300 bg-indigo-505/10' : 'text-red-300'}`}>
                    {headcountChange >= 0 ? `+${headcountChange}%` : `${headcountChange}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="50"
                  step="5"
                  value={headcountChange}
                  onChange={(e) => setHeadcountChange(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                />
                <div className="flex justify-between text-[9px] text-zinc-650 uppercase font-mono font-bold">
                  <span>-20% (Downsize)</span>
                  <span>Stable</span>
                  <span>+50% (Hire Spurt)</span>
                </div>
              </div>

              {/* Slider 2: Salary adjustment */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-bold">Base Salaries adjustment:</span>
                  <span className="font-black font-mono text-zinc-300">
                    {salaryChange >= 0 ? `+${salaryChange}%` : `${salaryChange}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="20"
                  step="1"
                  value={salaryChange}
                  onChange={(e) => setSalaryChange(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                />
                <div className="flex justify-between text-[9px] text-zinc-650 uppercase font-mono font-bold">
                  <span>-10% (Cuts)</span>
                  <span>Stable</span>
                  <span>+20% (Raises)</span>
                </div>
              </div>

              {/* Slider 3: Meeting Reduction */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-indigo-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Meeting Consolidation:
                  </span>
                  <span className="font-black font-mono text-emerald-400">
                    {meetingReduction}% reduction
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={meetingReduction}
                  onChange={(e) => setMeetingReduction(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                />
                <div className="flex justify-between text-[9px] text-zinc-650 uppercase font-mono font-bold">
                  <span>0% (Status Quo)</span>
                  <span>25% Standard</span>
                  <span>50% Max Async-first</span>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-zinc-900 mt-6 flex items-center gap-2 text-[10px] text-zinc-550 leading-tight">
            <Calculator className="w-4 h-4 text-zinc-600" />
            <span>Mathematical formulas immediately recalculate true headcount labor cost curves.</span>
          </div>
        </div>

        {/* Right Side: Projections Charts */}
        <div className="lg:col-span-8 bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between leading-normal">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-sm font-bold text-white">Next-12 Months Spend Forecast</h4>
              <p className="text-[11px] text-zinc-500">Live delta overview of simulated expenditures vs baseline budget indices.</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span> Current Baseline
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Live Simulation
              </span>
            </div>
          </div>

          {/* Results Summary Board */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            
            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-900 leading-snug">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Baseline Run</span>
              <p className="text-lg font-black text-white font-mono mt-0.5">$14.20M</p>
            </div>

            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-900 leading-snug">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Simulated Projected</span>
              <p className="text-lg font-black text-indigo-300 font-mono mt-0.5">
                ${(projectedCost / 1000000).toFixed(2)}M
              </p>
            </div>

            <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 leading-snug ${
              costDelta <= 0
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/5 border-red-500/20 text-red-400'
            }`}>
              <span className="text-[9px] font-bold uppercase tracking-widest">Projected variance</span>
              <p className="text-lg font-black font-mono mt-0.5">
                {costDelta <= 0 ? '-' : '+'}${(Math.abs(costDelta) / 1000000).toFixed(2)}M
                <span className="text-xs font-semibold ml-1">({percentageDelta.toFixed(1)}%)</span>
              </p>
            </div>

          </div>

          {/* Live Side by Side comparison bars */}
          <div className="p-5 bg-[#131315]/40 rounded-xl border border-zinc-900 flex justify-around items-end h-32 gap-6 pt-4 text-center">
            
            {/* Bar 1: Baseline */}
            <div className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
              <div className="w-16 bg-zinc-800 rounded-t-lg h-24 relative hover:bg-zinc-705 transition-all">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold font-mono text-zinc-400">$14.2M</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status Quo</span>
            </div>

            {/* Bar 2: Live simulation */}
            <div className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
              <div
                className={`w-16 rounded-t-lg relative transition-all duration-500 ${
                  costDelta <= 0 ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-red-500/80 hover:bg-red-400'
                }`}
                style={{ height: `${(projectedCost / baselineCost) * 96}px` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold font-mono text-indigo-300">
                  ${(projectedCost / 1000000).toFixed(1)}M
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Projected Run</span>
            </div>

          </div>

          {/* AI Simulator Advice panel */}
          {savingsAmount > 0 && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl mt-6">
              <div className="flex items-center gap-1.5 text-emerald-400 mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Simulated Optimization Path Created</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                By enforcing a <strong>{meetingReduction}% alignment reduction</strong> (transitioning trivial catchups to async), your company successfully overrides the cost creep of the {headcountChange}% headcount growth, yielding a net savings of <strong>${savingsAmount.toLocaleString()}</strong> of strategic workforce capital!
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
