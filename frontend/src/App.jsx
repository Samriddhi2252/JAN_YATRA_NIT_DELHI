import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MovingBusAnimation from './components/MovingBusAnimation';
import CoolIntroSplash from './components/CoolIntroSplash';
import CommuterView from './components/CommuterView';
import DriverView from './components/DriverView';
import AdminView from './components/AdminView';
import SmsSimulator from './components/SmsSimulator';
import VoiceAssistant from './components/VoiceAssistant';
import TicketModal from './components/TicketModal';
import PitchModal from './components/PitchModal';
import ConductorLogin from './components/ConductorLogin';
import MyTicketsView from './components/MyTicketsView';
import RoleAuthModal from './components/RoleAuthModal';
import OfflineReconnectionModal from './components/OfflineReconnectionModal';
import LiveManifestView from './components/LiveManifestView';
import ErrorBoundary from './components/ErrorBoundary';
import { INITIAL_BUSES, INITIAL_ROUTES, createDynamicBuses, getDynamicTimesForBus } from './services/mockData';
import { saveBookingLocally, getOfflineQueue, syncOfflineQueue, getStoredBookings } from './services/db';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Commuter User',
    contact: '',
    role: 'COMMUTER',
  });
  const [activeView, setActiveView] = useState('commuter');
  const [isOffline, setIsOffline] = useState(false);
  const [buses, setBuses] = useState(() => createDynamicBuses());
  const [routes] = useState(INITIAL_ROUTES);
  
  // Portal & Conductor Authentication state
  const [isConductorLoggedIn, setIsConductorLoggedIn] = useState(false);
  const [conductorUser, setConductorUser] = useState(null);
  const [ticketsCount, setTicketsCount] = useState(() => getStoredBookings().length);

  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [reconnectionModalTicket, setReconnectionModalTicket] = useState(null);
  const [ticketModalBus, setTicketModalBus] = useState(null);
  const [autoBookingData, setAutoBookingData] = useState(null);
  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync ticket count when local storage or offline queue changes
  useEffect(() => {
    const updateCount = () => setTicketsCount(getStoredBookings().length);
    window.addEventListener('storage', updateCount);
    window.addEventListener('jan_yatra_offline_queue_updated', updateCount);
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('jan_yatra_offline_queue_updated', updateCount);
    };
  }, []);

  // Update offline queue count on load and changes
  useEffect(() => {
    const queue = getOfflineQueue();
    setOfflineQueueCount(queue.length);
  }, [isOffline]);

  // Handle offline/online network status and queued ticket online payment prompt
  useEffect(() => {
    if (!isOffline) {
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        setReconnectionModalTicket(queue[0]);
        showToast(`Network restored! Prompting online payment for ${queue.length} offline-queued ticket(s).`);
      }
    } else {
      showToast('Simulating Offline Mode (No Internet). Showing cached routes & offline queueing.');
    }
  }, [isOffline]);

  // Real browser online/offline event handlers
  useEffect(() => {
    const handleBrowserOnline = () => {
      setIsOffline(false);
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        setReconnectionModalTicket(queue[0]);
      }
    };
    const handleBrowserOffline = () => {
      setIsOffline(true);
    };
    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);
    return () => {
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
    };
  }, []);

  // Live GPS simulation loop: move buses continuously along Delhi NCR & Haryana routes
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          const latDelta = (Math.random() - 0.5) * 0.002;
          const lngDelta = (Math.random() - 0.5) * 0.002;
          return {
            ...bus,
            currentLocation: {
              lat: bus.currentLocation.lat + latDelta,
              lng: bus.currentLocation.lng + lngDelta,
            },
            speed: Math.floor(45 + Math.random() * 25),
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Periodically refresh departure and arrival times to stay in lockstep with the real-world clock
  useEffect(() => {
    const timeSyncInterval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((b, idx) => {
          const dynamicTimes = getDynamicTimesForBus(b, idx, new Date());
          return {
            ...b,
            departureTime: dynamicTimes.departureTime,
            arrivalTime: dynamicTimes.arrivalTime,
          };
        })
      );
    }, 60000);

    return () => clearInterval(timeSyncInterval);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleConfirmBooking = (bookingPayload) => {
    const newTicket = saveBookingLocally(bookingPayload, isOffline);
    setTicketsCount(getStoredBookings().length);
    if (isOffline) {
      setOfflineQueueCount((prev) => prev + 1);
      showToast('Offline Mode: Ticket queued locally. Awaiting network for online payment.');
    } else {
      showToast(`Ticket Confirmed for ${bookingPayload?.passengerName || 'Passenger'}! Pass ID: ${newTicket.ticketHash}`);
    }
    return newTicket;
  };

  const handleUpdateOccupancy = (busId, status) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, occupancy: status } : b))
    );
    showToast(`Bus ${busId} occupancy updated to ${status}`);
  };

  const handleReportDelay = (busId, delayMins, note) => {
    let updatedBusObj = null;

    setBuses((prev) =>
      prev.map((b) => {
        if (b.id === busId) {
          const updated = {
            ...b,
            status: 'DELAYED',
            gpsEtaMinutes: Math.max(1, (Number(b.gpsEtaMinutes) || 0) + delayMins),
            mlEtaMinutes: Math.max(1, (Number(b.mlEtaMinutes) || 0) + delayMins),
            historicalDelayFactor: note,
          };
          updatedBusObj = updated;
          return updated;
        }
        return b;
      })
    );

    setConductorUser((prev) => {
      if (prev?.assignedBus && prev.assignedBus.id === busId) {
        return {
          ...prev,
          assignedBus: {
            ...prev.assignedBus,
            status: 'DELAYED',
            gpsEtaMinutes: Math.max(1, (Number(prev.assignedBus.gpsEtaMinutes) || 0) + delayMins),
            mlEtaMinutes: Math.max(1, (Number(prev.assignedBus.mlEtaMinutes) || 0) + delayMins),
            historicalDelayFactor: note,
          },
        };
      }
      return prev;
    });

    // Broadcast system event so all route tickers & commuter listeners update in real time
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('janyatra:delay-reported', {
          detail: { busId, delayMins, note, bus: updatedBusObj },
        })
      );
    }

    showToast(`Voice delay synced: +${delayMins} mins applied live to dispatch!`);
  };

  const handleAutoBookFromVoice = (voiceBookingData) => {
    setAutoBookingData(voiceBookingData);
    let matchedBus = voiceBookingData?.bus;
    if (!matchedBus && voiceBookingData?.from && voiceBookingData?.to) {
      const direct = buses.filter((b) => 
        b.from?.toLowerCase().includes(voiceBookingData.from.toLowerCase().split(' ')[0]) &&
        b.to?.toLowerCase().includes(voiceBookingData.to.toLowerCase().split(' ')[0])
      );
      matchedBus = direct[0];
    }
    if (!matchedBus) {
      matchedBus = buses.find((b) => 
        (voiceBookingData?.from && b.from?.toLowerCase().includes(voiceBookingData.from.toLowerCase().split(' ')[0])) ||
        (voiceBookingData?.to && b.to?.toLowerCase().includes(voiceBookingData.to.toLowerCase().split(' ')[0]))
      ) || buses[0];
    }
    setTicketModalBus(matchedBus ? {
      ...matchedBus,
      from: voiceBookingData?.from || matchedBus.from,
      to: voiceBookingData?.to || matchedBus.to,
      departureTime: voiceBookingData?.departureTime || matchedBus.departureTime,
      arrivalTime: voiceBookingData?.arrivalTime || matchedBus.arrivalTime,
      duration: voiceBookingData?.duration || matchedBus.duration,
      fare: voiceBookingData?.fare || matchedBus.fare,
    } : buses[0]);
  };

  const handleDispatchBackupBus = () => {
    showToast('Emergency Backup Bus HR-46-EM-9900 dispatched to Samalkha corridor!');
  };

  const isConductor = currentUser?.role === 'CONDUCTOR' || isConductorLoggedIn;

  // Strict role-based access control and routing enforcement
  useEffect(() => {
    if (isConductor) {
      if (activeView !== 'driver' && activeView !== 'manifest') {
        setActiveView('driver');
      }
    } else {
      if (activeView === 'driver' || activeView === 'manifest') {
        setActiveView('commuter');
      }
    }
  }, [isConductor, activeView]);

  const handleLoginCommuter = (commuterData) => {
    setCurrentUser(commuterData);
    setIsConductorLoggedIn(false);
    setConductorUser(null);
    setActiveView('commuter');
    setShowRoleModal(false);
    showToast(`Welcome, ${commuterData.name || 'Commuter'}! Commuter Portal loaded.`);
  };

  const handleLoginConductor = (conductorData) => {
    setConductorUser(conductorData);
    setIsConductorLoggedIn(true);
    setCurrentUser(conductorData);
    setActiveView('driver');
    setShowRoleModal(false);
    showToast(`Conductor ${conductorData.employeeId} authenticated! ETM Console loaded.`);
  };

  const handleConductorSignOut = () => {
    setIsConductorLoggedIn(false);
    setConductorUser(null);
    setCurrentUser({
      name: 'Passenger',
      contact: '',
      role: 'COMMUTER',
    });
    setActiveView('commuter');
    showToast('Conductor signed out. Switched to Commuter Portal.');
  };

  const activeDriverBus = conductorUser?.assignedBus || buses[0];
  const [commuterSelectedBus, setCommuterSelectedBus] = useState(null);

  useEffect(() => {
    const handleBusSelected = (e) => {
      if (e.detail) {
        setCommuterSelectedBus(e.detail);
        if (isConductor) {
          setConductorUser((prev) => (prev ? { ...prev, assignedBus: e.detail } : prev));
        }
      }
    };
    window.addEventListener('janyatra:bus-selected', handleBusSelected);
    return () => window.removeEventListener('janyatra:bus-selected', handleBusSelected);
  }, [isConductor]);

  const activeTickerBus = isConductor ? activeDriverBus : (commuterSelectedBus || buses[0]);

  return (
    <div className="min-h-screen bg-[#f9f9fc] bg-animated-road flex flex-col font-sans selection:bg-saffron-300">
      
      {/* High-Impact Opening Cool Intro Splash Animation */}
      {showSplash && (
        <CoolIntroSplash
          onFinish={() => {
            setShowSplash(false);
            setShowRoleModal(true);
          }}
        />
      )}

      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        offlineQueueCount={offlineQueueCount}
        onOpenPitch={() => setIsPitchOpen(true)}
        isConductorLoggedIn={isConductorLoggedIn}
        ticketsCount={ticketsCount}
        onOpenRoleModal={() => setShowRoleModal(true)}
        currentUser={currentUser}
      />

      {/* Animated Moving Bus Road Banner on Every Page - Dynamically synced with active route / driver bus */}
      <MovingBusAnimation bus={activeTickerBus} />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-28 right-4 z-50 bg-navy-900 text-white text-xs font-black px-4 py-3 rounded-2xl shadow-xl border border-navy-700 animate-bounce flex items-center space-x-2">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main View Router - Strictly Role-Gated */}
      <main className="flex-1">
        {/* If logged in as Conductor: ONLY render dedicated Conductor Console */}
        {isConductor ? (
          <div className="space-y-3">
            {/* Conductor Active Session Bar */}
            <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-saffron-900 text-white px-4 sm:px-6 py-2.5 border-b border-navy-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="font-extrabold text-saffron-400 uppercase tracking-wider text-[11px]">
                  Conductor ETM Session Active
                </span>
                <span className="text-navy-300 font-mono text-[11px]">
                  ID: <strong className="text-white">{conductorUser?.employeeId || 'HR-COND-4089'}</strong>
                </span>
                <span className="hidden sm:inline text-navy-300 text-[11px]">
                  • Bus: <strong className="text-white">{activeDriverBus?.regNumber}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleConductorSignOut}
                  className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition-colors flex items-center space-x-1"
                >
                  <span>🔒 Sign Out / Switch Role</span>
                </button>
              </div>
            </div>

            {activeView === 'manifest' ? (
              <LiveManifestView bus={activeDriverBus} />
            ) : (
              <DriverView
                bus={activeDriverBus}
                onUpdateOccupancy={handleUpdateOccupancy}
                onReportDelay={handleReportDelay}
              />
            )}
          </div>
        ) : (
          /* If logged in as Commuter (Passenger): Strictly Passenger Features */
          <>
            {/* Commuter Map & Live Tracker */}
            {activeView === 'commuter' && (
              <ErrorBoundary
                title="Commuter Corridor Explorer"
                message="An unexpected issue occurred while rendering the commuter dashboard. Click below to safely restore the corridor view."
              >
                <CommuterView
                  buses={buses}
                  routes={routes}
                  currentUser={currentUser}
                  onOpenTicketModal={(bus, autoData) => {
                    setAutoBookingData(autoData || null);
                    let targetBus = bus;
                    if (!targetBus && autoData?.from && autoData?.to) {
                      const direct = buses.filter((b) => 
                        b.from?.toLowerCase().includes(autoData.from.toLowerCase().split(' ')[0]) &&
                        b.to?.toLowerCase().includes(autoData.to.toLowerCase().split(' ')[0])
                      );
                      targetBus = direct[0] || buses[0];
                    }
                    if (targetBus) {
                      setTicketModalBus({
                        ...targetBus,
                        from: autoData?.from || targetBus.from,
                        to: autoData?.to || targetBus.to,
                        departureTime: autoData?.departureTime || targetBus.departureTime,
                        arrivalTime: autoData?.arrivalTime || targetBus.arrivalTime,
                        duration: autoData?.duration || targetBus.duration,
                        fare: autoData?.fare || targetBus.fare,
                        travelDate: autoData?.travelDate || targetBus.travelDate,
                      });
                    } else {
                      setTicketModalBus(buses[0]);
                    }
                  }}
                  isOffline={isOffline}
                />
              </ErrorBoundary>
            )}

            {/* My Confirmed Tickets & Passes */}
            {activeView === 'tickets' && (
              <MyTicketsView
                onNavigateToBook={() => setActiveView('commuter')}
                buses={buses}
                currentUser={currentUser}
                onCompletePayment={(ticket) => setReconnectionModalTicket(ticket)}
              />
            )}

            {/* Admin Fleet Dashboard */}
            {activeView === 'admin' && (
              <AdminView
                buses={buses}
                routes={routes}
                onDispatchBackup={handleDispatchBackupBus}
              />
            )}

            {/* USSD / SMS Fallback Assistant */}
            {activeView === 'sms' && <SmsSimulator />}
          </>
        )}
      </main>

      {/* Floating Voice Assistant Widget - Passenger Only */}
      {!isConductor && <VoiceAssistant onAutoBookTicket={handleAutoBookFromVoice} />}

      {/* Ticket Booking Drawer Modal - Passenger Only */}
      {!isConductor && (
        <TicketModal
          bus={ticketModalBus}
          isOpen={Boolean(ticketModalBus)}
          onClose={() => setTicketModalBus(null)}
          onConfirmBooking={handleConfirmBooking}
          isOffline={isOffline}
          initialBookingData={autoBookingData}
          currentUser={currentUser}
        />
      )}

      {/* Hackathon System Features Presentation Drawer */}
      <PitchModal
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
      />

      {/* Reconnection Prompt Modal for Queued Offline Tickets */}
      <OfflineReconnectionModal
        isOpen={Boolean(reconnectionModalTicket)}
        ticket={reconnectionModalTicket}
        onPaymentSuccess={(confirmedTicket) => {
          setTicketsCount(getStoredBookings().length);
          const remaining = getOfflineQueue();
          setOfflineQueueCount(remaining.length);
          showToast(`Payment received! Ticket #${confirmedTicket.ticketHash || confirmedTicket.id} confirmed.`);
          if (remaining.length > 0) {
            setReconnectionModalTicket(remaining[0]);
          } else {
            setReconnectionModalTicket(null);
          }
        }}
        onClose={() => setReconnectionModalTicket(null)}
      />

      {/* Role Selection & Sign-In Modal Overlay on Initial Load / Switch */}
      <RoleAuthModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onLoginCommuter={handleLoginCommuter}
        onLoginConductor={handleLoginConductor}
        buses={buses}
      />
    </div>
  );
}
