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
        // Auto-scroll to reader if text is beamed in
        readerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    initApp();
  }, []);

  const sanitizeText = (rawText: string) => {
    return rawText.replace(/<[^>]*>?/gm, '').replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ").trim();
  };

  const saveToHistory = (entryName: string) => {
    const newEntry = `${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${entryName}`;
    const updatedHistory = [newEntry, ...history.slice(0, 4)];
    setHistory(updatedHistory);
    localStorage.setItem('quantread_history', JSON.stringify(updatedHistory));
  };

  const fetchWebArticle = async () => {
    if (!urlInput) return;
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlInput)}`);
      const data = await response.json();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      const articleText = doc.querySelector('article')?.innerText || doc.querySelector('main')?.innerText || doc.body.innerText;
      setText(sanitizeText(articleText));
      saveToHistory(`WEB: ${new URL(urlInput).hostname}`);
      setUrlInput("");
    } catch (error) {
      alert("Stream Blocked.");
    } finally {
      setIsLoading(false);
    }
  };

  const processFile = async (file: File) => {
    if (!isLibReady) return;
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => item.str).join(" ") + " ";
      }
      setText(sanitizeText(fullText));
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setText(sanitizeText(e.target?.result as string));
      reader.readAsText(file);
    }
    saveToHistory(`FILE: ${file.name}`);
  };

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
      
      {/* 1. LANDING HERO SECTION */}
      {!isPlaying && (
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-8 animate-in fade-in duration-1000">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
              QUANT<span className="text-red-500">READ</span>
            </h1>
            <p className="text-slate-500 text-sm uppercase tracking-[0.6em] font-bold">Overclock your consumption</p>
          </div>
          
          <p className="max-w-xl text-slate-400 leading-relaxed text-lg">
            A high-performance neural reading interface designed to process data at the speed of thought. 
            Upload PDFs, fetch web articles, or beam text directly from your browser.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => readerRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-red-600 hover:bg-red-500 text-white font-black px-10 py-4 rounded-2xl shadow-2xl shadow-red-900/40 transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
            >
              Start Reading
            </button>
            <button className="bg-slate-900 border border-slate-800 text-slate-400 font-bold px-10 py-4 rounded-2xl hover:text-white transition-all text-xs uppercase tracking-widest">
              Add Chrome Extension
            </button>
          </div>

          <div className="pt-20 opacity-20 animate-bounce">
            <div className="w-1 h-12 bg-slate-500 rounded-full mx-auto" />
          </div>
        </section>
      )}

      {/* 2. MAIN APP INTERFACE */}
      <div ref={readerRef} className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-12 pt-24">
        
        {/* Sidebar */}
        <aside className={`lg:col-span-1 space-y-6 transition-all duration-700 ${isPlaying ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`}>
          <div className="bg-slate-900/20 border border-slate-800/50 p-6 rounded-[2rem]">
            <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Sequence History</h2>
            <div className="space-y-3">
              {history.map((item, i) => (
                <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-[10px] text-slate-500 truncate hover:text-red-400 transition-colors cursor-pointer">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-10">
          {/* Reader Display */}
          <div className={`relative w-full aspect-video bg-slate-900/20 border border-slate-800 rounded-[3rem] shadow-2xl backdrop-blur-xl flex items-center justify-center overflow-hidden transition-all duration-700 ${isPlaying ? 'scale-110 shadow-red-500/10 border-red-500/20' : ''}`}>
            <div className="absolute top-0 left-0 h-1 bg-red-600 transition-all duration-300" style={{ width: `${(currentIndex / tokens.length) * 100}%` }} />
            {isPlaying ? renderWord(tokens[currentIndex]) : (
               <div className="flex flex-col items-center gap-4">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                 <span className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em]">{isLoading ? "Streaming Data..." : "Interface Awaiting Data"}</span>
               </div>
            )}
          </div>

          {/* Controls Panel */}
          <section className={`space-y-8 bg-slate-900/20 p-8 md:p-12 rounded-[3rem] border border-slate-800/50 transition-all duration-1000 ${isPlaying ? 'opacity-0 translate-y-20 pointer-events-none' : 'opacity-100'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="URL SOURCE..." 
                  className="bg-[#020617] border border-slate-800 rounded-2xl px-6 py-4 text-xs font-mono outline-none text-slate-300 focus:border-red-500/50 transition-all"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button onClick={fetchWebArticle} className="bg-slate-800 hover:bg-red-600 text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest transition-all">
                  Fetch Web Stream
                </button>
            </div>

            <textarea
              className="w-full h-56 bg-[#020617] border border-slate-800 rounded-[2.5rem] p-8 outline-none resize-none text-slate-400 font-mono text-xs leading-relaxed focus:border-red-500/30 transition-all"
              placeholder="OR PASTE RAW DATA..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex flex-wrap justify-between items-center gap-6 border-t border-slate-800/50 pt-8">
              <div className="flex gap-12">
                <div>
                  <span className="text-[9px] font-black text-slate-600 uppercase block mb-2 tracking-widest">WPM Frequency</span>
                  <input type="number" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="bg-transparent text-3xl font-mono text-red-500 outline-none w-24" />
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                  Upload PDF
                </button>
                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} accept=".txt,.pdf" className="hidden" />
              </div>
              
              <button onClick={startReader} className="bg-red-600 hover:bg-red-500 text-white font-black px-16 py-5 rounded-3xl shadow-2xl shadow-red-900/30 transition-all active:scale-95 text-xs uppercase tracking-[0.2em]">
                Execute
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* Termination UI */}
      <button onClick={() => setIsPlaying(false)} className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-12 py-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full text-[10px] font-black tracking-[0.4em] text-slate-500 hover:text-red-500 transition-all shadow-2xl ${isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        TERMINATE STREAM
      </button>
    </div>
  );
};

export default QuantRead;