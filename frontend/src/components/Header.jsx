import React, { useState, useEffect } from 'react';
import { Bus, Wifi, WifiOff, Info, Phone, UserCheck, LayoutDashboard } from 'lucide-react';

export default function Header({ 
  activeView, 
  setActiveView, 
  isOffline, 
  setIsOffline, 
  offlineQueueCount, 
  onOpenPitch 
}) {
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (setIsOffline) {
        setIsOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (setIsOffline) {
        setIsOffline(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOffline]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-navy-100 shadow-md">
      <div className="w-full px-3 sm:px-6">
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Absolute Top-Left Corner: Primary Logo & Wordmark */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer py-1 group flex-shrink-0" 
            onClick={() => setActiveView('commuter')}
            title="JAN YATRA - Smart Bus Service, Better Yatra"
          >
            {/* Primary Lotus + Bus Logo Icon */}
            <div className="h-12 sm:h-16 w-auto flex-shrink-0 flex items-center justify-center p-1 bg-white rounded-2xl border border-navy-100 shadow-sm group-hover:scale-105 transition-transform">
              <img 
                src="/logo.png" 
                alt="JAN YATRA Icon" 
                className="h-full w-auto object-contain"
              />
            </div>

            {/* Official Header Wordmark Image */}
            <div className="h-9 sm:h-12 w-auto flex items-center">
              <img 
                src="/wordmark.png" 
                alt="जन YATRA - SMART BUS SERVICE, BETTER YATRA" 
                className="h-full w-auto object-contain group-hover:brightness-105 transition-all"
              />
            </div>
          </div>

          {/* Navigation View Switcher Tabs */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-navy-50/90 p-1.5 rounded-2xl border border-navy-100 shadow-inner mx-4">
            <button
              onClick={() => setActiveView('commuter')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeView === 'commuter'
                  ? 'bg-navy-800 text-white shadow-navy scale-[1.02]'
                  : 'text-navy-800 hover:bg-white/80'
              }`}
            >
              <Bus className="w-4 h-4 text-saffron-400" />
              <span>Commuter Map</span>
            </button>

            <button
              onClick={() => setActiveView('driver')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeView === 'driver'
                  ? 'bg-saffron-500 text-white shadow-saffron scale-[1.02]'
                  : 'text-navy-800 hover:bg-white/80'
              }`}
            >
              <UserCheck className="w-4 h-4 text-white" />
              <span>Conductor Mode</span>
            </button>

            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeView === 'admin'
                  ? 'bg-forest-700 text-white shadow-forest scale-[1.02]'
                  : 'text-navy-800 hover:bg-white/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-saffron-400" />
              <span>Admin Fleet</span>
            </button>

            <button
              onClick={() => setActiveView('sms')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeView === 'sms'
                  ? 'bg-navy-800 text-white shadow-navy scale-[1.02]'
                  : 'text-navy-800 hover:bg-white/80'
              }`}
            >
              <Phone className="w-4 h-4 text-forest-400" />
              <span>SMS Fallback</span>
            </button>
          </nav>

          {/* Right Action Controls: Offline Simulator + System Info Drawer */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            
            {/* Live Network Status Indicator */}
            <button
              type="button"
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all border cursor-default ${
                isOnline
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
              }`}
              title={isOnline ? 'Live / Online' : 'Offline Mode'}
            >
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span>
                {isOnline ? 'Live / Online' : 'Offline Mode'}
              </span>
            </button>

            {/* Offline Queue Badge */}
            {offlineQueueCount > 0 && (
              <span className="bg-saffron-100 text-saffron-950 text-xs font-black px-2.5 py-1 rounded-xl border border-saffron-300 flex items-center space-x-1">
                <span>Queued:</span>
                <span className="bg-saffron-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                  {offlineQueueCount}
                </span>
              </span>
            )}

            {/* System Info Drawer Button */}
            <button
              onClick={onOpenPitch}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-4 py-2.5 rounded-xl text-xs font-black hover:from-saffron-600 hover:to-saffron-700 transition-all shadow-saffron border border-saffron-400"
            >
              <Info className="w-4 h-4" />
              <span className="hidden lg:inline">System Features</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-navy-100 text-xs font-black">
          <button
            onClick={() => setActiveView('commuter')}
            className={`px-3 py-1.5 rounded-lg ${activeView === 'commuter' ? 'bg-navy-800 text-white' : 'text-navy-800'}`}
          >
            Commuter
          </button>
          <button
            onClick={() => setActiveView('driver')}
            className={`px-3 py-1.5 rounded-lg ${activeView === 'driver' ? 'bg-saffron-500 text-white' : 'text-navy-800'}`}
          >
            Conductor
          </button>
          <button
            onClick={() => setActiveView('admin')}
            className={`px-3 py-1.5 rounded-lg ${activeView === 'admin' ? 'bg-forest-700 text-white' : 'text-navy-800'}`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveView('sms')}
            className={`px-3 py-1.5 rounded-lg ${activeView === 'sms' ? 'bg-navy-800 text-white' : 'text-navy-800'}`}
          >
            SMS
          </button>
        </div>
      </div>
    </header>
  );
}
