/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Shield, Sparkles, TrendingUp, Calendar, Zap, DollarSign, Layout, Users, ChevronRight, Activity } from 'lucide-react';

interface LandingViewProps {
  onEnterApp: () => void;
  onEnterLogin: () => void;
}

export default function LandingView({ onEnterApp, onEnterLogin }: LandingViewProps) {
  const features = [
    {
      icon: Calendar,
      title: "Calendar Sync & Mapping",
      description: "Directly syncs with Google Calendar and Outlook API. Converts calendar blocks and organizer metadata into real-world cost metrics."
    },
    {
      icon: Sparkles,
      title: "AI-Attribution Engine",
      description: "ML classification maps 94% of unassigned discussions and alignment meetings to precise, correct epic and client codes."
    },
    {
      icon: Shield,
      title: "Executive Anomaly Center",
      description: "Automated real-time monitoring flags meeting overlap, contractor budget leaks, and extreme team meeting creep."
    },
    {
      icon: TrendingUp,
      title: "Scenarios & Forecasting",
      description: "Interactive what-if simulations for modeling future corporate restructures, salary adjustments, and strategic workspace changes."
    },
    {
      icon: Zap,
      title: "Executive AI Copilot",
      description: "An LLM-driven companion to instantly query spend metrics, write board briefs, and request custom optimization plans."
    },
    {
      icon: DollarSign,
      title: "True Blended Rate Calculator",
      description: "Tracks exact title and seniority mixes to calculate the absolute true fully-burdened hourly cost of any corporate group."
    }
  ];

  return (
    <div id="landing-view" className="bg-[#09090b] text-[#e5e1e4] min-h-screen selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden relative">
      
      {/* Aurora Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center border-b border-zinc-900 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center text-[#09090b] font-bold">
            <Activity className="w-5 h-5 text-indigo-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white leading-none">WorkPulse <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">AI</span></span>
            <p className="text-[10px] text-zinc-500 tracking-widest uppercase">HR Cost Intelligence</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Product Demo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={onEnterLogin} className="text-xs font-semibold px-4 py-2 text-zinc-300 hover:text-white transition-colors">
            Log In
          </button>
          <button onClick={onEnterApp} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5">
            Launch Sandbox <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-32 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/65 border border-zinc-800 text-xs text-indigo-300 font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Introducing WorkPulse AI Engine 2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
            Transform Calendar Activity into{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-200 to-violet-300 bg-clip-text text-transparent">
              HR Cost Intelligence
            </span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
            Automate meeting-to-project allocation tracking, discover contractor bleed alignment issues, and model HR expenditures with AI-powered foresight.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button onClick={onEnterApp} className="w-full sm:w-auto text-sm font-bold bg-white text-[#09090b] hover:bg-zinc-200 px-8 py-3.5 rounded-xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2">
              Get Started for Free <ChevronRight className="w-4 h-4 text-zinc-900" />
            </button>
            <button onClick={onEnterLogin} className="w-full sm:w-auto text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 px-8 py-3.5 rounded-xl transition-all">
              Request Demo Run
            </button>
          </div>

          {/* Core Visual Mimicry */}
          <div className="mt-20 w-full rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
            <div className="h-6 w-full flex items-center justify-between px-4 border-b border-zinc-900 bg-zinc-950 rounded-t-xl text-zinc-500 text-[10px] font-mono">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
              </div>
              <span>https://app.workpulse.ai/copilot</span>
              <span className="text-indigo-400 select-none">ONLINE</span>
            </div>
            
            {/* Visual simulation block */}
            <div className="p-6 bg-[#131315] rounded-b-xl flex flex-col md:flex-row gap-6 items-center justify-between text-left">
              <div className="space-y-4 max-w-md">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 w-fit">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Interactive Calculation</span>
                </div>
                <h3 className="text-xl font-bold text-white">Daily Tech-Lead Standup</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  12 attendees • 45 minutes • 7 DevOps Engineers, 3 PMs, 2 Architects.
                </p>
                <div className="flex items-center gap-4 py-2">
                  <div>
                    <span className="text-xs text-zinc-500 font-mono">Blended Rate:</span>
                    <p className="text-sm font-semibold text-zinc-300">$148.50/hr</p>
                  </div>
                  <div className="border-l border-zinc-800 pl-4">
                    <span className="text-xs text-zinc-500 font-mono">True Meeting Cost:</span>
                    <p className="text-sm font-semibold text-emerald-400">$1,336.50 / week</p>
                  </div>
                </div>
              </div>

              {/* Graphical simulation panel */}
              <div className="w-full md:w-80 p-4 bg-zinc-950/70 rounded-xl border border-zinc-800 flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-bold tracking-widest uppercase">AI Suggestion</span>
                  <span className="text-violet-400 flex items-center gap-0.5"><Sparkles className="w-3 h-3" /> 94% match</span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full w-[94%]"></div>
                </div>
                <p className="text-xs text-zinc-400">
                  Linked to project: <span className="text-white font-semibold">CLOUD-MIG (Cloud Migration)</span> based on attendee roles and discussion references.
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={onEnterApp} className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-bold transition-all">
                    Confirm Link
                  </button>
                  <button onClick={onEnterApp} className="px-2.5 py-1.5 text-zinc-500 hover:text-white transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Board */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-b border-zinc-900 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-zinc-400">
        <div>
          <span className="text-3xl font-bold text-white">$420k+</span>
          <p className="text-xs tracking-wider uppercase mt-1">Average Savings Unlocked</p>
        </div>
        <div>
          <span className="text-3xl font-bold text-white">94%</span>
          <p className="text-xs tracking-wider uppercase mt-1">AI Classification Accuracy</p>
        </div>
        <div>
          <span className="text-3xl font-bold text-white">12,000+</span>
          <p className="text-xs tracking-wider uppercase mt-1">Meetings Mapped Monthly</p>
        </div>
        <div>
          <span className="text-3xl font-bold text-white">&lt; 15 mins</span>
          <p className="text-xs tracking-wider uppercase mt-1">Workspace Integration Setup</p>
        </div>
      </section>

      {/* Features bento style */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-28 leading-normal">
        <div className="text-center mb-20">
          <small className="text-indigo-400 text-xs font-mono font-bold uppercase tracking-widest">Built for the modern stack</small>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-2 tracking-tight">
            Workforce Spend, Under a True Lens.
          </h2>
          <p className="text-zinc-400 text-zinc-400 text-base md:text-lg max-w-xl mx-auto mt-4">
            WorkPulse AI analyzes calendar metadata automatically, calculating granular cost breakdowns and anomalies before they drain capital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{feat.description}</p>
                </div>
                <div className="mt-6 flex items-center text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer select-none" onClick={onEnterApp}>
                  Explore module <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Product Demo */}
      <section id="demo" className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-900 leading-normal">
        <div className="p-8 rounded-3xl bg-gradient-to-tr from-indigo-950/20 to-violet-950/10 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-md">
            <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">Interactive Playground</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mt-2 leading-tight">
              Test cost simulations inside the Sandbox.
            </h2>
            <p className="text-xs text-zinc-400 mt-4 leading-relaxed">
              Play with real what-if sliders (budget rates, meeting filters, headcount forecasts) to see how dynamic algorithms immediately forecast monthly savings potential.
            </p>
            <div className="mt-8">
              <button onClick={onEnterApp} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95">
                Launch Corporate Sandbox <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="w-full md:w-96 p-5 bg-[#131315]/80 backdrop-blur rounded-2xl border border-zinc-800 flex flex-col gap-4">
            <span className="text-xs text-zinc-500">SIMULATION FORECAST INDEX</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400">Projected Run Cost</span>
                <p className="text-xl font-bold text-white">$14.2M</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400">With 15% Reduction</span>
                <p className="text-xl font-bold text-emerald-400">$12.8M</p>
              </div>
            </div>
            <div className="flex items-end h-16 gap-1 bg-zinc-950 p-2 rounded-lg">
              <div className="h-10 bg-zinc-800 flex-1 rounded-sm"></div>
              <div className="h-12 bg-zinc-800 flex-1 rounded-sm"></div>
              <div className="h-14 bg-zinc-800 flex-1 rounded-sm"></div>
              <div className="h-10 bg-indigo-500 flex-1 rounded-sm"></div>
              <div className="h-8 bg-indigo-500 flex-1 rounded-sm"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Row */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-28 border-t border-zinc-900 leading-normal">
        <div className="text-center mb-16">
          <small className="text-violet-400 text-xs font-mono font-bold uppercase tracking-widest">Transparent pricing</small>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-1">Flexible SaaS Plans</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[#131315]/40 border border-zinc-900 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-zinc-400">Sandbox Trial</span>
              <p className="text-2xl font-black text-white mt-2">$0</p>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">Perfect for exploring the mock platform workspace and evaluating dashboard structures.</p>
              <ul className="text-xs text-zinc-400 space-y-2 mt-6">
                <li>• Simulator access with mock inputs</li>
                <li>• Anomaly log browser</li>
                <li>• AI copilot evaluation</li>
              </ul>
            </div>
            <button onClick={onEnterApp} className="w-full mt-8 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg text-xs font-bold transition-all">
              Go to Sandbox
            </button>
          </div>

          <div className="p-8 rounded-2xl bg-[#131315]/70 border-2 border-indigo-500/50 shadow-2xl relative flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-[#09090b] text-[10px] font-bold uppercase px-3 py-1 rounded-full">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase text-indigo-400">Professional</span>
              <p className="text-2xl font-black text-white mt-2">$799<span className="text-xs font-light text-zinc-400">/mo</span></p>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">Full calendar sync integration for scale-ups wishing to monitor up to 500 team members.</p>
              <ul className="text-xs text-zinc-400 space-y-2 mt-6">
                <li>• Live Google & Outlook Calendar Sync</li>
                <li>• Precision AI Project Classification</li>
                <li>• Full Anomaly Alerts Integration</li>
                <li>• Dynamic What-If forecasts</li>
              </ul>
            </div>
            <button onClick={onEnterApp} className="w-full mt-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/30">
              Launch Pro Workspace
            </button>
          </div>

          <div className="p-8 rounded-2xl bg-[#131315]/40 border border-zinc-900 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-violet-400">Enterprise Scale</span>
              <p className="text-2xl font-black text-white mt-2">Custom</p>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">High-density multi-tenant solution with Custom LLM model adapters for active workspace configurations.</p>
              <ul className="text-xs text-zinc-400 space-y-2 mt-6">
                <li>• Unlimited synced calendar users</li>
                <li>• Custom API Key overrides</li>
                <li>• Dedicate enterprise AI Agent</li>
                <li>• SSO & Compliance exports</li>
              </ul>
            </div>
            <button onClick={onEnterApp} className="w-full mt-8 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg text-xs font-bold transition-all">
              Launch Sandbox Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 text-center text-xs text-zinc-600 max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <span>© 2026 WorkPulse AI. Built in enterprise-grade obsidian style. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Support Portal</a>
        </div>
      </footer>
    </div>
  );
}
