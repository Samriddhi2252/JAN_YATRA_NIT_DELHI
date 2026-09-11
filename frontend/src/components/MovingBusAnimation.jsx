import React from 'react';
import { Bus, MapPin, Zap } from 'lucide-react';

export default function MovingBusAnimation() {
  return (
    <div className="w-full bg-gradient-to-r from-navy-950 via-navy-900 to-forest-950 text-white overflow-hidden py-2 px-4 shadow-md border-b border-navy-800 relative z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Live Corridor Status Indicator */}
        <div className="flex items-center space-x-2 text-[11px] font-black text-saffron-400 flex-shrink-0 z-10 bg-navy-950/80 px-2.5 py-1 rounded-lg border border-navy-800">
          <span className="w-2 h-2 rounded-full bg-forest-400 animate-ping"></span>
          <span className="tracking-wide">LIVE HARYANA EXPRESS CORRIDOR</span>
        </div>

        {/* Animated Moving Bus Road Track */}
        <div className="flex-1 relative mx-6 h-7 hidden sm:flex items-center overflow-hidden">
          {/* Road Line */}
          <div className="w-full h-0.5 bg-gradient-to-r from-saffron-500/30 via-white/40 to-forest-500/30"></div>

          {/* Landmark Stops */}
          <div className="absolute inset-0 flex items-center justify-between px-4 text-[9px] font-extrabold text-navy-200">
            <span className="bg-navy-900/90 px-1.5 py-0.5 rounded border border-navy-700">Rohtak</span>
            <span className="bg-navy-900/90 px-1.5 py-0.5 rounded border border-navy-700">Meham</span>
            <span className="bg-navy-900/90 px-1.5 py-0.5 rounded border border-navy-700">Hansi</span>
            <span className="bg-navy-900/90 px-1.5 py-0.5 rounded border border-navy-700">Hisar</span>
          </div>

          {/* Animated Moving Bus Element */}
          <div className="absolute top-0 animate-bus-drive flex items-center space-x-1">
            <div className="bg-saffron-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-saffron border border-saffron-300 flex items-center space-x-1">
              <Bus className="w-3.5 h-3.5 stroke-[2.5] animate-bounce" />
              <span>HR-46-AT-9081</span>
            </div>
          </div>
        </div>

        {/* Live Speed Badge */}
        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-navy-100 flex-shrink-0 z-10 bg-navy-950/80 px-2.5 py-1 rounded-lg border border-navy-800">
          <Zap className="w-3.5 h-3.5 text-saffron-400" />
          <span>Avg Speed: <strong className="text-saffron-400">58 km/h</strong></span>
        </div>

      </div>
    </div>
  );
}
