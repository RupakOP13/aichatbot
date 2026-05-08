import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiX, 
  FiCheckCircle, 
  FiTrendingUp, 
  FiActivity, 
  FiZap, 
  FiTarget, 
  FiShield, 
  FiDatabase,
  FiPieChart,
  FiPlay
} from 'react-icons/fi';

const DemoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setBooting(true);
      const bootTimer = setTimeout(() => setBooting(false), 1500);
      const stepTimer = setInterval(() => {
        setStep(s => (s + 1) % 4);
      }, 4000);
      return () => {
        clearTimeout(bootTimer);
        clearInterval(stepTimer);
      };
    } else {
      setStep(0);
      setBooting(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stages = [
    { 
      title: "Unified Data Ingestion", 
      desc: "Transforming raw spreadsheets into actionable knowledge structures.",
      icon: <FiDatabase />,
      color: "#00cec9"
    },
    { 
      title: "Semantic Intelligence", 
      desc: "Deep neural extraction of trends, risks, and strategic entities.",
      icon: <FiZap />,
      color: "#a29bfe"
    },
    { 
      title: "High-Fidelity Visuals", 
      desc: "Bloomberg-grade visualizations for executive decision making.",
      icon: <FiTrendingUp />,
      color: "#2ed573"
    },
    { 
      title: "Strategic Action", 
      desc: "Unlocking the full potential of your business intelligence.",
      icon: <FiTarget />,
      color: "#00cec9"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl aspect-[16/9] bg-black rounded-[40px] border border-white/10 shadow-[0_0_150px_rgba(0,206,201,0.15)] overflow-hidden animate-zoom-in">
        {/* Immersive Background Canvas with Moving Grid */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent-primary)_0%,transparent_70%)] opacity-20 animate-pulse" />
           </div>
           {/* Moving Grid Pattern */}
           <div className="absolute inset-0 opacity-[0.05] animate-grid-move" style={{ backgroundImage: 'linear-gradient(var(--accent-primary) 1px, transparent 1px), linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
           
           {/* Random Floating Particles */}
           {[...Array(20)].map((_, i) => (
             <div 
               key={i} 
               className="absolute w-1 h-1 bg-[var(--accent-primary)] rounded-full opacity-20 animate-float-random" 
               style={{ 
                 left: `${Math.random() * 100}%`, 
                 top: `${Math.random() * 100}%`,
                 animationDelay: `${Math.random() * 5}s`,
                 animationDuration: `${5 + Math.random() * 10}s`
               }} 
             />
           ))}
        </div>

        {/* Header Overlay */}
        <div className="absolute top-0 w-full p-8 flex items-center justify-between z-50">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 animate-pulse">
                 <FiActivity className="animate-spin-slow" />
              </div>
              <div>
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Nexus Intelligence Stream</h3>
                 <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Neural Link: Established</span>
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 group">
             <FiX className="text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all" />
           </button>
        </div>

        {/* Boot Sequence */}
        {booting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black animate-fade-in">
             <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border-2 border-white/5 flex items-center justify-center">
                   <div className="w-16 h-16 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
                </div>
                <FiZap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--accent-primary)] animate-pulse" />
             </div>
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.6em] animate-pulse">Synchronizing Neural Channels</p>
          </div>
        ) : (
          <div className="relative h-full w-full flex flex-col items-center justify-center p-12 overflow-hidden">
             {/* Dynamic Content Layers */}
             <div className="relative w-full max-w-4xl flex flex-col items-center justify-center flex-1">
                {/* Visual Stage Container */}
                <div className="h-72 w-full relative mb-8 flex items-center justify-center">
                   
                   {/* Stage 0: Data Storm */}
                   {step === 0 && (
                      <div className="relative w-full h-full flex items-center justify-center animate-scale-in">
                         {/* Centered Sink */}
                         <div className="w-32 h-32 rounded-full bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 flex items-center justify-center relative z-10">
                            <FiDatabase size={40} className="text-[var(--accent-primary)] animate-bounce" />
                            <div className="absolute inset-0 rounded-full border border-[var(--accent-primary)]/20 animate-ping" />
                         </div>
                         
                         {/* Flying Data Points */}
                         {[...Array(12)].map((_, i) => (
                           <div 
                             key={i} 
                             className="absolute w-2 h-2 glass border-white/10 rounded flex items-center justify-center animate-data-stream"
                             style={{ 
                               '--angle': `${i * 30}deg`,
                               '--delay': `${i * 0.2}s`
                             } as any}
                           >
                             <div className="w-0.5 h-0.5 bg-[var(--accent-primary)] rounded-full" />
                           </div>
                         ))}
                      </div>
                   )}

                   {/* Stage 1: Neural Expansion */}
                   {step === 1 && (
                      <div className="relative w-64 h-64 flex items-center justify-center animate-zoom-in">
                         {/* Concentric Pulses */}
                         {[1, 2, 3].map(i => (
                           <div 
                             key={i} 
                             className="absolute rounded-full border border-[var(--accent-primary)]/20 animate-expand-pulse" 
                             style={{ animationDelay: `${i * 0.8}s` }} 
                           />
                         ))}
                         
                         <div className="relative z-10 w-24 h-24 glass rounded-full flex items-center justify-center border border-[var(--accent-primary)]/40 shadow-[0_0_50px_var(--accent-primary)]/20">
                            <FiZap size={40} className="text-[var(--accent-primary)] animate-pulse" />
                         </div>

                         {/* Orbiting Insight Tags - TRI-SYMMETRIC ORBIT for perfect spacing */}
                         {[
                           { label: 'Growth Vector', color: 'var(--success)', icon: <FiTrendingUp />, angle: '0deg' },
                           { label: 'Volatility Index', color: 'var(--error)', icon: <FiActivity />, angle: '120deg' },
                           { label: 'Market Sentiment', color: 'var(--accent-primary)', icon: <FiTarget />, angle: '240deg' }
                         ].map((tag, i) => (
                           <div 
                             key={i} 
                             className="absolute glass px-5 py-2.5 rounded-2xl border-white/10 flex items-center gap-3 animate-orbit z-20 shadow-xl"
                             style={{ 
                               '--start-angle': tag.angle,
                               '--radius': '220px' 
                             } as any}
                           >
                              <span style={{ color: tag.color }} className="text-sm">{tag.icon}</span>
                              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">{tag.label}</span>
                           </div>
                         ))}
                      </div>
                   )}

                   {/* Stage 2: Animated Analytics */}
                   {step === 2 && (
                      <div className="w-full max-w-3xl animate-fade-in flex flex-col gap-8">
                         <div className="h-64 glass rounded-[48px] border-white/5 relative overflow-hidden p-10 flex items-end gap-4 bg-gradient-to-br from-white/[0.02] to-transparent">
                            <div className="absolute top-10 left-10 flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                               <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Real-time Performance Alpha</span>
                            </div>
                            
                            {/* Scanning Line Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-primary)]/5 to-transparent w-1/4 h-full animate-scan-sweep pointer-events-none" />

                            {[40, 75, 55, 100, 65, 85, 50, 95, 60, 110, 80, 120].map((h, i) => (
                               <div 
                                 key={i} 
                                 className="flex-1 bg-gradient-to-t from-[var(--accent-primary)] to-transparent rounded-t-xl opacity-80 group relative"
                                 style={{ 
                                   height: `${h/1.2}%`, 
                                   transformOrigin: 'bottom', 
                                   animation: `growUp 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${i * 0.05}s` 
                                 }}
                               >
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black text-[var(--accent-primary)]">
                                     {h}%
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}

                   {/* Stage 3: Success Spectacle */}
                   {step === 3 && (
                      <div className="flex flex-col items-center animate-scale-in text-center relative">
                         {/* Success Glow Ring */}
                         <div className="absolute inset-0 -m-20 bg-[var(--accent-primary)]/5 blur-[100px] rounded-full animate-pulse" />
                         
                         <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-black shadow-[0_0_100px_rgba(255,255,255,0.4)] mb-8 relative z-10 animate-bounce-slow">
                            <FiCheckCircle size={40} />
                         </div>
                         
                         <div className="relative z-10">
                            <h2 className="text-3xl font-black text-white mb-3 tracking-tighter">INTELLIGENCE UNLOCKED.</h2>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-10">System state: Optimized for maximum growth</p>
                            
                            <Link 
                              to="/register" 
                              className="px-12 py-4 rounded-2xl bg-white text-black font-black text-base hover:bg-[var(--accent-primary)] hover:text-white transition-all transform hover:scale-105 shadow-[0_20px_50px_rgba(255,255,255,0.2)] flex items-center gap-3 group"
                            >
                              START YOUR TRANSFORMATION
                              <FiPlay className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                         </div>
                      </div>
                   )}
                </div>

                {/* Text Content Layer */}
                <div className="text-center space-y-2 max-w-xl h-24 relative z-10">
                   {step !== 3 && (
                     <div key={step} className="animate-slide-in-up">
                        <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full border border-white/5 bg-white/5 mb-3">
                           <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Phase 0{step + 1}</span>
                           <div className="w-1 h-1 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">
                           {stages[step].title}
                        </h2>
                        <p className="text-gray-500 text-sm font-bold leading-relaxed max-w-md mx-auto">
                           {stages[step].desc}
                        </p>
                     </div>
                   )}
                </div>
             </div>

             {/* Footer Progress Indicators - FIXED ALIGNMENT */}
             <div className="absolute bottom-8 flex gap-8 z-10 items-end">
                {stages.map((_, i) => (
                  <div key={i} className="flex flex-col items-center group cursor-pointer" onClick={() => setStep(i)}>
                     <span className={`text-[8px] font-black uppercase tracking-widest transition-all duration-500 mb-3 ${step === i ? 'opacity-100 text-white translate-y-0' : 'opacity-30 translate-y-1'}`}>
                        {_.title.split(' ')[0]}
                     </span>
                     <div className={`h-1 rounded-full transition-all duration-700 ${step === i ? 'w-16 bg-[var(--accent-primary)] shadow-[0_0_20px_var(--accent-primary)]' : 'w-4 bg-white/10 group-hover:bg-white/30'}`} />
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white overflow-x-hidden">
      {/* Demo Modal Overlay */}
      <DemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00cec9] to-[#0984e3] flex items-center justify-center font-bold text-lg">
              N
            </div>
            <span className="text-xl font-bold tracking-tight">NexusAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-[#00cec9] transition-colors">Log in</Link>
            <button 
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-[#00cec9] hover:text-white transition-all transform hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#00cec9]/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00cec9]/30 bg-[#00cec9]/5 text-[#00cec9] text-xs font-bold mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#00cec9] animate-pulse" />
            AI-POWERED BUSINESS INTELLIGENCE
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Turn Your Spreadsheets into <br />
            <span className="gradient-text">Strategic Intelligence.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-12 leading-relaxed">
            Upload your Excel/CSV reports and chat with a specialized AI analyst. 
            Get instant insights, trends, and professional charts in plain English.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#00cec9] to-[#0984e3] text-white font-bold text-lg shadow-[0_10px_40px_rgba(0,206,201,0.3)] hover:shadow-[0_15px_50px_rgba(0,206,201,0.5)] transition-all transform hover:-translate-y-1"
            >
              Analyze Your First Report
            </button>
            <button 
              onClick={() => setShowDemo(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <FiPlay className="text-[var(--accent-primary)]" /> Watch Demo
            </button>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative animate-slide-in-up">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00cec9] to-[#0984e3] rounded-2xl blur opacity-20" />
            <div className="relative bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=1200&h=600" 
                alt="Dashboard Preview" 
                className="w-full opacity-70"
                style={{ filter: 'brightness(0.8) contrast(1.1)' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for data mastery</h2>
            <p className="text-gray-400">Advanced tools powered by the latest in LLM technology.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Conversational Analysis",
                desc: "Ask complex questions like 'Who is my top client?' or 'Why did sales drop in July?' and get instant answers.",
                icon: "💬"
              },
              {
                title: "Smart Visualizations",
                desc: "Automatic Bar, Line, and Pie charts generated on the fly. No manual tweaking required.",
                icon: "📊"
              },
              {
                title: "Executive Summaries",
                desc: "AI-generated insights, trends, and risk assessments delivered straight to your dashboard.",
                icon: "✨"
              },
              {
                title: "Voice-To-Data",
                desc: "Speak your queries naturally. NexusAI understands context and provides accurate audio feedback.",
                icon: "🎤"
              },
              {
                title: "Multi-Format Support",
                desc: "Seamlessly parse Excel (.xlsx) and CSV files. From small sheets to massive data exports.",
                icon: "📑"
              },
              {
                title: "Professional PDF Export",
                desc: "Generate and download branded PDF reports containing all your AI-driven insights and charts.",
                icon: "📥"
              }
            ].map((feature, i) => (
              <div key={i} className="glass p-8 rounded-2xl hover:border-[#00cec9]/40 transition-colors group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#0984e3]/5 blur-[100px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Three steps to clarity</h2>
            <p className="text-gray-400">Our engine does the heavy lifting so you can focus on strategy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            {[
              { step: "01", title: "Upload Data", desc: "Drop your CSV or Excel files. We instantly parse rows, columns, and numeric types.", icon: "📤" },
              { step: "02", title: "AI Audit", desc: "Our models perform a health check, detecting trends, risks, and data quality issues.", icon: "🧠" },
              { step: "03", title: "Chat & Export", desc: "Ask questions naturally, generate live charts, and export professional PDF reports.", icon: "📈" }
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mx-auto mb-6 relative z-10 shadow-xl">
                  {s.icon}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#00cec9] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0d0d1a]">
                    {s.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[240px] mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400">Unlock the full power of your data with our professional plans.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="glass p-10 rounded-3xl border-white/5 flex flex-col">
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-400 mb-2">Free Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">$0</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {["5 Reports Monthly", "Basic AI Insights", "Standard Visualizations", "Email Support"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-[#00cec9]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/register')}
                className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/5 font-bold text-sm transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="glass p-10 rounded-3xl border-[#00cec9]/30 bg-gradient-to-br from-[#00cec9]/5 to-transparent flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1 bg-[#00cec9] text-black text-[10px] font-black uppercase tracking-widest rounded-bl-xl">Popular</div>
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#00cec9] mb-2">Pro Intelligence</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">$19</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {["Unlimited Reports", "Advanced Strategic Analysis", "Premium PDF Exports", "Voice-to-Data Integration", "24/7 Priority Support"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white">
                    <span className="text-[#00cec9]">★</span> {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/register')}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00cec9] to-[#0984e3] text-white font-bold text-sm shadow-lg shadow-[#00cec9]/20 hover:scale-[1.02] transition-all"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-12 md:gap-24 text-center">
          <div>
            <div className="text-4xl font-bold text-[#00cec9] mb-1">10k+</div>
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Reports Processed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#0984e3] mb-1">98%</div>
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Analysis Accuracy</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#6c5ce7] mb-1">500+</div>
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Businesses</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#fd79a8] mb-1">24/7</div>
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">AI Availability</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto glass p-12 md:p-20 rounded-[32px] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00cec9]/10 to-transparent pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to unlock your data's potential?</h2>
          <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto">
            Join hundreds of forward-thinking analysts who are saving hours of work every week with NexusAI.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="px-10 py-5 rounded-xl bg-white text-black font-bold text-xl hover:bg-[#00cec9] hover:text-white transition-all transform hover:scale-105"
          >
            Start Analyzing for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-bold text-sm">
              N
            </div>
            <span className="font-bold">NexusAI</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact Us</a>
          </div>
          <div className="text-gray-600 text-sm">
            © 2026 NexusAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
