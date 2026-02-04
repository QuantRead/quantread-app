"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function ReaderPage() {
  const [text, setText] = useState("SYSTEM ONLINE");
  const [words, setWords] = useState(["Awaiting", "Neural", "Data", "Beam..."]);
  const [index, setIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [wpm, setWpm] = useState(400);

  const stats = useMemo(() => {
    const total = words.length;
    const current = index;
    const progress = total > 0 ? (current / total) * 100 : 0;
    const remainingWords = total - current;
    const minutes = Math.ceil(remainingWords / (wpm || 400));
    return { count: total, current, progress, time: minutes };
  }, [words, index, wpm]);

  // ORP RED LETTERING: Centers focus on the middle character
  const renderWord = (word: string) => {
    if (!word) return "";
    const midpoint = Math.floor(word.length / 2);
    return (
      <>
        {word.substring(0, midpoint)}
        <span className="text-red-600">{word.substring(midpoint, midpoint + 1)}</span>
        {word.substring(midpoint + 1)}
      </>
    );
  };

  useEffect(() => {
    const handleBeam = (event: MessageEvent) => {
      if (event.data.type === "QUANTREAD_BEAM") {
        const newText = event.data.text;
        setWords(newText.trim().split(/\s+/));
        setHistory(prev => [newText.substring(0, 40) + "...", ...prev]);
        setIndex(0);
        setText("BEAM RECEIVED");
        window.focus(); 
      }
    };
    window.addEventListener("message", handleBeam);
    // Notify the extension that the page is ready for data
    window.parent.postMessage({ type: "READER_READY" }, "*");
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
    } else if (index >= words.length) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, index, words, wpm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); setIsActive(prev => !prev); }
      if (e.code === "Escape" && zenMode) { setZenMode(false); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zenMode]);

  return (
    <main className={`min-h-screen p-8 transition-all duration-700 ${zenMode ? 'bg-black' : 'bg-[#030712]'}`}>
      {!zenMode && (
        <header className="max-w-7xl mx-auto flex justify-between items-start mb-8 text-white">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Quant<span className="text-red-500">.</span>Read</h1>
            <span className="text-[9px] font-mono text-slate-500 tracking-[0.4em] uppercase">Experimental Speed Deck</span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center glass-card px-4 py-1 gap-4">
               <input type="range" min="100" max="1000" step="50" value={wpm} onChange={(e) => setWpm(parseInt(e.target.value))} className="w-24 accent-red-600 cursor-pointer" />
               <span className="text-[10px] font-mono w-12">{wpm} WPM</span>
            </div>
            <button onClick={() => setZenMode(!zenMode)} className="px-4 py-2 glass-card text-[10px] font-mono uppercase tracking-widest hover:text-red-500">Zen: {zenMode ? "ON" : "OFF"}</button>
            <Link href="/" className="px-4 py-2 glass-card text-[10px] font-mono uppercase tracking-widest hover:text-red-500">Exit</Link>
          </div>
        </header>
      )}

      <div className={`max-w-7xl mx-auto grid ${zenMode ? 'grid-cols-1' : 'grid-cols-12'} gap-8`}>
        {!zenMode && (
          <aside className="col-span-3">
            <div className="text-[10px] font-mono text-red-500 tracking-widest uppercase mb-4 px-2">Neural History</div>
            <div className="glass-card p-6 h-[450px] overflow-y-auto space-y-4">
              {history.map((h, i) => (
                <div key={i} className="text-[10px] text-slate-500 font-mono border-b border-white/5 pb-2 uppercase">{h}</div>
              ))}
            </div>
          </aside>
        )}

        <section className={`${zenMode ? 'fixed inset-0 flex items-center justify-center' : 'col-span-9'}`}>
          <div className={`glass-card neural-glow aspect-video flex items-center justify-center relative overflow-hidden ${zenMode ? 'w-full h-full rounded-none border-none' : ''}`}>
            <div className="absolute top-8 right-10 text-right z-20">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Est. Completion</div>
                <div className="text-2xl font-black text-red-500">{stats.time} <span className="text-[10px] text-white uppercase">Min</span></div>
            </div>
            <div className="absolute bottom-8 left-10 z-20">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Data Volume</div>
                <div className="text-xl font-bold text-white">{stats.current} / {stats.count} <span className="text-[8px] text-slate-600 uppercase">Words</span></div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                <div className="h-full bg-red-600 transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${stats.progress}%` }} />
            </div>
            <h2 className={`font-black italic uppercase tracking-tighter text-white text-center px-4 z-10 ${zenMode ? 'text-8xl md:text-[14rem]' : 'text-6xl md:text-9xl'}`}>
              {renderWord(text)}
            </h2>
            {zenMode && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-700 tracking-[0.5em] uppercase">
                {isActive ? "ACTIVE" : "PAUSED"} | SPACE: TOGGLE | ESC: EXIT
              </div>
            )}
          </div>
          <div className="mt-8 flex justify-center">
            <button onClick={() => setIsActive(!isActive)} className="px-16 py-5 bg-red-600 text-white font-black uppercase tracking-[0.2em] skew-x-[-12deg] active:scale-95 transition-all">
              <span className="block skew-x-[12deg]">{isActive ? "Stop" : "Initiate"}</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}