"use client";

import React, { useState, useEffect, useRef } from 'react';

// This makes the file a module for Vercel/TypeScript
export default function QuantRead() {
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
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
      <div className="text-4xl font-mono flex justify-center items-center">
        <span className="text-right flex-1">{start}</span>
        <span className="text-red-500">{mid}</span>
        <span className="text-left flex-1">{end}</span>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-8 flex flex-col items-center gap-8 bg-white text-black min-h-screen">
      <h1 className="text-3xl font-bold">QuantRead</h1>
      
      <div className="w-full h-32 border-2 border-gray-200 rounded flex items-center justify-center bg-gray-50">
        {isPlaying ? renderWord(tokens[currentIndex]) : <span className="text-gray-400">Ready to Read</span>}
      </div>

      <textarea
        className="w-full h-40 p-4 border rounded text-black"
        placeholder="Paste your text here..."
        value={text}
        onChange={handleTextChange}
      />

      <div className="flex gap-4 items-center">
        <label>WPM: </label>
        <input 
          type="number" 
          value={wpm} 
          onChange={(e) => setWpm(Number(e.target.value))}
          className="border p-1 w-20 text-black"
        />
        <button 
          onClick={startReader}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          EXECUTE
        </button>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-gray-600 text-white px-6 py-2 rounded"
        >
          {isPlaying ? "PAUSE" : "RESUME"}
        </button>
      </div>
    </div>
  );
}