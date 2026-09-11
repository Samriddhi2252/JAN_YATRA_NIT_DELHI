import React, { useState, useEffect } from 'react';
import { Bus, Zap } from 'lucide-react';
import { INITIAL_BUSES, INITIAL_ROUTES, findBusesForRoute } from '../services/mockData';

export default function MovingBusAnimation({ bus: propBus }) {
  const [currentBus, setCurrentBus] = useState(propBus || INITIAL_BUSES[0]);
  const [fromName, setFromName] = useState('Delhi');
  const [toName, setToName] = useState('Noida');
  const [corridorStops, setCorridorStops] = useState([
    'Kashmiri Gate',
    'Akshardham',
    'Sector 18',
    'Sector 62'
  ]);

  const updateCorridorData = (fromCity, toCity) => {
    if (!fromCity || !toCity) return;
    const fromShort = fromCity.split('(')[0].trim();
    const toShort = toCity.split('(')[0].trim();
    setFromName(fromShort);
    setToName(toShort);

    const matchingBuses = findBusesForRoute(INITIAL_BUSES, fromCity, toCity);
    const bus = matchingBuses && matchingBuses.length > 0 ? matchingBuses[0] : INITIAL_BUSES[0];
    setCurrentBus(bus);

    const matchedRoute = INITIAL_ROUTES.find((r) => r.id === bus.routeId);
    if (matchedRoute && matchedRoute.stops && matchedRoute.stops.length > 0) {
      setCorridorStops(matchedRoute.stops.slice(0, 4));
    } else {
      setCorridorStops([
        fromShort,
        bus.nextStop || 'Expressway Midpoint',
        toShort
      ]);
    }
  };

  useEffect(() => {
    if (propBus) {
      setCurrentBus(propBus);
      return;
    }

    const syncWithDom = () => {
      const selects = document.querySelectorAll('select');
      if (selects.length >= 2) {
        const f = selects[0].value;
        const t = selects[1].value;
        if (f && t) {
          updateCorridorData(f, t);
        }
      }
    };

    // Initial check
    syncWithDom();

    // Listen to changes in origin/destination dropdowns
    document.addEventListener('change', syncWithDom);

    // Listen to clicks on popular corridor chips, swap button, or bus cards
    const handleClick = () => {
      setTimeout(syncWithDom, 60);
      setTimeout(syncWithDom, 250);
    };
    document.addEventListener('click', handleClick);

    const handleCustomRoute = (e) => {
      if (e.detail?.from && e.detail?.to) {
        updateCorridorData(e.detail.from, e.detail.to);
      }
    };
    const handleCustomBus = (e) => {
      if (e.detail) {
        setCurrentBus(e.detail);
      }
    };
    window.addEventListener('janyatra:route-changed', handleCustomRoute);
    window.addEventListener('janyatra:bus-selected', handleCustomBus);

    return () => {
      document.removeEventListener('change', syncWithDom);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('janyatra:route-changed', handleCustomRoute);
      window.removeEventListener('janyatra:bus-selected', handleCustomBus);
    };
  }, [propBus]);

  return (
    <div className="w-full bg-gradient-to-r from-navy-950 via-navy-900 to-forest-950 text-white overflow-hidden py-2 px-4 shadow-md border-b border-navy-800 relative z-30">
      <style>{`
        @keyframes gentleBusDrive {
          0% { left: -6%; }
          100% { left: 104%; }
        }
        .animate-gentle-bus {
          animation: gentleBusDrive 40s linear infinite;
        }
        .bus-track-container:hover .animate-gentle-bus {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Dynamic Live Corridor Status Indicator */}
        <div className="flex items-center space-x-2 text-[11px] font-black text-saffron-400 flex-shrink-0 z-10 bg-navy-950/90 px-3 py-1.5 rounded-xl border border-navy-800 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-forest-400 animate-ping"></span>
          <span className="tracking-wide uppercase">
            LIVE {fromName} - {toName} CORRIDOR
          </span>
        </div>

        {/* Animated Moving Bus Road Track (Smooth 40s travel with pause on hover) */}
        <div className="flex-1 relative mx-6 h-8 hidden sm:flex items-center overflow-hidden bus-track-container">
          {/* Road Line */}
          <div className="w-full h-0.5 bg-gradient-to-r from-saffron-500/30 via-white/40 to-forest-500/30"></div>

          {/* Dynamic Landmark Stops Along the Selected Corridor */}
          <div className="absolute inset-0 flex items-center justify-between px-4 text-[10px] font-extrabold text-navy-200 pointer-events-none">
            {corridorStops.map((stop, idx) => (
              <span key={idx} className="bg-navy-900/90 px-2 py-0.5 rounded-md border border-navy-700/80 shadow-sm flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-saffron-400"></span>
                <span>{stop}</span>
              </span>
            ))}
          </div>

          {/* Animated Moving Bus Element */}
          <div className="absolute top-0.5 animate-gentle-bus flex items-center space-x-1 cursor-pointer">
            <div 
              className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-saffron border border-saffron-300 flex items-center space-x-1.5 hover:scale-105 transition-transform"
              title={`${currentBus.routeName} (${currentBus.regNumber}) - Next: ${currentBus.nextStop}`}
            >
              <Bus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{currentBus.regNumber}</span>
              <span className="bg-navy-950/60 px-1.5 py-0.2 rounded text-[9px] text-saffron-200">₹{currentBus.fare}</span>
            </div>
          </div>
        </div>

        {/* Live Speed & Next Stop Badge */}
        <div className="flex items-center space-x-2 text-[11px] font-bold text-navy-100 flex-shrink-0 z-10 bg-navy-950/90 px-3 py-1.5 rounded-xl border border-navy-800 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-saffron-400" />
          <span>Live Speed: <strong className="text-saffron-400">{currentBus.speed || 52} km/h</strong></span>
          <span className="text-navy-500 hidden md:inline">•</span>
          <span className="text-forest-300 font-extrabold hidden md:inline">Next: {currentBus.nextStop}</span>
        </div>

      </div>
    </div>
  );
}
