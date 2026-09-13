import React, { useState } from 'react';
import { Wifi, QrCode, Smartphone, CheckCircle2, ShieldCheck, X, Clock, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { completeOfflinePaymentLocally } from '../services/db';

export default function OfflineReconnectionModal({ isOpen, ticket, onPaymentSuccess, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !ticket) return null;

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const confirmedTicket = completeOfflinePaymentLocally(ticket.id || ticket.ticketHash);
      setIsProcessing(false);
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore if confetti fails
      }
      if (onPaymentSuccess) {
        onPaymentSuccess(confirmedTicket || { ...ticket, status: 'CONFIRMED', paymentMode: 'ONLINE_QR' });
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-navy-100 overflow-hidden text-left animate-scale-up">
        
        {/* Header Strip with Network Reconnection Announcement */}
        <div className="bg-gradient-to-r from-forest-800 via-forest-700 to-navy-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
            title="Close / Pay Later"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-forest-500/30 border border-forest-400/40 text-forest-200">
              <Wifi className="w-5 h-5 animate-pulse text-green-300" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-green-300 bg-forest-900/60 px-2.5 py-0.5 rounded-full border border-forest-500/40">
              Network Restored
            </span>
          </div>

          <h3 className="text-lg font-black text-white leading-tight">
            Complete Deferred Online Payment
          </h3>
          <p className="text-xs text-forest-100 mt-1 font-medium leading-relaxed">
            Your connection has been restored. Finalize payment for your offline-queued ticket to generate your confirmed digital pass.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          
          {/* Status Badge */}
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs">
            <span className="font-extrabold text-amber-900 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Ticket Status:</span>
            </span>
            <span className="bg-amber-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
              Queued Offline - Awaiting Network for Online Payment
            </span>
          </div>

          {/* Ticket Snapshot Card */}
          <div className="bg-navy-50/70 border border-navy-100 rounded-2xl p-3.5 text-xs text-navy-900 space-y-2">
            <div className="flex items-center justify-between font-black border-b border-navy-100 pb-2">
              <span className="text-navy-950 font-black text-sm">{ticket.routeName || 'Inter-City Express'}</span>
              <span className="text-saffron-600 font-mono font-black text-sm">₹{ticket.totalAmount || ticket.farePerTicket}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-navy-700">
              <div>
                <span className="text-[10px] text-navy-400 font-bold block uppercase">Route</span>
                <span className="font-bold">{ticket.from} ➔ {ticket.to}</span>
              </div>
              <div>
                <span className="text-[10px] text-navy-400 font-bold block uppercase">Bus & Seats</span>
                <span className="font-bold">{ticket.busRegNumber || 'DL-01-PC-7788'} ({ticket.passengers || 1} Seat{ticket.passengers > 1 ? 's' : ''})</span>
              </div>
              <div>
                <span className="text-[10px] text-navy-400 font-bold block uppercase">Passenger</span>
                <span className="font-bold">{ticket.passengerName || 'Commuter User'}</span>
              </div>
              <div>
                <span className="text-[10px] text-navy-400 font-bold block uppercase">Schedule</span>
                <span className="font-bold">{ticket.departureTime || '02:45 PM'}</span>
              </div>
            </div>
          </div>

          {/* UPI QR Payment Box */}
          <div className="bg-navy-900 text-white p-4 rounded-2xl border border-navy-800 space-y-3">
            <div className="flex items-center justify-between border-b border-navy-800 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-black">
                <Smartphone className="w-4 h-4 text-saffron-400" />
                <span>Instant UPI / BharatQR Payment</span>
              </div>
              <span className="text-xs font-black text-saffron-400 font-mono">₹{ticket.totalAmount || 45}</span>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="bg-white p-2 rounded-xl flex-shrink-0 shadow">
                <QrCode className="w-16 h-16 text-navy-950" />
              </div>
              <div className="text-[11px] space-y-0.5 text-navy-200">
                <p className="font-black text-white">JAN YATRA Transit Services</p>
                <p className="text-navy-300 font-mono text-[10px]">UPI: janyatra.delhi@upi</p>
                <p className="text-forest-300 text-[10px] flex items-center space-x-1 font-bold pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 inline text-forest-400" />
                  <span>Secure Direct Gateway Verification</span>
                </p>
              </div>
            </div>

            {/* Action Payment Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePayNow}
              className="w-full py-3 px-4 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-black text-xs rounded-xl shadow-saffron border border-saffron-400 flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:opacity-60"
            >
              {isProcessing ? (
                <span>Authorizing Online Payment...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Online Payment Now (₹{ticket.totalAmount || 45})</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary Dismiss Button */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-navy-500 hover:text-navy-800 transition-colors"
            >
              I will pay later in My Tickets
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
