"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReaderPage() {
  const [text, setText] = useState("AWAITING BEAM");
  const [words, setWords] = useState(["SYSTEM", "READY", "CONNECT", "EXTENSION", "TO", "BEAM", "DATA"]);
  const [index, setIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(300);

  // FIX: Listen for "Beamed" text from the Chrome Extension
  useEffect(() => {
    const handleBeam = (event: MessageEvent) => {
      if (event.data.type === "QUANTREAD_BEAM") {
        const newText = event.data.text;
        setWords(newText.split(/\s+/));
        setIndex(0);
        setText("READY TO INTAKE");
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
    } else if (index >= words.length) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, index, words, wpm]);

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Soft Background Glow */}
      <div className="absolute inset-0 soft-glow pointer-events-none" />

      <div className="w-full max-w-4xl glass-panel rounded-3xl p-16 md:p-32 relative z-10 text-center shadow-2xl">
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase text-white drop-shadow-2xl">
          {text}
        </h2>
        
        {/* Soft UI Accents */}
        <div className="absolute top-8 left-10 text-[10px] font-mono text-red-500/50 tracking-[0.5em] uppercase">Neural Interface Active</div>
        <div className="absolute bottom-8 right-10 flex items-center gap-2">
           <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
           <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{wpm} WPM</span>
        </div>
      </div>

      <div className="fixed bottom-12 flex gap-4 z-20">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest rounded-full shadow-lg shadow-red-900/20 active:scale-95"
        >
          {isActive ? "Pause" : "Initiate"}
        </button>
        <Link href="/" className="px-8 py-3 bg-slate-900/50 hover:bg-slate-800 text-slate-400 border border-white/5 font-bold uppercase tracking-widest rounded-full backdrop-blur-md">
          Exit
        </Link>
      </div>
    </main>
  );
}