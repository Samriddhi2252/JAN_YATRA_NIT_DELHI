import React, { useState } from 'react';
import { 
  User, 
  UserCheck, 
  Bus, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  X, 
  CheckCircle2, 
  KeyRound, 
  Smartphone, 
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

export default function RoleAuthModal({ isOpen, onClose, onLoginCommuter, onLoginConductor, buses = [] }) {
  // Main Role Tab: 'commuter' | 'conductor'
  const [selectedRole, setSelectedRole] = useState('commuter');
  
  // Passenger Auth Tab: 'login' | 'signup'
  const [passengerAuthMode, setPassengerAuthMode] = useState('login');

  // Passenger Form State (Start clean with empty inputs - no hardcoded names or prefilled text)
  const [commuterContact, setCommuterContact] = useState('');
  const [commuterName, setCommuterName] = useState('');
  const [commuterPin, setCommuterPin] = useState('');

  // OTP Verification State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSentNotice, setOtpSentNotice] = useState('');

  // Google SSO Profile Prompt State
  const [isGoogleAuthStep, setIsGoogleAuthStep] = useState(false);

  // Conductor Form State (Start clean with empty inputs)
  const [conductorId, setConductorId] = useState('');
  const [conductorPin, setConductorPin] = useState('');
  const [selectedBusId, setSelectedBusId] = useState(buses[0]?.id || 'BUS-100');

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Passenger Login Submission
  const handlePassengerLoginSubmit = (e) => {
    if (e) e.preventDefault();
    if (!commuterName.trim()) {
      setErrorMsg('Please enter your full name to log in.');
      return;
    }
    if (!commuterContact.trim()) {
      setErrorMsg('Please enter your email address or mobile phone number.');
      return;
    }

    // Trigger OTP Verification Step
    if (!isOtpStep) {
      setErrorMsg('');
      setIsOtpStep(true);
      setOtpSentNotice(`Hello ${commuterName.trim()}! A 6-digit OTP verification code has been sent to ${commuterContact.trim()}`);
      return;
    }

    // Verify OTP Code
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setErrorMsg('Please enter the verification code sent to your phone/email (Demo OTP: 123456).');
      return;
    }

    const resolvedName = commuterName.trim() || 'Commuter User';
    setErrorMsg('');
    onLoginCommuter({
      contact: commuterContact.trim(),
      name: resolvedName,
      role: 'COMMUTER',
    });
  };

  // Passenger Signup Submission
  const handlePassengerSignupSubmit = (e) => {
    if (e) e.preventDefault();
    if (!commuterName.trim()) {
      setErrorMsg('Full name is mandatory for passenger registration.');
      return;
    }
    if (!commuterContact.trim()) {
      setErrorMsg('Email address or phone number is mandatory.');
      return;
    }
    if (!commuterPin.trim() || commuterPin.trim().length < 4) {
      setErrorMsg('Please create a 4-digit security PIN for your account.');
      return;
    }

    if (!isOtpStep) {
      setErrorMsg('');
      setIsOtpStep(true);
      setOtpSentNotice(`Welcome ${commuterName.trim()}! A 6-digit verification code was sent to ${commuterContact.trim()}`);
      return;
    }

    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit OTP code to verify your new account (Demo: 123456).');
      return;
    }

    const resolvedName = commuterName.trim() || 'Commuter User';
    setErrorMsg('');
    onLoginCommuter({
      contact: commuterContact.trim(),
      name: resolvedName,
      role: 'COMMUTER',
    });
  };

  // Google SSO Click Handler: Prompt for name if not provided
  const handleGoogleSignInClick = () => {
    if (commuterName.trim()) {
      setErrorMsg('');
      onLoginCommuter({
        contact: commuterContact.trim() || 'user@gmail.com',
        name: commuterName.trim(),
        provider: 'Google SSO',
        role: 'COMMUTER',
      });
    } else {
      // Prompt user explicitly for their name before completing Google login
      setIsGoogleAuthStep(true);
      setErrorMsg('');
    }
  };

  // Google SSO Modal Form Submit
  const handleGoogleAuthSubmit = (e) => {
    if (e) e.preventDefault();
    if (!commuterName.trim()) {
      setErrorMsg('Please enter your full name to proceed with Google sign-in.');
      return;
    }
    setErrorMsg('');
    onLoginCommuter({
      contact: commuterContact.trim() || 'user@gmail.com',
      name: commuterName.trim() || 'Commuter User',
      provider: 'Google SSO',
      role: 'COMMUTER',
    });
  };

  // Conductor Login Submission
  const handleConductorSubmit = (e) => {
    if (e) e.preventDefault();
    if (!conductorId.trim()) {
      setErrorMsg('Conductor Employee ID is mandatory.');
      return;
    }
    if (!conductorPin.trim()) {
      setErrorMsg('4-digit Conductor Security PIN is mandatory.');
      return;
    }

    setErrorMsg('');
    const assignedBus = buses.find((b) => b.id === selectedBusId) || buses[0];
    onLoginConductor({
      employeeId: conductorId.trim().toUpperCase(),
      name: `Conductor (${conductorId.trim().toUpperCase()})`,
      depot: 'Delhi ISBT Kashmiri Gate Depot',
      assignedBus,
      role: 'CONDUCTOR',
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // Quick 1-Click Demo Login for Passenger
  const handleQuickDemoCommuter = () => {
    onLoginCommuter({
      contact: commuterContact.trim() || '+91 98765 00000',
      name: commuterName.trim() || 'Commuter User',
      role: 'COMMUTER',
    });
  };

  // Quick 1-Click Demo Login for Conductor
  const handleQuickDemoConductor = () => {
    const assignedBus = buses[0] || { id: 'BUS-100', regNumber: 'DL-01-PC-7788', routeName: 'Delhi - Noida Express' };
    onLoginConductor({
      employeeId: 'HR-COND-4089',
      name: 'Conductor (HR-COND-4089)',
      depot: 'Delhi ISBT Kashmiri Gate Depot',
      assignedBus,
      role: 'CONDUCTOR',
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-navy-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-navy-100 overflow-hidden my-auto relative animate-scale-up max-h-[92vh] flex flex-col">
        
        {/* Top Header Graphic */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-saffron-600 p-5 sm:p-6 text-white relative flex-shrink-0">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-xs font-black"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center space-x-3 mb-1.5">
            <div className="h-10 w-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-sm flex-shrink-0">
              <img src="/logo.png" alt="JAN YATRA" className="h-full w-auto object-contain" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-saffron-300 bg-saffron-500/20 px-2 py-0.5 rounded-full border border-saffron-400/30">
                Official Transit Access
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">JAN YATRA Portal Sign-In</h2>
            </div>
          </div>
          <p className="text-xs text-navy-200 font-medium line-clamp-1 sm:line-clamp-none">
            Secure, verified role authentication for Delhi NCR & Interstate routes.
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 md:p-7 space-y-5 overflow-y-auto flex-1">
          
          {/* Role Selection Tabs */}
          <div>
            <span className="text-[11px] font-extrabold text-navy-600 uppercase tracking-wider block mb-2">
              Select Your Role
            </span>
            <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-navy-50/90 rounded-2xl border border-navy-100">
              
              {/* Role Tab 1: Commuter (Passenger) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('commuter');
                  setErrorMsg('');
                  setIsOtpStep(false);
                  setIsGoogleAuthStep(false);
                }}
                className={`p-3 rounded-xl text-left transition-all relative flex flex-col items-start ${
                  selectedRole === 'commuter'
                    ? 'bg-white text-navy-950 shadow-md border-2 border-navy-800'
                    : 'text-navy-600 hover:text-navy-900 hover:bg-white/60 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    selectedRole === 'commuter' ? 'bg-navy-900 text-white' : 'bg-navy-100 text-navy-700'
                  }`}>
                    <User className="w-3.5 h-3.5" />
                  </div>
                  {selectedRole === 'commuter' && (
                    <CheckCircle2 className="w-4 h-4 text-forest-600" />
                  )}
                </div>
                <span className="text-xs font-black block">Passenger</span>
                <span className="text-[10px] text-navy-500 line-clamp-1">
                  Map, Bookings & Passes
                </span>
              </button>

              {/* Role Tab 2: Conductor */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('conductor');
                  setErrorMsg('');
                  setIsOtpStep(false);
                  setIsGoogleAuthStep(false);
                }}
                className={`p-3 rounded-xl text-left transition-all relative flex flex-col items-start ${
                  selectedRole === 'conductor'
                    ? 'bg-white text-navy-950 shadow-md border-2 border-saffron-500'
                    : 'text-navy-600 hover:text-navy-900 hover:bg-white/60 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    selectedRole === 'conductor' ? 'bg-saffron-500 text-white' : 'bg-saffron-100 text-saffron-800'
                  }`}>
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  {selectedRole === 'conductor' && (
                    <CheckCircle2 className="w-4 h-4 text-saffron-600" />
                  )}
                </div>
                <span className="text-xs font-black block">Conductor</span>
                <span className="text-[10px] text-navy-500 line-clamp-1">
                  ETM & Occupancy Console
                </span>
              </button>
            </div>
          </div>

          {/* Validation & Error Feedback */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-3 rounded-xl flex items-center space-x-2 animate-shake">
              <span className="flex-shrink-0">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION A: PASSENGER / COMMUTER AUTHENTICATION               */}
          {/* ============================================================ */}
          {selectedRole === 'commuter' && (
            <div className="space-y-4">
              
              {/* Passenger Sub-Tabs: Login vs Sign Up (Only shown when not in OTP or Google steps) */}
              {!isOtpStep && !isGoogleAuthStep && (
                <div className="flex items-center p-1 bg-navy-100/70 rounded-xl border border-navy-200/60 text-xs font-black">
                  <button
                    type="button"
                    onClick={() => {
                      setPassengerAuthMode('login');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 text-center rounded-lg transition-all ${
                      passengerAuthMode === 'login'
                        ? 'bg-white text-navy-900 shadow-sm'
                        : 'text-navy-600 hover:text-navy-900'
                    }`}
                  >
                    Passenger Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPassengerAuthMode('signup');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 text-center rounded-lg transition-all ${
                      passengerAuthMode === 'signup'
                        ? 'bg-white text-navy-900 shadow-sm'
                        : 'text-navy-600 hover:text-navy-900'
                    }`}
                  >
                    New Passenger Sign Up
                  </button>
                </div>
              )}

              {/* Simulated Google SSO Button */}
              {!isOtpStep && !isGoogleAuthStep && (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleGoogleSignInClick}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-sm transition-all flex items-center justify-center space-x-2.5"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>
                      {passengerAuthMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                    </span>
                  </button>

                  <div className="flex items-center space-x-2 text-[10px] text-navy-400 font-bold uppercase tracking-wider">
                    <div className="flex-1 h-px bg-navy-100" />
                    <span>Or with Mobile / Email</span>
                    <div className="flex-1 h-px bg-navy-100" />
                  </div>
                </div>
              )}

              {/* Step 1: Google SSO Explicit Name & Email Prompt Step */}
              {isGoogleAuthStep && (
                <form onSubmit={handleGoogleAuthSubmit} className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 space-y-2">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span className="font-extrabold text-slate-900 text-sm">Google Account Verification</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Please provide your legal name to connect your Google account to your passenger transit profile.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={commuterName}
                        onChange={(e) => setCommuterName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-navy-200 text-xs font-bold text-navy-900 focus:outline-none focus:border-navy-800 focus:ring-1 focus:ring-navy-800 bg-navy-50/30"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                      Google Account Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={commuterContact}
                        onChange={(e) => setCommuterContact(e.target.value)}
                        placeholder="Enter your Google email address"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-navy-200 text-xs font-bold text-navy-900 focus:outline-none focus:border-navy-800 focus:ring-1 focus:ring-navy-800 bg-navy-50/30"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-navy-900 hover:bg-navy-950 text-white font-black text-xs rounded-xl shadow-navy flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>Authorize & Sign In with Google</span>
                    <ArrowRight className="w-4 h-4 text-saffron-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsGoogleAuthStep(false);
                      setErrorMsg('');
                    }}
                    className="w-full py-2 text-center text-xs font-bold text-navy-600 hover:text-navy-900 transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification Step */}
              {isOtpStep && (
                <form onSubmit={passengerAuthMode === 'login' ? handlePassengerLoginSubmit : handlePassengerSignupSubmit} className="space-y-4">
                  <div className="bg-forest-50/80 border border-forest-200 rounded-2xl p-3.5 text-xs text-forest-900 font-medium">
                    <div className="flex items-center space-x-1.5 font-bold mb-1 text-forest-800">
                      <Smartphone className="w-4 h-4 text-forest-600" />
                      <span>OTP Verification Code Sent</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {otpSentNotice || `Please enter the 6-digit verification code sent to ${commuterContact}.`}
                    </p>
                    <span className="block mt-1 text-[10px] font-mono font-bold text-forest-700 bg-forest-100/80 px-2 py-0.5 rounded inline-block">
                      💡 Hackathon Demo OTP: 123456
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                      6-Digit Verification Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit OTP code"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-navy-200 text-sm font-mono font-bold tracking-widest text-navy-900 focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 bg-navy-50/30"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-navy-900 hover:bg-navy-950 text-white font-black text-xs rounded-xl shadow-navy flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>Verify OTP & Enter Commuter Portal</span>
                    <ArrowRight className="w-4 h-4 text-saffron-400" />
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpStep(false);
                        setOtpCode('');
                        setErrorMsg('');
                      }}
                      className="text-navy-600 hover:text-navy-900 font-bold flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Edit Phone / Email</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setOtpSentNotice(`New verification code resent to ${commuterContact}. Demo code: 123456`);
                      }}
                      className="text-saffron-600 hover:text-saffron-700 font-bold flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Initial Passenger Forms (Login vs Sign Up) */}
              {!isOtpStep && !isGoogleAuthStep && (
                passengerAuthMode === 'login' ? (
                  /* --- Passenger Login Form --- */
                  <form onSubmit={handlePassengerLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={commuterName}
                          onChange={(e) => setCommuterName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-navy-200 text-xs font-bold text-navy-900 focus:outline-none focus:border-navy-800 focus:ring-1 focus:ring-navy-800 bg-navy-50/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                        Email Address or Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={commuterContact}
                          onChange={(e) => setCommuterContact(e.target.value)}
                          placeholder="Enter your email or phone number"
                          className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-navy-200 text-xs font-bold text-navy-900 focus:outline-none focus:border-navy-800 focus:ring-1 focus:ring-navy-800 bg-navy-50/30"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-navy-900 hover:bg-navy-950 text-white font-black text-xs rounded-xl shadow-navy flex items-center justify-center space-x-2 transition-all"
                    >
                      <span>Continue to OTP Verification</span>
                      <ArrowRight className="w-4 h-4 text-saffron-400" />
                    </button>

                    <div className="pt-2 border-t border-navy-100 text-center">
                      <button
                        type="button"
                        onClick={handleQuickDemoCommuter}
                        className="w-full py-2.5 px-3 bg-navy-50 hover:bg-navy-100 text-navy-800 text-xs font-bold rounded-xl border border-navy-200 transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
                        <span>⚡ 1-Click Demo Login (Commuter User)</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* --- Passenger Sign Up Form --- */
                  <form onSubmit={handlePassengerSignupSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                        Full Legal Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={commuterName}
                          onChange={(e) => setCommuterName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-navy-200 text-xs font-bold text-navy-900 focus:outline-none focus:border-navy-800 focus:ring-1 focus:ring-navy-800 bg-navy-50/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                        Email Address or Mobile Phone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={commuterContact}
                          onChange={(e) => setCommuterContact(e.target.value)}
                          placeholder="Enter your email or phone number"
                          className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-navy-200 text-xs font-bold text-navy-900 focus:outline-none focus:border-navy-800 focus:ring-1 focus:ring-navy-800 bg-navy-50/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                        Create 4-Digit Security PIN <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          maxLength={6}
                          required
                          value={commuterPin}
                          onChange={(e) => setCommuterPin(e.target.value)}
                          placeholder="Create a 4-digit security PIN"
                          className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-navy-200 text-xs font-mono font-bold text-navy-900 tracking-widest focus:outline-none focus:border-navy-800 focus:ring-1 focus:ring-navy-800 bg-navy-50/30"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-navy-900 hover:bg-navy-950 text-white font-black text-xs rounded-xl shadow-navy flex items-center justify-center space-x-2 transition-all"
                    >
                      <span>Create Account & Verify OTP</span>
                      <ArrowRight className="w-4 h-4 text-saffron-400" />
                    </button>
                  </form>
                )
              )}

            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION B: CONDUCTOR AUTHENTICATION (Zero-Hardware ETM)     */}
          {/* ============================================================ */}
          {selectedRole === 'conductor' && (
            <form onSubmit={handleConductorSubmit} className="space-y-4">
              
              <div className="bg-saffron-50/80 border border-saffron-200 rounded-2xl p-3 text-xs text-saffron-950 font-medium leading-relaxed">
                <span className="font-black text-saffron-900 block mb-0.5">
                  RTC Conductor ETM Console Access:
                </span>
                Requires an active Employee ID and route assignment. Conductors authenticate directly to manage live occupancy and inspect passenger tickets.
              </div>

              {/* Conductor Employee ID */}
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
                    value={conductorId}
                    onChange={(e) => setConductorId(e.target.value)}
                    placeholder="Enter official Conductor Employee ID (e.g. HR-COND-4089)"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-navy-200 text-xs font-mono font-bold text-navy-900 focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-navy-50/30"
                  />
                </div>
              </div>

              {/* Assigned Bus / Route Selection */}
              <div>
                <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                  Assigned Bus & Route <span className="text-red-500">*</span>
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
                        {b.regNumber} — {b.routeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4-Digit Security PIN */}
              <div>
                <label className="block text-xs font-black text-navy-900 uppercase tracking-wider mb-1.5">
                  4-Digit Security PIN <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={conductorPin}
                    onChange={(e) => setConductorPin(e.target.value)}
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

              <div className="pt-2 border-t border-navy-100 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoConductor}
                  className="w-full py-2.5 px-3 bg-navy-50 hover:bg-navy-100 text-navy-800 text-xs font-bold rounded-xl border border-navy-200 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-forest-600" />
                  <span>⚡ 1-Click Demo Login (HR-COND-4089)</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Helper */}
          <div className="text-center text-[11px] text-navy-500 font-medium pt-1">
            Protected by RTC Zero-Hardware Security Protocols.
          </div>
        </div>

      </div>
    </div>
  );
}
