// LocalStorage / IndexedDB service for JAN YATRA offline capability

const DB_KEYS = {
  BOOKINGS: 'jan_yatra_bookings',
  OFFLINE_QUEUE: 'jan_yatra_offline_queue',
  CACHED_ROUTES: 'jan_yatra_cached_routes',
};

export const getStoredBookings = () => {
  try {
    const raw = localStorage.getItem(DB_KEYS.BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load bookings from local DB', e);
    return [];
  }
};

export const saveBookingLocally = (booking, isOffline = false) => {
  try {
    const bookings = getStoredBookings();
    const newBooking = {
      ...booking,
      id: 'JY-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: isOffline ? 'QUEUED_OFFLINE' : 'CONFIRMED',
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
    const raw = localStorage.getItem(DB_KEYS.OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const syncOfflineQueue = () => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { count: 0, synced: [] };

  const bookings = getStoredBookings();
  const updatedBookings = bookings.map((b) => {
    if (b.status === 'QUEUED_OFFLINE') {
      return { ...b, status: 'CONFIRMED', syncedAt: new Date().toISOString() };
    }
    return b;
  });

  localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
  localStorage.setItem(DB_KEYS.OFFLINE_QUEUE, JSON.stringify([]));

  return { count: queue.length, synced: queue };
};
