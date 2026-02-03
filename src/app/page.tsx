"use client";

import React, { useState, useEffect, useRef } from 'react';

let pdfjsLib: any = null;

const QuantRead = () => {
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zenMode, setZenMode] = useState(true);
  const [wpm, setWpm] = useState(300);
  const [history, setHistory] = useState<string[]>([]);
  const [isLibReady, setIsLibReady] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const tokensRemaining = tokens.length - currentIndex;
  const minutesLeft = Math.ceil(tokensRemaining / wpm);

  useEffect(() => {
    const initApp = async () => {
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      setIsLibReady(true);
      const saved = localStorage.getItem('quantread_history');
      if (saved) setHistory(JSON.parse(saved));

      const params = new URLSearchParams(window.location.search);
      const sharedText = params.get('text');
      if (sharedText) {
        setText(decodeURIComponent(sharedText));
        window.history.replaceState({}, document.title, "/");
        readerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    initApp();
  }, []);

  const handleStart = () => {
    if (tokens.length === 0 || text !== tokens.join(" ")) {
      const splitTokens = text.split(/\s+/).filter(t => t.length > 0);
      setTokens(splitTokens);
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && currentIndex < tokens.length) {
      const interval = (60 / wpm) * 1000;
      timerRef.current = setTimeout(() => setCurrentIndex(prev => prev + 1), interval);
    } else if (currentIndex >= tokens.length && tokens.length > 0) {
      setIsPlaying(false);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentIndex, tokens, wpm]);

  const renderWord = (word: string) => {
    const centerIndex = Math.floor(word.length / 2);
    return (
      <div className="text-5xl md:text-8xl font-mono tracking-tight flex justify-center items-center text-slate-100">
        <span className="text-right flex-1 opacity-20">{word.slice(0, centerIndex)}</span>
        <span className="text-red-500 font-bold px-1 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">{word[centerIndex]}</span>
        <span className="text-left flex-1 opacity-20">{word.slice(centerIndex + 1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-red-500/30">
      
      {/* 1. HERO SECTION WITH EXTENSION LINK */}
      {(!isPlaying || !zenMode) && (
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-10">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
              QUANT<span className="text-red-500 text-7xl md:text-9xl">.</span>READ
            </h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.8em] font-bold">Overclock Your Intellect</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => readerRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-red-600 hover:bg-red-500 text-white font-black px-12 py-5 rounded-2xl shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              Enter Interface
            </button>
            {/* The Missing Extension Link */}
            <a 
              href="https://github.com/YourUsername/quantread-extension" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 border border-slate-800 text-slate-400 font-bold px-10 py-5 rounded-2xl hover:text-white hover:border-red-500/50 transition-all text-xs uppercase tracking-widest"
            >
              Get Chrome Extension
            </a>
          </div>

          <div className="max-w-md pt-10 border-t border-slate-900">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Mobile Support</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Save as bookmark: <br/>
              <code className="text-red-500/80 break-all select-all text-[9px] font-mono">javascript:window.open('https://quantread-app.vercel.app/?text='+encodeURIComponent(window.getSelection().toString()||document.body.innerText));</code>
            </p>
          </div>
        </section>
      )}

      {/* 2. MAIN INTERFACE */}
      <div ref={readerRef} className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-12 pt-24 min-h-screen">
        
        <aside className={`lg:col-span-1 space-y-6 ${(isPlaying && zenMode) ? 'opacity-0 pointer-events-none' : 'opacity-100 transition-opacity duration-700'}`}>
          <div className="bg-slate-900/20 border border-slate-800/50 p-6 rounded-[2rem]">
            <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Neural Logs</h2>
            <div className="space-y-3 text-[10px] text-slate-500">
              {history.map((item, i) => <div key={i} className="truncate">{item}</div>)}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-10 pb-32">
          {/* Reader Display */}
          <div className={`relative w-full aspect-video bg-slate-900/20 border border-slate-800 rounded-[3rem] shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-700 ${isPlaying ? 'scale-110 border-red-500/20 shadow-red-500/10' : ''}`}>
            <div className="absolute top-0 left-0 h-1 bg-red-600 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.5)]" style={{ width: `${(currentIndex / tokens.length) * 100}%` }} />
            
            {/* Stats Overlay */}
            {isPlaying && (
              <div className="absolute bottom-6 w-full px-10 flex justify-between items-center animate-in fade-in duration-500">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{tokensRemaining} words left</span>
                <span className="text-[10px] font-mono text-red-500/80 uppercase tracking-widest">{minutesLeft}m left</span>
              </div>
            )}

            {isPlaying ? renderWord(tokens[currentIndex]) : (
               <span className="text-[10px] text-slate-700 font-black uppercase tracking-[0.6em]">Awaiting Stream</span>
            )}
          </div>

          {/* Controls Panel */}
          <section className={`space-y-8 bg-slate-900/20 p-8 md:p-12 rounded-[3rem] border border-slate-800/50 transition-all duration-1000 ${(isPlaying && zenMode) ? 'opacity-0 translate-y-20 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex justify-between items-center mb-2">
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Interface Settings</span>
               <label className="flex items-center gap-3 cursor-pointer group">
                  <span className="text-[9px] font-black text-slate-500 group-hover:text-red-500 transition-colors uppercase tracking-widest text-right">Zen Focus Mode</span>
                  <input type="checkbox" checked={zenMode} onChange={() => setZenMode(!zenMode)} className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-red-600 focus:ring-red-500" />
               </label>
            </div>

            <textarea
              className="w-full h-48 bg-[#020617] border border-slate-800 rounded-[2rem] p-8 outline-none resize-none text-slate-400 font-mono text-xs leading-relaxed"
              placeholder="PASTE DATA OR BEAM CONTENT..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex flex-wrap justify-between items-center gap-6 border-t border-slate-800/50 pt-8">
              <div className="flex gap-10">
                <div>
                  <span className="text-[9px] font-black text-slate-600 uppercase block mb-2">Speed (WPM)</span>
                  <input type="number" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="bg-transparent text-4xl font-mono text-red-500 outline-none w-28" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-600 uppercase block mb-2 tracking-widest">Volume</span>
                  <span className="text-4xl font-mono text-slate-300">{wordCount}</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                {isPlaying ? (
                  <button onClick={() => setIsPlaying(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-black px-12 py-5 rounded-2xl transition-all uppercase tracking-widest text-xs">
                    Pause Stream
                  </button>
                ) : (
                  <button onClick={handleStart} className="bg-red-600 hover:bg-red-500 text-white font-black px-16 py-5 rounded-2xl shadow-2xl transition-all uppercase tracking-widest text-xs">
                    {currentIndex > 0 ? "Resume" : "Execute"}
                  </button>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Persistent Floating Controls (Playing) */}
      {isPlaying && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-4 animate-in slide-in-from-bottom-10 duration-500">
          <button onClick={() => setIsPlaying(false)} className="px-10 py-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full text-[10px] font-black tracking-[0.4em] text-slate-400 hover:text-red-500 shadow-2xl transition-all">
            PAUSE
          </button>
          <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="px-6 py-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full text-[10px] font-black tracking-[0.4em] text-slate-700 hover:text-white shadow-2xl transition-all">
            RESET
          </button>
        </div>
      )}
    </div>
  );
};

export default QuantRead;