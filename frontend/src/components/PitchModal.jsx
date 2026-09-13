import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  WifiOff,
  Mic,
  MicOff,
  TrendingUp,
  HelpCircle,
  Send,
  Sparkles,
  Volume2,
  MessageSquare
} from 'lucide-react';
import { createSpeechRecognizer, speakText, isSpeechSupported } from '../services/speech';

export default function PitchModal({ isOpen, onClose }) {
  const [userQuery, setUserQuery] = useState('');
  const [activeQA, setActiveQA] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognizer, setRecognizer] = useState(null);

  useEffect(() => {
    return () => {
      if (recognizer) {
        try { recognizer.stop(); } catch (err) {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [recognizer]);

  if (!isOpen) return null;

  // Practical answers for common questions about Jan Yatra
  const answerAppQuestion = (query) => {
    const q = query.toLowerCase().trim();

    if (q.includes('offline') || q.includes('internet') || q.includes('no connection') || q.includes('network') || q.includes('bina net')) {
      return "Jan Yatra is built offline-first using Service Workers and IndexedDB. You can search cached routes and book passes without internet. Pass cryptograms are saved locally and sync automatically with the central server when connectivity returns.";
    }

    if (q.includes('delay') || q.includes('late') || q.includes('traffic') || q.includes('jam') || q.includes('deri')) {
      return "The system recalculates live arrival times by factoring in highway chokepoints and tollgate queues. Drivers can also report live delays hands-free using voice commands, pushing instant updates to all waiting passengers.";
    }

    if (q.includes('conductor') || q.includes('verify') || q.includes('scan') || q.includes('pass') || q.includes('etm') || q.includes('ticket')) {
      return "Each pass includes a secure cryptographic QR code and unique Pass ID (e.g. JY-DEL-XXXX). Conductors verify passes using the dedicated Conductor ETM Console scanner, with instant visual validation even with weak or zero network coverage.";
    }

    if (q.includes('voice') || q.includes('hindi') || q.includes('speak') || q.includes('bol') || q.includes('language') || q.includes('bhasha')) {
      return "Jan Yatra features a bilingual voice assistant supporting both Hindi and English via the W3C Web Speech API. Passengers can search routes, ask arrival times, and book tickets completely hands-free.";
    }

    if (q.includes('tech') || q.includes('stack') || q.includes('architecture') || q.includes('database') || q.includes('built')) {
      return "The application uses a modern React & Vite frontend with Leaflet mapping, Tailwind CSS, Service Worker PWA caching, IndexedDB local storage, Express Node.js backend, and a scikit-learn GBDT regression engine for delay estimation.";
    }

    if (q.includes('fare') || q.includes('price') || q.includes('cost') || q.includes('rupaye') || q.includes('payment') || q.includes('paise')) {
      return "Fares are calculated dynamically based on distance across Delhi NCR corridors (from ₹25 to ₹65). Commuters can pay online with simulated UPI/Cards or queue passes offline for instant settlement upon network reconnection.";
    }

    if (q.includes('route') || q.includes('gurugram') || q.includes('faridabad') || q.includes('noida') || q.includes('delhi') || q.includes('kahan')) {
      return "Jan Yatra connects key Delhi NCR intercity corridors across Delhi (Kashmiri Gate, Anand Vihar, Dhaula Kuan), Noida (Sector 62, Botanical Garden), Greater Noida (Pari Chowk), Gurugram (Cyber Hub, IFFCO Chowk), Ghaziabad, and Faridabad.";
    }

    if (q.includes('safety') || q.includes('emergency') || q.includes('sos') || q.includes('suraksha')) {
      return "The platform features one-tap emergency backup bus dispatching, real-time driver delay notifications, and continuous live GPS telemetry to ensure commuter safety across all arterial routes.";
    }

    return "Jan Yatra is a voice-first, offline-capable public transit system designed for seamless travel across Delhi NCR. It combines offline pass booking, bilingual voice search, driver ETM management, and live ML-powered delay predictions.";
  };

  const handleAskSubmit = (e) => {
    if (e) e.preventDefault();
    if (!userQuery.trim()) return;
    const q = userQuery.trim();
    const a = answerAppQuestion(q);
    setActiveQA({ question: q, answer: a });
    setUserQuery('');
  };

  const handleSelectQuickChip = (chipText) => {
    const a = answerAppQuestion(chipText);
    setActiveQA({ question: chipText, answer: a });
  };

  const handleToggleVoice = () => {
    if (isListening) {
      if (recognizer) {
        try { recognizer.stop(); } catch (err) {}
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechSupported()) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    const rec = createSpeechRecognizer({
      lang: 'hi-IN',
      silenceTimeoutMs: 2000,
      noSpeechTimeoutMs: 6000,
      onResult: (transcript, isFinal) => {
        setUserQuery(transcript);
        if (isFinal && transcript.trim()) {
          setIsListening(false);
          const a = answerAppQuestion(transcript.trim());
          setActiveQA({ question: transcript.trim(), answer: a });
          speakText(a, 'hi-IN');
        }
      },
      onSpeechEnd: (finalTranscript) => {
        setIsListening(false);
        if (finalTranscript && finalTranscript.trim()) {
          const a = answerAppQuestion(finalTranscript.trim());
          setActiveQA({ question: finalTranscript.trim(), answer: a });
          speakText(a, 'hi-IN');
        }
      },
      onNoSpeech: () => {
        setIsListening(false);
      },
      onError: () => {
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (rec) {
      try {
        rec.start();
        setRecognizer(rec);
        setIsListening(true);
      } catch (err) {
        console.warn('Speech start error', err);
        setIsListening(false);
      }
    }
  };

  const handleSpeakAnswer = () => {
    if (!activeQA?.answer) return;
    speakText(activeQA.answer, 'hi-IN');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-y-auto border border-navy-100 flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 via-saffron-500 to-forest-700 p-6 text-white sticky top-0 z-10 flex items-center justify-between shadow-md flex-shrink-0">
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
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          
          {/* Section 1: The 3 Core Innovations */}
          <div>
            <h3 className="text-sm font-black text-navy-900 uppercase tracking-wide mb-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-saffron-500" />
              <span>3 Core System Innovations</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-saffron-50 border border-saffron-200 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 font-black text-saffron-900 text-xs mb-1.5">
                    <WifiOff className="w-4 h-4 text-saffron-600 flex-shrink-0" />
                    <span>1. Offline-First Architecture</span>
                  </div>
                  <p className="text-[11px] text-saffron-900 leading-relaxed font-bold">
                    PWA + Service Worker + Local Mesh Sync. Functions completely when there is 0 internet coverage in rural corridors.
                  </p>
                </div>
              </div>

              <div className="bg-navy-50 border border-navy-200 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 font-black text-navy-900 text-xs mb-1.5">
                    <Mic className="w-4 h-4 text-navy-700 flex-shrink-0" />
                    <span>2. Conversational Voice (Hindi/English)</span>
                  </div>
                  <p className="text-[11px] text-navy-900 leading-relaxed font-bold">
                    Handles multi-turn follow-ups ("agli bus kab aayegi?") and ticket booking rather than simple one-shot commands.
                  </p>
                </div>
              </div>

              <div className="bg-forest-50 border border-forest-200 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 font-black text-forest-900 text-xs mb-1.5">
                    <TrendingUp className="w-4 h-4 text-forest-700 flex-shrink-0" />
                    <span>3. ML-Based Delay Prediction</span>
                  </div>
                  <p className="text-[11px] text-forest-900 leading-relaxed font-bold">
                    Blends live GPS speed with a Gradient Boosted Regression model trained on historical route congestion patterns for true ETAs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Practical Commuter-Focused FAQs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-navy-900 uppercase tracking-wide flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-forest-700" />
                <span>Frequently Asked Questions</span>
              </h3>
              <span className="text-[10px] font-extrabold text-saffron-600 bg-saffron-50 px-2.5 py-0.5 rounded-full border border-saffron-200">
                Commuter & Judge Essentials
              </span>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <div className="p-3.5 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-navy-200 transition-colors">
                <strong className="text-navy-900 block mb-1 text-xs">
                  Q: How do I book a ticket without internet?
                </strong>
                <p className="text-navy-700 font-normal leading-relaxed text-[11px]">
                  A: You can search cached routes and book offline. Jan Yatra saves your booking to a secure local IndexedDB queue with an offline cryptographic pass token. As soon as connectivity returns, your ticket automatically syncs and prompts secure payment.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-navy-200 transition-colors">
                <strong className="text-navy-900 block mb-1 text-xs">
                  Q: What happens if my bus is delayed or stuck in traffic?
                </strong>
                <p className="text-navy-700 font-normal leading-relaxed text-[11px]">
                  A: The live system dynamically recalculates real-time arrival times taking into account highway chokepoints and tollgate queues. Drivers can report traffic delays hands-free using voice commands, which instantly push live alerts to waiting commuters.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-navy-200 transition-colors">
                <strong className="text-navy-900 block mb-1 text-xs">
                  Q: How does the conductor verify my digital pass?
                </strong>
                <p className="text-navy-700 font-normal leading-relaxed text-[11px]">
                  A: Each confirmed pass includes a tamper-proof cryptographic QR code and unique Pass ID. Conductors verify passes using the dedicated Conductor ETM Console scanner, providing instant visual validation even with intermittent network coverage.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-navy-200 transition-colors">
                <strong className="text-navy-900 block mb-1 text-xs">
                  Q: Can I search routes and book tickets using voice commands in Hindi?
                </strong>
                <p className="text-navy-700 font-normal leading-relaxed text-[11px]">
                  A: Yes! Tap the microphone icon anywhere on the portal to speak in Hindi or English (e.g., "दिल्ली से गुरुग्राम की अगली बस कब है?"). The bilingual assistant searches routes, provides audio guidance, and prepares your ticket pass.
                </p>
              </div>
            </div>

            {/* Interactive Ask a Question Container */}
            <div className="mt-4 bg-gradient-to-br from-navy-950 via-navy-900 to-forest-950 text-white p-4 sm:p-5 rounded-2xl shadow-xl border border-navy-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-saffron-500 text-white flex items-center justify-center font-black shadow-saffron">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center space-x-1.5">
                      <span>Ask a Question</span>
                      <Sparkles className="w-3 h-3 text-saffron-400" />
                    </h4>
                    <p className="text-[10px] text-navy-300">
                      Type or speak your query about Jan Yatra to receive instant answers
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-white/10 text-saffron-300 font-bold px-2 py-0.5 rounded-full border border-white/10 hidden sm:inline-block">
                  Voice & Text Assistant
                </span>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[9px] font-bold text-navy-400 uppercase">Suggested:</span>
                {[
                  'How does offline booking work?',
                  'How does conductor scan pass?',
                  'What happens during delays?',
                  'What is the tech stack?'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuickChip(chip)}
                    className="text-[10px] font-bold bg-white/10 hover:bg-saffron-500 text-white px-2.5 py-0.5 rounded-lg border border-white/15 transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Text Input & Mic Control Bar */}
              <form onSubmit={handleAskSubmit} className="flex items-center space-x-2 pt-1">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder={
                      isListening
                        ? 'Listening to your voice... Speak now'
                        : 'Type your question for commuters or judges...'
                    }
                    className={`w-full bg-white/10 border text-xs text-white placeholder-navy-300 rounded-xl px-3.5 py-2.5 focus:outline-none transition-all ${
                      isListening ? 'border-red-400 ring-2 ring-red-500/30' : 'border-white/20 focus:border-saffron-400'
                    }`}
                  />
                  {isListening && (
                    <span className="absolute right-3 top-2.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </div>

                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 shadow-sm border ${
                    isListening
                      ? 'bg-red-600 text-white border-red-400 animate-pulse ring-4 ring-red-500/30'
                      : 'bg-white/15 hover:bg-white/25 text-white border-white/20 hover:border-saffron-400'
                  }`}
                  title={isListening ? 'Stop listening' : 'Speak your question (Hindi / English)'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-saffron-400" />}
                </button>

                {/* Submit Question Button */}
                <button
                  type="submit"
                  disabled={!userQuery.trim()}
                  className="px-3.5 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 disabled:opacity-40 text-white text-xs font-black flex items-center space-x-1 transition-all shadow-saffron border border-saffron-400 flex-shrink-0"
                  title="Submit question"
                >
                  <span>Ask</span>
                  <Send className="w-3 h-3" />
                </button>
              </form>

              {/* Answer Response Bubble */}
              {activeQA && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between text-[10px] text-saffron-300 font-extrabold pb-1 border-b border-white/10">
                    <span className="truncate pr-2">Q: "{activeQA.question}"</span>
                    <button
                      type="button"
                      onClick={handleSpeakAnswer}
                      className="text-white hover:text-saffron-300 flex items-center space-x-1 p-0.5 rounded transition-colors flex-shrink-0"
                      title="Listen to answer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-saffron-400" />
                      <span className="text-[9px]">Listen</span>
                    </button>
                  </div>
                  <p className="text-xs text-navy-100 font-medium leading-relaxed">
                    {activeQA.answer}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Close Overview Button */}
          <button
            onClick={onClose}
            className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-black py-3.5 rounded-xl shadow-saffron text-xs border border-saffron-400 transition-all hover:scale-[1.01]"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
}

