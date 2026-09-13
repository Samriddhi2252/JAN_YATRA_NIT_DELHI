import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { calculateMlEta } from '../services/mlEta';
import { findBusesForRoute, getRoadFollowingCoordinates } from '../services/mockData';
import CitySearchBooking from './CitySearchBooking';
import ErrorBoundary from './ErrorBoundary';
import { Bus, MapPin, Zap, Ticket, Sparkles, ChevronRight, AlertTriangle, Info, X, Calendar, Clock } from 'lucide-react';

const createBusIcon = (occupancy, isSelected) => {
  let color = '#00205B';
  if (occupancy === 'FULL') color = '#F46522';
  if (occupancy === 'OVERCROWDED') color = '#0D6938';
  if (isSelected) color = '#F46522';

  const svgHtml = `
    <div style="background-color: ${color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 16px rgba(0,32,91,0.35); transform: scale(${isSelected ? '1.25' : '1.0'}); transition: all 0.3s ease;">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 6v6"/>
        <path d="M15 6v6"/>
        <path d="M2 12h19.6"/>
        <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.2 6 18.2 6H5.8C4.8 6 3.9 6.8 3.6 7.8l-1.4 5c-.1.4-.2.8-.2 1.2C2.5 16.3 3 18 3 18h3"/>
        <circle cx="7.5" cy="18" r="1.5"/>
        <circle cx="16.5" cy="18" r="1.5"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-bus-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
};

// Map controller that keeps map steady and prevents auto-zoom-out / view resetting on user interactions or background ticks
function MapRouteSync({ routeCoordinates, selectedBusPos, routeKey }) {
  const map = useMap();
  const userInteractedRef = useRef(false);
  const lastRouteKeyRef = useRef(null);
  const lastBusPosRef = useRef(null);

  // Detect user drag or zoom gestures so we never override their manual map interaction
  useEffect(() => {
    const markInteraction = () => {
      userInteractedRef.current = true;
    };

    map.on('dragstart', markInteraction);
    map.on('zoomstart', markInteraction);

    return () => {
      map.off('dragstart', markInteraction);
      map.off('zoomstart', markInteraction);
    };
  }, [map]);

  // When route explicitly changes (user performed a new search or changed corridor)
  useEffect(() => {
    if (!routeKey) return;
    if (lastRouteKeyRef.current !== routeKey) {
      lastRouteKeyRef.current = routeKey;
      userInteractedRef.current = false; // Reset interaction flag on deliberate route change
      try {
        if (Array.isArray(routeCoordinates) && routeCoordinates.length > 1) {
          const validCoords = routeCoordinates.filter(
            (c) => Array.isArray(c) && c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1])
          );
          if (validCoords.length > 1) {
            const bounds = L.latLngBounds(validCoords);
            if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13, animate: true });
              return;
            }
          }
        }
        if (selectedBusPos && Array.isArray(selectedBusPos) && !isNaN(selectedBusPos[0]) && !isNaN(selectedBusPos[1])) {
          map.panTo(selectedBusPos, { animate: true });
        }
      } catch (err) {
        console.warn('MapRouteSync fitBounds error:', err);
      }
    }
  }, [routeKey, routeCoordinates, selectedBusPos, map]);

  // When a different bus is selected, pan to it smoothly without altering the user's zoom level
  useEffect(() => {
    if (!selectedBusPos || !Array.isArray(selectedBusPos) || isNaN(selectedBusPos[0]) || isNaN(selectedBusPos[1])) return;
    const posKey = `${selectedBusPos[0]},${selectedBusPos[1]}`;
    if (lastBusPosRef.current !== posKey) {
      lastBusPosRef.current = posKey;
      // Only pan if the user hasn't explicitly navigated or zoomed elsewhere
      if (!userInteractedRef.current) {
        try {
          map.panTo(selectedBusPos, { animate: true });
        } catch (e) {}
      }
    }
  }, [selectedBusPos, map]);

  return null;
}

export default function CommuterView({ buses, routes, onOpenTicketModal, isOffline, currentUser }) {
  const todayStr = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '2026-09-12';
  const [travelDate, setTravelDate] = useState(todayStr);
  const isFutureDate = Boolean(travelDate && travelDate > todayStr);

  const [selectedBusId, setSelectedBusId] = useState('BUS-100');
  const [useMlEta, setUseMlEta] = useState(true);
  const [activePopoverBusId, setActivePopoverBusId] = useState(null);
  const [activeDetailsPopover, setActiveDetailsPopover] = useState(false);
  const [, setTick] = useState(0);

  // Dynamic refresh interval to keep ETA dynamically factoring in real-time highway/tollgate delay adjustments
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const [activeSearch, setActiveSearch] = useState({
    from: 'Delhi (Kashmiri Gate ISBT)',
    to: 'Noida (Sector 62)'
  });
  const [filteredBusList, setFilteredBusList] = useState(() => {
    try {
      const initial = findBusesForRoute(buses, 'Delhi (Kashmiri Gate ISBT)', 'Noida (Sector 62)');
      return Array.isArray(initial) && initial.length > 0 ? initial : (buses || []);
    } catch (e) {
      console.warn('Initial bus search fallback:', e);
      return buses || [];
    }
  });

  useEffect(() => {
    try {
      if (activeSearch?.from && activeSearch?.to) {
        const matched = findBusesForRoute(buses, activeSearch.from, activeSearch.to);
        const list = Array.isArray(matched) && matched.length > 0 ? matched : (buses || []);
        setFilteredBusList(list);
        if (list.length > 0 && !list.some((b) => b?.id === selectedBusId)) {
          setSelectedBusId(list[0]?.id || 'BUS-100');
        }
      } else {
        setFilteredBusList(buses || []);
      }
    } catch (err) {
      console.warn('Error filtering buses:', err);
      setFilteredBusList(buses || []);
    }
  }, [buses, activeSearch]);

  const handleSelectSearchRoute = (from, to, pax, date) => {
    if (!from || !to) return;
    setActiveSearch({ from, to });
    if (date) {
      setTravelDate(date);
    }
    try {
      const matched = findBusesForRoute(buses, from, to);
      const list = Array.isArray(matched) && matched.length > 0 ? matched : (buses || []);
      setFilteredBusList(list);
      const bus = list.length > 0 ? list[0] : null;
      if (bus?.id) {
        setSelectedBusId(bus.id);
      }
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
    } catch (err) {
      console.error('Error during route selection:', err);
    }
  };

  const selectedBus = useMemo(() => {
    if (!Array.isArray(filteredBusList) || filteredBusList.length === 0) {
      return (Array.isArray(buses) && buses[0]) || null;
    }
    return filteredBusList.find((b) => b?.id === selectedBusId) || filteredBusList[0] || (Array.isArray(buses) && buses[0]) || null;
  }, [filteredBusList, selectedBusId, buses]);

  // Strictly bind the active route geometry to active search result parameters
  const activeRoute = useMemo(() => {
    if (!routes || !Array.isArray(routes) || routes.length === 0) return null;

    if (activeSearch?.from && activeSearch?.to) {
      const fromNorm = (activeSearch.from || '').toLowerCase().split('(')[0].trim();
      const toNorm = (activeSearch.to || '').toLowerCase().split('(')[0].trim();

      const matchedByCities = routes.find(
        (r) =>
          r?.from && r?.to &&
          r.from.toLowerCase().includes(fromNorm) &&
          r.to.toLowerCase().includes(toNorm)
      );
      if (matchedByCities) return matchedByCities;
    }

    if (selectedBus?.routeId) {
      const matchedByBus = routes.find((r) => r?.id === selectedBus.routeId);
      if (matchedByBus) return matchedByBus;
    }

    if (filteredBusList?.[0]?.routeId) {
      const matchedByFirst = routes.find((r) => r?.id === filteredBusList[0].routeId);
      if (matchedByFirst) return matchedByFirst;
    }

    return routes[0] || null;
  }, [routes, activeSearch, selectedBus?.routeId, filteredBusList]);

  // Coordinates specifically of the active route using clean road-following paths with robust fallback
  const activeRouteCoordinates = useMemo(() => {
    try {
      if (selectedBus?.routeCoordinates && Array.isArray(selectedBus.routeCoordinates) && selectedBus.routeCoordinates.length > 0) {
        const valid = selectedBus.routeCoordinates.filter(
          (c) => Array.isArray(c) && c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1])
        );
        if (valid.length > 1) return valid;
      }
      if (activeSearch?.from && activeSearch?.to) {
        const road = getRoadFollowingCoordinates(activeSearch.from, activeSearch.to);
        if (Array.isArray(road) && road.length > 1) {
          const valid = road.filter(
            (c) => Array.isArray(c) && c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1])
          );
          if (valid.length > 1) return valid;
        }
      }
      if (activeRoute?.coordinates && Array.isArray(activeRoute.coordinates) && activeRoute.coordinates.length > 0) {
        const valid = activeRoute.coordinates.filter(
          (c) => Array.isArray(c) && c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1])
        );
        if (valid.length > 1) return valid;
      }
    } catch (err) {
      console.warn('activeRouteCoordinates calculation fallback:', err);
    }
    return [
      [28.6667, 77.2333],
      [28.6360, 77.2510],
      [28.6127, 77.2773],
      [28.5870, 77.3160],
      [28.5700, 77.3200],
      [28.6010, 77.3550],
      [28.6250, 77.3750]
    ];
  }, [selectedBus?.routeCoordinates, activeSearch?.from, activeSearch?.to, activeRoute?.coordinates]);

  const selectedBusPos = useMemo(() => {
    const lat = Number(selectedBus?.currentLocation?.lat);
    const lng = Number(selectedBus?.currentLocation?.lng);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return [lat, lng];
    }
    return [28.6139, 77.2090];
  }, [selectedBus?.currentLocation?.lat, selectedBus?.currentLocation?.lng]);

  useEffect(() => {
    if (selectedBus && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('janyatra:bus-selected', { detail: selectedBus })
      );
      if (selectedBus.from && selectedBus.to) {
        window.dispatchEvent(
          new CustomEvent('janyatra:route-changed', {
            detail: { from: selectedBus.from, to: selectedBus.to, bus: selectedBus }
          })
        );
      }
    }
  }, [selectedBus?.id]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-[#f9f9fc]">
      
      {/* Top Inter-City Search Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <ErrorBoundary
          title="Search Filter Error"
          message="Could not load the search bar. You can still track and book buses below."
        >
          <CitySearchBooking
            onSelectSearchRoute={handleSelectSearchRoute}
            onOpenTicketModal={onOpenTicketModal}
          />
        </ErrorBoundary>
      </div>

      {/* Main Map & Bus List Workspace */}
      <div className="relative flex-1 bg-[#f9f9fc] flex flex-col lg:flex-row overflow-hidden border-t border-navy-100">
        
        {/* Sidebar: Bus List & Predictive ETA Toggle */}
        <div className="w-full lg:w-[420px] bg-white border-r border-navy-100 p-4 sm:p-5 overflow-y-auto flex flex-col space-y-4 shadow-sm z-20">
          
          {/* Passenger Identity Status Card */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-navy-50/90 to-slate-50 border border-navy-100 text-xs shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-forest-700 text-white flex items-center justify-center font-black text-xs shadow-sm">
                {(currentUser?.name || 'C').charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-extrabold text-navy-950 block text-xs leading-tight">
                  {currentUser?.name || 'Commuter User'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {currentUser?.contact ? `${currentUser.contact} • Passenger` : 'Active Passenger Account'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-forest-700 bg-forest-100/80 px-2 py-0.5 rounded-full border border-forest-200/60">
              Verified
            </span>
          </div>

          {/* Smart Tech Feature Banner / Advance Timetable Notice */}
          {isFutureDate ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-700" />
                  <span>Advance Timetable Mode</span>
                </span>
                <span className="bg-blue-800 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  📅 {travelDate}
                </span>
              </div>
              <p className="text-xs text-blue-950 leading-relaxed font-medium">
                Displaying scheduled departures for <strong>{travelDate}</strong>. Live countdown ETAs are hidden for future dates. Timings are based on historical route data and subject to traffic variations on the day of travel.
              </p>
            </div>
          ) : (
            <>
              {/* Smart Tech Feature Banner */}
              <div className="bg-gradient-to-r from-navy-50 to-forest-50 border border-navy-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-navy-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-saffron-500" />
                    <span>Smart Tech Feature</span>
                  </span>
                  <span className="bg-navy-800 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    GPS + ML Layer
                  </span>
                </div>
                <p className="text-xs text-navy-900 leading-relaxed font-medium">
                  Unlike basic GPS trackers, JAN YATRA uses historical route congestion patterns to predict true arrival ETAs within ±3 mins.
                </p>
              </div>

              {/* ETA Mode Toggle (GPS Only vs GPS + ML) */}
              <div className="bg-navy-50/50 border border-navy-100 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-navy-800">Display ETA Model</span>
                  <span className="text-[11px] font-bold text-saffron-600 bg-saffron-50 px-2 py-0.5 rounded-md border border-saffron-200">
                    {useMlEta ? 'ML Model Enabled' : 'Raw GPS Only'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 bg-navy-100/70 p-1 rounded-xl">
                  <button
                    onClick={() => setUseMlEta(false)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      !useMlEta
                        ? 'bg-white text-navy-900 shadow-sm border border-navy-200'
                        : 'text-navy-700 hover:text-navy-950'
                    }`}
                  >
                    GPS-Only ETA
                  </button>
                  <button
                    onClick={() => setUseMlEta(true)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                      useMlEta
                        ? 'bg-saffron-500 text-white shadow-saffron'
                        : 'text-navy-700 hover:text-navy-950'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>GPS + ML ETA</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Active Bus List Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-navy-900 flex items-center space-x-2">
              <Bus className="w-4 h-4 text-forest-700" />
              <span>Available Express Fleet ({filteredBusList.length})</span>
            </h2>
            <span className="text-xs text-navy-600 font-bold">Delhi & Delhi NCR</span>
          </div>

          {/* Bus Cards List */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {filteredBusList.map((bus) => {
              const isSelected = bus.id === selectedBusId;
              const busEta = calculateMlEta(bus);
              const displayMinutes = useMlEta ? busEta.mlEta : busEta.gpsEta;

              return (
                <div
                  key={bus.id}
                  onClick={() => setSelectedBusId(bus.id)}
                  className={`cursor-pointer rounded-2xl p-4 transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-br from-navy-900 to-navy-800 text-white border-navy-700 shadow-lg scale-[1.01]'
                      : 'bg-white text-navy-900 border-navy-100 hover:border-forest-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-navy-700 text-white' : 'bg-navy-50 text-navy-800'
                      }`}>
                        {bus.regNumber}
                      </span>
                      <h3 className={`text-sm font-extrabold mt-1.5 ${isSelected ? 'text-white' : 'text-navy-900'}`}>
                        {bus.routeName}
                      </h3>
                    </div>

                    <div className="text-right">
                      {isFutureDate ? (
                        <div>
                          <div className={`text-base font-black ${isSelected ? 'text-saffron-400' : 'text-forest-700'}`}>
                            {bus.departureTime}
                          </div>
                          <span className={`text-[10px] font-bold block ${isSelected ? 'text-navy-200' : 'text-navy-600'}`}>
                            Scheduled Departure
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-end space-x-1.5">
                            <div className={`text-xl font-black ${isSelected ? 'text-saffron-400' : 'text-forest-700'}`}>
                              {displayMinutes} mins
                            </div>
                            {useMlEta && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePopoverBusId(activePopoverBusId === bus.id ? null : bus.id);
                                }}
                                className={`p-1 rounded-full transition-all ${
                                  isSelected ? 'text-saffron-300 hover:text-white hover:bg-navy-700' : 'text-navy-500 hover:text-navy-900 hover:bg-navy-100'
                                }`}
                                title="View GBDT Model ETA Breakdown"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold block ${isSelected ? 'text-navy-200' : 'text-navy-600'}`}>
                            {useMlEta ? 'ML Predicted' : 'GPS Calculated'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Future Date Timetable & Note vs Live ML Tollgate Delay Model */}
                  {isFutureDate ? (
                    <div className={`mb-2 p-2.5 rounded-xl border text-left space-y-1 text-xs ${
                      isSelected
                        ? 'bg-navy-800/80 border-navy-700 text-navy-100'
                        : 'bg-blue-50/90 border-blue-200/80 text-blue-950'
                    }`}>
                      <div className="flex items-center justify-between text-[11px] font-extrabold">
                        <span className={isSelected ? 'text-saffron-300' : 'text-blue-900'}>
                          Timetable: {bus.departureTime} ➔ {bus.arrivalTime}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isSelected ? 'bg-navy-700 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          Est. {bus.duration}
                        </span>
                      </div>
                      <p className={`text-[10px] leading-relaxed font-medium ${
                        isSelected ? 'text-navy-300' : 'text-blue-800'
                      }`}>
                        Timings are based on historical route data and subject to traffic variations on the day of travel.
                      </p>
                    </div>
                  ) : (
                    useMlEta && (
                      <div className="mb-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePopoverBusId(activePopoverBusId === bus.id ? null : bus.id);
                          }}
                          className={`w-full text-left inline-flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-tight border transition-colors ${
                            isSelected
                              ? 'bg-saffron-500/20 text-saffron-300 border-saffron-400/40 hover:bg-saffron-500/30'
                              : 'bg-saffron-50/90 text-saffron-900 border-saffron-200 hover:bg-saffron-100'
                          }`}
                        >
                          <span className="flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-saffron-500 shrink-0" />
                            <span>ML-Optimized ETA (75% more accurate, ±1.8m)</span>
                          </span>
                          <span className="text-[9px] font-black opacity-80 underline ml-1">
                            GBDT model info
                          </span>
                        </button>

                        {/* Info Popover powered by GBDT tollgate delay model */}
                        {activePopoverBusId === bus.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 p-3 rounded-xl bg-white text-navy-950 border border-navy-200 shadow-xl text-left text-xs z-30 animate-in fade-in zoom-in-95 duration-150"
                          >
                            <div className="flex items-center justify-between pb-1.5 border-b border-navy-100">
                              <span className="font-black text-navy-900 flex items-center space-x-1 text-[11px]">
                                <Sparkles className="w-3.5 h-3.5 text-saffron-500" />
                                <span>ML-Optimized ETA (75% more accurate, ±1.8m)</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePopoverBusId(null);
                                }}
                                className="text-navy-400 hover:text-navy-700 p-0.5 rounded"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[11px] text-navy-600 font-semibold mt-1.5 leading-snug">
                              Powered by our <strong>GBDT tollgate delay model</strong>. Dynamically factors in highway chokepoints and toll plaza queues in real time instead of a naive static countdown.
                            </p>
                            <div className="mt-2 space-y-1.5 bg-navy-50/70 p-2 rounded-lg text-[11px]">
                              <div className="flex items-center justify-between">
                                <span className="text-navy-700 font-medium">Tollgate Queue Adjustment:</span>
                                <span className="font-black text-saffron-700">+{busEta.tollgateDelayMins}m ({((busEta.tollgateName || '').split('&')[0] || '').trim()})</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-navy-700 font-medium">Highway Delay Adjustment:</span>
                                <span className="font-black text-navy-800">+{busEta.highwayDelayMins}m ({((busEta.highwayName || '').split('&')[0] || '').trim()})</span>
                              </div>
                              <div className="flex items-center justify-between border-t border-navy-200/60 pt-1">
                                <span className="text-navy-900 font-bold">Total Dynamic ML ETA:</span>
                                <span className="font-black text-forest-700">{busEta.mlEta} mins (vs {busEta.gpsEta}m raw GPS)</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}

                  <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-navy-100/20">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-saffron-400' : 'text-forest-700'}`} />
                      <span className={isSelected ? 'text-navy-100 font-medium' : 'text-navy-700'}>
                        Next: <strong className={isSelected ? 'text-white' : 'text-navy-950'}>{bus.nextStop}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {bus.departureTime && (
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-saffron-300' : 'text-navy-600'}`}>
                          🕒 {bus.departureTime}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                        isSelected ? 'bg-saffron-500 text-white' : 'bg-forest-50 text-forest-700 border border-forest-200'
                      }`}>
                        ₹{bus.fare}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        bus.occupancy === 'EMPTY' ? 'bg-forest-100 text-forest-800' :
                        bus.occupancy === 'HALF' ? 'bg-navy-100 text-navy-800' :
                        bus.occupancy === 'FULL' ? 'bg-saffron-100 text-saffron-900' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {bus.occupancy}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Bus Ticket Booking Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                const target = selectedBus || filteredBusList?.[0] || buses?.[0];
                if (target && onOpenTicketModal) {
                  onOpenTicketModal(target, { travelDate });
                }
              }}
              className="w-full bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-saffron transition-all flex items-center justify-center space-x-2 text-sm border border-saffron-400"
            >
              <Ticket className="w-5 h-5" />
              <span>
                {isFutureDate
                  ? `Reserve Seat for ${travelDate} (${selectedBus?.regNumber || 'Express'})`
                  : `Book Seat on ${selectedBus?.regNumber || 'Express'} (₹${selectedBus?.fare || 110})`}
              </span>
            </button>
          </div>

        </div>

        {/* Main Map View Area */}
        <div className="flex-1 relative h-[500px] lg:h-auto w-full">
          
          {isOffline && (
            <div className="absolute top-4 left-4 right-4 z-20 bg-saffron-500 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between border border-saffron-400">
              <div className="flex items-center space-x-2 text-xs font-extrabold">
                <AlertTriangle className="w-4 h-4" />
                <span>Offline Mode Active: Displaying last-known bus positions cached in IndexedDB.</span>
              </div>
              <span className="text-[10px] bg-saffron-700 text-white font-black px-2 py-0.5 rounded-md">
                Cached Sync
              </span>
            </div>
          )}

          {selectedBus && (() => {
            const selectedBusEta = calculateMlEta(selectedBus);
            const activeEtaMins = useMlEta ? selectedBusEta.mlEta : selectedBusEta.gpsEta;

            return (
              <div className="absolute bottom-4 left-4 right-4 lg:left-8 lg:right-auto lg:w-96 z-20 glass-card rounded-2xl p-4 shadow-xl border border-navy-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-forest-500 animate-ping"></span>
                    <span className="text-xs font-black text-navy-900">{selectedBus.routeName}</span>
                  </div>
                  <span className="text-[11px] font-black text-navy-800 bg-navy-50 px-2.5 py-0.5 rounded-full border border-navy-200">
                    {selectedBus.regNumber}
                  </span>
                </div>

                {/* ML-Optimized ETA Visual Tag, Badge & GBDT Model Adjustment OR Future Timetable */}
                {isFutureDate ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 my-2.5 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-900 flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-blue-700" />
                        <span>Scheduled Timetable ({travelDate})</span>
                      </span>
                      <span className="text-[10px] font-bold bg-blue-200 text-blue-950 px-1.5 py-0.5 rounded">
                        Advance Timetable
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl font-black text-navy-950">
                        {selectedBus.departureTime} ➔ {selectedBus.arrivalTime}
                      </span>
                      <span className="text-xs font-bold text-navy-700 bg-white/80 px-2 py-0.5 rounded-md border border-navy-200">
                        Est. {selectedBus.duration}
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] text-blue-950 bg-white/70 p-2 rounded-lg leading-relaxed font-medium border border-blue-100">
                      ℹ️ Timings are based on historical route data and subject to traffic variations on the day of travel.
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-saffron-50 to-navy-50 border border-saffron-200/80 rounded-xl p-2.5 my-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-navy-600 block">
                          Estimated Arrival (ETA)
                        </span>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-2xl font-black text-navy-950">
                            {activeEtaMins} mins
                          </span>
                          {useMlEta && (
                            <span className="text-[11px] font-bold text-saffron-600">
                              (Dynamic GBDT Model)
                            </span>
                          )}
                        </div>
                      </div>
                      {useMlEta && (
                        <button
                          type="button"
                          onClick={() => setActiveDetailsPopover(!activeDetailsPopover)}
                          className="p-1 text-navy-600 hover:text-navy-950 rounded-full hover:bg-white/60 transition-all"
                          title="View GBDT Model Delay Adjustments"
                        >
                          <Info className="w-4 h-4 text-saffron-600" />
                        </button>
                      )}
                    </div>

                    {useMlEta && (
                      <div className="mt-1.5 pt-1.5 border-t border-saffron-200/60">
                        <div className="flex items-center space-x-1">
                          <span className="inline-flex items-center space-x-1 bg-saffron-500 text-white px-2 py-0.5 rounded-md text-[10px] font-black shadow-xs">
                            <Sparkles className="w-3 h-3" />
                            <span>ML-Optimized ETA (75% more accurate, ±1.8m)</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-navy-700 font-semibold mt-1">
                          Powered by our <strong>GBDT tollgate delay model</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Real-Time Speed */}
                <div className="flex items-center justify-between text-xs my-2.5 bg-navy-50/50 px-3 py-2 rounded-xl border border-navy-100">
                  <span className="text-navy-600 text-[10px] font-bold">GPS Speed</span>
                  <span className="font-extrabold text-navy-900">{selectedBus.speed} km/h</span>
                </div>

                {/* Popover overlay for Route Details Card if toggled */}
                {activeDetailsPopover && useMlEta && (
                  <div className="mb-2.5 p-3 rounded-xl bg-white border border-navy-200 shadow-xl text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-navy-100">
                      <span className="font-black text-navy-900 text-[11px] flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-saffron-500" />
                        <span>ML-Optimized ETA (75% more accurate, ±1.8m)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveDetailsPopover(false)}
                        className="text-navy-400 hover:text-navy-700 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-navy-600 font-medium mt-1">
                      Powered by our GBDT tollgate delay model. Instead of a static naive countdown, ETA dynamically accounts for toll plaza queues and highway choke points.
                    </p>
                    <div className="mt-2 space-y-1 bg-navy-50 p-2 rounded-lg text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-navy-700 font-medium">Toll Plaza:</span>
                        <span className="font-black text-saffron-700">{selectedBusEta.tollgateName || 'Highway Toll'} (+{selectedBusEta.tollgateDelayMins || 0}m)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-navy-700 font-medium">Corridor Flow:</span>
                        <span className="font-black text-navy-800">{selectedBusEta.highwayName || 'NCR Highway'} (+{selectedBusEta.highwayDelayMins || 0}m)</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-navy-800 font-bold">Driver: {selectedBus.driver || 'Assigned Driver'}</span>
                  <button
                    onClick={() => {
                      const target = selectedBus || filteredBusList?.[0] || buses?.[0];
                      if (target && onOpenTicketModal) {
                        onOpenTicketModal(target, { travelDate });
                      }
                    }}
                    className="text-saffron-600 hover:text-saffron-700 font-black flex items-center space-x-1"
                  >
                    <span>Book Pass (₹{selectedBus?.fare || 110})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}

          <ErrorBoundary
            title="Interactive Map Unavailable"
            message="We encountered an issue loading the map rendering engine. You can still select buses and book passes above."
          >
            <MapContainer
              center={selectedBusPos || [28.6139, 77.2090]}
              zoom={11}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <MapRouteSync
                routeCoordinates={activeRouteCoordinates}
                selectedBusPos={selectedBusPos}
                routeKey={`${activeSearch?.from || ''}->${activeSearch?.to || ''}`}
              />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Clean, proper road-following active route polyline */}
              {Array.isArray(activeRouteCoordinates) && activeRouteCoordinates.length > 1 && (
                <Polyline
                  positions={activeRouteCoordinates}
                  color="#00205B"
                  weight={5}
                  opacity={0.85}
                  lineCap="round"
                  lineJoin="round"
                />
              )}

              {/* Fleet Bus Markers placed strictly at real GPS locations */}
              {Array.isArray(filteredBusList) && filteredBusList.map((bus) => {
                if (!bus || !bus.id) return null;
                const lat = Number(bus.currentLocation?.lat);
                const lng = Number(bus.currentLocation?.lng);
                if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

                const markerBusEta = calculateMlEta(bus);
                const isSelected = bus.id === selectedBusId;

                return (
                  <Marker
                    key={bus.id}
                    position={[lat, lng]}
                    icon={createBusIcon(bus.occupancy, isSelected)}
                    eventHandlers={{
                      click: () => setSelectedBusId(bus.id),
                    }}
                  >
                    <Popup className="bus-popup">
                      <div className="p-1 max-w-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-navy-800">{bus.regNumber || 'NCR EXPRESS'}</span>
                          <span className="text-[9px] font-black bg-green-100 text-green-800 px-1.5 py-0.2 rounded-full border border-green-300">
                            LIVE ON ROUTE
                          </span>
                        </div>
                        <p className="text-xs text-navy-950 font-bold mt-0.5">{bus.routeName}</p>
                        <div className="mt-1.5 text-[11px] text-navy-700 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Raw GPS ETA:</span>
                            <strong>{markerBusEta.gpsEta} mins</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Dynamic ML ETA:</span>
                            <strong className="text-saffron-600 font-black">{markerBusEta.mlEta} mins</strong>
                          </div>
                          <div className="bg-saffron-50 border border-saffron-200 text-saffron-900 p-1.5 rounded-lg text-[10px] mt-1.5">
                            <div className="font-black flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-saffron-600 shrink-0" />
                              <span>ML-Optimized ETA (75% more accurate, ±1.8m)</span>
                            </div>
                            <div className="text-[9px] text-navy-700 mt-0.5 leading-snug">
                              Powered by our GBDT tollgate delay model ({((markerBusEta?.tollgateName || '').split('&')[0] || '').trim()}: +{markerBusEta.tollgateDelayMins || 0}m, {((markerBusEta?.highwayName || '').split('&')[0] || '').trim()}: +{markerBusEta.highwayDelayMins || 0}m)
                            </div>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </ErrorBoundary>
        </div>

      </div>
    </div>
  );
}
