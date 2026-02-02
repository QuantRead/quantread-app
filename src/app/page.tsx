"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const QuantRead = () => {
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [history, setHistory] = useState<string[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('quantread_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const progress = tokens.length > 0 ? (currentIndex / tokens.length) * 100 : 0;
  const minutesLeft = Math.ceil((tokens.length - currentIndex) / wpm);

  const saveToHistory = (content: string) => {
    const newHistory = [content.substring(0, 50) + "...", ...history.slice(0, 4)];
    setHistory(newHistory);
    localStorage.setItem('quantread_history', JSON.stringify(newHistory));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      saveToHistory(`PDF: ${file.name}`);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
        saveToHistory(`TXT: ${file.name}`);
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
        <span className="text-right flex-1 opacity-30">{word.slice(0, centerIndex)}</span>
        <span className="text-red-500 font-bold px-1 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">{word[centerIndex]}</span>
        <span className="text-left flex-1 opacity-30">{word.slice(centerIndex + 1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar: History */}
        <aside className={`lg:col-span-1 space-y-4 transition-opacity duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Session History</h2>
          <div className="space-y-2">
            {history.length > 0 ? history.map((item, i) => (
              <div key={i} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-[10px] text-slate-400 truncate hover:border-slate-700 transition-colors cursor-pointer">
                {item}
              </div>
            )) : <p className="text-[10px] text-slate-700 italic">No recent sessions</p>}
          </div>
        </aside>

        {/* Main Interface */}
        <main className="lg:col-span-3 space-y-8">
          <header className={`flex justify-between items-center transition-opacity duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            <h1 className="text-2xl font-black tracking-tighter">QUANT<span className="text-red-500 text-3xl">.</span>READ</h1>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-widest">Time Remaining</span>
              <span className="text-xl font-mono text-red-500">{isPlaying ? minutesLeft : 0} <small className="text-[10px] text-slate-600">MIN</small></span>
            </div>
          </header>

          {/* Reader Display */}
          <div className="relative w-full aspect-video bg-slate-900/40 border border-slate-800 rounded-[2.5rem] shadow-2xl backdrop-blur-md flex items-center justify-center overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-1 bg-red-600 transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${progress}%` }} />
            
            {isPlaying ? renderWord(tokens[currentIndex]) : (
              <div className="text-center space-y-4">
                <div className="text-slate-700 text-[10px] font-black tracking-[0.5em] uppercase">Ready for Execution</div>
              </div>
            )}
          </div>

          {/* Controls */}
          <section className={`space-y-6 bg-slate-900/30 p-8 rounded-[2rem] border border-slate-800/50 transition-all duration-1000 ${isPlaying ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Text Processor</span>
              <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 transition-all">
                IMPORT DOCUMENT
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.pdf" className="hidden" />
            </div>

            <textarea
              className="w-full h-48 p-6 bg-[#020617] border border-slate-800 rounded-3xl focus:ring-1 focus:ring-red-500/50 outline-none resize-none text-slate-300 font-mono text-sm leading-relaxed"
              placeholder="Paste data or drop file..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex justify-between items-center border-t border-slate-800 pt-6">
              <div className="flex gap-8">
                <div>
                  <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Speed (WPM)</span>
                  <input type="number" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="bg-transparent text-2xl font-mono text-red-500 outline-none w-20" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Word Count</span>
                  <div className="text-2xl font-mono text-slate-200">{wordCount}</div>
                </div>
              </div>
              <button onClick={startReader} className="bg-red-600 hover:bg-red-500 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-red-900/20 transition-transform active:scale-95">
                EXECUTE
              </button>
            </div>
          </section>
        </main>

        {/* Termination Button */}
        <button onClick={() => setIsPlaying(false)} className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-10 py-3 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-bold tracking-widest text-slate-500 hover:text-red-500 transition-all ${isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          ABORT STREAM
        </button>
      </div>
    </div>
  );
};

export default QuantRead;