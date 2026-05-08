import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white overflow-x-hidden">
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
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 font-bold text-lg hover:bg-white/10 transition-all">
              Watch Demo
            </button>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative animate-slide-in-up">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00cec9] to-[#0984e3] rounded-2xl blur opacity-20" />
            <div className="relative bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=1200&h=600" 
                alt="Dashboard Preview" 
                className="w-full opacity-60 mix-blend-luminosity"
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
