import React from 'react';
import { X, CheckCircle, WifiOff, Mic, TrendingUp, HelpCircle, Layers, Info } from 'lucide-react';

export default function PitchModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-y-auto border border-navy-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 via-saffron-500 to-forest-700 p-6 text-white sticky top-0 z-10 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="JAN YATRA" className="h-12 w-auto bg-white/10 p-1.5 rounded-2xl" />
            <div>
              <h2 className="font-black text-xl">JAN YATRA — System Architecture & Core Features</h2>
              <p className="text-xs text-white/90 font-bold">Voice-First, Offline-Capable Public Transport System</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Section 1: The 4 Core Innovations */}
          <div>
            <h3 className="text-sm font-black text-navy-900 uppercase tracking-wide mb-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-saffron-500" />
              <span>4 Core System Innovations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-saffron-50 border border-saffron-200 p-4 rounded-2xl">
                <div className="flex items-center space-x-2 font-black text-saffron-900 text-xs mb-1">
                  <WifiOff className="w-4 h-4 text-saffron-600" />
                  <span>1. Offline-First Architecture</span>
                </div>
                <p className="text-[11px] text-saffron-900 leading-relaxed font-bold">
                  PWA + Service Worker + Local Mesh Sync. Functions completely when there is 0 internet coverage in rural corridors.
                </p>
              </div>

              <div className="bg-navy-50 border border-navy-200 p-4 rounded-2xl">
                <div className="flex items-center space-x-2 font-black text-navy-900 text-xs mb-1">
                  <Mic className="w-4 h-4 text-navy-700" />
                  <span>2. Conversational Voice (Hindi/English)</span>
                </div>
                <p className="text-[11px] text-navy-900 leading-relaxed font-bold">
                  Handles multi-turn follow-ups ("agli bus kab aayegi?") and ticket booking rather than simple one-shot commands.
                </p>
              </div>

              <div className="bg-forest-50 border border-forest-200 p-4 rounded-2xl">
                <div className="flex items-center space-x-2 font-black text-forest-900 text-xs mb-1">
                  <TrendingUp className="w-4 h-4 text-forest-700" />
                  <span>3. ML-Based Delay Prediction</span>
                </div>
                <p className="text-[11px] text-forest-900 leading-relaxed font-bold">
                  Blends live GPS speed with a Gradient Boosted Regression model trained on historical route congestion patterns for true ETAs.
                </p>
              </div>

              <div className="bg-navy-50 border border-navy-200 p-4 rounded-2xl">
                <div className="flex items-center space-x-2 font-black text-navy-900 text-xs mb-1">
                  <Layers className="w-4 h-4 text-navy-700" />
                  <span>4. Primary Logo Palette Design</span>
                </div>
                <p className="text-[11px] text-navy-900 leading-relaxed font-bold">
                  High-contrast Navy Blue (#00205B), Saffron (#F46522), and Forest Green (#0D6938) UI tailored for Tier-2/3 commuters.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: System Data Flow */}
          <div className="bg-navy-50/50 border border-navy-100 p-5 rounded-2xl space-y-2">
            <h3 className="text-xs font-black text-navy-900 uppercase">System Data Flow</h3>
            <div className="text-xs text-navy-900 font-mono space-y-1 bg-white p-3 rounded-xl border border-navy-200 font-bold">
              <div>Commuter PWA (React/Vite) ⇄ Service Worker Caching</div>
              <div>⇄ IndexedDB Local Queue (Offline Bookings)</div>
              <div>⇄ WebSocket / REST API ⇄ Express Node Backend ⇄ ML ETA Regressor</div>
            </div>
          </div>

          {/* Section 3: System Q&A */}
          <div>
            <h3 className="text-sm font-black text-navy-900 uppercase tracking-wide mb-3 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-forest-700" />
              <span>Frequently Asked Architecture Questions</span>
            </h3>

            <div className="space-y-3 text-xs font-bold">
              <div className="p-3.5 rounded-2xl bg-white border border-navy-100">
                <strong className="text-navy-900 block mb-1">Q: How does offline mode handle booking conflicts once devices reconnect?</strong>
                <p className="text-navy-700 font-normal">
                  A: We enforce a first-synced-wins queue policy with local ticket hashing. If a seat is overbooked, the background sync API automatically prompts a rebooking on the next available bus with an SMS fallback push.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-navy-100">
                <strong className="text-navy-900 block mb-1">Q: Why use ML for ETA instead of pure GPS distance / speed?</strong>
                <p className="text-navy-700 font-normal">
                  A: Pure GPS distance fails during peak-hour tollgate queues or depot bottlenecks. Our scikit-learn model incorporates time-of-day, day-of-week, and stop passenger boarding loads to reduce ETA error from ±7 mins to ±2 mins.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-black py-3.5 rounded-xl shadow-saffron text-xs border border-saffron-400"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
}
