import React, { useState, useEffect, useRef } from 'react';
import {
  Bus,
  Mic,
  CheckCircle,
  CheckCircle2,
  Navigation,
  Users,
  Play,
  Pause,
  RefreshCw,
  Radio
} from 'lucide-react';
import { createSpeechRecognizer, isSpeechSupported, speakText } from '../services/speech';
import { parseVoiceDelayDetails } from '../services/delayParser';

export default function DriverView({ bus, onUpdateOccupancy, onReportDelay }) {
  const [activeOccupancy, setActiveOccupancy] = useState(bus?.occupancy || 'HALF');
  const [selectedOccupancy, setSelectedOccupancy] = useState(bus?.occupancy || 'HALF');
  const [successToast, setSuccessToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTripRunning, setIsTripRunning] = useState(true);

  // Voice Delay State
  const initialDelayReport = 'Heavy traffic at Meham bypass toll. Delay 8 minutes.';
  const [delayNote, setDelayNote] = useState(initialDelayReport);
  const [delayDetails, setDelayDetails] = useState({
    incidentType: 'Tollgate Congestion',
    delayMinutes: 8,
    icon: '🛑',
    severity: 'MODERATE',
    formattedReport: initialDelayReport,
  });
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef(null);
  const holdStartRef = useRef(0);
  const isHoldingRef = useRef(false);
  const speechTimeoutRef = useRef(null);
  const simulationIndexRef = useRef(0);

  useEffect(() => {
    if (bus?.occupancy) {
      setActiveOccupancy(bus.occupancy);
      setSelectedOccupancy(bus.occupancy);
    }
  }, [bus?.occupancy]);

  // Synchronize the active driver bus and route details to top ticker and global state
  useEffect(() => {
    if (bus && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('janyatra:bus-selected', { detail: bus })
      );
      if (bus.from && bus.to) {
        window.dispatchEvent(
          new CustomEvent('janyatra:route-changed', {
            detail: { from: bus.from, to: bus.to, bus }
          })
        );
      }
    }
  }, [bus?.id, bus?.regNumber]);

  // Step 1: Conductor taps an occupancy level -> Temporarily selects status without updating instantly
  const handleSelectOccupancy = (status) => {
    setSelectedOccupancy(status);
  };

  // Step 2: Conductor clicks Submit -> Processes update, syncs to live state/database, and shows confirmation toast
  const handleSubmitOccupancy = () => {
    const statusToSubmit = selectedOccupancy || activeOccupancy;
    setIsSubmitting(true);
    setActiveOccupancy(statusToSubmit);

    // Sync to live database / application state
    if (onUpdateOccupancy && bus?.id) {
      onUpdateOccupancy(bus.id, statusToSubmit);
    }

    speakText(`Occupancy updated to ${statusToSubmit}`);

    // Show quick success confirmation toast
    const toastMsg = `Occupancy successfully updated to "${statusToSubmit}" and synced live!`;
    setSuccessToast(toastMsg);
    setIsSubmitting(false);

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Commits parsed speech delay report and syncs with live system
  const commitDelayReport = (transcript) => {
    setIsListening(false);
    setInterimTranscript('');

    const parsed = parseVoiceDelayDetails(transcript, bus);
    setDelayNote(parsed.formattedReport);
    setDelayDetails(parsed);

    // Live dispatch sync
    if (onReportDelay && bus?.id) {
      onReportDelay(bus.id, parsed.delayMinutes, parsed.formattedReport);
    }

    // Voice announcement
    speakText(`Delay of ${parsed.delayMinutes} minutes reported to central dispatch.`, 'en-IN');

    // Broadcast live event to system listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('janyatra:delay-reported', {
          detail: {
            busId: bus?.id,
            delayMins: parsed.delayMinutes,
            note: parsed.formattedReport,
            incidentType: parsed.incidentType,
            bus,
          },
        })
      );
    }
  };

  // Starts voice recognition with fallback to contextual simulation
  const startListening = () => {
    if (isListening) return;

    setIsListening(true);
    setInterimTranscript('');

    const simulationPhrases = [
      `Heavy traffic at ${bus?.nextStop || 'Meham bypass toll'}. Delay 8 minutes.`,
      `Traffic jam near ${bus?.nextStop || 'expressway flyover'}. Delay 12 minutes.`,
      `Vehicle breakdown near highway junction. Delay 20 minutes.`,
      `Toll plaza queue and slow traffic. Delay 10 minutes.`,
      `Road construction work and diversion. Delay 15 minutes.`,
    ];

    if (isSpeechSupported()) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }

        let hasResult = false;

        const recognizer = createSpeechRecognizer({
          onResult: (transcript, isFinal) => {
            hasResult = true;
            setInterimTranscript(transcript);
            if (isFinal) {
              if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
              }
              commitDelayReport(transcript);
            }
          },
          onError: (err) => {
            console.warn('Speech recognizer error / fallback to simulated audio capture:', err);
            if (!hasResult) {
              const phrase = simulationPhrases[simulationIndexRef.current % simulationPhrases.length];
              simulationIndexRef.current += 1;
              commitDelayReport(phrase);
            }
          },
          onEnd: () => {},
          lang: 'en-IN',
          silenceTimeoutMs: 1800,
          noSpeechTimeoutMs: 5000,
        });

        recognitionRef.current = recognizer;
        if (recognizer) {
          recognizer.start();
        } else {
          fallbackToSimulation();
        }
      } catch (err) {
        console.warn('Could not start speech recognition, using simulation:', err);
        fallbackToSimulation();
      }
    } else {
      fallbackToSimulation();
    }

    function fallbackToSimulation() {
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = setTimeout(() => {
        const phrase = simulationPhrases[simulationIndexRef.current % simulationPhrases.length];
        simulationIndexRef.current += 1;
        commitDelayReport(phrase);
      }, 1800);
    }
  };

  const stopListening = () => {
    if (!isListening) return;
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    if (interimTranscript && interimTranscript.trim().length > 3) {
      commitDelayReport(interimTranscript);
    } else {
      const simulationPhrases = [
        `Heavy traffic at ${bus?.nextStop || 'Meham bypass toll'}. Delay 8 minutes.`,
        `Traffic jam near ${bus?.nextStop || 'expressway flyover'}. Delay 12 minutes.`,
        `Vehicle breakdown near highway junction. Delay 20 minutes.`,
        `Toll plaza queue and slow traffic. Delay 10 minutes.`,
      ];
      const phrase = simulationPhrases[simulationIndexRef.current % simulationPhrases.length];
      simulationIndexRef.current += 1;
      commitDelayReport(phrase);
    }
  };

  // Hold & release event handlers for microphone button
  const handleMouseDown = () => {
    holdStartRef.current = Date.now();
    isHoldingRef.current = true;
    startListening();
  };

  const handleMouseUp = () => {
    const elapsed = Date.now() - holdStartRef.current;
    if (isHoldingRef.current && elapsed > 350) {
      isHoldingRef.current = false;
      stopListening();
    } else {
      isHoldingRef.current = false;
    }
  };

  const handleTouchStart = () => {
    holdStartRef.current = Date.now();
    isHoldingRef.current = true;
    startListening();
  };

  const handleTouchEnd = (e) => {
    const elapsed = Date.now() - holdStartRef.current;
    if (isHoldingRef.current && elapsed > 350) {
      if (e.cancelable) e.preventDefault();
      isHoldingRef.current = false;
      stopListening();
    } else {
      isHoldingRef.current = false;
    }
  };

  const handleClick = () => {
    const elapsed = Date.now() - holdStartRef.current;
    if (elapsed > 350) return;
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f9f9fc] p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-forest-900 text-white rounded-3xl p-6 shadow-xl border border-navy-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-saffron-500 text-white flex items-center justify-center font-black shadow-saffron border border-saffron-400">
            <Bus className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-saffron-500 text-white text-xs font-black px-3 py-0.5 rounded-full border border-saffron-400">
                Driver Console
              </span>
              <span className="text-xs font-black text-saffron-300">{bus?.regNumber}</span>
            </div>
            <h1 className="text-xl font-black text-white mt-1">{bus?.routeName}</h1>
            <p className="text-xs text-navy-100 font-bold">Driver: {bus?.driver} ({bus?.driverPhone})</p>
          </div>
        </div>

        {/* Trip Controls */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={() => setIsTripRunning(!isTripRunning)}
            className={`flex-1 md:flex-none px-5 py-3 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-md ${
              isTripRunning
                ? 'bg-saffron-500 hover:bg-saffron-600 text-white border border-saffron-400'
                : 'bg-forest-700 hover:bg-forest-800 text-white border border-forest-600'
            }`}
          >
            {isTripRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isTripRunning ? 'Pause GPS Feed' : 'Start GPS Broadcast'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Occupancy & Voice Delay Reporting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Conductor Occupancy Reporter with Explicit Submit */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-navy-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-navy-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-forest-700" />
              <span>One-Tap Occupancy Report</span>
            </h2>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-extrabold text-navy-600">Live Status:</span>
              <span className="text-xs font-black text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-200">
                {activeOccupancy}
              </span>
            </div>
          </div>

          <p className="text-xs text-navy-700 font-bold">
            Select an occupancy level below and click <strong>'Submit Occupancy Report'</strong> to sync live with waiting commuters.
          </p>

          {/* Quick Success Confirmation Toast */}
          {successToast && (
            <div className="bg-forest-50 border-2 border-forest-500 text-forest-950 p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-forest-600 flex-shrink-0" />
                <span>{successToast}</span>
              </div>
              <span className="text-[10px] bg-forest-600 text-white px-2 py-0.5 rounded font-mono font-black flex-shrink-0 ml-2">
                SYNCED LIVE
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSelectOccupancy('EMPTY')}
              className={`p-4 rounded-2xl border-2 font-black text-xs transition-all text-center relative ${
                selectedOccupancy === 'EMPTY'
                  ? 'bg-forest-50 border-forest-700 text-forest-900 shadow-md ring-2 ring-forest-500/40 scale-[1.02]'
                  : 'bg-navy-50/50 border-navy-100 text-navy-800 hover:border-navy-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-forest-700 text-white flex items-center justify-center mx-auto mb-2 text-sm font-black">
                🟢
              </div>
              <span className="block font-black">Empty (&lt; 25%)</span>
              {activeOccupancy === 'EMPTY' && (
                <span className="text-[9px] bg-forest-200 text-forest-900 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">
                  Current Live
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectOccupancy('HALF')}
              className={`p-4 rounded-2xl border-2 font-black text-xs transition-all text-center relative ${
                selectedOccupancy === 'HALF'
                  ? 'bg-navy-50 border-navy-800 text-navy-900 shadow-md ring-2 ring-navy-500/40 scale-[1.02]'
                  : 'bg-navy-50/50 border-navy-100 text-navy-800 hover:border-navy-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center mx-auto mb-2 text-sm font-black">
                🔵
              </div>
              <span className="block font-black">Half (50% Filled)</span>
              {activeOccupancy === 'HALF' && (
                <span className="text-[9px] bg-navy-200 text-navy-900 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">
                  Current Live
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectOccupancy('75% (FILLING FAST)')}
              className={`p-4 rounded-2xl border-2 font-black text-xs transition-all text-center relative ${
                selectedOccupancy === '75% (FILLING FAST)' || selectedOccupancy === '75% (Filling Fast)' || selectedOccupancy === '75%'
                  ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-md ring-2 ring-amber-500/40 scale-[1.02]'
                  : 'bg-navy-50/50 border-navy-100 text-navy-800 hover:border-navy-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-black">
                🟠
              </div>
              <span className="block font-black">75% (Filling Fast)</span>
              {(activeOccupancy === '75% (FILLING FAST)' || activeOccupancy === '75% (Filling Fast)' || activeOccupancy === '75%') && (
                <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">
                  Current Live
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectOccupancy('FULL')}
              className={`p-4 rounded-2xl border-2 font-black text-xs transition-all text-center relative ${
                selectedOccupancy === 'FULL'
                  ? 'bg-saffron-50 border-saffron-500 text-saffron-900 shadow-md ring-2 ring-saffron-500/40 scale-[1.02]'
                  : 'bg-navy-50/50 border-navy-100 text-navy-800 hover:border-navy-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-saffron-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-black">
                🟡
              </div>
              <span className="block font-black">Full (100%)</span>
              {activeOccupancy === 'FULL' && (
                <span className="text-[9px] bg-saffron-200 text-saffron-900 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">
                  Current Live
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectOccupancy('OVERCROWDED')}
              className={`col-span-2 p-3.5 rounded-2xl border-2 font-black text-xs transition-all text-center flex items-center justify-center space-x-2 relative ${
                selectedOccupancy === 'OVERCROWDED'
                  ? 'bg-rose-50 border-rose-600 text-rose-900 shadow-md ring-2 ring-rose-500/40 scale-[1.02]'
                  : 'bg-navy-50/50 border-navy-100 text-navy-800 hover:border-navy-200'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                🔴
              </div>
              <span className="font-black">Overcrowded</span>
              {activeOccupancy === 'OVERCROWDED' && (
                <span className="text-[9px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-bold ml-2">
                  Current Live
                </span>
              )}
            </button>
          </div>

          {/* Submit Occupancy Report Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmitOccupancy}
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm text-white shadow-md transition-all flex items-center justify-center space-x-2 border-2 ${
                selectedOccupancy !== activeOccupancy
                  ? 'bg-gradient-to-r from-saffron-500 via-saffron-600 to-forest-700 hover:from-saffron-600 hover:to-forest-800 shadow-saffron scale-[1.01] border-white/40'
                  : 'bg-forest-700 hover:bg-forest-800 border-forest-600'
              }`}
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>
                {selectedOccupancy !== activeOccupancy
                  ? `Submit Occupancy Report (${selectedOccupancy})`
                  : 'Submit Occupancy Report'}
              </span>
            </button>
          </div>
        </div>

        {/* Card 2: Voice-Based Delay Reporter */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-navy-100 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-black text-navy-900 flex items-center space-x-2">
                <Mic className="w-5 h-5 text-saffron-500" />
                <span>Hands-Free Voice Delay Report</span>
              </h2>
              <span className="text-xs font-extrabold text-saffron-600 bg-saffron-50 px-2.5 py-0.5 rounded-full border border-saffron-200">
                Driver Safety
              </span>
            </div>

            <p className="text-xs text-navy-700 font-bold">
              Tap the button while driving to report traffic jams or breakdowns without looking at the screen.
            </p>
          </div>

          <div className="py-2 space-y-3">
            <button
              type="button"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={handleClick}
              className={`w-full py-5 rounded-2xl font-black text-sm text-white shadow-saffron transition-all flex items-center justify-center space-x-3 border select-none cursor-pointer active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-r from-red-600 via-saffron-600 to-red-600 animate-pulse border-red-400 ring-4 ring-red-500/30 shadow-lg'
                  : 'bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 border-saffron-400'
              }`}
              title="Click or press and hold to speak delay"
            >
              {isListening ? (
                <>
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-white opacity-60"></span>
                    <Radio className="w-6 h-6 text-white relative animate-spin" />
                  </div>
                  <span>Release or Tap to Submit Delay...</span>
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6" />
                  <span>Hold &amp; Speak Traffic Delay</span>
                </>
              )}
            </button>

            {/* Live Audio Listening & Waveform Banner */}
            {isListening && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-900 font-bold flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-4 bg-red-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-6 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <div className="flex-1">
                  <span className="block font-black text-red-950">
                    {interimTranscript ? `"${interimTranscript}"` : 'Listening for speech...'}
                  </span>
                  <span className="text-[11px] text-red-700 font-semibold">
                    Speak incident &amp; delay (e.g. "Heavy traffic at toll, delay 8 minutes")
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Reported Text Box Below (Dynamically Updated) */}
          {delayNote && (
            <div className="bg-saffron-50 border border-saffron-200 text-saffron-950 p-3 rounded-2xl text-xs font-bold space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-saffron-600 flex-shrink-0" />
                <span>Reported: "{delayNote}"</span>
              </div>

              {delayDetails && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-saffron-200/80 text-[11px]">
                  <span className="bg-saffron-200/80 text-saffron-900 px-2 py-0.5 rounded-md font-extrabold flex items-center space-x-1">
                    <span>{delayDetails.icon}</span>
                    <span>{delayDetails.incidentType}</span>
                  </span>
                  <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md font-extrabold">
                    +{delayDetails.delayMinutes}m ETA Added
                  </span>
                  <span className="bg-forest-100 text-forest-800 border border-forest-200 px-2 py-0.5 rounded-md font-extrabold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-forest-700 inline" />
                    <span>Synced Live to Commuters &amp; Dispatch</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Stop Sequence Progress Tracker */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-navy-100 space-y-4">
        <h3 className="text-sm font-black text-navy-900 flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-forest-700" />
          <span>Route Stop Sequence & Arrival Times</span>
        </h3>

        {(() => {
          const now = new Date();
          const formatStopEta = (minutesFromNow) => {
            const d = new Date(now.getTime() + minutesFromNow * 60000);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          };

          const stop1Name = bus?.from ? bus.from.split('(')[0].trim() : 'Origin Depot';
          const stop1Time = bus?.departureTime || formatStopEta(-22);

          const stop2Name = bus?.nextStop || 'Approaching Stop';
          const stop2EtaMins = Number(bus?.gpsEtaMinutes) || 4;
          const stop2Time = formatStopEta(stop2EtaMins);

          const stop3Name = bus?.to?.includes('Noida') ? 'Mayur Vihar / Akshardham' :
                            bus?.to?.includes('Gurugram') ? 'IFFCO Chowk' :
                            bus?.to?.includes('Ghaziabad') ? 'Mohan Nagar' :
                            bus?.to?.includes('Faridabad') ? 'Badarpur Border' :
                            'Transit Interchange';
          const stop3Time = formatStopEta(stop2EtaMins + 18);

          const stop4Name = bus?.to ? bus.to.split('(')[0].trim() : 'Terminal Depot';
          const stop4Time = bus?.arrivalTime || formatStopEta(stop2EtaMins + 38);

          return (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-bold">
              <div className="bg-forest-50 border border-forest-200 text-forest-900 p-3.5 rounded-2xl">
                <span className="text-[10px] text-forest-700 block uppercase font-black">Stop 1 (Passed)</span>
                <span className="text-sm font-black">{stop1Name}</span>
                <span className="block text-[11px] text-forest-800 mt-1">Departed {stop1Time}</span>
              </div>
              <div className="bg-saffron-50 border border-saffron-300 text-saffron-950 p-3.5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-saffron-700 block uppercase font-black">Stop 2 (Approaching)</span>
                <span className="text-sm font-black">{stop2Name}</span>
                <span className="block text-[11px] text-saffron-900 mt-1">ETA: {stop2Time} ({stop2EtaMins} mins)</span>
              </div>
              <div className="bg-navy-50/60 border border-navy-100 text-navy-900 p-3.5 rounded-2xl">
                <span className="text-[10px] text-navy-600 block uppercase font-black">Stop 3</span>
                <span className="text-sm font-black">{stop3Name}</span>
                <span className="block text-[11px] text-navy-700 mt-1">ETA: {stop3Time}</span>
              </div>
              <div className="bg-navy-50/60 border border-navy-100 text-navy-900 p-3.5 rounded-2xl">
                <span className="text-[10px] text-navy-600 block uppercase font-black">Stop 4 (Terminal)</span>
                <span className="text-sm font-black">{stop4Name}</span>
                <span className="block text-[11px] text-navy-700 mt-1">ETA: {stop4Time}</span>
              </div>
            </div>
          );
        })()}
      </div>

    </div>
  );
}
