"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReaderPage() {
  const [text, setText] = useState("SYSTEM ONLINE");
  const [words, setWords] = useState(["Awaiting", "Neural", "Data", "Beam..."]);
  const [index, setIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // 1. BEAM PROTOCOL: Listen for extension data
  useEffect(() => {
    const handleBeam = (event: MessageEvent) => {
      if (event.data.type === "QUANTREAD_BEAM") {
        const newText = event.data.text;
        setWords(newText.split(/\s+/));
        setHistory(prev => [newText.substring(0, 30) + "...", ...prev]);
        setIndex(0);
        setText("BEAM RECEIVED");
      }
    };
    window.addEventListener("message", handleBeam);
    return () => window.removeEventListener("message", handleBeam);
  }, []);

  // 2. RSVP ENGINE
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && index < words.length) {
      interval = setInterval(() => {
        setText(words[index]);
        setIndex(prev => prev + 1);
      }, 150); // ~400 WPM
    } else if (index >= words.length) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, index, words]);

  return (
    <main className={`min-h-screen transition-all duration-700 bg-[#030712] p-8 ${zenMode ? 'bg-black' : ''}`}>
      
      {/* HEADER SECTION */}
      {!zenMode && (
        <header className="max-w-7xl mx-auto flex justify-between items-start mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Quant<span className="text-red-500">.</span>Read</h1>
            <span className="text-[9px] font-mono text-slate-500 tracking-[0.4em] uppercase">Experimental Speed Deck</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setZenMode(!zenMode)} className="px-4 py-2 glass-card text-[10px] font-mono uppercase tracking-widest hover:text-red-500 transition-all">
              Zen Mode: {zenMode ? "ON" : "OFF"}
            </button>
            <Link href="/" className="px-4 py-2 glass-card text-[10px] font-mono uppercase tracking-widest hover:text-red-500">Exit</Link>
          </div>
        </header>
      )}

      <div className={`max-w-7xl mx-auto grid ${zenMode ? 'grid-cols-1' : 'grid-cols-12'} gap-8 transition-all duration-500`}>
        
        {/* LEFT: NEURAL HISTORY */}
        {!zenMode && (
          <aside className="col-span-3 space-y-4">
            <div className="text-[10px] font-mono text-red-500 tracking-widest uppercase mb-4">Neural History</div>
            <div className="glass-card p-6 h-[400px] overflow-y-auto space-y-4">
              {history.length > 0 ? history.map((h, i) => (
                <div key={i} className="text-xs text-slate-500 font-mono border-b border-white/5 pb-2">{h}</div>
              )) : (
                <div className="text-xs text-slate-500 font-mono italic animate-pulse">Awaiting data logs...</div>
              )}
            </div>
          </aside>
        )}

        {/* CENTER: PRIMARY RSVP INTERFACE */}
        <section className={`${zenMode ? 'fixed inset-0 z-50 flex items-center justify-center p-0' : 'col-span-9'}`}>
          <div className={`glass-card neural-glow aspect-video flex items-center justify-center relative overflow-hidden transition-all duration-500 ${zenMode ? 'w-full h-full rounded-none border-none' : ''}`}>
            {/* Visual Pulse */}
            <div className="absolute w-2 h-2 bg-red-600 rounded-full top-8 left-1/2 -translate-x-1/2 animate-ping" />
            
            <h2 className={`font-black italic uppercase tracking-tighter transition-all duration-300 ${zenMode ? 'text-8xl md:text-[12rem]' : 'text-5xl md:text-8xl'}`}>
              {text}
            </h2>

            {/* Deck Overlays */}
            <div className="absolute bottom-8 text-[10px] font-mono text-slate-500 tracking-[0.5em] uppercase">SYSTEM ONLINE</div>
          </div>
        </section>
      </div>

      {/* SOURCE INPUT SECTION */}
      {!zenMode && (
        <section className="max-w-7xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-4">
              <div className="w-8 h-[1px] bg-red-500/50" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Source Input</span>
            </div>
            <button className="px-4 py-2 glass-card text-[10px] font-bold uppercase tracking-widest bg-slate-800/40 hover:bg-slate-700 transition-all">Upload Document</button>
          </div>
          <div className="glass-card p-8 min-h-[150px] relative group">
            <textarea 
              placeholder="PASTE MANUSCRIPT OR UPLOAD PDF FOR PROCESSING..."
              className="w-full bg-transparent border-none focus:ring-0 text-slate-500 font-mono text-xs leading-relaxed resize-none h-32 uppercase"
              onChange={(e) => setWords(e.target.value.split(/\s+/))}
            />
            <button 
              onClick={() => setIsActive(!isActive)}
              className="absolute bottom-6 right-6 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest skew-x-[-12deg] transition-all"
            >
              <span className="block skew-x-[12deg]">{isActive ? "Stop" : "Process Beam"}</span>
            </button>
          </div>
        </section>
      )}
    </main>
  );
}