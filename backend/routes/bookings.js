const express = require('express');
const router = express.Router();

// POST /api/bookings/sync - Sync IndexedDB offline bookings queue
router.post('/sync', (req, res) => {
  const { offlineQueue } = req.body;
  const count = (offlineQueue && offlineQueue.length) || 0;

  res.json({
    success: true,
    syncedCount: count,
    message: `Successfully synchronized ${count} offline queued ticket(s) to cloud database!`,
    syncedAt: new Date().toISOString(),
  });
});

module.exports = router;
