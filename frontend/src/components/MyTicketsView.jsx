import React, { useState, useEffect } from 'react';
import { Ticket, CheckCircle, Clock, QrCode, MapPin, Bus, User, Phone, ShieldCheck, Sparkles, ArrowRight, RefreshCw, Printer, Smartphone, Wifi } from 'lucide-react';
import { getStoredBookings, saveBookingLocally } from '../services/db';

export default function MyTicketsView({ onNavigateToBook, buses = [], currentUser, onCompletePayment }) {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [activeQrModalTicket, setActiveQrModalTicket] = useState(null);

  const loadTickets = () => {
    const stored = getStoredBookings();
    setTickets(stored);
  };

  useEffect(() => {
    loadTickets();
    const handleStorage = () => loadTickets();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('jan_yatra_offline_queue_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('jan_yatra_offline_queue_updated', handleStorage);
    };
  }, []);

  const handleGenerateSampleTicket = () => {
    const sampleBus = buses[0] || {
      id: 'BUS-100',
      regNumber: 'DL-01-PC-7788',
      routeName: 'Delhi - Noida Express',
      from: 'Delhi (Kashmiri Gate ISBT)',
      to: 'Noida (Sector 62)',
      fare: 45,
      busType: 'Jan Yatra Standard',
      departureTime: '02:45 PM',
      arrivalTime: '03:50 PM',
      duration: '1h 05m',
    };

    saveBookingLocally({
      busId: sampleBus.id,
      busRegNumber: sampleBus.regNumber,
      routeName: sampleBus.routeName,
      busType: sampleBus.busType,
      departureTime: sampleBus.departureTime || '02:45 PM',
      arrivalTime: sampleBus.arrivalTime || '03:50 PM',
      duration: sampleBus.duration || '1h 05m',
      farePerTicket: sampleBus.fare || 45,
      from: sampleBus.from,
      to: sampleBus.to,
      passengerName: currentUser?.name || 'Commuter User',
      passengerPhone: currentUser?.contact || '+91 98XXX XXXXX',
      passengers: 2,
      totalAmount: (sampleBus.fare || 45) * 2,
      paymentMode: 'ONLINE_QR',
    }, false);

    loadTickets();
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'CONFIRMED') return t.status === 'CONFIRMED';
    if (filter === 'OFFLINE') return t.status === 'PENDING_OFFLINE' || t.status === 'QUEUED_OFFLINE';
    return true;
  });

  const totalSpent = tickets.reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0);
  const confirmedCount = tickets.filter((t) => t.status === 'CONFIRMED').length;
  const offlineCount = tickets.filter((t) => t.status === 'PENDING_OFFLINE' || t.status === 'QUEUED_OFFLINE').length;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f9f9fc] p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-forest-900 text-white rounded-3xl p-6 shadow-xl border border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-saffron-500 text-white flex items-center justify-center font-black shadow-saffron border border-saffron-400">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-saffron-500 text-white text-xs font-black px-3 py-0.5 rounded-full border border-saffron-400">
                User / Commuter Portal
              </span>
              <span className="text-xs font-bold text-saffron-300">
                Passenger: {currentUser?.name || 'Commuter User'}
              </span>
            </div>
            <h1 className="text-xl font-black text-white mt-1">My Confirmed Tickets & Passes</h1>
            <p className="text-xs text-navy-100 font-medium">
              View your validated e-tickets, offline hash passes, and payment receipts for {currentUser?.name || 'Commuter User'}.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          <button
            onClick={onNavigateToBook}
            className="flex-1 md:flex-none px-4 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-extrabold text-xs rounded-xl shadow-saffron border border-saffron-400 flex items-center justify-center space-x-1.5 transition-all"
          >
            <span>Book New Ticket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-navy-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-navy-500 block uppercase">Total Passes</span>
            <span className="text-2xl font-black text-navy-900">{tickets.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-navy-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-forest-700 block uppercase">Confirmed Online</span>
            <span className="text-2xl font-black text-forest-700">{confirmedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-navy-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-saffron-700 block uppercase">Offline Queued</span>
            <span className="text-2xl font-black text-saffron-700">{offlineCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-saffron-50 text-saffron-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Refresh */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center space-x-2 bg-navy-50 p-1 rounded-xl border border-navy-200/60">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              filter === 'ALL' ? 'bg-navy-900 text-white shadow-sm' : 'text-navy-700 hover:text-navy-900'
            }`}
          >
            All Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('CONFIRMED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              filter === 'CONFIRMED' ? 'bg-forest-700 text-white shadow-sm' : 'text-navy-700 hover:text-navy-900'
            }`}
          >
            Confirmed ({confirmedCount})
          </button>
          <button
            onClick={() => setFilter('OFFLINE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              filter === 'OFFLINE' ? 'bg-saffron-500 text-white shadow-sm' : 'text-navy-700 hover:text-navy-900'
            }`}
          >
            Offline Queued ({offlineCount})
          </button>
        </div>

        <button
          onClick={loadTickets}
          className="text-xs text-navy-600 hover:text-navy-900 flex items-center space-x-1 font-bold px-2 py-1"
          title="Refresh stored tickets"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map((ticket) => {
            const isConfirmed = ticket.status === 'CONFIRMED';
            return (
              <div
                key={ticket.id || ticket.ticketHash}
                className="bg-white rounded-3xl p-5 shadow-sm border border-navy-100 hover:shadow-md transition-all space-y-4 relative overflow-hidden"
              >
                {/* Top Strip */}
                <div className="flex items-start justify-between border-b border-navy-50 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black text-navy-900">
                        {ticket.ticketHash || ticket.id}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                          isConfirmed
                            ? 'bg-forest-100 text-forest-800 border border-forest-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {isConfirmed ? <CheckCircle className="w-3 h-3 text-forest-700" /> : <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{isConfirmed ? 'CONFIRMED PASS' : 'Queued Offline - Awaiting Network for Online Payment'}</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-navy-400 font-medium block mt-0.5">
                      Booked: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recently'}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveQrModalTicket(ticket)}
                    className="p-2 rounded-xl bg-navy-50 text-navy-800 hover:bg-saffron-50 hover:text-saffron-700 transition-colors"
                    title="View QR Travel Pass"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>

                {/* Route Information */}
                <div>
                  <div className="flex items-center justify-between text-xs font-black text-navy-950 mb-1">
                    <span className="truncate pr-2">{ticket.from}</span>
                    <span className="text-saffron-600 px-1">➔</span>
                    <span className="truncate text-right pl-2">{ticket.to}</span>
                  </div>

                  <div className="bg-navy-50/70 p-2.5 rounded-xl flex items-center justify-between text-[11px] font-bold text-navy-700">
                    <div className="flex items-center space-x-1.5">
                      <Bus className="w-3.5 h-3.5 text-forest-700" />
                      <span>{ticket.busRegNumber || 'DL-01-PC-7788'} ({ticket.busType || 'Express'})</span>
                    </div>
                    <span>{ticket.travelDate ? `📅 ${ticket.travelDate} • ` : ''}🕒 {ticket.departureTime || '02:45 PM'} ➔ {ticket.arrivalTime || '03:50 PM'}</span>
                  </div>

                  {ticket.isFutureBooking && (
                    <div className="text-[10px] text-blue-900 bg-blue-50 border border-blue-200/80 p-2 rounded-xl leading-relaxed font-medium mt-1">
                      ℹ️ Timings are based on historical route data and subject to traffic variations on the day of travel.
                    </div>
                  )}
                </div>

                {/* Passenger & Fare Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-navy-50">
                  <div>
                    <span className="text-[10px] text-navy-500 font-bold block uppercase">Passenger</span>
                    <span className="font-extrabold text-navy-900 flex items-center space-x-1 truncate">
                      <User className="w-3 h-3 text-navy-400 shrink-0" />
                      <span>{ticket.passengerName || 'Commuter'} ({ticket.passengers || 1} Seat{ticket.passengers > 1 ? 's' : ''})</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-navy-500 font-bold block uppercase">Total Fare</span>
                    <span className="text-sm font-black text-forest-700">
                      ₹{ticket.totalAmount || ticket.farePerTicket || 45}
                    </span>
                    <span className="text-[9px] text-navy-500 block font-medium">
                      {isConfirmed ? 'Prepaid UPI / QR' : 'Deferred Online Payment'}
                    </span>
                  </div>
                </div>

                {/* Conductor Inspection Bar */}
                <div className="bg-gradient-to-r from-navy-900 to-navy-950 text-white p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2 truncate">
                    <ShieldCheck className="w-4 h-4 text-saffron-400 shrink-0" />
                    <span className="text-[10px] text-navy-200 truncate">
                      Conductor PIN: <strong className="text-white font-mono text-xs">#{(ticket.id || '8841').slice(-4)}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveQrModalTicket(ticket)}
                    className="text-[10px] font-sans font-bold text-saffron-400 hover:text-saffron-300 underline flex-shrink-0"
                  >
                    Show Pass
                  </button>
                </div>

                {/* Action for Offline Queued Tickets: Complete Payment */}
                {!isConfirmed && (
                  <button
                    type="button"
                    onClick={() => onCompletePayment ? onCompletePayment(ticket) : setActiveQrModalTicket(ticket)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-black text-xs shadow-saffron flex items-center justify-center space-x-1.5 transition-transform active:scale-95"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Complete Online Payment (₹{ticket.totalAmount || ticket.farePerTicket || 45})</span>
                  </button>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 text-center border border-navy-100 shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-navy-50 text-navy-600 flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8 text-saffron-500" />
          </div>
          <div>
            <h3 className="text-base font-black text-navy-900">No Tickets Found</h3>
            <p className="text-xs text-navy-600 mt-1 font-medium leading-relaxed">
              You haven't booked any bus tickets yet, or your filter returned no results.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              onClick={onNavigateToBook}
              className="w-full sm:w-auto px-5 py-3 bg-saffron-500 hover:bg-saffron-600 text-white font-black text-xs rounded-xl shadow-saffron border border-saffron-400 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Book Bus on Commuter Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleGenerateSampleTicket}
              className="w-full sm:w-auto px-4 py-3 bg-navy-50 hover:bg-navy-100 text-navy-800 font-bold text-xs rounded-xl border border-navy-200 transition-all flex items-center justify-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
              <span>⚡ Load Sample Demo Ticket</span>
            </button>
          </div>
        </div>
      )}

      {/* QR Travel Pass Modal */}
      {activeQrModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-navy-100 p-6 space-y-5 text-center relative">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div className="text-left">
                <span className="text-[10px] uppercase font-black text-saffron-600 tracking-wider">JAN YATRA Boarding Pass</span>
                <h3 className="text-sm font-black text-navy-900">{activeQrModalTicket.routeName}</h3>
              </div>
              <button
                onClick={() => setActiveQrModalTicket(null)}
                className="w-7 h-7 rounded-full bg-navy-100 hover:bg-navy-200 text-navy-800 flex items-center justify-center text-xs font-black"
              >
                ✕
              </button>
            </div>

            {/* Status Badge in Modal */}
            {(activeQrModalTicket.isQueued || activeQrModalTicket.status === 'QUEUED_OFFLINE') ? (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-900">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  Queued Offline - Awaiting Network for Online Payment
                </span>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  Stored securely on device. Once online, complete digital payment to confirm ticket.
                </p>
              </div>
            ) : null}

            {/* Mock QR Code Visual */}
            <div className="bg-navy-50 p-6 rounded-2xl border border-navy-200 inline-block mx-auto">
              <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-inner border border-navy-200 flex flex-col items-center justify-center font-mono text-[10px] space-y-1">
                <div className="grid grid-cols-6 gap-1 w-full h-full p-1 opacity-90">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        (i % 2 === 0 || i % 5 === 0) && i !== 14 && i !== 21
                          ? 'bg-navy-900'
                          : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="block text-[11px] font-mono font-black text-navy-900 mt-2">
                {activeQrModalTicket.ticketHash || activeQrModalTicket.id}
              </span>
            </div>

            <div className="text-xs text-navy-700 font-medium space-y-1 bg-navy-50/70 p-3 rounded-xl text-left">
              <div className="flex justify-between">
                <span>Passenger:</span>
                <strong className="text-navy-900">{activeQrModalTicket.passengerName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Bus:</span>
                <strong className="text-navy-900">{activeQrModalTicket.busRegNumber}</strong>
              </div>
              {activeQrModalTicket.travelDate && (
                <div className="flex justify-between">
                  <span>Travel Date:</span>
                  <strong className="text-navy-900">{activeQrModalTicket.travelDate}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span>Amount:</span>
                <strong className="text-forest-700">₹{activeQrModalTicket.totalAmount}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                {(activeQrModalTicket.isQueued || activeQrModalTicket.status === 'QUEUED_OFFLINE') ? (
                  <span className="text-amber-800 font-bold text-[10px] bg-amber-100 px-1.5 py-0.5 rounded">Deferred Online Payment</span>
                ) : (
                  <span className="text-forest-700 font-bold text-[10px] bg-forest-50 px-1.5 py-0.5 rounded">Online UPI Confirmed</span>
                )}
              </div>
              {activeQrModalTicket.isFutureBooking && (
                <div className="text-[9px] text-blue-800 bg-blue-50 p-1.5 rounded text-left italic border border-blue-100">
                  Timings are based on historical route data and subject to traffic variations on the day of travel.
                </div>
              )}
              <div className="flex justify-between border-t border-navy-200/60 pt-1">
                <span>Conductor PIN:</span>
                <strong className="font-mono text-navy-950">#{(activeQrModalTicket.id || '8841').slice(-4)}</strong>
              </div>
            </div>

            {(activeQrModalTicket.isQueued || activeQrModalTicket.status === 'QUEUED_OFFLINE') && onCompletePayment && (
              <button
                onClick={() => {
                  const t = activeQrModalTicket;
                  setActiveQrModalTicket(null);
                  onCompletePayment(t);
                }}
                className="w-full py-3 bg-gradient-to-r from-saffron-500 to-amber-500 hover:from-saffron-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                Complete Online Payment (₹{activeQrModalTicket.totalAmount})
              </button>
            )}

            <button
              onClick={() => setActiveQrModalTicket(null)}
              className="w-full py-3 bg-navy-900 hover:bg-navy-950 text-white font-extrabold text-xs rounded-xl transition-all"
            >
              Close Boarding Pass
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
