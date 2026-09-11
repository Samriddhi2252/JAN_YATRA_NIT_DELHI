import React, { useState } from 'react';
import { X, Ticket, QrCode, CheckCircle2, WifiOff, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TicketModal({ bus, isOpen, onClose, onConfirmBooking, isOffline, initialBookingData }) {
  const [passengers, setPassengers] = useState(initialBookingData?.count || 1);
  const [passengerName, setPassengerName] = useState('Rahul Sharma');
  const [passengerPhone, setPassengerPhone] = useState('98123 45678');
  const [bookedTicket, setBookedTicket] = useState(null);

  if (!isOpen || !bus) return null;

  const farePerTicket = bus.fare || 110;
  const totalAmount = farePerTicket * passengers;

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    const bookingPayload = {
      busId: bus.id,
      busRegNumber: bus.regNumber,
      routeName: bus.routeName,
      passengerName,
      passengerPhone,
      passengers,
      totalAmount,
      from: bus.from || 'Rohtak Bus Stand',
      to: bus.to || 'Hisar Bypass Depot',
    };

    const newTicket = onConfirmBooking(bookingPayload);
    setBookedTicket(newTicket);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-navy-100">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-forest-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="JAN YATRA" className="h-10 w-auto bg-white/10 p-1 rounded-xl" />
            <div>
              <h3 className="font-black text-base">Book Bus Ticket Pass</h3>
              <p className="text-xs text-navy-100 font-bold">{bus.routeName} ({bus.regNumber})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Queueing Info Banner */}
        {isOffline && (
          <div className="bg-saffron-500 text-white px-4 py-2 text-xs font-extrabold flex items-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span>Network Offline: Booking will be queued in IndexedDB & synced automatically once reconnected.</span>
          </div>
        )}

        {!bookedTicket ? (
          /* Ticket Booking Form */
          <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
            
            {/* Route Overview */}
            <div className="bg-navy-50/50 p-4 rounded-2xl border border-navy-100 space-y-2 text-xs">
              <div className="flex items-center justify-between font-black text-navy-900">
                <span>{bus.from || 'Rohtak Bus Stand'}</span>
                <ArrowRight className="w-4 h-4 text-saffron-500" />
                <span>{bus.to || 'Hisar Bypass Depot'}</span>
              </div>
              <div className="flex items-center justify-between text-navy-700 pt-2 border-t border-navy-100">
                <span>Fare per seat: ₹{farePerTicket}</span>
                <span className="text-forest-700 font-black">Next Bus ETA: {bus.gpsEtaMinutes} mins</span>
              </div>
            </div>

            {/* Passenger Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-navy-800 mb-1">Passenger Name</label>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs font-bold text-navy-900 focus:ring-2 focus:ring-navy-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-navy-800 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs font-bold text-navy-900 focus:ring-2 focus:ring-navy-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Seat Counter */}
            <div>
              <label className="block text-xs font-extrabold text-navy-800 mb-1.5 flex items-center justify-between">
                <span>Number of Passengers</span>
                <span className="text-saffron-600 font-black">{passengers} Seat(s)</span>
              </label>
              <div className="flex items-center space-x-3 bg-navy-50 p-2 rounded-2xl border border-navy-100">
                <button
                  type="button"
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  className="w-10 h-10 rounded-xl bg-white text-navy-900 font-black shadow-sm hover:bg-navy-100 flex items-center justify-center text-base border border-navy-200"
                >
                  -
                </button>
                <div className="flex-1 text-center font-black text-sm text-navy-900">
                  {passengers} Passenger(s)
                </div>
                <button
                  type="button"
                  onClick={() => setPassengers(Math.min(6, passengers + 1))}
                  className="w-10 h-10 rounded-xl bg-white text-navy-900 font-black shadow-sm hover:bg-navy-100 flex items-center justify-center text-base border border-navy-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Fare Summary & Submit */}
            <div className="pt-3 border-t border-navy-100 flex items-center justify-between">
              <div>
                <span className="text-navy-600 text-[11px] block font-bold">Total Fare Amount</span>
                <span className="text-xl font-black text-navy-900">₹{totalAmount}</span>
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-black py-3 px-6 rounded-xl shadow-saffron border border-saffron-400 text-xs flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm & Pay ₹{totalAmount}</span>
              </button>
            </div>

          </form>
        ) : (
          /* Booked Ticket Digital Pass Preview */
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-navy-900">
                {isOffline ? 'Ticket Saved Offline!' : 'Ticket Confirmed!'}
              </h3>
              <p className="text-xs text-navy-700 font-bold">
                {isOffline ? 'Queued locally in IndexedDB. Ready for conductor scan.' : 'SMS confirmation sent to mobile.'}
              </p>
            </div>

            {/* Digital QR Code Card with Navy Blue & Saffron */}
            <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-forest-900 text-white p-5 rounded-2xl shadow-xl text-left border border-navy-700 space-y-3">
              <div className="flex items-center justify-between border-b border-navy-700 pb-2">
                <span className="text-xs font-black text-saffron-400 uppercase tracking-wide">JAN YATRA Digital Pass</span>
                <span className="bg-saffron-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  {bookedTicket.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">{bookedTicket.routeName}</h4>
                  <span className="text-xs text-navy-200 block font-bold">{bookedTicket.busRegNumber}</span>
                  <span className="text-xs text-navy-200 mt-1 block">Passenger: <strong>{bookedTicket.passengerName} ({bookedTicket.passengers} seats)</strong></span>
                </div>
                
                <div className="bg-white p-2 rounded-xl shadow-md">
                  <QrCode className="w-16 h-16 text-navy-900" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-navy-700 text-[11px] text-navy-200 font-mono">
                <span>Pass Hash: {bookedTicket.ticketHash}</span>
                <span>Total: ₹{bookedTicket.totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setBookedTicket(null);
                onClose();
              }}
              className="w-full bg-navy-800 hover:bg-navy-900 text-white font-extrabold py-3 rounded-xl text-xs"
            >
              Done & Return to Map
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
