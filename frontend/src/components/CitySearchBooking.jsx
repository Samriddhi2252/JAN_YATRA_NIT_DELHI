import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, ArrowRightLeft, Bus, Ticket, Zap, Sparkles } from 'lucide-react';
import { CITIES_LIST } from '../services/mockData';

export default function CitySearchBooking({ onSelectSearchRoute, onOpenTicketModal }) {
  const [fromCity, setFromCity] = useState('Delhi (Kashmiri Gate ISBT)');
  const [toCity, setToCity] = useState('Noida (Sector 62)');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState(1);
  const [searchResults, setSearchResults] = useState(null);

  const handleSwapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleSearchBuses = (e) => {
    e.preventDefault();
    
    // Trigger route filtering & search result preview
    onSelectSearchRoute(fromCity, toCity, passengers);
    setSearchResults({
      from: fromCity,
      to: toCity,
      date: travelDate,
      passengers,
    });
  };

  return (
    <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-forest-950 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-navy-800 space-y-4 my-4">
      
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-saffron-500 text-white flex items-center justify-center font-black shadow-saffron">
            <Bus className="w-4 h-4" />
          </div>
          <h2 className="text-base font-black text-white tracking-wide">
            Inter-City Bus Search & Ticket Booking
          </h2>
        </div>

        <span className="bg-saffron-500/20 text-saffron-300 text-[10px] font-black px-3 py-1 rounded-full border border-saffron-400/40">
          Delhi NCR & Haryana Network
        </span>
      </div>

      {/* Search Input Form Bar */}
      <form onSubmit={handleSearchBuses} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* From City Select */}
        <div className="md:col-span-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          <label className="block text-[10px] font-extrabold uppercase text-saffron-300 mb-1 flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-saffron-400" />
            <span>From (Origin City)</span>
          </label>
          <select
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
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
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
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
        <div className="md:col-span-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          <label className="block text-[10px] font-extrabold uppercase text-navy-200 mb-1 flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-white" />
            <span>Travel Date</span>
          </label>
          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            className="w-full bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
          />
        </div>

        {/* Search Submit Button */}
        <div className="md:col-span-12 pt-1">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-black py-3.5 px-6 rounded-2xl shadow-saffron border border-saffron-400 text-xs flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01]"
          >
            <Search className="w-4 h-4" />
            <span>Search Inter-City Express Buses ({fromCity.split(' ')[0]} ➔ {toCity.split(' ')[0]})</span>
          </button>
        </div>

      </form>

      {/* Quick Inter-City Popular Corridor Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pt-1 text-[11px] font-bold">
        <span className="text-navy-300 uppercase text-[10px] font-black flex-shrink-0">Popular Routes:</span>
        <button
          onClick={() => {
            setFromCity('Delhi (Kashmiri Gate ISBT)');
            setToCity('Noida (Sector 62)');
          }}
          className="bg-navy-800 hover:bg-navy-700 text-saffron-300 px-3 py-1 rounded-xl border border-navy-700 flex-shrink-0 transition-all"
        >
          🚌 Delhi ➔ Noida (32 km)
        </button>
        <button
          onClick={() => {
            setFromCity('Delhi (Anand Vihar ISBT)');
            setToCity('Rohtak (Bus Stand)');
          }}
          className="bg-navy-800 hover:bg-navy-700 text-forest-300 px-3 py-1 rounded-xl border border-navy-700 flex-shrink-0 transition-all"
        >
          🚌 Delhi ➔ Gurgaon ➔ Rohtak (86 km)
        </button>
        <button
          onClick={() => {
            setFromCity('Noida (Botanical Garden)');
            setToCity('Panipat (Mill Chowk)');
          }}
          className="bg-navy-800 hover:bg-navy-700 text-saffron-300 px-3 py-1 rounded-xl border border-navy-700 flex-shrink-0 transition-all"
        >
          🚌 Noida ➔ Panipat (94 km)
        </button>
      </div>

    </div>
  );
}
