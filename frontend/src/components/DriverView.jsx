import React, { useState } from 'react';
import { Bus, Mic, CheckCircle, Navigation, Users, Play, Pause } from 'lucide-react';
import { speakText } from '../services/speech';

export default function DriverView({ bus, onUpdateOccupancy, onReportDelay }) {
  const [activeOccupancy, setActiveOccupancy] = useState(bus.occupancy || 'HALF');
  const [isTripRunning, setIsTripRunning] = useState(true);
  const [delayNote, setDelayNote] = useState('');
  const [voiceDelayActive, setVoiceDelayActive] = useState(false);

  const handleOccupancyChange = (status) => {
    setActiveOccupancy(status);
    onUpdateOccupancy(bus.id, status);
    speakText(`Occupancy updated to ${status}`);
  };

  const handleVoiceDelayReport = () => {
    setVoiceDelayActive(true);
    setTimeout(() => {
      const simulatedVoiceDelay = 'Heavy traffic at Meham bypass toll. Delay 8 minutes.';
      setDelayNote(simulatedVoiceDelay);
      onReportDelay(bus.id, 8, simulatedVoiceDelay);
      speakText('Delay reported to central dispatch.');
      setVoiceDelayActive(false);
    }, 1500);
  };

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
              <span className="text-xs font-black text-saffron-300">{bus.regNumber}</span>
            </div>
            <h1 className="text-xl font-black text-white mt-1">{bus.routeName}</h1>
            <p className="text-xs text-navy-100 font-bold">Driver: {bus.driver} ({bus.driverPhone})</p>
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
        
        {/* Card 1: One-Tap Occupancy Reporter */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-navy-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-navy-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-forest-700" />
              <span>One-Tap Occupancy Report</span>
            </h2>
            <span className="text-xs font-extrabold text-navy-600">Live Status</span>
          </div>

          <p className="text-xs text-navy-700 font-bold">
            Tap to instantly update bus passenger occupancy level for waiting commuters.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOccupancyChange('EMPTY')}
              className={`p-4 rounded-2xl border-2 font-black text-xs transition-all text-center ${
                activeOccupancy === 'EMPTY'
                  ? 'bg-forest-50 border-forest-700 text-forest-900 shadow-md scale-[1.02]'
                  : 'bg-navy-50/50 border-navy-100 text-navy-800 hover:border-navy-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-forest-700 text-white flex items-center justify-center mx-auto mb-2 text-sm font-black">
                🟢
              </div>
              <span>EMPTY (&lt; 25%)</span>
            </button>

            <button
              onClick={() => handleOccupancyChange('HALF')}
              className={`p-4 rounded-2xl border-2 font-black text-xs transition-all text-center ${
                activeOccupancy === 'HALF'
                  ? 'bg-navy-50 border-navy-800 text-navy-900 shadow-md scale-[1.02]'
                  : 'bg-navy-50/50 border-navy-100 text-navy-800 hover:border-navy-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center mx-auto mb-2 text-sm font-black">
                🔵
              </div>
              <span>HALF SEATS (50%)</span>
            </button>

            <button
              onClick={() => handleOccupancyChange('75% (FILLING FAST)')}
              className={`p-4 rounded-2xl border-2 font-black text-xs transition-all text-center ${
                activeOccupancy === '75% (FILLING FAST)' || activeOccupancy === '75% (Filling Fast)' || activeOccupancy === '75%'
                  ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-md scale-[1.02]'
                  : 'bg-navy-50/50 border-navy-100 text-navy-800 hover:border-navy-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-black">
                🟠
              </div>
              <span>75% (FILLING FAST)</span>
            </button>

            <button
              onClick={() => handleOccupancyChange('FULL')}
              className={`p-4 rounded-2xl border-2 font-black text-xs transition-all text-center ${
                activeOccupancy === 'FULL'
                  ? 'bg-saffron-50 border-saffron-500 text-saffron-900 shadow-md scale-[1.02]'
                  : 'bg-navy-50/50 border-navy-100 text-navy-800 hover:border-navy-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-saffron-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-black">
                🟡
              </div>
              <span>FULL (100%)</span>
            </button>

            <button
              onClick={() => handleOccupancyChange('OVERCROWDED')}
              className={`col-span-2 p-3.5 rounded-2xl border-2 font-black text-xs transition-all text-center flex items-center justify-center space-x-2 ${
                activeOccupancy === 'OVERCROWDED'
                  ? 'bg-rose-50 border-rose-600 text-rose-900 shadow-md scale-[1.02]'
                  : 'bg-navy-50/50 border-navy-100 text-navy-800 hover:border-navy-200'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                🔴
              </div>
              <span>OVERCROWDED</span>
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

          <div className="py-4">
            <button
              onClick={handleVoiceDelayReport}
              disabled={voiceDelayActive}
              className={`w-full py-5 rounded-2xl font-black text-sm text-white shadow-saffron transition-all flex items-center justify-center space-x-3 border border-saffron-400 ${
                voiceDelayActive
                  ? 'bg-saffron-600 animate-pulse'
                  : 'bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700'
              }`}
            >
              <Mic className="w-6 h-6 animate-bounce" />
              <span>{voiceDelayActive ? 'Listening to voice report...' : 'Hold & Speak Traffic Delay'}</span>
            </button>
          </div>

          {delayNote && (
            <div className="bg-saffron-50 border border-saffron-200 text-saffron-950 p-3 rounded-2xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-saffron-600 flex-shrink-0" />
              <span>Reported: "{delayNote}"</span>
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
