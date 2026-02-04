import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans selection:bg-red-500/30">
      
      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 px-6 text-center border-b border-slate-900">
        <div className="max-w-6xl mx-auto space-y-10">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter italic uppercase leading-none">
            Quant<span className="text-red-500">.</span>Read
          </h1>
          <p className="max-w-xl mx-auto text-slate-400 text-lg">
            High-performance neural RSVP interface.
          </p>
          <div className="pt-6">
            <Link 
              href="/reader" 
              className="px-10 py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest transition-all skew-x-[-12deg] inline-block"
            >
              <span className="block skew-x-[12deg]">Launch Interface</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 text-center opacity-50">
        <Link href="/privacy" className="text-xs uppercase tracking-widest hover:text-red-500">Privacy Protocol</Link>
      </footer>
    </main>
  );
}