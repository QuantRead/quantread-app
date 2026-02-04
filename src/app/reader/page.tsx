"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReaderPage() {
  const [text, setText] = useState("READY");
  const [words, setWords] = useState(["SYSTEM", "READY.", "AWAITING", "NEURAL", "BEAM..."]);
  const [index, setIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && index < words.length) {
      interval = setInterval(() => {
        setText(words[index]);
        setIndex((prev) => prev + 1);
      }, 250);
    } else if (index >= words.length) {
      setIsActive(false);
      setIndex(0);
    }
    return () => clearInterval(interval);
  }, [isActive, index, words]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-3xl aspect-video border border-red-500/20 bg-slate-900/5 flex items-center justify-center relative">
        <h2 className="text-6xl md:text-8xl font-black tracking-widest uppercase italic">{text}</h2>
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-600"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-600"></div>
      </div>

      <div className="mt-16 flex gap-6">
        <button 
          onClick={() => { setIndex(0); setIsActive(true); }}
          className="px-10 py-4 bg-red-600 hover:bg-red-500 font-black uppercase text-sm skew-x-[-12deg]"
        >
          <span className="block skew-x-[12deg]">Start Intake</span>
        </button>
        <Link href="/" className="px-10 py-4 border border-slate-800 hover:bg-slate-900 font-black uppercase text-sm skew-x-[-12deg]">
          <span className="block skew-x-[12deg]">Exit</span>
        </Link>
      </div>
    </div>
  );
}