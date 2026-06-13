/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Shield, Sparkles, TrendingUp, Calendar, Zap, DollarSign, ChevronRight, Activity, CheckCircle2 } from 'lucide-react';

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
    <div id="landing-view" className="bg-[#FAF8F5] text-[#1F1A17] min-h-screen selection:bg-[#6F4E37] selection:text-white font-sans overflow-x-hidden relative">
      
      {/* Luxury Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#C8A27C]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-[#6F4E37]/3 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center border-b border-[#E8DDD0] sticky top-0 bg-[#FAF8F5]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#6F4E37] to-[#8B6B4A] rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-[#1F1A17] font-display">WorkPulse <span className="bg-gradient-to-r from-[#6F4E37] to-[#C8A27C] bg-clip-text text-transparent">AI</span></span>
            <p className="text-[10px] text-[#8D8176] tracking-widest uppercase font-bold">HR Cost Intelligence</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[#5E5248] font-medium">
          <a href="#features" className="hover:text-[#6F4E37] transition-colors">Features</a>
          <a href="#demo" className="hover:text-[#6F4E37] transition-colors">Product Demo</a>
          <a href="#pricing" className="hover:text-[#6F4E37] transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={onEnterLogin} className="text-xs font-semibold px-4 py-2 text-[#5E5248] hover:text-[#1F1A17] transition-colors">
            Log In
          </button>
          <button onClick={onEnterApp} className="text-xs font-bold bg-gradient-to-r from-[#6F4E37] to-[#8B6B4A] text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5 border-none cursor-pointer">
            Launch Sandbox <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-32 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* Executive Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EDE4] border border-[#E8DDD0] text-xs text-[#6F4E37] font-bold mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#C8A27C]" />
            <span>Introducing WorkPulse AI Engine 2.0</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#1F1A17] max-w-4xl leading-[1.15] mb-6 font-display">
            Transform Calendar Activity into{" "}
            <span className="bg-gradient-to-r from-[#6B4423] via-[#8B5E3C] via-[#C08B5C] to-[#D4A373] bg-clip-text text-transparent">
              HR Cost Intelligence
            </span>
          </h1>

          <p className="text-[#5E5248] text-base md:text-lg max-w-2xl leading-relaxed mb-10">
            Automate meeting-to-project allocation tracking, discover contractor bleed alignment issues, and model HR expenditures with AI-powered foresight. Built for CFOs, CHROs, and executive teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button onClick={onEnterApp} className="w-full sm:w-auto text-sm font-bold bg-[#6F4E37] text-white hover:opacity-90 px-8 py-3.5 rounded-xl shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 border-none">
              Get Started for Free <ChevronRight className="w-4 h-4 text-white" />
            </button>
            <button onClick={onEnterLogin} className="w-full sm:w-auto text-sm font-semibold bg-white hover:bg-[#F3EDE4] text-[#1F1A17] border border-[#E8DDD0] px-8 py-3.5 rounded-xl transition-all shadow-xs cursor-pointer">
              Request Demo Run
            </button>
          </div>

          {/* Core Visual Mockup */}
          <div className="mt-20 w-full rounded-2xl border border-[#E8DDD0] bg-white p-3 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-[#6F4E37]/5 to-transparent pointer-events-none"></div>
            <div className="h-6 w-full flex items-center justify-between px-4 border-b border-[#E8DDD0] bg-[#FAF8F5] rounded-t-xl text-[#8D8176] text-[10px] font-mono">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8DDD0]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8DDD0]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8DDD0]"></span>
              </div>
              <span>https://app.workpulse.ai/executive-cockpit</span>
              <span className="text-[#6F4E37] font-bold">ONLINE</span>
            </div>
            
            {/* Visual simulation block */}
            <div className="p-8 bg-white rounded-b-xl flex flex-col md:flex-row gap-8 items-center justify-between text-left">
              <div className="space-y-4 max-w-md">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#F3EDE4] border border-[#E8DDD0] text-xs text-[#6F4E37] w-fit font-bold">
                  <Activity className="w-3.5 h-3.5 text-[#C8A27C]" />
                  <span>Interactive Calculation</span>
                </div>
                <h3 className="text-xl font-bold text-[#1F1A17] font-display">Daily Tech-Lead Standup</h3>
                <p className="text-xs text-[#5E5248] leading-relaxed">
                  12 attendees • 45 minutes • 7 DevOps Engineers, 3 PMs, 2 Architects.
                </p>
                <div className="flex items-center gap-6 py-2">
                  <div>
                    <span className="text-xs text-[#8D8176] font-mono">Blended Rate:</span>
                    <p className="text-sm font-semibold text-[#1F1A17]">$148.50/hr</p>
                  </div>
                  <div className="border-l border-[#E8DDD0] pl-6">
                    <span className="text-xs text-[#8D8176] font-mono">True Meeting Cost:</span>
                    <p className="text-sm font-bold text-[#4F7942]">$1,336.50 / week</p>
                  </div>
                </div>
              </div>

              {/* Graphical simulation panel */}
              <div className="w-full md:w-80 p-5 bg-[#FAF8F5] rounded-xl border border-[#E8DDD0] flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px] text-[#5E5248]">
                  <span className="font-bold tracking-widest uppercase">AI Suggestion</span>
                  <span className="text-[#6F4E37] font-bold flex items-center gap-0.5"><Sparkles className="w-3 h-3 text-[#C8A27C]" /> 94% match</span>
                </div>
                <div className="h-2 bg-[#E8DDD0] rounded-full overflow-hidden">
                  <div className="bg-[#6F4E37] h-full w-[94%]"></div>
                </div>
                <p className="text-xs text-[#5E5248] leading-relaxed">
                  Linked to project: <span className="text-[#1F1A17] font-bold">CLOUD-MIG (Cloud Migration)</span> based on attendee roles and discussion references.
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={onEnterApp} className="flex-1 py-1.5 bg-[#6F4E37] text-white hover:opacity-90 rounded-md text-[11px] font-bold transition-all border-none cursor-pointer">
                    Confirm Link
                  </button>
                  <button onClick={onEnterApp} className="px-3 py-1.5 bg-white text-[#5E5248] hover:text-[#1F1A17] rounded-md text-[11px] font-bold border border-[#E8DDD0] cursor-pointer">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Board */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-b border-[#E8DDD0] grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-[#5E5248] bg-[#F9F6F1]">
        <div>
          <span className="text-3xl font-bold text-[#1F1A17] font-display">$420k+</span>
          <p className="text-xs tracking-wider uppercase mt-1 font-semibold">Average Savings Unlocked</p>
        </div>
        <div>
          <span className="text-3xl font-bold text-[#1F1A17] font-display">94%</span>
          <p className="text-xs tracking-wider uppercase mt-1 font-semibold">AI Classification Accuracy</p>
        </div>
        <div>
          <span className="text-3xl font-bold text-[#1F1A17] font-display">12,000+</span>
          <p className="text-xs tracking-wider uppercase mt-1 font-semibold">Meetings Mapped Monthly</p>
        </div>
        <div>
          <span className="text-3xl font-bold text-[#1F1A17] font-display">&lt; 15 mins</span>
          <p className="text-xs tracking-wider uppercase mt-1 font-semibold">Workspace Setup Time</p>
        </div>
      </section>

      {/* Features bento style */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-28 leading-normal">
        <div className="text-center mb-20">
          <small className="text-[#C8A27C] text-xs font-mono font-bold uppercase tracking-widest">Built for the Modern Enterprise</small>
          <h2 className="text-3xl md:text-5xl font-bold text-[#1F1A17] mt-2 tracking-tight font-display">
            Workforce Spend, Under a True Lens.
          </h2>
          <p className="text-[#5E5248] text-base md:text-lg max-w-xl mx-auto mt-4">
            WorkPulse AI analyzes calendar metadata automatically, calculating granular cost breakdowns and anomalies before they drain capital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="p-8 rounded-2xl bg-white border border-[#E8DDD0] hover:border-[#6F4E37] hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-[#F3EDE4] border border-[#E8DDD0] rounded-xl flex items-center justify-center text-[#6F4E37] mb-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1F1A17] mb-2 font-display">{feat.title}</h3>
                  <p className="text-xs text-[#5E5248] leading-relaxed">{feat.description}</p>
                </div>
                <div className="mt-6 flex items-center text-xs text-[#6F4E37] hover:text-[#8B6B4A] font-bold cursor-pointer select-none" onClick={onEnterApp}>
                  Explore module <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Product Demo */}
      <section id="demo" className="max-w-6xl mx-auto px-6 py-20 border-t border-[#E8DDD0] leading-normal">
        <div className="p-10 rounded-3xl bg-gradient-to-tr from-[#F3EDE4] to-[#FAF8F5] border border-[#E8DDD0] flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-md">
            <span className="text-xs font-mono font-bold text-[#8B6B4A] uppercase tracking-widest">Interactive Playground</span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#1F1A17] mt-2 leading-tight font-display">
              Test cost simulations inside the Sandbox.
            </h2>
            <p className="text-xs text-[#5E5248] mt-4 leading-relaxed">
              Play with real what-if sliders (budget rates, meeting filters, headcount forecasts) to see how dynamic algorithms immediately forecast monthly savings potential.
            </p>
            <div className="mt-8">
              <button onClick={onEnterApp} className="px-6 py-3 bg-[#6F4E37] text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all border-none cursor-pointer">
                Launch Corporate Sandbox &rarr;
              </button>
            </div>
          </div>
          <div className="w-full md:w-96 p-6 bg-white rounded-2xl border border-[#E8DDD0] flex flex-col gap-4 shadow-sm">
            <span className="text-xs text-[#8D8176] font-bold uppercase tracking-wider">SIMULATION FORECAST INDEX</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#5E5248]">Projected Run Cost</span>
                <p className="text-xl font-bold text-[#1F1A17] font-mono">$14.2M</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#5E5248]">With 15% Reduction</span>
                <p className="text-xl font-bold text-[#4F7942] font-mono">$12.8M</p>
              </div>
            </div>
            <div className="flex items-end h-16 gap-1 bg-[#FAF8F5] p-2 rounded-lg border border-[#E8DDD0]">
              <div className="h-10 bg-[#E8DDD0] flex-1 rounded-sm"></div>
              <div className="h-12 bg-[#E8DDD0] flex-1 rounded-sm"></div>
              <div className="h-14 bg-[#E8DDD0] flex-1 rounded-sm"></div>
              <div className="h-10 bg-[#6F4E37] flex-1 rounded-sm"></div>
              <div className="h-8 bg-[#8B6B4A] flex-1 rounded-sm"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Row */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-28 border-t border-[#E8DDD0] leading-normal">
        <div className="text-center mb-16">
          <small className="text-[#8B6B4A] text-xs font-mono font-bold uppercase tracking-widest">Transparent Pricing Model</small>
          <h2 className="text-3xl md:text-5xl font-bold text-[#1F1A17] mt-1 font-display">SaaS Pricing Options</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-[#E8DDD0] flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-[#8D8176]">Sandbox Trial</span>
              <p className="text-2xl font-bold text-[#1F1A17] mt-2 font-display">$0</p>
              <p className="text-xs text-[#5E5248] mt-2 leading-relaxed">Perfect for exploring the mock platform workspace and evaluating dashboard structures.</p>
              <ul className="text-xs text-[#5E5248] space-y-2.5 mt-6 border-t border-[#FAF8F5] pt-6">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942]" /> Simulator access with mock inputs</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942]" /> Anomaly log browser</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942]" /> AI copilot evaluation</li>
              </ul>
            </div>
            <button onClick={onEnterApp} className="w-full mt-8 py-2.5 bg-[#FAF8F5] hover:bg-[#F3EDE4] border border-[#E8DDD0] text-[#1F1A17] rounded-lg text-xs font-bold transition-all cursor-pointer">
              Go to Sandbox
            </button>
          </div>

          <div className="p-8 rounded-2xl bg-white border-2 border-[#6F4E37] shadow-xl relative flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6F4E37] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase text-[#6F4E37]">Professional</span>
              <p className="text-2xl font-bold text-[#1F1A17] mt-2 font-display">$799<span className="text-xs font-light text-[#8D8176]">/mo</span></p>
              <p className="text-xs text-[#5E5248] mt-2 leading-relaxed">Full calendar sync integration for scale-ups wishing to monitor up to 500 team members.</p>
              <ul className="text-xs text-[#5E5248] space-y-2.5 mt-6 border-t border-[#FAF8F5] pt-6">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942]" /> Live Google & Outlook Sync</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942]" /> Precision AI Project Classification</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942]" /> Full Anomaly Alerts Integration</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942]" /> Dynamic What-If forecasts</li>
              </ul>
            </div>
            <button onClick={onEnterApp} className="w-full mt-8 py-2.5 bg-[#6F4E37] text-white hover:opacity-90 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer border-none">
              Launch Pro Workspace
            </button>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-[#E8DDD0] flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-[#8D8176]">Enterprise Scale</span>
              <p className="text-2xl font-bold text-[#1F1A17] mt-2 font-display">Custom</p>
              <p className="text-xs text-[#5E5248] mt-2 leading-relaxed">High-density multi-tenant solution with Custom LLM model adapters for active workspace configurations.</p>
              <ul className="text-xs text-[#5E5248] space-y-2.5 mt-6 border-t border-[#FAF8F5] pt-6">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942]" /> Unlimited synced calendar users</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942]" /> Custom API Key overrides</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942]" /> Dedicated enterprise AI Agent</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4F7942]" /> SSO & Compliance exports</li>
              </ul>
            </div>
            <button onClick={onEnterApp} className="w-full mt-8 py-2.5 bg-[#FAF8F5] hover:bg-[#F3EDE4] border border-[#E8DDD0] text-[#1F1A17] rounded-lg text-xs font-bold transition-all cursor-pointer">
              Launch Sandbox Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8DDD0] py-12 text-center text-xs text-[#8D8176] max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 font-medium">
        <span>© 2026 WorkPulse AI. Built in premium light enterprise-grade executive style. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-[#6F4E37] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#6F4E37] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#6F4E37] transition-colors">Support Portal</a>
        </div>
      </footer>
    </div>
  );
}
