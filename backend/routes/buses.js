const express = require('express');
const router = express.Router();

const INITIAL_BUSES = [
  {
    id: 'BUS-100',
    regNumber: 'DL-01-PC-7788',
    routeId: 'R-100',
    routeName: 'Delhi - Noida Express',
    driver: 'Virender Tyagi',
    driverPhone: '+91 98112 33445',
    currentLocation: { lat: 28.6127, lng: 77.2773 },
    from: 'Delhi (Kashmiri Gate ISBT)',
    to: 'Noida (Sector 62)',
    nextStop: 'Sector 18 Noida',
    speed: 52,
    occupancy: 'HALF',
    gpsEtaMinutes: 12,
    mlEtaMinutes: 15,
    fare: 45,
  },
  {
    id: 'BUS-101',
    regNumber: 'UP-16-BT-9090',
    routeId: 'R-102',
    routeName: 'Noida - Panipat Superfast',
    driver: 'Rajesh Gurjar',
    driverPhone: '+91 99102 88776',
    currentLocation: { lat: 28.6667, lng: 77.2333 },
    from: 'Noida (Botanical Garden)',
    to: 'Panipat (Mill Chowk)',
    nextStop: 'Samalkha Toll',
    speed: 62,
    occupancy: 'FULL',
    gpsEtaMinutes: 28,
    mlEtaMinutes: 34,
    fare: 120,
  },
];

// GET /api/buses - Fetch active bus fleet
router.get('/', (req, res) => {
  res.json({ success: true, data: INITIAL_BUSES });
});

// POST /api/buses/:id/occupancy - Conductor update occupancy
router.post('/:id/occupancy', (req, res) => {
  const { id } = req.params;
  const { occupancy } = req.body;
  
  res.json({
    success: true,
    message: `Occupancy for bus ${id} updated to ${occupancy}`,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
