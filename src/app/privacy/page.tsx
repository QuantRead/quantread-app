import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans p-8 md:p-24">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <Link href="/" className="text-red-500 font-black tracking-tighter text-2xl hover:opacity-80 transition-opacity">
            QUANT<span className="text-white">.</span>READ
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Effective Date: February 2026</p>
        </div>

        {/* Content Section */}
        <section className="space-y-10 leading-relaxed">
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Data Collection
            </h2>
            <p>
              QuantRead and the QuantRead Beam extension do not collect, store, or transmit any personally identifiable information (PII). We do not require account registration, and we do not use cookies to track your browsing behavior.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Extension Permissions
            </h2>
            <p>
              The QuantRead Beam extension uses the <code className="bg-slate-900 text-red-400 px-2 py-1 rounded">activeTab</code> and <code className="bg-slate-900 text-red-400 px-2 py-1 rounded">scripting</code> permissions solely to extract text content from the website you are currently viewing. This action only occurs when you explicitly click the &quot;Beam Text&quot; button.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Data Usage
            </h2>
            <p>
              Extracted text is passed directly to the web application via a URL parameter. This data is processed locally in your browser for the purpose of the RSVP (Rapid Serial Visual Presentation) reader. No text content is ever saved to a database or sent to a third-party server.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Third-Party Services
            </h2>
            <p>
              We do not sell, trade, or otherwise transfer your information to outside parties. Your data remains entirely within your local browsing session.
            </p>
          </div>

        </section>

        {/* Footer */}
        <div className="pt-12 border-t border-slate-800">
          <Link href="/" className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 hover:text-red-500 transition-colors">
            ← Back to Interface
          </Link>
        </div>
      </div>
    </div>
  );
}