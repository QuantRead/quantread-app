import React from 'react';
import Link from 'next/link';

const steps = [
  { num: "01", label: "INTERFACE", title: "INITIATE BEAM", desc: "Click the QuantRead icon on any article to prepare extraction." },
  { num: "02", label: "TRANSFER", title: "BEAM CONTENT", desc: "Hit 'BEAM TEXT' to transmit data to your neural environment." },
  { num: "03", label: "EXECUTE", title: "INTAKE DATA", desc: "The RSVP reader activates for maximum focus and retention." }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans selection:bg-red-500/30">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-8">
          <div className="inline-block px-4 py-1 border border-red-500/30 bg-red-500/10 rounded-full">
            <p className="text-red-500 font-mono text-[10px] uppercase tracking-[0.4em]">Neural Interface v1.0.4 Online</p>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">
            Quant<span className="text-red-500">.</span>Read
          </h1>
          <p className="max-w-xl mx-auto text-slate-400 text-lg leading-relaxed">
            Overclock your intake. A high-performance RSVP interface designed for distraction-free consumption.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
            <button className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest transition-all skew-x-[-12deg]">
              <span className="block skew-x-[12deg]">Get Extension</span>
            </button>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION (WITH ID FOR ANCHOR LINKING) --- */}
      <section id="how-it-works" className="py-24 bg-[#020617] text-white border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6 text-left">
          <div className="mb-20 space-y-2">
            <p className="text-red-500 font-mono text-xs tracking-[0.4em] uppercase">Deployment Protocol</p>
            <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white">How It Works<span className="text-red-500">_</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="group relative p-8 bg-slate-900/40 border border-slate-800 hover:border-red-500/50 transition-all duration-500">
                <div className="absolute top-4 right-6 text-7xl font-black text-white/5 group-hover:text-red-500/10 transition-colors">{step.num}</div>
                <div className="relative z-10">
                  <span className="text-[10px] font-mono text-red-500 tracking-[0.3em] uppercase block mb-4">{step.label}</span>
                  <h3 className="text-xl font-bold mb-4 tracking-tight text-white">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-red-500 group-hover:w-full transition-all duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-slate-900 bg-[#010409]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-left">
          <div className="font-black tracking-tighter text-xl text-white">QUANT<span className="text-red-500">.</span>READ</div>
          
          <div className="flex gap-8 text-xs font-mono uppercase tracking-widest text-slate-500">
            {/* Added Link to Jump to the Section */}
            <Link href="#how-it-works" className="hover:text-red-500 transition-colors uppercase">How It Works</Link>
            <Link href="/privacy" className="hover:text-red-500 transition-colors uppercase">Privacy Protocol</Link>
          </div>
          
          <div className="text-[10px] text-slate-700 font-mono uppercase tracking-widest">© 2026 QUANTREAD SYSTEMS.</div>
        </div>
      </footer>
    </main>
  );
}