import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ArrowRightLeft,
  Bus,
  Ticket,
  Zap,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  Clock,
  ChevronRight
} from 'lucide-react';
import { CITIES_LIST, SAMPLE_VOICE_COMMANDS, INITIAL_BUSES, findBusesForRoute } from '../services/mockData';
import {
  createSpeechRecognizer,
  speakText,
  parseVoiceIntent,
  isSpeechSupported,
  isTtsSupported,
  getVoiceRecommendations
} from '../services/speech';

export default function CitySearchBooking({ onSelectSearchRoute, onOpenTicketModal }) {
  const todayStr = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '2026-09-11';
  const [fromCity, setFromCity] = useState('Delhi (Kashmiri Gate ISBT)');
  const [toCity, setToCity] = useState('Noida (Sector 62)');
  const [travelDate, setTravelDate] = useState(todayStr);
  const [passengers, setPassengers] = useState(1);
  const [searchResults, setSearchResults] = useState(null);
  const dateInputRef = useRef(null);

  // Bilingual Voice Interaction State (W3C Web Speech API)
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('hi-IN'); // 'hi-IN' (Hindi) or 'en-IN' (Indian English)
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState(null);
  const [realtimeRecommendations, setRealtimeRecommendations] = useState(() => {
    return getVoiceRecommendations('delhi se noida', INITIAL_BUSES);
  });
  const [recognizer, setRecognizer] = useState(null);

  // Listen for global voice search events from floating assistant
  useEffect(() => {
    const handleGlobalVoiceSearch = (e) => {
      const { from, to, count } = e.detail || {};
      if (from && to) {
        setFromCity(from);
        setToCity(to);
        if (count) setPassengers(count);
        onSelectSearchRoute(from, to, count || passengers);
        const recs = getVoiceRecommendations(`${from} se ${to}`, INITIAL_BUSES);
        setRealtimeRecommendations(recs);
        const matched = findBusesForRoute(INITIAL_BUSES, from, to);
        const bus = matched && matched.length > 0 ? matched[0] : null;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('janyatra:route-changed', {
              detail: { from, to, bus }
            })
          );
          if (bus) {
            window.dispatchEvent(
              new CustomEvent('janyatra:bus-selected', { detail: bus })
            );
          }
        }
      }
    };

    window.addEventListener('jan_yatra_voice_search', handleGlobalVoiceSearch);
    return () => window.removeEventListener('jan_yatra_voice_search', handleGlobalVoiceSearch);
  }, [passengers, onSelectSearchRoute]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognizer) {
        try { recognizer.stop(); } catch (err) {}
      }
    };
  }, [recognizer]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const finalDate = (selectedDate && selectedDate < todayStr) ? todayStr : selectedDate;
    setTravelDate(finalDate);
  };

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        try {
          dateInputRef.current.showPicker();
        } catch (err) {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleFromCityChange = (newFrom) => {
    setFromCity(newFrom);
  };

  const handleToCityChange = (newTo) => {
    setToCity(newTo);
  };

  const handleSwapCities = () => {
    const tempFrom = toCity;
    const tempTo = fromCity;
    setFromCity(tempFrom);
    setToCity(tempTo);
  };

  const handleSearchBuses = (e) => {
    e.preventDefault();
    if (onSelectSearchRoute) {
      onSelectSearchRoute(fromCity, toCity, passengers, travelDate);
    }
    setSearchResults({
      from: fromCity,
      to: toCity,
      date: travelDate,
      passengers,
    });
    const matched = findBusesForRoute(INITIAL_BUSES, fromCity, toCity);
    const bus = matched && matched.length > 0 ? matched[0] : null;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('janyatra:route-changed', {
          detail: { from: fromCity, to: toCity, bus }
        })
      );
      if (bus) {
        window.dispatchEvent(
          new CustomEvent('janyatra:bus-selected', { detail: bus })
        );
      }
    }
    const recs = getVoiceRecommendations(`${fromCity} to ${toCity}`, INITIAL_BUSES);
    setRealtimeRecommendations(recs);
  };

  // Process user voice input and dynamically populate recommendations
  const processVoiceInput = (rawText, lang) => {
    if (!rawText || rawText.trim().toLowerCase() === 'try again') return;
    const activeLang = lang || voiceLang;
    setVoiceTranscript(rawText);

    const intent = parseVoiceIntent(rawText);
    setVoiceFeedback(intent);

    // Compute real-time recommendation chips matching the query results
    const matchingBuses = getVoiceRecommendations(rawText, INITIAL_BUSES);
    setRealtimeRecommendations(matchingBuses);

    // Apply identified origin and destination cities
    if (intent.from && intent.to) {
      setFromCity(intent.from);
      setToCity(intent.to);
      const pax = intent.count || passengers;
      if (intent.count) setPassengers(pax);

      // Trigger route filter
      onSelectSearchRoute(intent.from, intent.to, pax);

      const matched = findBusesForRoute(INITIAL_BUSES, intent.from, intent.to);
      const bus = matched && matched.length > 0 ? matched[0] : null;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('janyatra:route-changed', {
            detail: { from: intent.from, to: intent.to, bus }
          })
        );
        if (bus) {
          window.dispatchEvent(
            new CustomEvent('janyatra:bus-selected', { detail: bus })
          );
        }
      }

      // Provide speech synthesis audio guidance in selected language
      speakText(intent.responseText, activeLang);

      // If user requested booking directly, open ticket pass booking drawer
      if (intent.type === 'BOOK_TICKET' && onOpenTicketModal) {
        const busToBook = matchingBuses[0] || INITIAL_BUSES[0];
        setTimeout(() => {
          onOpenTicketModal(busToBook, {
            from: intent.from,
            to: intent.to,
            fare: busToBook.fare,
            departureTime: busToBook.departureTime,
            arrivalTime: busToBook.arrivalTime,
            duration: busToBook.duration,
            busType: busToBook.busType,
            count: pax
          });
        }, 1200);
      }
    } else {
      speakText(intent.responseText, activeLang);
    }
  };

  // Toggle or start speech recognition with automatic silence timeout and speech-end detection
  const handleToggleVoice = () => {
    if (isListening) {
      if (recognizer) {
        try { recognizer.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    setIsVoiceActive(true);
    // Dynamically clear transcript so old text never loops
    setVoiceTranscript('');
    setVoiceFeedback(null);

    if (!isSpeechSupported()) {
      setIsListening(false);
      return;
    }

    let sessionHandled = false;

    const rec = createSpeechRecognizer({
      lang: voiceLang,
      silenceTimeoutMs: 1800,
      noSpeechTimeoutMs: 6000,
      onResult: (text, isFinal) => {
        // Dynamically update transcript based on newly recognized speech input
        setVoiceTranscript(text);
        if (text.trim().length > 3) {
          const liveMatches = getVoiceRecommendations(text, INITIAL_BUSES);
          setRealtimeRecommendations(liveMatches);
        }
        if (isFinal && text.trim() && !sessionHandled) {
          sessionHandled = true;
          setIsListening(false);
          processVoiceInput(text.trim(), voiceLang);
        }
      },
      onSpeechEnd: (finalText) => {
        // Speech-end detection: turns off mic when speaker stops speaking / goes silent
        setIsListening(false);
        if (finalText && finalText.trim() && !sessionHandled) {
          sessionHandled = true;
          setVoiceTranscript(finalText.trim());
          processVoiceInput(finalText.trim(), voiceLang);
        }
      },
      onNoSpeech: () => {
        // Automatic timeout if no clear voice input is detected within window -> Try again
        setIsListening(false);
        if (sessionHandled) return;
        sessionHandled = true;
        setVoiceTranscript('Try again');
        setVoiceFeedback({
          type: 'NO_SPEECH',
          responseText: voiceLang === 'hi-IN'
            ? 'कोई आवाज़ नहीं सुनाई दी। कृपया पुनः प्रयास करें (Try again)।'
            : 'No voice input detected. Please try again.'
        });
        speakText(voiceLang === 'hi-IN' ? 'कृपया दोबारा बोलें' : 'Please try again', voiceLang);
      },
      onError: (err) => {
        setIsListening(false);
        if (err === 'no-speech') {
          if (sessionHandled) return;
          sessionHandled = true;
          setVoiceTranscript('Try again');
          setVoiceFeedback({
            type: 'NO_SPEECH',
            responseText: voiceLang === 'hi-IN'
              ? 'कोई आवाज़ नहीं सुनाई दी। कृपया पुनः प्रयास करें (Try again)।'
              : 'No voice input detected. Please try again.'
          });
        } else {
          console.warn('Voice recognition error:', err);
        }
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
        console.warn('Speech start error:', err);
        setIsListening(false);
      }
    }
  };

  // Direct selection of a recommended bus from query results
  const handleSelectRecommendation = (recBus) => {
    setFromCity(recBus.from);
    setToCity(recBus.to);
    onSelectSearchRoute(recBus.from, recBus.to, passengers);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('janyatra:route-changed', {
          detail: { from: recBus.from, to: recBus.to, bus: recBus }
        })
      );
      window.dispatchEvent(
        new CustomEvent('janyatra:bus-selected', { detail: recBus })
      );
    }

    // Speak audio confirmation of the selected recommendation
    const msg = voiceLang === 'hi-IN'
      ? `${recBus.routeName} चुनी गई। प्रस्थान समय ${recBus.departureTime}।`
      : `Selected ${recBus.routeName}. Departure at ${recBus.departureTime}.`;
    speakText(msg, voiceLang);

    if (onOpenTicketModal) {
      onOpenTicketModal(recBus, {
        from: recBus.from,
        to: recBus.to,
        fare: recBus.fare,
        departureTime: recBus.departureTime,
        arrivalTime: recBus.arrivalTime,
        duration: recBus.duration,
        busType: recBus.busType,
        count: passengers
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-forest-950 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-navy-800 space-y-4 my-4 relative">
      
      {/* Header Label & Prominent Microphone Button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-saffron-500 text-white flex items-center justify-center font-black shadow-saffron">
            <Bus className="w-4 h-4" />
          </div>
          <h2 className="text-base font-black text-white tracking-wide">
            Inter-City Bus Search & Ticket Booking
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Prominent Bilingual Microphone Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`group relative flex items-center space-x-2 px-4 py-2 rounded-2xl shadow-saffron text-xs font-black transition-all transform hover:scale-105 active:scale-95 border ${
              isListening
                ? 'bg-red-600 text-white border-red-400 animate-pulse ring-4 ring-red-500/30'
                : 'bg-gradient-to-r from-saffron-500 via-saffron-600 to-navy-800 hover:from-saffron-600 hover:to-navy-900 text-white border-saffron-400/80'
            }`}
            title="Voice Route Search & Booking in Hindi or English"
          >
            <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
              {isListening ? (
                <MicOff className="w-3.5 h-3.5 text-white" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
              )}
            </div>
            <span>{isListening ? 'Listening (बोलिए)...' : 'बोलकर खोजें / Voice Search'}</span>
            <span className="bg-white/20 text-[9px] px-1.5 py-0.5 rounded font-mono">
              {voiceLang === 'hi-IN' ? 'हिन्दी' : 'ENG'}
            </span>
          </button>

          <span className="bg-saffron-500/20 text-saffron-300 text-[10px] font-black px-3 py-1.5 rounded-full border border-saffron-400/40 hidden sm:inline-block">
            Delhi & Delhi NCR Network
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BILINGUAL VOICE INTERACTION & VISUAL FEEDBACK PANEL                       */}
      {/* ========================================================================= */}
      {isVoiceActive && (
        <div className="bg-navy-900/95 backdrop-blur-md rounded-2xl p-4 border-2 border-saffron-500/50 shadow-2xl space-y-3 animate-fade-in text-left">
          <div className="flex items-center justify-between border-b border-navy-700/80 pb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-saffron-500 text-white'
              }`}>
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center space-x-1.5">
                  <span>Bilingual Voice Interaction</span>
                  <span className="text-[10px] text-saffron-300 font-bold">(W3C Web Speech API)</span>
                </h4>
                <p className="text-[10px] text-navy-300">Speak Hindi or English commands (उदा: "दिल्ली से नोएडा की बस चाहिए")</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <div className="bg-navy-800 p-0.5 rounded-xl border border-navy-700 flex text-[10px]">
                <button
                  type="button"
                  onClick={() => setVoiceLang('hi-IN')}
                  className={`px-2.5 py-1 rounded-lg font-black transition-all ${
                    voiceLang === 'hi-IN' ? 'bg-saffron-500 text-white shadow-sm' : 'text-navy-300 hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLang('en-IN')}
                  className={`px-2.5 py-1 rounded-lg font-black transition-all ${
                    voiceLang === 'en-IN' ? 'bg-navy-700 text-white shadow-sm' : 'text-navy-300 hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (recognizer) {
                    try { recognizer.stop(); } catch (e) {}
                  }
                  setIsListening(false);
                  setIsVoiceActive(false);
                }}
                className="w-6 h-6 rounded-full bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white flex items-center justify-center transition-colors"
                title="Close voice panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Listening Audio Stream Feedback */}
          {isListening && (
            <div className="bg-saffron-500/10 border border-saffron-500/30 rounded-xl p-3 flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1 items-center">
                  <span className="w-1.5 h-5 bg-saffron-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-7 bg-saffron-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-4 bg-saffron-400 rounded-full animate-bounce"></span>
                </div>
                <div>
                  <span className="text-xs font-black text-saffron-300 block">Listening to your voice stream...</span>
                  <span className="text-[11px] text-navy-200">
                    {voiceTranscript ? `« ${voiceTranscript} »` : 'Please speak now (उदा: "दिल्ली से नोएडा की बस चाहिए")'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleVoice}
                className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-black px-3 py-1.5 rounded-lg flex items-center space-x-1"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            </div>
          )}

          {/* Live Transcription & Confirmation Banner */}
          {voiceTranscript && !isListening && (
            <div className="bg-navy-800/80 rounded-xl p-3 border border-navy-700 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-navy-400 font-bold uppercase text-[9px] tracking-wider">Recognized Transcription:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] flex items-center space-x-1 ${
                  voiceFeedback?.type === 'NO_SPEECH'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-forest-500/20 text-forest-300'
                }`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{voiceFeedback?.type === 'NO_SPEECH' ? 'Try Again' : 'Processed'}</span>
                </span>
              </div>
              <p className="text-xs font-black text-white bg-navy-950/60 p-2.5 rounded-lg border border-navy-700/60 font-mono">
                "{voiceTranscript}"
              </p>

              {voiceFeedback && (
                <div className={`border rounded-xl p-2.5 text-xs flex items-start justify-between gap-2 ${
                  voiceFeedback.type === 'NO_SPEECH'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-100'
                    : 'bg-forest-950/40 border-forest-500/40 text-forest-100'
                }`}>
                  <div className="space-y-1">
                    <div className={`flex items-center space-x-1.5 font-black ${
                      voiceFeedback.type === 'NO_SPEECH' ? 'text-amber-300' : 'text-forest-300'
                    }`}>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {voiceFeedback.type === 'NO_SPEECH'
                          ? 'No Speech Detected (Try Again)'
                          : voiceFeedback.type === 'BOOK_TICKET'
                          ? 'Booking Requested'
                          : 'Route Identified & Filtered'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white font-bold">{voiceFeedback.responseText}</p>
                    {voiceFeedback.from && voiceFeedback.to && (
                      <div className="text-[10px] text-navy-300 flex items-center space-x-2 pt-0.5">
                        <span>From: <strong className="text-saffron-300">{voiceFeedback.from}</strong></span>
                        <span>➔</span>
                        <span>To: <strong className="text-forest-300">{voiceFeedback.to}</strong></span>
                        {voiceFeedback.count && <span>({voiceFeedback.count} seat{voiceFeedback.count > 1 ? 's' : ''})</span>}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => speakText(voiceFeedback.responseText, voiceLang)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white flex-shrink-0"
                    title="Play audio guidance again"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* DYNAMIC RECOMMENDATION CHIPS / REAL-TIME QUERY RESULTS                    */}
          {/* ========================================================================= */}
          <div className="space-y-2 pt-1 border-t border-navy-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-saffron-300 flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-saffron-400" />
                <span>Real-Time Matching Route Recommendations ({realtimeRecommendations.length}):</span>
              </span>
              <span className="text-[10px] text-navy-400 font-bold">Click chip to book exact bus</span>
            </div>

            {/* Dynamic Results Grid / Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {realtimeRecommendations.map((busItem) => (
                <div
                  key={busItem.id}
                  onClick={() => handleSelectRecommendation(busItem)}
                  className="bg-navy-800/90 hover:bg-navy-750 p-2.5 rounded-xl border border-navy-700 hover:border-saffron-400 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between group shadow-sm"
                  title={`Book ${busItem.routeName} departing at ${busItem.departureTime}`}
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="bg-navy-700 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                        {busItem.regNumber}
                      </span>
                      <h5 className="text-[11px] font-black text-white truncate group-hover:text-saffron-300 transition-colors">
                        {busItem.routeName}
                      </h5>
                    </div>
                    <div className="text-[10px] text-navy-300 flex items-center space-x-2">
                      <span>🕒 {busItem.departureTime} ➔ {busItem.arrivalTime}</span>
                      <span>•</span>
                      <span className="text-forest-300 font-bold">₹{busItem.fare}</span>
                    </div>
                    <div className="text-[9px] text-navy-400 truncate">
                      {busItem.from.split(' ')[0]} ➔ {busItem.to.split(' ')[0]} ({busItem.busType})
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="bg-saffron-500 group-hover:bg-saffron-600 text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center space-x-0.5 shadow-sm">
                      <span>Book</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Voice Query Sample Phrases */}
          <div className="space-y-1.5 pt-1 border-t border-navy-800">
            <span className="text-[10px] font-black uppercase text-navy-400 block">
              Try Speaking or Click Sample Phrases:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {SAMPLE_VOICE_COMMANDS.map((cmd, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setVoiceLang(cmd.lang);
                    processVoiceInput(cmd.text, cmd.lang);
                  }}
                  className="text-left text-[11px] font-bold bg-navy-800/80 hover:bg-saffron-600 text-navy-200 hover:text-white px-2.5 py-1 rounded-xl border border-navy-700 hover:border-saffron-400 transition-all flex items-center space-x-1"
                >
                  <span className="text-[10px]">💬</span>
                  <span>{cmd.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Input Form Bar */}
      <form onSubmit={handleSearchBuses} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* From City Select */}
        <div className="md:col-span-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          <label className="block text-[10px] font-extrabold uppercase text-saffron-300 mb-1 flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-saffron-400" />
            <span>From (Origin City)</span>
          </label>
          <select
            id="from-city-select"
            value={fromCity}
            onChange={(e) => handleFromCityChange(e.target.value)}
            className="w-full bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
          >
            {CITIES_LIST.map((city) => (
              <option key={city.id} value={city.name} className="bg-navy-900 text-white">
                {city.name} ({city.state})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex items-center justify-center">
          <button
            type="button"
            onClick={handleSwapCities}
            className="w-9 h-9 rounded-full bg-saffron-500 hover:bg-saffron-600 text-white flex items-center justify-center shadow-saffron transition-transform hover:rotate-180 border border-saffron-400"
            title="Swap Origin & Destination"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* To City Select */}
        <div className="md:col-span-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          <label className="block text-[10px] font-extrabold uppercase text-forest-300 mb-1 flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-forest-400" />
            <span>To (Destination City)</span>
          </label>
          <select
            id="to-city-select"
            value={toCity}
            onChange={(e) => handleToCityChange(e.target.value)}
            className="w-full bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
          >
            {CITIES_LIST.map((city) => (
              <option key={city.id} value={city.name} className="bg-navy-900 text-white">
                {city.name} ({city.state})
              </option>
            ))}
          </select>
        </div>

        {/* Travel Date */}
        <div 
          onClick={handleOpenDatePicker}
          className="md:col-span-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 cursor-pointer group hover:border-white/40 transition-colors"
          title="Click to select travel date"
        >
          <label 
            htmlFor="travel-date-input"
            className="block text-[10px] font-extrabold uppercase text-navy-200 mb-1 flex items-center space-x-1 cursor-pointer"
          >
            <Calendar className="w-3 h-3 text-white" />
            <span>Travel Date</span>
          </label>
          <input
            id="travel-date-input"
            ref={dateInputRef}
            type="date"
            min={todayStr}
            value={travelDate}
            onChange={handleDateChange}
            onClick={(e) => {
              e.stopPropagation();
              if (typeof e.target.showPicker === 'function') {
                try { e.target.showPicker(); } catch (err) {}
              }
            }}
            className="w-full bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer [color-scheme:dark]"
          />
        </div>

        {/* Search Submit Button & Prominent Mic Action */}
        <div className="md:col-span-12 pt-1 flex items-center space-x-2">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-black py-3.5 px-6 rounded-2xl shadow-saffron border border-saffron-400 text-xs flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01]"
          >
            <Search className="w-4 h-4" />
            <span>Search NCR Express Buses ({fromCity.split(' ')[0]} ➔ {toCity.split(' ')[0]})</span>
          </button>

          <button
            type="button"
            onClick={handleToggleVoice}
            className={`py-3.5 px-5 rounded-2xl font-black text-xs text-white border transition-all flex items-center space-x-2 shadow-lg ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 border-red-400 animate-pulse ring-4 ring-red-400/30'
                : 'bg-navy-800 hover:bg-navy-700 border-white/20 hover:border-saffron-400'
            }`}
            title="Speak search or booking query in Hindi / English"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-saffron-400 animate-pulse" />}
            <span className="hidden sm:inline">{isListening ? 'Stop Mic' : 'Voice Search'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
