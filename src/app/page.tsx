"use client";

import React, { useState, useEffect, useRef } from 'react';

// We define a variable to hold the library after it loads in the browser
let pdfjsLib: any = null;

const QuantRead = () => {
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [history, setHistory] = useState<string[]>([]);
  const [isLibReady, setIsLibReady] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize library and load history ONLY on the client
  useEffect(() => {
    const initApp = async () => {
      // Dynamic import prevents the Vercel "DOMMatrix" error
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      setIsLibReady(true);

      const saved = localStorage.getItem('quantread_history');
      if (saved) setHistory(JSON.parse(saved));
    };
    initApp();
  }, []);

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const progress = tokens.length > 0 ? (currentIndex / tokens.length) * 100 : 0;
  const minutesLeft = Math.ceil((tokens.length - currentIndex) / wpm);

  const saveToHistory = (name: string) => {
    const newEntry = `${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${name}`;
    const updatedHistory = [newEntry, ...history.slice(0, 4)];
    setHistory(updatedHistory);
    localStorage.setItem('quantread_history', JSON.stringify(updatedHistory));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isLibReady) return;

    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => item.str).join(" ") + " ";
      }
      setText(fullText);
      saveToHistory(file.name);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target?.result as string);
        saveToHistory(file.name);
      };
      reader.readAsText(file);
    }
  };

  const startReader = () => {
    const splitTokens = text.split(/\s+/).filter(t => t.length > 0);
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
      <div className="text-5xl md:text-7xl font-mono tracking-tight flex justify-center items-center text-slate-100">
        <span className="text-right flex-1 opacity-20">{word.slice(0, centerIndex)}</span>
        <span className="text-red-500 font-bold px-1 drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]">{word[centerIndex]}</span>
        <span className="text-left flex-1 opacity-20">{word.slice(centerIndex + 1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-4 md:p-8 selection:bg-red-500/30">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar: History & Stats */}
        <aside className={`lg:col-span-1 space-y-6 transition-all duration-700 ${isPlaying ? 'opacity-0 -translate-x-10' : 'opacity-100'}`}>
          <div>
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Neural History</h2>
            <div className="space-y-2">
              {history.length > 0 ? history.map((item, i) => (
                <div key={i} className="p-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl text-[10px] text-slate-400 truncate hover:border-red-500/30 transition-all cursor-default">
                  {item}
                </div>
              )) : <div className="text-[10px] text-slate-800 italic p-4 border border-dashed border-slate-900 rounded-2xl">Awaiting data logs...</div>}
            </div>
          </div>
        </aside>

        {/* Main Neural Interface */}
        <main className="lg:col-span-3 space-y-8">
          <header className={`flex justify-between items-end transition-opacity duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white">QUANT<span className="text-red-500">.</span>READ</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.5em] font-bold mt-1">Experimental Speed Deck</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Estimated Completion</span>
              <span className="text-2xl font-mono text-red-500">{minutesLeft} <small className="text-[10px] text-slate-600 uppercase">min</small></span>
            </div>
          </header>

          {/* Core Reader Box */}
          <div className="relative w-full aspect-video bg-slate-900/20 border border-slate-800/50 rounded-[3rem] shadow-2xl backdrop-blur-xl flex items-center justify-center overflow-hidden transition-all duration-700">
            {/* Real-time Progress Stripe */}
            <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]" style={{ width: `${progress}%` }} />
            
            {isPlaying ? renderWord(tokens[currentIndex]) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">
                  {isLibReady ? "System Online" : "Loading Core Modules..."}
                </span>
              </div>
            )}
          </div>

          {/* Interface Controls */}
          <section className={`space-y-6 bg-slate-900/30 p-8 md:p-10 rounded-[2.5rem] border border-slate-800/50 transition-all duration-1000 shadow-xl ${isPlaying ? 'opacity-0 translate-y-20 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-4 h-[1px] bg-red-500" /> Source Input
              </span>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={!isLibReady}
                className="text-[9px] font-black text-white hover:bg-red-600 px-6 py-2.5 rounded-full bg-slate-800 border border-slate-700 transition-all disabled:opacity-20 uppercase tracking-widest shadow-lg"
              >
                Upload Document
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.pdf" className="hidden" />
            </div>

            <textarea
              className="w-full h-56 p-8 bg-[#020617]/80 border border-slate-800 rounded-[2rem] focus:ring-1 focus:ring-red-500/30 outline-none resize-none text-slate-300 font-mono text-xs leading-loose transition-all placeholder:text-slate-800"
              placeholder="PASTE MANUSCRIPT OR UPLOAD PDF FOR PROCESSING..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-800/50 pt-8">
              <div className="flex gap-12">
                <div>
                  <span className="text-[9px] font-black text-slate-600 uppercase block mb-2 tracking-widest">Frequency (WPM)</span>
                  <input type="number" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="bg-transparent text-3xl font-mono text-red-500 outline-none w-24" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-600 uppercase block mb-2 tracking-widest">Total Tokens</span>
                  <div className="text-3xl font-mono text-slate-200">{wordCount}</div>
                </div>
              </div>
              <button 
                onClick={startReader} 
                className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white font-black px-16 py-5 rounded-2xl shadow-2xl shadow-red-900/30 transition-all transform hover:scale-[1.02] active:scale-95 text-xs tracking-[0.2em]"
              >
                EXECUTE
              </button>
            </div>
          </section>
        </main>

        {/* Global Stop Command */}
        <button 
          onClick={() => setIsPlaying(false)} 
          className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-12 py-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full text-[10px] font-black tracking-[0.3em] text-slate-500 hover:text-red-500 transition-all shadow-2xl ${isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        >
          [ TERMINATE STREAM ]
        </button>
      </div>
    </div>
  );
};

export default QuantRead;