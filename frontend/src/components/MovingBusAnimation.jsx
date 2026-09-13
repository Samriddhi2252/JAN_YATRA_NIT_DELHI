import React, { useState, useEffect } from 'react';
import { Bus, Zap } from 'lucide-react';
import { INITIAL_BUSES, INITIAL_ROUTES, findBusesForRoute } from '../services/mockData';

export default function MovingBusAnimation({ bus: propBus }) {
  const resolveRouteData = (b) => {
    if (!b) {
      return {
        from: 'Delhi',
        to: 'Noida',
        stops: ['Kashmiri Gate', 'Akshardham', 'Sector 18', 'Sector 62']
      };
    }
    let fromCity = b.from;
    let toCity = b.to;
    if (!fromCity || !toCity) {
      const matchedRoute = INITIAL_ROUTES.find((r) => r.id === b.routeId);
      if (matchedRoute) {
        fromCity = fromCity || matchedRoute.from;
        toCity = toCity || matchedRoute.to;
      } else if (b.routeName && b.routeName.includes('-')) {
        const parts = b.routeName.split('-');
        fromCity = fromCity || parts[0].trim();
        toCity = toCity || parts[1].replace(/Express|Corridor|Flyer|Feeder|Connect|Rapid|Cityliner/i, '').trim();
      }
    }
    const fromShort = fromCity ? fromCity.split('(')[0].trim() : 'Origin';
    const toShort = toCity ? toCity.split('(')[0].trim() : 'Destination';

    const matchedRouteById = INITIAL_ROUTES.find((r) => r.id === b.routeId);
    let stops = null;
    if (matchedRouteById && matchedRouteById.stops && matchedRouteById.stops.length >= 2) {
      stops = matchedRouteById.stops;
    } else {
      const matchedRouteByNames = INITIAL_ROUTES.find(
        (r) =>
          (r.from?.toLowerCase().includes(fromShort.toLowerCase()) && r.to?.toLowerCase().includes(toShort.toLowerCase())) ||
          (r.name?.toLowerCase().includes(fromShort.toLowerCase()) && r.name?.toLowerCase().includes(toShort.toLowerCase()))
      );
      if (matchedRouteByNames && matchedRouteByNames.stops && matchedRouteByNames.stops.length >= 2) {
        stops = matchedRouteByNames.stops;
      } else {
        const reverseRoute = INITIAL_ROUTES.find(
          (r) =>
            r.from?.toLowerCase().includes(toShort.toLowerCase()) && r.to?.toLowerCase().includes(fromShort.toLowerCase())
        );
        if (reverseRoute && reverseRoute.stops && reverseRoute.stops.length >= 2) {
          stops = [...reverseRoute.stops].reverse();
        }
      }
    }

    if (stops && stops.length >= 2) {
      return { from: fromShort, to: toShort, stops: stops.slice(0, 4) };
    }
    const fromLoc = fromCity?.match(/\((.*?)\)/)?.[1] || fromShort;
    const toLoc = toCity?.match(/\((.*?)\)/)?.[1] || toShort;
    const intermediate1 = b.nextStop && b.nextStop !== toLoc ? b.nextStop : `${fromShort} Expressway`;
    const intermediate2 = 'NCR Corridor Link';
    return {
      from: fromShort,
      to: toShort,
      stops: [fromLoc, intermediate1, intermediate2, toLoc]
    };
  };

  const initialRouteInfo = resolveRouteData(propBus);
  const [currentBus, setCurrentBus] = useState(propBus || INITIAL_BUSES[0]);
  const [fromName, setFromName] = useState(initialRouteInfo.from);
  const [toName, setToName] = useState(initialRouteInfo.to);
  const [corridorStops, setCorridorStops] = useState(initialRouteInfo.stops);

  const updateCorridorData = (fromCity, toCity, specificBus = null) => {
    if (!fromCity || !toCity) return;
    const fromShort = fromCity.split('(')[0].trim();
    const toShort = toCity.split('(')[0].trim();
    setFromName(fromShort);
    setToName(toShort);

    // 1. Resolve matching bus for the corridor
    let bus = specificBus || propBus;
    if (!bus) {
      const matchingBuses = findBusesForRoute(INITIAL_BUSES, fromCity, toCity);
      bus = matchingBuses && matchingBuses.length > 0 ? matchingBuses[0] : null;
    }
    if (!bus) {
      bus = INITIAL_BUSES.find(
        (b) =>
          (b.from && b.from.toLowerCase().includes(fromShort.toLowerCase())) ||
          (b.to && b.to.toLowerCase().includes(toShort.toLowerCase())) ||
          (b.routeName && b.routeName.toLowerCase().includes(fromShort.toLowerCase())) ||
          (b.routeName && b.routeName.toLowerCase().includes(toShort.toLowerCase()))
      );
    }
    if (!bus) {
      bus = {
        ...INITIAL_BUSES[0],
        routeName: `${fromShort} - ${toShort} Express`,
        from: fromCity,
        to: toCity,
        nextStop: `${toShort} Terminal`,
      };
    }
    setCurrentBus(bus);

    // 2. Resolve realistic landmark stop sequence along the corridor
    let stops = null;
    const matchedRouteById = INITIAL_ROUTES.find((r) => r.id === bus.routeId);
    if (matchedRouteById && matchedRouteById.stops && matchedRouteById.stops.length >= 2) {
      stops = matchedRouteById.stops;
    } else {
      const matchedRouteByNames = INITIAL_ROUTES.find(
        (r) =>
          (r.from?.toLowerCase().includes(fromShort.toLowerCase()) && r.to?.toLowerCase().includes(toShort.toLowerCase())) ||
          (r.name?.toLowerCase().includes(fromShort.toLowerCase()) && r.name?.toLowerCase().includes(toShort.toLowerCase()))
      );
      if (matchedRouteByNames && matchedRouteByNames.stops && matchedRouteByNames.stops.length >= 2) {
        stops = matchedRouteByNames.stops;
      } else {
        const reverseRoute = INITIAL_ROUTES.find(
          (r) =>
            r.from?.toLowerCase().includes(toShort.toLowerCase()) && r.to?.toLowerCase().includes(fromShort.toLowerCase())
        );
        if (reverseRoute && reverseRoute.stops && reverseRoute.stops.length >= 2) {
          stops = [...reverseRoute.stops].reverse();
        }
      }
    }

    if (stops && stops.length >= 2) {
      setCorridorStops(stops.slice(0, 4));
    } else {
      const fromLoc = fromCity.match(/\((.*?)\)/)?.[1] || fromShort;
      const toLoc = toCity.match(/\((.*?)\)/)?.[1] || toShort;
      const intermediate1 = bus.nextStop && bus.nextStop !== toLoc ? bus.nextStop : `${fromShort} Expressway`;
      const intermediate2 = 'NCR Corridor Link';
      setCorridorStops([fromLoc, intermediate1, intermediate2, toLoc]);
    }
  };

  // Sync with propBus when passed or updated from parent
  useEffect(() => {
    if (propBus) {
      setCurrentBus(propBus);
      const data = resolveRouteData(propBus);
      setFromName(data.from);
      setToName(data.to);
      setCorridorStops(data.stops);
    }
  }, [propBus?.id, propBus?.regNumber, propBus?.routeName, propBus?.from, propBus?.to]);

  useEffect(() => {
    const syncWithDom = () => {
      const fromEl = document.getElementById('from-city-select');
      const toEl = document.getElementById('to-city-select');
      if (fromEl && toEl && fromEl.value && toEl.value) {
        updateCorridorData(fromEl.value, toEl.value);
        return;
      }
      const selects = document.querySelectorAll('select');
      for (let i = 0; i < selects.length - 1; i++) {
        const f = selects[i].value;
        const t = selects[i + 1].value;
        if (f && t && (f.includes('(') || t.includes('('))) {
          updateCorridorData(f, t);
          return;
        }
      }
    };

    // Initial check if no propBus is provided
    if (!propBus) {
      syncWithDom();
    }

    // Listen to changes in origin/destination dropdowns
    document.addEventListener('change', syncWithDom);

    // Listen to clicks on popular corridor chips, swap button, or bus cards
    const handleClick = () => {
      setTimeout(syncWithDom, 50);
      setTimeout(syncWithDom, 200);
    };
    document.addEventListener('click', handleClick);

    const handleCustomRoute = (e) => {
      if (e.detail?.from && e.detail?.to) {
        updateCorridorData(e.detail.from, e.detail.to, e.detail.bus);
      }
    };
    const handleCustomBus = (e) => {
      if (e.detail) {
        const bus = e.detail;
        setCurrentBus(bus);
        const data = resolveRouteData(bus);
        setFromName(data.from);
        setToName(data.to);
        setCorridorStops(data.stops);
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
