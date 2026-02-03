"use client";

import React, { useState, useEffect, useRef } from 'react';

let pdfjsLib: any = null;

const QuantRead = () => {
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [history, setHistory] = useState<string[]>([]);
  const [isLibReady, setIsLibReady] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const minutesLeft = Math.ceil((tokens.length - currentIndex) / wpm);

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

  const startReader = () => {
    const splitTokens = text.split(" ").filter(t => t.length > 0);
    if (splitTokens.length > 0) {
      setTokens(splitTokens);
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isPlaying && currentIndex < tokens.length) {
      const interval = (60 / wpm) * 1000;
      timerRef.current = setTimeout(() => setCurrentIndex(prev => prev + 1), interval);
    } else if (currentIndex >= tokens.length) {
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
      
      {/* 1. UPDATED LANDING HERO */}
      {!isPlaying && (
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
            <a 
              href="https://github.com/YourUsername/quantread-extension" 
              target="_blank"
              className="bg-slate-900 border border-slate-800 text-slate-400 font-bold px-10 py-5 rounded-2xl hover:text-white hover:border-red-500/50 transition-all text-xs uppercase tracking-widest"
            >
              Get Extension
            </a>
          </div>

          {/* Mobile Beaming Instructions */}
          <div className="max-w-md pt-10 border-t border-slate-900">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Mobile Support</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              To "Beam" from mobile: Save a bookmark with this URL: <br/>
              <code className="text-red-500/80 break-all select-all">javascript:window.open('https://quantread-app.vercel.app/?text='+encodeURIComponent(window.getSelection().toString()||document.body.innerText));</code>
            </p>
          </div>
        </section>
      )}

      {/* 2. MAIN APP INTERFACE */}
      <div ref={readerRef} className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-12 pt-24">
        
        <aside className={`lg:col-span-1 space-y-6 ${isPlaying ? 'opacity-0' : 'opacity-100 transition-opacity duration-700'}`}>
          <div className="bg-slate-900/20 border border-slate-800/50 p-6 rounded-[2rem]">
            <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">System Stats</h2>
            <div className="space-y-4">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Volume</span>
                <span className="text-xl font-mono text-slate-300">{wordCount} <small className="text-[9px]">WORDS</small></span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Completion</span>
                <span className="text-xl font-mono text-red-500">{isPlaying ? minutesLeft : 0} <small className="text-[9px]">MIN</small></span>
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-10 pb-32">
          {/* Reader Display */}
          <div className={`relative w-full aspect-video bg-slate-900/20 border border-slate-800 rounded-[3rem] shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-700 ${isPlaying ? 'scale-110 border-red-500/20' : ''}`}>
            <div className="absolute top-0 left-0 h-1 bg-red-600 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.5)]" style={{ width: `${(currentIndex / tokens.length) * 100}%` }} />
            {isPlaying ? renderWord(tokens[currentIndex]) : (
               <span className="text-[10px] text-slate-700 font-black uppercase tracking-[0.6em] animate-pulse">Neural Link Ready</span>
            )}
          </div>

          <section className={`space-y-8 bg-slate-900/20 p-8 md:p-12 rounded-[3rem] border border-slate-800/50 transition-all duration-1000 ${isPlaying ? 'opacity-0 translate-y-20' : 'opacity-100'}`}>
            <textarea
              className="w-full h-56 bg-[#020617] border border-slate-800 rounded-[2.5rem] p-8 outline-none resize-none text-slate-400 font-mono text-xs leading-relaxed"
              placeholder="PASTE DATA OR BEAM FROM EXTENSION..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex flex-wrap justify-between items-center gap-6 border-t border-slate-800/50 pt-8">
              <div>
                <span className="text-[9px] font-black text-slate-600 uppercase block mb-2">Speed (WPM)</span>
                <input type="number" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="bg-transparent text-4xl font-mono text-red-500 outline-none w-28" />
              </div>
              <button onClick={startReader} className="bg-red-600 hover:bg-red-500 text-white font-black px-20 py-6 rounded-[2rem] shadow-2xl shadow-red-900/40 transition-all active:scale-95 text-sm uppercase tracking-[0.3em]">
                Execute
              </button>
            </div>
          </section>
        </main>
      </div>

      <button onClick={() => setIsPlaying(false)} className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-12 py-4 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black tracking-[0.4em] text-slate-500 hover:text-red-500 transition-all shadow-2xl ${isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        ABORT
      </button>
    </div>
  );
};

export default QuantRead;