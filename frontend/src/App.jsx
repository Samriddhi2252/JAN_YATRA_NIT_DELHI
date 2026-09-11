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
import { INITIAL_BUSES, INITIAL_ROUTES } from './services/mockData';
import { saveBookingLocally, getOfflineQueue, syncOfflineQueue } from './services/db';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState('commuter');
  const [isOffline, setIsOffline] = useState(false);
  const [buses, setBuses] = useState(INITIAL_BUSES);
  const [routes] = useState(INITIAL_ROUTES);
  
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [ticketModalBus, setTicketModalBus] = useState(null);
  const [autoBookingData, setAutoBookingData] = useState(null);
  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Update offline queue count on load and changes
  useEffect(() => {
    const queue = getOfflineQueue();
    setOfflineQueueCount(queue.length);
  }, [isOffline]);

  // Handle offline/online network simulation toggle & auto-sync
  useEffect(() => {
    if (!isOffline) {
      const syncResult = syncOfflineQueue();
      if (syncResult.count > 0) {
        showToast(`Auto-synced ${syncResult.count} offline booking(s) to central cloud database!`);
        setOfflineQueueCount(0);
      }
    } else {
      showToast('Simulating Offline Mode (No Internet). Showing cached routes & offline queueing.');
    }
  }, [isOffline]);

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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleConfirmBooking = (bookingPayload) => {
    const newTicket = saveBookingLocally(bookingPayload, isOffline);
    if (isOffline) {
      setOfflineQueueCount((prev) => prev + 1);
      showToast('Offline Mode: Ticket saved locally. Will sync when reconnected.');
    } else {
      showToast(`Ticket Confirmed! Pass ID: ${newTicket.ticketHash}`);
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
    setBuses((prev) =>
      prev.map((b) =>
        b.id === busId
          ? {
              ...b,
              status: 'DELAYED',
              gpsEtaMinutes: b.gpsEtaMinutes + delayMins,
              mlEtaMinutes: b.mlEtaMinutes + delayMins,
              historicalDelayFactor: note,
            }
          : b
      )
    );
    showToast(`Driver delay reported: +${delayMins} mins on ${busId}`);
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

  return (
    <div className="min-h-screen bg-[#f9f9fc] bg-animated-road flex flex-col font-sans selection:bg-saffron-300">
      
      {/* High-Impact Opening Cool Intro Splash Animation */}
      {showSplash && <CoolIntroSplash onFinish={() => setShowSplash(false)} />}

      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        offlineQueueCount={offlineQueueCount}
        onOpenPitch={() => setIsPitchOpen(true)}
      />

      {/* Animated Moving Bus Road Banner on Every Page */}
      <MovingBusAnimation />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-28 right-4 z-50 bg-navy-900 text-white text-xs font-black px-4 py-3 rounded-2xl shadow-xl border border-navy-700 animate-bounce flex items-center space-x-2">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'commuter' && (
          <CommuterView
            buses={buses}
            routes={routes}
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
                });
              } else {
                setTicketModalBus(buses[0]);
              }
            }}
            isOffline={isOffline}
          />
        )}

        {activeView === 'driver' && (
          <DriverView
            bus={buses[0]}
            onUpdateOccupancy={handleUpdateOccupancy}
            onReportDelay={handleReportDelay}
          />
        )}

        {activeView === 'admin' && (
          <AdminView
            buses={buses}
            routes={routes}
            onDispatchBackup={handleDispatchBackupBus}
          />
        )}

        {activeView === 'sms' && <SmsSimulator />}
      </main>

      {/* Floating Voice Assistant Widget */}
      <VoiceAssistant onAutoBookTicket={handleAutoBookFromVoice} />

      {/* Ticket Booking Drawer Modal */}
      <TicketModal
        bus={ticketModalBus}
        isOpen={Boolean(ticketModalBus)}
        onClose={() => setTicketModalBus(null)}
        onConfirmBooking={handleConfirmBooking}
        isOffline={isOffline}
        initialBookingData={autoBookingData}
      />

      {/* Hackathon System Features Presentation Drawer */}
      <PitchModal
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
      />
    </div>
  );
}
