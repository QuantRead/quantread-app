"use client";

import React, { useState, useEffect, useRef } from 'react';

const QuantRead = () => {
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Word Counter Logic
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content); // For now, this handles .txt files. 
      // Note: Full PDF parsing usually requires a library like 'pdf.js'
    };
    reader.readAsText(file);
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
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, interval);
    } else if (currentIndex >= tokens.length) {
      setIsPlaying(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, tokens, wpm]);

  const renderWord = (word: string) => {
    if (!word) return null;
    const centerIndex = Math.floor(word.length / 2);
    const start = word.slice(0, centerIndex);
    const mid = word[centerIndex];
    const end = word.slice(centerIndex + 1);

    return (
      <div className="text-5xl md:text-7xl font-mono tracking-tight flex justify-center items-center text-slate-100">
        <span className="text-right flex-1 opacity-40">{start}</span>
        <span className="text-red-500 font-bold px-1 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">{mid}</span>
        <span className="text-left flex-1 opacity-40">{end}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-red-500/30 font-sans transition-colors duration-700">
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center gap-12">
        
        {/* Header */}
        <header className={`text-center transition-opacity duration-1000 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
            QUANT<span className="text-red-500">READ</span>
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-[0.3em] font-medium">Neural Speed Interface</p>
        </header>

        {/* Reader Display */}
        <div className={`w-full aspect-video md:aspect-[21/9] bg-slate-900/40 border border-slate-800 rounded-[2rem] shadow-2xl backdrop-blur-md flex items-center justify-center relative overflow-hidden transition-all duration-700 ${isPlaying ? 'border-red-500/20 shadow-red-500/5' : ''}`}>
          {isPlaying ? renderWord(tokens[currentIndex]) : (
            <div className="text-slate-600 animate-pulse text-sm tracking-[0.2em] uppercase font-bold">
              System Ready
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className={`w-full max-w-2xl space-y-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-800/50 transition-all duration-1000 ${isPlaying ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100'}`}>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Input Stream</span>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-md border border-red-500/20"
            >
              Upload Document
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".txt,.pdf" 
              className="hidden" 
            />
          </div>

          <textarea
            className="w-full h-40 p-4 bg-[#020617] border border-slate-800 rounded-2xl focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all outline-none resize-none text-slate-300 placeholder:text-slate-700 font-mono text-sm"
            placeholder="PASTE TEXT OR UPLOAD FILE..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Word Counter & Settings */}
          <div className="flex flex-wrap items-center justify-between gap-6 border-t border-slate-800 pt-6">
            <div className="flex gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Frequency</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={wpm} 
                    onChange={(e) => setWpm(Number(e.target.value))}
                    className="bg-transparent w-16 text-xl font-mono text-red-500 outline-none"
                  />
                  <span className="text-xs text-slate-500 font-bold">WPM</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Volume</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono text-slate-300">{wordCount}</span>
                  <span className="text-xs text-slate-500 font-bold">WORDS</span>
                </div>
              </div>
            </div>

            <button 
              onClick={startReader}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs tracking-widest py-4 px-10 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
            >
              EXECUTE
            </button>
          </div>
        </div>

        {/* Floating Stop Button */}
        <button 
          onClick={() => setIsPlaying(false)}
          className={`fixed bottom-8 px-6 py-2 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-bold tracking-widest text-slate-500 hover:text-red-500 transition-all ${isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          TERMINATE PROCESS
        </button>
      </div>
    </div>
  );
};

export default QuantRead;