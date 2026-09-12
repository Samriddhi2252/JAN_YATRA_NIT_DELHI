import React, { useState, useEffect } from 'react';
import {
  X,
  Ticket,
  QrCode,
  CheckCircle2,
  WifiOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Banknote,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  AlertCircle,
  Calendar,
  Bus as BusIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cleanExpiredOfflineBookings } from '../services/db';

export default function TicketModal({ bus, isOpen, onClose, onConfirmBooking, isOffline, initialBookingData }) {
  const [passengers, setPassengers] = useState(initialBookingData?.count || 1);
  const [passengerName, setPassengerName] = useState('Rahul Sharma');
  const [passengerPhone, setPassengerPhone] = useState('98123 45678');
  
  // Modal Workflow Steps: 'FORM' | 'PAYMENT_OPTIONS' | 'PASS'
  const [step, setStep] = useState('FORM');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('ONLINE_QR'); // 'ONLINE_QR' | 'CASH_TO_CONDUCTOR'
  const [bookedTicket, setBookedTicket] = useState(null);
  
  // Real-time offline expiry countdown
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [isBookingExpired, setIsBookingExpired] = useState(false);

  // Reset modal state when bus changes or modal reopens
  useEffect(() => {
    if (isOpen) {
      setStep('FORM');
      setBookedTicket(null);
      setIsBookingExpired(false);
      setRemainingSeconds(null);
      if (initialBookingData?.count) {
        setPassengers(initialBookingData.count);
      }
    }
  }, [isOpen, bus, initialBookingData]);

  // Background sync check & live countdown for offline pending ticket
  useEffect(() => {
    if (!bookedTicket || bookedTicket.status !== 'PENDING_OFFLINE') return;

    const checkExpiry = () => {
      cleanExpiredOfflineBookings();
      const now = Date.now();
      const target = bookedTicket.arrivalEtaTimestamp;
      if (!target) return;

      const diffSecs = Math.max(0, Math.floor((target - now) / 1000));
      setRemainingSeconds(diffSecs);

      if (diffSecs <= 0) {
        setIsBookingExpired(true);
      }
    };

    checkExpiry();
    const timer = setInterval(checkExpiry, 1000);
    return () => clearInterval(timer);
  }, [bookedTicket]);

  if (!isOpen || !bus) return null;

  // Exact Selected Dynamic Details
  const sourceCity = initialBookingData?.from || bus.from || 'Delhi (Kashmiri Gate ISBT)';
  const destCity = initialBookingData?.to || bus.to || 'Noida (Sector 62)';
  const farePerTicket = Number(initialBookingData?.fare || bus.fare) || 50;
  const totalAmount = farePerTicket * passengers;
  const now = new Date();
  const fallbackDep = new Date(now.getTime() + 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fallbackArr = new Date(now.getTime() + 75 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const departureTime = initialBookingData?.departureTime || bus.departureTime || fallbackDep;
  const arrivalTime = initialBookingData?.arrivalTime || bus.arrivalTime || fallbackArr;
  const duration = initialBookingData?.duration || bus.duration || `${bus.gpsEtaMinutes || 20} mins`;
  const busType = initialBookingData?.busType || bus.busType || 'Jan Yatra Express';
  const regNumber = initialBookingData?.regNumber || bus.regNumber || 'DL-01-EV-5544';
  const routeName = initialBookingData?.routeName || bus.routeName || `${sourceCity.split(' ')[0]} - ${destCity.split(' ')[0]} Express`;
  const etaMinutes = Number(bus.gpsEtaMinutes) || 18;

  // Step 1: User clicks "Confirm and Pay"
  const handleProceedToPayment = (e) => {
    e.preventDefault();

    const bookingBase = {
      busId: bus.id,
      busRegNumber: regNumber,
      routeName: routeName,
      busType: busType,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      duration: duration,
      farePerTicket: farePerTicket,
      passengerName,
      passengerPhone,
      passengers,
      totalAmount,
      gpsEtaMinutes: etaMinutes,
      from: sourceCity,
      to: destCity,
    };

    if (isOffline) {
      // Offline mode: automatically route booking to offline queue with cash-to-conductor mode
      const offlineTicket = onConfirmBooking({
        ...bookingBase,
        paymentMode: 'CASH_TO_CONDUCTOR',
      });
      setBookedTicket(offlineTicket);
      setStep('PASS');
    } else {
      // Online mode: present two payment mode options (Online QR vs Cash to Conductor)
      setStep('PAYMENT_OPTIONS');
    }
  };

  // Step 2 (Online flow): User selects payment mode and completes payment
  const handleCompleteOnlineSelection = (mode) => {
    const bookingPayload = {
      busId: bus.id,
      busRegNumber: regNumber,
      routeName: routeName,
      busType: busType,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      duration: duration,
      farePerTicket: farePerTicket,
      passengerName,
      passengerPhone,
      passengers,
      totalAmount,
      gpsEtaMinutes: etaMinutes,
      from: sourceCity,
      to: destCity,
      paymentMode: mode,
    };

    const confirmedTicket = onConfirmBooking(bookingPayload);
    setBookedTicket(confirmedTicket);
    setStep('PASS');

    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  // Fast-forward simulator to test the background sync auto-invalidation requirement
  const handleSimulateArrivalExpiry = () => {
    if (!bookedTicket) return;
    const pastTimestamp = Date.now() - 5000;
    bookedTicket.arrivalEtaTimestamp = pastTimestamp;
    cleanExpiredOfflineBookings();
    setRemainingSeconds(0);
    setIsBookingExpired(true);
  };

  // Format seconds to mm:ss
  const formatCountdown = (secs) => {
    if (secs === null || secs === undefined) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-navy-100 max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header with Dynamic Bus & Route Info */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-forest-800 p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="JAN YATRA" className="h-10 w-auto bg-white/10 p-1 rounded-xl" />
            <div>
              <h3 className="font-black text-base">
                {step === 'FORM' && 'Book Bus Ticket Pass'}
                {step === 'PAYMENT_OPTIONS' && 'Select Payment Mode'}
                {step === 'PASS' && (isOffline ? 'Offline Booking Queued' : 'Ticket Confirmation')}
              </h3>
              <p className="text-xs text-navy-100 font-bold flex items-center space-x-1.5">
                <span>{routeName}</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded font-mono text-[10px]">{regNumber}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Network Banner */}
        {isOffline && (
          <div className="bg-amber-600 text-white px-4 py-2 text-xs font-extrabold flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2">
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              <span>Offline Mode: Bookings auto-queue locally. Cash to conductor required.</span>
            </div>
            <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded font-mono">IDB QUEUE</span>
          </div>
        )}

        <div className="overflow-y-auto p-6 flex-1">
          {/* ========================================================================= */}
          {/* STEP 1: DYNAMIC PASSENGER DETAILS FORM                                    */}
          {/* ========================================================================= */}
          {step === 'FORM' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Dynamic Route Overview Card */}
              <div className="bg-navy-50/80 p-4 rounded-2xl border border-navy-100 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-black text-navy-950">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-saffron-500"></span>
                    <span>{sourceCity}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-saffron-500 flex-shrink-0 mx-2" />
                  <div className="flex items-center space-x-1.5 text-right">
                    <span className="w-2 h-2 rounded-full bg-forest-600"></span>
                    <span>{destCity}</span>
                  </div>
                </div>

                {/* Timing & Vehicle Type Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-navy-200/60 text-[11px] text-navy-800">
                  <div className="bg-white p-2 rounded-xl border border-navy-100 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-saffron-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-navy-500 block font-bold">Scheduled Timings</span>
                      <strong className="text-navy-900">{departureTime} ➔ {arrivalTime}</strong>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-navy-100 flex items-center space-x-2">
                    <BusIcon className="w-4 h-4 text-forest-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-navy-500 block font-bold">Fleet Service</span>
                      <strong className="text-navy-900 truncate block">{busType}</strong>
                    </div>
                  </div>
                </div>

                {/* Pricing & ETA breakdown */}
                <div className="flex items-center justify-between text-navy-700 pt-1">
                  <span className="font-bold">
                    Exact Fare: <strong className="text-navy-950 text-sm">₹{farePerTicket}</strong> / seat
                  </span>
                  <span className="text-forest-700 font-black flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Duration: {duration} (Next Bus ~{etaMinutes}m)</span>
                  </span>
                </div>
              </div>

              {/* Passenger Details */}
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
                  <span className="text-saffron-600 font-black">{passengers} Seat(s) (₹{farePerTicket} × {passengers})</span>
                </label>
                <div className="flex items-center space-x-3 bg-navy-50 p-2 rounded-2xl border border-navy-100">
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className="w-10 h-10 rounded-xl bg-white text-navy-900 font-black shadow-sm hover:bg-navy-100 flex items-center justify-center text-base border border-navy-200 transition-colors"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-black text-sm text-navy-900">
                    {passengers} Passenger(s)
                  </div>
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.min(6, passengers + 1))}
                    className="w-10 h-10 rounded-xl bg-white text-navy-900 font-black shadow-sm hover:bg-navy-100 flex items-center justify-center text-base border border-navy-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Dynamic Fare Summary & Submit Button */}
              <div className="pt-3 border-t border-navy-100 flex items-center justify-between">
                <div>
                  <span className="text-navy-600 text-[11px] block font-bold">Total Fare (₹{farePerTicket} × {passengers})</span>
                  <span className="text-2xl font-black text-navy-950">₹{totalAmount}</span>
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-black py-3 px-6 rounded-xl shadow-saffron border border-saffron-400 text-xs flex items-center space-x-2 transition-transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm and Pay ₹{totalAmount}</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: ONLINE PAYMENT MODE OPTIONS                                       */}
          {/* ========================================================================= */}
          {step === 'PAYMENT_OPTIONS' && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('FORM')}
                  className="text-xs font-bold text-navy-600 hover:text-navy-900 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to details</span>
                </button>
                <span className="text-xs font-black text-navy-900">Amount Due: ₹{totalAmount}</span>
              </div>

              <div className="bg-navy-50 p-3 rounded-xl border border-navy-100 text-xs text-navy-800 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>{sourceCity.split(' ')[0]} ➔ {destCity.split(' ')[0]} ({regNumber})</span>
                  <span className="text-saffron-600 font-black">₹{farePerTicket} × {passengers}</span>
                </div>
                <div className="text-[11px] text-navy-600">
                  Departure: <strong>{departureTime}</strong> | Arrival: <strong>{arrivalTime}</strong>
                </div>
              </div>

              <p className="text-xs font-bold text-navy-700">
                Please select how you wish to pay for your ticket:
              </p>

              {/* Payment Mode Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Online Payment via QR Code */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMode('ONLINE_QR')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                    selectedPaymentMode === 'ONLINE_QR'
                      ? 'border-saffron-500 bg-saffron-50/40 shadow-md ring-2 ring-saffron-400/20'
                      : 'border-navy-200 hover:border-navy-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-saffron-100 text-saffron-700 flex items-center justify-center mb-2">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-navy-900">Online Payment</h4>
                    <span className="bg-saffron-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">UPI QR</span>
                  </div>
                  <p className="text-[11px] text-navy-600 font-bold mt-1">
                    Scan via QR Code (GPay, PhonePe, Paytm, BHIM).
                  </p>
                </button>

                {/* Option 2: Pay Offline in Cash to Conductor */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMode('CASH_TO_CONDUCTOR')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                    selectedPaymentMode === 'CASH_TO_CONDUCTOR'
                      ? 'border-forest-600 bg-forest-50/40 shadow-md ring-2 ring-forest-500/20'
                      : 'border-navy-200 hover:border-navy-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center mb-2">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-navy-900">Pay Offline in Cash</h4>
                    <span className="bg-forest-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">ON BOARD</span>
                  </div>
                  <p className="text-[11px] text-navy-600 font-bold mt-1">
                    Pay exact cash directly to conductor upon boarding.
                  </p>
                </button>
              </div>

              {/* Conditional Payment Action View */}
              {selectedPaymentMode === 'ONLINE_QR' ? (
                <div className="bg-navy-900 text-white p-5 rounded-2xl border border-navy-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-navy-700/80 pb-2">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-saffron-400" />
                      <span className="text-xs font-black text-white">Scan BharatQR / UPI to Pay</span>
                    </div>
                    <span className="text-xs font-black text-saffron-400">₹{totalAmount}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-lg flex-shrink-0">
                      <QrCode className="w-20 h-20 text-navy-950" />
                    </div>

                    <div className="text-xs space-y-1 text-navy-200 font-medium">
                      <p className="text-white font-black">JAN YATRA Transit Services</p>
                      <p className="text-[11px] text-navy-300">UPI ID: <span className="font-mono text-saffron-300">janyatra.delhi@upi</span></p>
                      <p className="text-[11px] text-navy-300">Bus: <span className="text-white font-bold">{regNumber}</span></p>
                      <p className="text-[10px] text-forest-300 flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 inline" />
                        <span>Secure NPCI / UPI Gateway</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCompleteOnlineSelection('ONLINE_QR')}
                    className="w-full bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-black py-3 px-4 rounded-xl shadow-saffron text-xs flex items-center justify-center space-x-2 transition-transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Payment & Generate Pass (₹{totalAmount})</span>
                  </button>
                </div>
              ) : (
                <div className="bg-forest-900 text-white p-5 rounded-2xl border border-forest-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-forest-700/80 pb-2">
                    <div className="flex items-center space-x-2">
                      <Banknote className="w-4 h-4 text-forest-300" />
                      <span className="text-xs font-black text-white">Cash Payment on Board</span>
                    </div>
                    <span className="text-xs font-black text-forest-300">₹{totalAmount}</span>
                  </div>

                  <div className="text-xs text-forest-100 space-y-1.5 font-medium">
                    <p className="font-bold text-white">
                      Please carry exact cash of <strong className="text-forest-200 underline">₹{totalAmount}</strong> for {passengers} passenger(s).
                    </p>
                    <p className="text-[11px] text-forest-200">
                      Your confirmed ticket pass will be generated instantly. Present the pass hash or QR code to the conductor upon boarding bus <span className="font-mono font-bold text-white">{regNumber}</span> ({departureTime}) and hand over the cash fare.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCompleteOnlineSelection('CASH_TO_CONDUCTOR')}
                    className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-500 hover:to-forest-600 text-white font-black py-3 px-4 rounded-xl shadow-md text-xs flex items-center justify-center space-x-2 transition-transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Cash Booking & Generate Pass</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: DYNAMIC TICKET PASS PREVIEW                                       */}
          {/* ========================================================================= */}
          {step === 'PASS' && bookedTicket && (
            <div className="space-y-4 text-center">
              
              {/* Top Status Icon & Message */}
              {!isOffline && bookedTicket.status === 'CONFIRMED' ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-navy-900">Ticket Confirmed!</h3>
                    <p className="text-xs text-navy-700 font-bold">
                      {bookedTicket.paymentMode === 'ONLINE_QR'
                        ? 'Online payment verified via QR Code. Digital boarding pass issued.'
                        : 'Booking confirmed! Pay exact cash to conductor upon boarding.'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-sm ${
                    isBookingExpired ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isBookingExpired ? <AlertCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-navy-900">
                      {isBookingExpired ? 'Booking Invalidated / Dropped' : 'Ticket Pending in Offline Queue'}
                    </h3>
                    <p className="text-xs text-navy-700 font-bold">
                      {isBookingExpired
                        ? 'Bus arrival time passed while device remained offline without reconnecting.'
                        : 'Stored locally in device IndexedDB queue. Ready for conductor verification.'}
                    </p>
                  </div>

                  {/* Mandatory Offline Notice */}
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-left space-y-2">
                    <div className="flex items-center space-x-2 text-amber-900 font-black text-xs sm:text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <span>Notice: Ticket is Pending Confirmation</span>
                    </div>
                    <p className="text-xs font-bold text-amber-950 leading-relaxed">
                      Cash payment of the exact fare of <span className="font-black underline text-amber-900">₹{bookedTicket.totalAmount}</span> must be made directly to the conductor upon boarding bus <span className="font-mono font-black">{bookedTicket.busRegNumber}</span>.
                    </p>
                  </div>

                  {/* Background Sync & Expiry Banner */}
                  <div className={`p-3.5 rounded-2xl border text-left space-y-1.5 ${
                    isBookingExpired
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : 'bg-navy-50 border-navy-200 text-navy-900'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="flex items-center space-x-1.5">
                        <RefreshCw className={`w-3.5 h-3.5 ${isBookingExpired ? 'text-red-600' : 'text-saffron-600 animate-spin'}`} />
                        <span>Background Sync Expiry Check</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                        isBookingExpired ? 'bg-red-200 text-red-900 font-black' : 'bg-navy-200 text-navy-900'
                      }`}>
                        {isBookingExpired ? 'EXPIRED' : `ETA: ${formatCountdown(remainingSeconds)}`}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-navy-700">
                      {isBookingExpired ? (
                        <span className="text-red-700 font-bold">
                          The bus arrival window has elapsed without reconnecting to the server. As per transit protocol, this offline booking request has been automatically dropped from the queue.
                        </span>
                      ) : (
                        <span>
                          If this device remains offline until the scheduled bus arrival time (<strong className="text-navy-950">{bookedTicket.arrivalEtaTimeFormatted || `~${etaMinutes} mins`}</strong>) passes without reconnecting to the server, this pending offline booking will automatically be invalidated and dropped.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Simulator button for fast test evaluation */}
                  {!isBookingExpired && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={handleSimulateArrivalExpiry}
                        className="text-[10px] text-navy-500 hover:text-red-600 font-bold underline transition-colors"
                        title="Simulate bus arrival passing to test auto-invalidation"
                      >
                        [Demo: Fast-Forward to Bus Arrival Time]
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Dynamic Digital Pass Card */}
              <div className={`p-5 rounded-2xl shadow-xl text-left border space-y-3 transition-opacity ${
                isBookingExpired
                  ? 'bg-gray-800 text-gray-400 border-gray-700 opacity-60'
                  : 'bg-gradient-to-br from-navy-900 via-navy-800 to-forest-900 text-white border-navy-700'
              }`}>
                <div className="flex items-center justify-between border-b border-navy-700/80 pb-2">
                  <span className="text-xs font-black text-saffron-400 uppercase tracking-wide">
                    JAN YATRA Digital Pass
                  </span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    isBookingExpired
                      ? 'bg-red-600 text-white'
                      : bookedTicket.status === 'CONFIRMED'
                      ? 'bg-forest-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {isBookingExpired ? 'INVALIDATED / EXPIRED' : bookedTicket.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white">{bookedTicket.routeName}</h4>
                    <span className="text-xs text-navy-200 block font-bold">
                      {bookedTicket.from} ➔ {bookedTicket.to}
                    </span>
                    <span className="text-[11px] text-saffron-300 block font-mono">
                      🕒 {bookedTicket.departureTime} ➔ {bookedTicket.arrivalTime} ({bookedTicket.duration})
                    </span>
                    <span className="text-xs text-navy-200 block">
                      Passenger: <strong className="text-white">{bookedTicket.passengerName}</strong> ({bookedTicket.passengers} seat{bookedTicket.passengers > 1 ? 's' : ''})
                    </span>
                    <span className="text-[11px] text-forest-300 block font-bold">
                      Bus: {bookedTicket.busRegNumber} • {bookedTicket.busType}
                    </span>
                    <span className="text-[11px] text-saffron-300 block font-bold">
                      Payment Mode: {bookedTicket.paymentMode === 'ONLINE_QR' ? 'Online QR Paid' : 'Cash to Conductor'}
                    </span>
                  </div>
                  
                  <div className="bg-white p-2 rounded-xl shadow-md flex-shrink-0">
                    <QrCode className="w-16 h-16 text-navy-900" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-navy-700/80 text-[11px] text-navy-200 font-mono">
                  <span>Pass: {bookedTicket.ticketHash}</span>
                  <span className="text-white font-bold">
                    ₹{bookedTicket.farePerTicket} × {bookedTicket.passengers} = ₹{bookedTicket.totalAmount}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setBookedTicket(null);
                  setStep('FORM');
                  onClose();
                }}
                className="w-full bg-navy-800 hover:bg-navy-900 text-white font-extrabold py-3 rounded-xl text-xs transition-colors"
              >
                Done & Return to Map
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
