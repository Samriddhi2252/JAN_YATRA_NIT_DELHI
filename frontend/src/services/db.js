// LocalStorage / IndexedDB service for JAN YATRA offline capability

const DB_KEYS = {
  BOOKINGS: 'jan_yatra_bookings',
  OFFLINE_QUEUE: 'jan_yatra_offline_queue',
  CACHED_ROUTES: 'jan_yatra_cached_routes',
};

export const cleanExpiredOfflineBookings = () => {
  try {
    const now = Date.now();
    const rawQueue = localStorage.getItem(DB_KEYS.OFFLINE_QUEUE);
    const queue = rawQueue ? JSON.parse(rawQueue) : [];
    if (!queue || queue.length === 0) return { expiredCount: 0, remaining: [] };

    const validQueue = [];
    const expiredIds = new Set();

    queue.forEach((item) => {
      // Check if arrivalEtaTimestamp has elapsed while device remained offline without reconnecting
      if (item.arrivalEtaTimestamp && now > item.arrivalEtaTimestamp) {
        expiredIds.add(item.id);
      } else {
        validQueue.push(item);
      }
    });

    if (expiredIds.size > 0) {
      localStorage.setItem(DB_KEYS.OFFLINE_QUEUE, JSON.stringify(validQueue));

      // Mark as EXPIRED_OFFLINE in stored bookings
      const rawBookings = localStorage.getItem(DB_KEYS.BOOKINGS);
      const bookings = rawBookings ? JSON.parse(rawBookings) : [];
      const updatedBookings = bookings.map((b) => {
        if (expiredIds.has(b.id)) {
          return {
            ...b,
            status: 'EXPIRED_OFFLINE',
            invalidatedAt: new Date().toISOString(),
            invalidationReason: 'Bus arrival time passed while device remained offline without reconnecting to server.',
          };
        }
        return b;
      });
      localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(updatedBookings));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('jan_yatra_offline_queue_updated', {
            detail: { expiredCount: expiredIds.size, remainingCount: validQueue.length },
          })
        );
      }
    }

    return { expiredCount: expiredIds.size, remaining: validQueue };
  } catch (e) {
    console.error('Failed to clean expired offline bookings', e);
    return { expiredCount: 0, remaining: [] };
  }
};

export const getStoredBookings = () => {
  try {
    cleanExpiredOfflineBookings();
    const raw = localStorage.getItem(DB_KEYS.BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load bookings from local DB', e);
    return [];
  }
};

export const saveBookingLocally = (booking, isOffline = false) => {
  try {
    cleanExpiredOfflineBookings();

    const bookings = getStoredBookings();
    const etaMins = Number(booking.gpsEtaMinutes) || 20;
    const now = Date.now();
    const arrivalEtaTimestamp = booking.arrivalEtaTimestamp || (now + etaMins * 60 * 1000);

    const paymentMode = booking.paymentMode || (isOffline ? 'CASH_TO_CONDUCTOR' : 'ONLINE_QR');
    const status = isOffline ? 'PENDING_OFFLINE' : 'CONFIRMED';

    const newBooking = {
      ...booking,
      id: 'JY-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      etaMinutes: etaMins,
      arrivalEtaTimestamp,
      arrivalEtaTimeFormatted: new Date(arrivalEtaTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMode,
      status,
      ticketHash: 'JYQR-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    };

    bookings.unshift(newBooking);
    localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(bookings));

    if (isOffline) {
      const queue = getOfflineQueue();
      queue.push(newBooking);
      localStorage.setItem(DB_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    }

    return newBooking;
  } catch (e) {
    console.error('Failed to save booking locally', e);
    return null;
  }
};

export const getOfflineQueue = () => {
  try {
    cleanExpiredOfflineBookings();
    const raw = localStorage.getItem(DB_KEYS.OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const syncOfflineQueue = () => {
  cleanExpiredOfflineBookings();
  const queue = getOfflineQueue();
  if (queue.length === 0) return { count: 0, synced: [] };

  const bookings = getStoredBookings();
  const updatedBookings = bookings.map((b) => {
    if (b.status === 'PENDING_OFFLINE' || b.status === 'QUEUED_OFFLINE') {
      return { ...b, status: 'CONFIRMED', syncedAt: new Date().toISOString() };
    }
    return b;
  });

  localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
  localStorage.setItem(DB_KEYS.OFFLINE_QUEUE, JSON.stringify([]));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('jan_yatra_offline_queue_updated', {
        detail: { expiredCount: 0, remainingCount: 0 },
      })
    );
  }

  return { count: queue.length, synced: queue };
};

// Background sync interval check: runs continuously to invalidate stale offline requests
if (typeof window !== 'undefined') {
  setInterval(() => {
    cleanExpiredOfflineBookings();
  }, 5000);
}
