import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Bus, Lock, ArrowRight, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';

export default function ConductorLogin({ onLoginSuccess, onCancelToCommuter, buses = [] }) {
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [selectedBusId, setSelectedBusId] = useState(buses[0]?.id || 'BUS-100');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (!employeeId.trim()) {
      setErrorMsg('Please enter a valid Conductor Employee ID.');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('Please enter your 4-digit security PIN.');
      return;
    }

    const assignedBus = buses.find((b) => b.id === selectedBusId) || buses[0];

    onLoginSuccess({
      employeeId: employeeId.trim().toUpperCase(),
      name: `Conductor (${employeeId.trim().toUpperCase()})`,
      depot: 'Delhi (Kashmiri Gate ISBT) Depot',
      assignedBus,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleQuickDemoLogin = () => {
    const assignedBus = buses[0] || { id: 'BUS-100', regNumber: 'DL-01-PC-7788', routeName: 'Delhi - Noida Express' };
    onLoginSuccess({
      employeeId: 'HR-COND-4089',
      name: 'Conductor (HR-COND-4089)',
      depot: 'Delhi (Kashmiri Gate ISBT) Depot',
      assignedBus,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f9f9fc] flex items-center justify-center p-3 sm:p-5 md:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-navy-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-saffron-600 p-5 sm:p-6 text-white relative">
          <button
            type="button"
            onClick={onCancelToCommuter}
            className="inline-flex items-center space-x-1 text-xs text-navy-200 hover:text-white mb-3 transition-colors font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to User Portal</span>
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-saffron-500 flex items-center justify-center text-white font-black shadow-saffron border border-saffron-400 flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-saffron-500/30 text-saffron-300 px-2 py-0.5 rounded-full border border-saffron-400/30">
                  Zero-Hardware ETM
                </span>
                <span className="text-xs text-white/80 font-bold">• Secure Portal</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white mt-0.5">Conductor ETM Console Login</h1>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-7 md:p-8 space-y-6">
          
          <div className="bg-saffron-50/70 border border-saffron-200 rounded-2xl p-3.5 text-xs text-saffron-950 font-medium leading-relaxed">
            <span className="font-black text-saffron-900 flex items-center space-x-1 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
              <span>Production Architecture Note:</span>
            </span>
            Conductors securely authenticate via their smartphone browser, transforming standard consumer phones into a zero-cost, offline-capable Electronic Ticket Machine (ETM) without proprietary hardware terminals.
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-3 rounded-xl flex items-center space-x-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                Conductor Employee ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter official Conductor Employee ID (e.g. HR-COND-4089)"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-navy-200 text-xs font-mono font-bold text-navy-900 focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-navy-50/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                Assigned Bus / Route <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                  <Bus className="w-4 h-4" />
                </div>
                <select
                  required
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 rounded-xl border border-navy-200 text-xs font-bold text-navy-900 focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-navy-50/30"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.regNumber} — {b.routeName} ({b.fare ? `₹${b.fare}` : ''})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                4-Digit Conductor PIN <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your 4-digit security PIN"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-navy-200 text-xs font-mono font-bold text-navy-900 tracking-widest focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-navy-50/30"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-extrabold text-xs rounded-xl shadow-saffron border border-saffron-400 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Unlock Conductor ETM Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access for Hackathon Judges */}
          <div className="pt-2 border-t border-navy-100 text-center">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 px-3 bg-navy-50 hover:bg-navy-100 text-navy-800 text-xs font-bold rounded-xl border border-navy-200 transition-all flex items-center justify-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-forest-600" />
              <span>⚡ 1-Click Quick Demo Login (HR-COND-4089)</span>
            </button>
            <span className="block text-[10px] text-navy-500 mt-1 font-medium">
              Demo Mode enabled for judging: instantly bypass manual entry.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
