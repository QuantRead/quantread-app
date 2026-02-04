"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function ReaderPage() {
  const [text, setText] = useState("READY");
  const [fullRawText, setFullRawText] = useState("");
  const [words, setWords] = useState(["Awaiting", "Neural", "Data", "Beam..."]);
  const [index, setIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false); // New: Manual Mode
  const [manualText, setManualText] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [isAllCaps, setIsAllCaps] = useState(true);
  const [wpm, setWpm] = useState(400);
  const [showZenControls, setShowZenControls] = useState(false);

  useEffect(() => {
    const savedWpm = localStorage.getItem('quantread_wpm');
    const savedCase = localStorage.getItem('quantread_allcaps');
    if (savedWpm) setWpm(parseInt(savedWpm));
    if (savedCase) setIsAllCaps(savedCase === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('quantread_wpm', wpm.toString());
    localStorage.setItem('quantread_allcaps', isAllCaps.toString());
  }, [wpm, isAllCaps]);

  const stats = useMemo(() => {
    const total = words.length;
    const current = index;
    const progress = total > 0 ? (current / total) * 100 : 0;
    const remainingWords = total - current;
    const minutes = Math.ceil(remainingWords / (wpm || 400));
    const isComplete = index >= total && total > 5;
    return { count: total, current, progress, time: minutes, isHighSpeed: wpm >= 600, isComplete };
  }, [words, index, wpm]);

  // Handle Manual Paste
  const handleManualLoad = () => {
    if (manualText.trim()) {
      setFullRawText(manualText);
      setWords(manualText.trim().split(/\s+/));
      setIndex(0);
      setText("LOADED");
      setShowManualInput(false);
    }
  };

  const renderFixedWord = (word: string) => {
    if (!word) return null;
    const displayWord = isAllCaps ? word.toUpperCase() : word;
    const midpoint = Math.floor(displayWord.length / 2);
    const partLeft = displayWord.substring(0, midpoint);
    const pivot = displayWord.substring(midpoint, midpoint + 1);
    const partRight = displayWord.substring(midpoint + 1);

    return (
      <div className="flex w-full justify-center items-center font-black italic tracking-tighter text-white transition-all gap-x-[1px]">
        <div className="flex-1 text-right opacity-100 min-w-0 overflow-visible pr-2 md:pr-10">{partLeft}</div>
        <div className="text-red-600 scale-125 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] z-30 px-2 md:px-4 bg-[#030712]">{pivot}</div>
        <div className="flex-1 text-left opacity-100 min-w-0 overflow-visible pl-2 md:pl-10">{partRight}</div>
      </div>
    );
  };

  useEffect(() => {
    const handleBeam = (event: MessageEvent) => {
      if (event.data.type === "QUANTREAD_BEAM") {
        const newText = event.data.text;
        setFullRawText(newText);
        setWords(newText.trim().split(/\s+/));
        setHistory(prev => [`[BEAMED] ${newText.substring(0, 20)}...`, ...prev]);
        setIndex(0);
        setText("BEAMED");
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
    } else if (stats.isComplete && isActive) {
      setIsActive(false);
      setHistory(prev => [`[COMPLETE] ${words.length} WORDS @ ${wpm} WPM`, ...prev]);
    }
    return () => clearInterval(interval);
  }, [isActive, index, words, wpm, stats.isComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); setIsActive(prev => !prev); }
      if (e.code === "Escape") { setIsActive(false); setZenMode(false); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className={`min-h-screen p-4 md:p-8 transition-all duration-700 ${zenMode ? 'bg-black cursor-none landscape:fixed landscape:inset-0' : 'bg-[#030712]'}`}>
      
      {/* MOBILE LANDSCAPE TIP: Visible only on mobile portrait */}
      <div className="md:hidden fixed top-2 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-[8px] px-2 py-1 rounded-full font-bold animate-pulse portrait:block hidden">
        ROTATE FOR NEURAL DECK
      </div>

      {zenMode && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[60] flex gap-4 transition-opacity duration-500 ${showZenControls ? 'opacity-100' : 'opacity-0'}`}>
          <button onClick={() => setIsActive(!isActive)} className="px-6 py-2 glass-card text-[10px] font-mono text-white uppercase tracking-widest">Pause</button>
          <button onClick={() => setZenMode(false)} className="px-6 py-2 glass-card text-[10px] font-mono text-white uppercase tracking-widest">Exit Zen</button>
        </div>
      )}

      {!zenMode && (
        <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 text-white gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Quant<span className="text-red-500">.</span>Read</h1>
            <span className="text-[9px] font-mono text-slate-500 tracking-[0.4em] uppercase">Experimental Speed Deck</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setShowManualInput(!showManualInput)} className="px-4 py-2 glass-card text-[10px] font-mono uppercase tracking-widest hover:text-red-500">Input</button>
            <button onClick={() => setIsAllCaps(!isAllCaps)} className="px-4 py-2 glass-card text-[10px] font-mono uppercase tracking-widest hover:text-red-500">Case</button>
            <div className="flex items-center glass-card px-4 py-1 gap-2">
               <input type="range" min="100" max="1000" step="50" value={wpm} onChange={(e) => setWpm(parseInt(e.target.value))} className="w-16 md:w-24 accent-red-600" />
               <span className="text-[10px] font-mono w-10">{wpm}</span>
            </div>
            <button onClick={() => setZenMode(true)} className="px-4 py-2 glass-card text-[10px] font-mono uppercase tracking-widest hover:text-red-500">Zen</button>
          </div>
        </header>
      )}

      <div className={`max-w-7xl mx-auto grid ${zenMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'} gap-8 transition-all`}>
        {!zenMode && (
          <aside className="hidden md:block md:col-span-3">
            <div className="text-[10px] font-mono text-red-500 tracking-widest uppercase mb-4 px-2">Neural History & Logs</div>
            <div className="glass-card p-6 h-[450px] overflow-y-auto space-y-4">
              {history.map((h, i) => (
                <div key={i} className="text-[9px] font-mono border-b border-white/5 pb-2 uppercase text-slate-500">{h}</div>
              ))}
            </div>
          </aside>
        )}

        <section className={`${zenMode ? 'fixed inset-0 flex items-center justify-center' : 'col-span-1 md:col-span-9'}`}>
          <div className={`glass-card neural-glow aspect-video flex items-center justify-center relative overflow-hidden transition-all ${zenMode ? 'w-full h-full rounded-none border-none' : ''}`}>
            
            {/* MANUAL INPUT OVERLAY */}
            {showManualInput && (
              <div className="absolute inset-0 z-50 bg-[#030712]/95 p-6 md:p-12 animate-in fade-in">
                <textarea 
                  className="w-full h-4/5 bg-transparent border border-white/10 rounded-xl p-4 font-mono text-sm text-white focus:outline-none focus:border-red-600"
                  placeholder="PASTE TEXT OR PDF CONTENT HERE..."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                />
                <button onClick={handleManualLoad} className="mt-4 w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest">Load Manual Data</button>
              </div>
            )}

            <div className="absolute top-4 right-4 md:top-8 md:right-10 text-right z-20">
                <div className="text-xl md:text-2xl font-black text-red-500">{stats.time} <span className="text-[10px] text-white uppercase">Min</span></div>
            </div>

            <div className="absolute bottom-4 left-4 md:bottom-8 md:right-10 z-20">
                <div className="text-lg md:text-xl font-bold text-white">{stats.current} / {stats.count}</div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${stats.progress}%` }} />
            </div>

            <div className={`relative w-full px-4 transition-all ${zenMode ? 'text-7xl md:text-[14rem]' : 'text-5xl md:text-9xl'}`}>
              {renderFixedWord(text)}
            </div>
          </div>
          
          {!zenMode && (
            <div className="mt-8 flex justify-center gap-4">
              <button onClick={() => setIsActive(!isActive)} className="w-full md:w-auto px-16 py-5 bg-red-600 text-white font-black uppercase tracking-[0.2em] skew-x-[-12deg] active:scale-95 transition-all">
                <span className="block skew-x-[12deg]">{isActive ? "Stop" : "Initiate"}</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}