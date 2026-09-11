import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { calculateMlEta } from '../services/mlEta';
import { findBusesForRoute } from '../services/mockData';
import CitySearchBooking from './CitySearchBooking';
import { Bus, MapPin, Zap, Ticket, Sparkles, ChevronRight, AlertTriangle, Info, X } from 'lucide-react';

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
        <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.2 6 18.2 6H5.8C4.8 6 3.9 6.8 3.6 7.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2C2.5 16.3 3 18 3 18h3"/>
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

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 10, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function CommuterView({ buses, routes, onOpenTicketModal, isOffline }) {
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
    return findBusesForRoute(buses, 'Delhi (Kashmiri Gate ISBT)', 'Noida (Sector 62)');
  });

  useEffect(() => {
    if (activeSearch?.from && activeSearch?.to) {
      const matched = findBusesForRoute(buses, activeSearch.from, activeSearch.to);
      setFilteredBusList(matched);
      if (matched.length > 0 && !matched.some((b) => b.id === selectedBusId)) {
        setSelectedBusId(matched[0].id);
      }
    } else {
      setFilteredBusList(buses);
    }
  }, [buses, activeSearch]);

  const handleSelectSearchRoute = (from, to) => {
    setActiveSearch({ from, to });
    const matched = findBusesForRoute(buses, from, to);
    setFilteredBusList(matched);
    if (matched.length > 0) {
      setSelectedBusId(matched[0].id);
    }
  };

  const selectedBus = filteredBusList.find((b) => b.id === selectedBusId) || filteredBusList[0] || buses[0];

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-[#f9f9fc]">
      
      {/* Top Inter-City Search Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <CitySearchBooking
          onSelectSearchRoute={handleSelectSearchRoute}
          onOpenTicketModal={onOpenTicketModal}
        />
      </div>

      {/* Main Map & Bus List Workspace */}
      <div className="relative flex-1 bg-[#f9f9fc] flex flex-col lg:flex-row overflow-hidden border-t border-navy-100">
        
        {/* Sidebar: Bus List & Predictive ETA Toggle */}
        <div className="w-full lg:w-[420px] bg-white border-r border-navy-100 p-4 sm:p-5 overflow-y-auto flex flex-col space-y-4 shadow-sm z-20">
          
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
                  </div>

                  {/* ML-Optimized ETA Tag / Badge next to bus ETA */}
                  {useMlEta && (
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
                              <span className="font-black text-saffron-700">+{busEta.tollgateDelayMins}m ({busEta.tollgateName.split('&')[0].trim()})</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-navy-700 font-medium">Highway Delay Adjustment:</span>
                              <span className="font-black text-navy-800">+{busEta.highwayDelayMins}m ({busEta.highwayName.split('&')[0].trim()})</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-navy-200/60 pt-1">
                              <span className="text-navy-900 font-bold">Total Dynamic ML ETA:</span>
                              <span className="font-black text-forest-700">{busEta.mlEta} mins (vs {busEta.gpsEta}m raw GPS)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
              onClick={() => onOpenTicketModal(selectedBus)}
              className="w-full bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-saffron transition-all flex items-center justify-center space-x-2 text-sm border border-saffron-400"
            >
              <Ticket className="w-5 h-5" />
              <span>Book Seat on {selectedBus.regNumber} (₹{selectedBus.fare || 110})</span>
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

                {/* ML-Optimized ETA Visual Tag, Badge & GBDT Model Adjustment */}
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

                {/* Real-Time Speed & Dynamic Delay Adjustments */}
                <div className="grid grid-cols-2 gap-2 text-xs my-2.5 bg-navy-50/50 p-2.5 rounded-xl border border-navy-100">
                  <div>
                    <span className="text-navy-600 block text-[10px] font-bold">GPS Speed</span>
                    <span className="font-extrabold text-navy-900">{selectedBus.speed} km/h</span>
                  </div>
                  <div>
                    <span className="text-navy-600 block text-[10px] font-bold">Tollgate Queue Adj.</span>
                    <span className="font-extrabold text-saffron-600">+{selectedBusEta.tollgateDelayMins}m</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-navy-100/60 flex items-center justify-between text-[10px]">
                    <span className="text-navy-600 font-medium">Highway Delay Adj:</span>
                    <span className="font-bold text-navy-800">+{selectedBusEta.highwayDelayMins}m ({selectedBusEta.highwayName.split('&')[0].trim()})</span>
                  </div>
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
                        <span className="font-black text-saffron-700">{selectedBusEta.tollgateName} (+{selectedBusEta.tollgateDelayMins}m)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-navy-700 font-medium">Corridor Flow:</span>
                        <span className="font-black text-navy-800">{selectedBusEta.highwayName} (+{selectedBusEta.highwayDelayMins}m)</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-navy-800 font-bold">Driver: {selectedBus.driver}</span>
                  <button
                    onClick={() => onOpenTicketModal(selectedBus)}
                    className="text-saffron-600 hover:text-saffron-700 font-black flex items-center space-x-1"
                  >
                    <span>Book Pass (₹{selectedBus.fare || 110})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}

          <MapContainer
            center={[selectedBus.currentLocation.lat, selectedBus.currentLocation.lng]}
            zoom={10}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <MapRecenter center={[selectedBus.currentLocation.lat, selectedBus.currentLocation.lng]} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {routes.map((route) => (
              <Polyline
                key={route.id}
                positions={route.coordinates}
                color={route.id === selectedBus.routeId ? '#00205B' : '#0D6938'}
                weight={route.id === selectedBus.routeId ? 6 : 3}
                opacity={0.85}
              />
            ))}

            {selectedBus?.routeCoordinates && (
              <Polyline
                positions={selectedBus.routeCoordinates}
                color="#F46522"
                weight={5}
                opacity={0.9}
              />
            )}

            {filteredBusList.map((bus) => {
              const markerBusEta = calculateMlEta(bus);
              return (
                <Marker
                  key={bus.id}
                  position={[bus.currentLocation.lat, bus.currentLocation.lng]}
                  icon={createBusIcon(bus.occupancy, bus.id === selectedBusId)}
                  eventHandlers={{
                    click: () => setSelectedBusId(bus.id),
                  }}
                >
                  <Popup className="bus-popup">
                    <div className="p-1 max-w-xs">
                      <span className="text-xs font-black text-navy-800 block">{bus.regNumber}</span>
                      <p className="text-xs text-navy-950 font-bold">{bus.routeName}</p>
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
                            Powered by our GBDT tollgate delay model ({markerBusEta.tollgateName.split('&')[0].trim()}: +{markerBusEta.tollgateDelayMins}m, {markerBusEta.highwayName.split('&')[0].trim()}: +{markerBusEta.highwayDelayMins}m)
                          </div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}
