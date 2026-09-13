import React, { useState, useEffect } from 'react';
import { Bus, Wifi, WifiOff, Info, Phone, UserCheck, User, LayoutDashboard, Ticket } from 'lucide-react';

export default function Header({ 
  activeView, 
  setActiveView, 
  isOffline, 
  setIsOffline, 
  offlineQueueCount, 
  onOpenPitch,
  isConductorLoggedIn = false,
  ticketsCount = 0,
  onOpenRoleModal,
  currentUser
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

  const isConductor = currentUser?.role === 'CONDUCTOR' || isConductorLoggedIn;
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-navy-100 shadow-md">
      <div className="w-full px-3 sm:px-6">
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Absolute Top-Left Corner: Primary Logo & Wordmark */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer py-1 group flex-shrink-0" 
            onClick={() => setActiveView(isConductor ? 'driver' : 'commuter')}
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

          {/* Navigation View Switcher Tabs - Strictly Role-Based Access Control */}
          {isConductor ? (
            /* Conductor Role: Conductor Console & Live Manifest Tabs */
            <nav className="hidden md:flex items-center space-x-2 bg-saffron-50/90 p-1.5 rounded-2xl border border-saffron-200 shadow-inner mx-4">
              <button
                onClick={() => setActiveView('driver')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeView === 'driver' || !activeView
                    ? 'bg-saffron-500 text-white shadow-saffron border border-saffron-600 scale-[1.02]'
                    : 'text-navy-800 hover:bg-white/80'
                }`}
                title="Conductor Electronic Ticket Machine (ETM) Console"
              >
                <UserCheck className="w-4 h-4" />
                <span>Conductor ETM Console</span>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" title="ETM Active" />
              </button>

              <button
                onClick={() => setActiveView('manifest')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeView === 'manifest'
                    ? 'bg-saffron-500 text-white shadow-saffron border border-saffron-600 scale-[1.02]'
                    : 'text-navy-800 hover:bg-white/80'
                }`}
                title="Live Manifest / Booked Digital Passes"
              >
                <Ticket className="w-4 h-4 text-forest-600" />
                <span>Live Manifest / Booked Passes</span>
              </button>
            </nav>
          ) : (
            /* Passenger / Commuter Role: Strictly Show Only Commuter Features */
            <nav className="hidden md:flex items-center space-x-1.5 bg-navy-50/90 p-1.5 rounded-2xl border border-navy-100 shadow-inner mx-4">
              <button
                onClick={() => setActiveView('commuter')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                  activeView === 'commuter'
                    ? 'bg-navy-800 text-white shadow-navy scale-[1.02]'
                    : 'text-navy-800 hover:bg-white/80'
                }`}
                title="Commuter Map & Live Tracker"
              >
                <Bus className="w-4 h-4 text-saffron-400" />
                <span>Commuter Map</span>
              </button>

              <button
                onClick={() => setActiveView('tickets')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all relative ${
                  activeView === 'tickets'
                    ? 'bg-navy-800 text-white shadow-navy scale-[1.02]'
                    : 'text-navy-800 hover:bg-white/80'
                }`}
                title="My Confirmed & Offline Queued Tickets"
              >
                <Ticket className="w-4 h-4 text-forest-400" />
                <span>My Tickets</span>
                {ticketsCount > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    activeView === 'tickets'
                      ? 'bg-forest-500 text-white'
                      : 'bg-forest-100 text-forest-800 border border-forest-300'
                  }`}>
                    {ticketsCount}
                  </span>
                )}
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveView('admin')}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                    activeView === 'admin'
                      ? 'bg-forest-700 text-white shadow-forest scale-[1.02]'
                      : 'text-navy-800 hover:bg-white/80'
                  }`}
                  title="Fleet Command & Analytics"
                >
                  <LayoutDashboard className="w-4 h-4 text-saffron-400" />
                  <span>Admin Fleet</span>
                </button>
              )}

              <button
                onClick={() => setActiveView('sms')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                  activeView === 'sms'
                    ? 'bg-navy-800 text-white shadow-navy scale-[1.02]'
                    : 'text-navy-800 hover:bg-white/80'
                }`}
                title="USSD / SMS Offline Assistant"
              >
                <Phone className="w-4 h-4 text-forest-400" />
                <span>SMS Fallback</span>
              </button>
            </nav>
          )}

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

            {/* Role Switcher / Profile Badge */}
            {onOpenRoleModal && (
              <button
                type="button"
                onClick={onOpenRoleModal}
                className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all border ${
                  isConductor
                    ? 'bg-saffron-50 text-saffron-900 border-saffron-300 hover:bg-saffron-100'
                    : 'bg-navy-50 text-navy-800 border-navy-200 hover:bg-navy-100'
                }`}
                title="Switch Role or Re-Login"
              >
                {isConductor ? (
                  <>
                    <UserCheck className="w-4 h-4 text-saffron-600" />
                    <span className="hidden sm:inline">Conductor (ETM)</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-forest-700" />
                    <span className="hidden sm:inline">
                      {currentUser?.name ? (currentUser.name.length > 18 ? currentUser.name.split(' ')[0] : currentUser.name) : 'Commuter User'}
                    </span>
                  </>
                )}
                <span className="text-[10px] text-navy-400 font-normal">▼</span>
              </button>
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

        {/* Mobile Navigation Bar - Strictly Role-Gated */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-navy-100 text-[11px] font-black overflow-x-auto gap-1">
          {isConductor ? (
            <div className="flex items-center justify-center w-full py-0.5 space-x-2">
              <button
                onClick={() => setActiveView('driver')}
                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center space-x-1.5 ${
                  activeView === 'driver' || !activeView
                    ? 'bg-saffron-500 text-white shadow-sm'
                    : 'text-navy-800 bg-saffron-50 border border-saffron-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>ETM Console</span>
              </button>
              <button
                onClick={() => setActiveView('manifest')}
                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center space-x-1.5 ${
                  activeView === 'manifest'
                    ? 'bg-saffron-500 text-white shadow-sm'
                    : 'text-navy-800 bg-saffron-50 border border-saffron-200'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Live Manifest</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setActiveView('commuter')}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeView === 'commuter' ? 'bg-navy-800 text-white' : 'text-navy-800'}`}
              >
                Commuter
              </button>
              <button
                onClick={() => setActiveView('tickets')}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center space-x-1 ${activeView === 'tickets' ? 'bg-navy-800 text-white' : 'text-navy-800'}`}
              >
                <span>Tickets</span>
                {ticketsCount > 0 && (
                  <span className="bg-forest-600 text-white text-[9px] px-1 rounded-full">
                    {ticketsCount}
                  </span>
                )}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveView('admin')}
                  className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeView === 'admin' ? 'bg-forest-700 text-white' : 'text-navy-800'}`}
                >
                  Admin
                </button>
              )}
              <button
                onClick={() => setActiveView('sms')}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeView === 'sms' ? 'bg-navy-800 text-white' : 'text-navy-800'}`}
              >
                SMS
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
