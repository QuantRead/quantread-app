"use client";

import React, { useState, useEffect, useRef } from 'react';

// Define lib variable for dynamic client-side loading
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

  // Initialize library, load history, and "catch" beamed text from extension
  useEffect(() => {
    const initApp = async () => {
      // Prevent SSR errors by importing only on client
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      setIsLibReady(true);

      // 1. Load Session History
      const saved = localStorage.getItem('quantread_history');
      if (saved) setHistory(JSON.parse(saved));

      // 2. Catch the Beam (URL Parameters)
      const params = new URLSearchParams(window.location.search);
      const sharedText = params.get('text');
      if (sharedText) {
        const decodedText = decodeURIComponent(sharedText);
        setText(decodedText);
        // Clean the URL bar so the text isn't "re-caught" on refresh
        window.history.replaceState({}, document.title, "/");
      }
    };
    initApp();
  }, []);

  const sanitizeText = (rawText: string) => {
    return rawText
      .replace(/<[^>]*>?/gm, '') // Strip HTML
      .replace(/(\r\n|\n|\r)/gm, " ") 
      .replace(/\s+/g, " ")           
      .trim();
  };

  const saveToHistory = (entryName: string) => {
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const newEntry = `${timestamp} - ${entryName}`;
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
      alert("Stream Blocked: Could not fetch this specific site.");
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
      <div className="text-5xl md:text-7xl font-mono tracking-tight flex justify-center items-center text-slate-100">
        <span className="text-right flex-1 opacity-20">{word.slice(0, centerIndex)}</span>
        <span className="text-red-500 font-bold px-1 drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]">{word[centerIndex]}</span>
        <span className="text-left flex-1 opacity-20">{word.slice(centerIndex + 1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <aside className={`lg:col-span-1 space-y-6 transition-all duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Logs</h2>
          <div className="space-y-2">
            {history.map((item, i) => (
              <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-[10px] text-slate-400 truncate">
                {item}
              </div>
            ))}
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-8">
          <header className={`flex justify-between items-end transition-opacity duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            <h1 className="text-3xl font-black tracking-tighter text-white">QUANT<span className="text-red-500 text-4xl">.</span>READ</h1>
            <div className="text-right">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Time to End</span>
                <span className="text-2xl font-mono text-red-500">{Math.ceil((tokens.length - currentIndex) / wpm)} <small className="text-[10px] text-slate-600">MIN</small></span>
            </div>
          </header>

          {/* Reader Display */}
          <div className="relative w-full aspect-video bg-slate-900/20 border border-slate-800 rounded-[3rem] shadow-2xl backdrop-blur-xl flex items-center justify-center overflow-hidden">
            <div className="absolute top-0 left-0 h-1 bg-red-600 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.5)]" style={{ width: `${(currentIndex / tokens.length) * 100}%` }} />
            {isPlaying ? renderWord(tokens[currentIndex]) : (
               <div className="flex flex-col items-center gap-2">
                 <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">{isLoading ? "FETCHING DATA..." : "Awaiting Data Stream"}</span>
               </div>
            )}
          </div>

          {/* Controls Section */}
          <section className={`space-y-6 bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800 transition-all duration-1000 ${isPlaying ? 'opacity-0 translate-y-20' : 'opacity-100'}`}>
            <div className="flex gap-2 p-2 bg-[#020617] rounded-2xl border border-slate-800">
              <input 
                type="text" 
                placeholder="PASTE URL..." 
                className="flex-1 bg-transparent px-4 py-2 text-xs font-mono outline-none text-slate-300"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <button onClick={fetchWebArticle} className="bg-slate-800 hover:bg-slate-700 text-[9px] font-bold px-6 py-2 rounded-xl uppercase tracking-widest transition-all">
                {isLoading ? "LOADING..." : "FETCH URL"}
              </button>
            </div>

            <textarea
              className="w-full h-40 bg-[#020617] border border-slate-800 rounded-[2rem] p-6 outline-none resize-none text-slate-300 font-mono text-xs leading-relaxed"
              placeholder="OR PASTE TEXT MANUALLY..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex justify-between items-center border-t border-slate-800 pt-6">
              <div className="flex gap-8">
                <div>
                  <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Frequency</span>
                  <input type="number" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="bg-transparent text-2xl font-mono text-red-500 outline-none w-20" />
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="text-[9px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                  Upload PDF/TXT
                </button>
                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} accept=".txt,.pdf" className="hidden" />
              </div>
              <button onClick={startReader} className="bg-red-600 hover:bg-red-500 text-white font-black px-12 py-4 rounded-2xl shadow-xl transition-all active:scale-95">
                EXECUTE
              </button>
            </div>
          </section>
        </main>

        <button onClick={() => setIsPlaying(false)} className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-10 py-3 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-bold tracking-widest text-slate-500 hover:text-red-500 transition-all ${isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          ABORT
        </button>
      </div>
    </div>
  );
};

export default QuantRead;