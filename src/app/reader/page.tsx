"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function ReaderPage() {
  const [text, setText] = useState("SYSTEM ONLINE");
  const [words, setWords] = useState(["Awaiting", "Neural", "Data", "Beam..."]);
  const [index, setIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [isAllCaps, setIsAllCaps] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [wpm, setWpm] = useState(400);

  const stats = useMemo(() => {
    const total = words.length;
    const current = index;
    const progress = total > 0 ? (current / total) * 100 : 0;
    const remainingWords = total - current;
    const minutes = Math.ceil(remainingWords / (wpm || 400));
    return { 
        count: total, 
        current, 
        progress, 
        time: minutes, 
        isHighSpeed: wpm >= 600,
        tier: wpm >= 800 ? "HYPERSONIC" : wpm >= 500 ? "SUPER-SONIC" : "SUB-SONIC"
    };
  }, [words, index, wpm]);

  // ACHIEVEMENT SYSTEM: Logs milestones to History
  const logAchievement = (message: string) => {
    setHistory(prev => [`[ACHIEVEMENT] ${message}`, ...prev]);
  };

  const renderFixedWord = (word: string) => {
    if (!word) return null;
    const displayWord = isAllCaps ? word.toUpperCase() : word;
    const midpoint = Math.floor(displayWord.length / 2);
    const partLeft = displayWord.substring(0, midpoint);
    const pivot = displayWord.substring(midpoint, midpoint + 1);
    const partRight = displayWord.substring(midpoint + 1);

    return (
      <div className={`flex w-full justify-center items-center font-black italic tracking-tighter text-white transition-all ${isAllCaps ? 'uppercase' : ''} ${stats.isHighSpeed && isActive ? 'animate-pulse' : ''}`}>
        <div className={`w-1/2 text-right pr-[2px] opacity-80 ${stats.isHighSpeed && isActive ? 'blur-[0.5px]' : ''}`}>{partLeft}</div>
        <div className="text-red-600 scale-125 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] z-30">{pivot}</div>
        <div className={`w-1/2 text-left pl-[2px] opacity-80 ${stats.isHighSpeed && isActive ? 'blur-[0.5px]' : ''}`}>{partRight}</div>
      </div>
    );
  };

  useEffect(() => {
    const handleBeam = (event: MessageEvent) => {
      if (event.data.type === "QUANTREAD_BEAM") {
        const newText = event.data.text;
        setWords(newText.trim().split(/\s+/));
        setHistory(prev => [`[BEAM RECEIVED] ${newText.substring(0, 20)}...`, ...prev]);
        setIndex(0);
        setText("BEAM RECEIVED");
        window.focus(); 
      }
    };
    window.addEventListener("message", handleBeam);
    return () => window.removeEventListener("message", handleBeam);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && index < words.length) {
      const ms = (60 / wpm) * 1000;
      interval = setInterval(() => {
        setText(words[index]);
        setIndex(prev => prev + 1);
      }, ms);
    } else if (index >= words.length && words.length > 5) { // Ensure it was a real session
      setIsActive(false);
      logAchievement(`SESSION COMPLETE: ${words.length} WORDS @ ${wpm} WPM (${stats.tier})`);
    }
    return () => clearInterval(interval);
  }, [isActive, index, words, wpm, stats.tier]);

  return (
    <main className={`min-h-screen p-8 transition-all duration-700 ${zenMode ? 'bg-black' : 'bg-[#030712]'}`}>
      {!zenMode && (
        <header className="max-w-7xl mx-auto flex justify-between items-start mb-8 text-white">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Quant<span className="text-red-500">.</span>Read</h1>
            <span className="text-[9px] font-mono text-slate-500 tracking-[0.4em] uppercase">Experimental Speed Deck</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setIsAllCaps(!isAllCaps)} className="px-4 py-2 glass-card text-[10px] font-mono uppercase tracking-widest hover:text-red-500 transition-all">Case: {isAllCaps ? "All" : "Std"}</button>
            <div className="flex items-center glass-card px-4 py-1 gap-4">
               <input type="range" min="100" max="1000" step="50" value={wpm} onChange={(e) => setWpm(parseInt(e.target.value))} className="w-24 accent-red-600 cursor-pointer" />
               <span className={`text-[10px] font-mono w-12 transition-colors ${stats.isHighSpeed ? 'text-red-500 font-bold' : 'text-white'}`}>{wpm} WPM</span>
            </div>
            <button onClick={() => setZenMode(!zenMode)} className="px-4 py-2 glass-card text-[10px] font-mono uppercase tracking-widest hover:text-red-500">Zen: {zenMode ? "ON" : "OFF"}</button>
            <Link href="/" className="px-4 py-2 glass-card text-[10px] font-mono uppercase tracking-widest hover:text-red-500">Exit</Link>
          </div>
        </header>
      )}

      <div className={`max-w-7xl mx-auto grid ${zenMode ? 'grid-cols-1' : 'grid-cols-12'} gap-8 transition-all`}>
        {!zenMode && (
          <aside className="col-span-3">
            <div className="text-[10px] font-mono text-red-500 tracking-widest uppercase mb-4 px-2">Neural History & Logs</div>
            <div className="glass-card p-6 h-[450px] overflow-y-auto space-y-4">
              {history.map((h, i) => (
                <div key={i} className={`text-[9px] font-mono border-b border-white/5 pb-2 uppercase ${h.includes('ACHIEVEMENT') ? 'text-red-400' : 'text-slate-500'}`}>{h}</div>
              ))}
            </div>
          </aside>
        )}

        <section className={`${zenMode ? 'fixed inset-0 flex items-center justify-center' : 'col-span-9'}`}>
          <div className={`glass-card neural-glow aspect-video flex items-center justify-center relative overflow-hidden transition-all ${zenMode ? 'w-full h-full rounded-none border-none' : ''} ${stats.isHighSpeed && isActive ? 'shadow-[0_0_60px_rgba(220,38,38,0.2)]' : ''}`}>
            
            <div className="absolute top-8 right-10 text-right z-20">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Est. Completion</div>
                <div className={`text-2xl font-black transition-colors ${stats.isHighSpeed ? 'text-red-600' : 'text-red-500'}`}>{stats.time} <span className="text-[10px] text-white uppercase">Min</span></div>
            </div>

            <div className="absolute bottom-8 left-10 z-20">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{stats.tier} INTERFACE</div>
                <div className="text-xl font-bold text-white">{stats.current} / {stats.count} <span className="text-[8px] text-slate-600 uppercase">Words</span></div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                <div className={`h-full transition-all duration-300 ${stats.isHighSpeed ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'bg-red-600'}`} style={{ width: `${stats.progress}%` }} />
            </div>

            {stats.isHighSpeed && isActive && (
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] animate-pulse z-40" />
            )}

            <div className={`relative w-full transition-all ${zenMode ? 'text-8xl md:text-[14rem]' : 'text-6xl md:text-9xl'}`}>
              {renderFixedWord(text)}
            </div>

            {zenMode && (
              <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-[0.5em] uppercase ${stats.isHighSpeed ? 'text-red-500' : 'text-slate-700'}`}>
                {isActive ? "NEURAL LINK ACTIVE" : "LINK PAUSED"} | SPACE: TOGGLE | ESC: EXIT
              </div>
            )}
          </div>
          
          {!zenMode && (
            <div className="mt-8 flex justify-center">
              <button onClick={() => setIsActive(!isActive)} className="px-16 py-5 bg-red-600 text-white font-black uppercase tracking-[0.2em] skew-x-[-12deg] active:scale-95 transition-all">
                <span className="block skew-x-[12deg]">{isActive ? "Terminate" : "Initiate"}</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}