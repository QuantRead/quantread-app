import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans">
      {/* HERO */}
      <section className="relative pt-40 pb-24 px-6 text-center border-b border-slate-900">
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter italic uppercase italic">
          Quant<span className="text-red-500">.</span>Read
        </h1>
        <p className="mt-6 text-slate-400 max-w-xl mx-auto text-lg">
          High-performance neural RSVP interface for distraction-free consumption.
        </p>
        <div className="mt-10">
          <Link href="/reader" className="px-10 py-5 bg-red-600 hover:bg-red-500 font-black uppercase skew-x-[-12deg] inline-block">
            <span className="block skew-x-[12deg]">Launch Interface</span>
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-5xl font-black italic uppercase mb-16 italic">How It Works_</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { n: "01", t: "INITIATE", d: "Click the extension icon on any web article." },
            { n: "02", t: "TRANSFER", d: "Beam the text data directly to your neural dashboard." },
            { n: "03", t: "INTAKE", d: "Consume content via the high-speed RSVP stream." }
          ].map((step, i) => (
            <div key={i} className="p-10 bg-slate-900/30 border border-slate-800 relative group">
              <span className="text-5xl font-black text-slate-800/20 absolute top-4 right-6">{step.n}</span>
              <h3 className="text-xl font-bold mb-4">{step.t}</h3>
              <p className="text-slate-400 text-sm">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-slate-900 text-center">
        <Link href="/privacy" className="text-xs text-slate-500 hover:text-red-500 uppercase tracking-widest">Privacy Protocol</Link>
      </footer>
    </main>
  );
}