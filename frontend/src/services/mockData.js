// Dedicated Delhi & Delhi NCR Public Transport Fleet Mock Dataset for JAN YATRA
// Exclusively covers Delhi and the Delhi NCR region:
// Delhi, Noida, Greater Noida, Rohini, Gurugram, Ghaziabad, and Faridabad

export const CITIES_LIST = [
  { id: 'DEL-KG', name: 'Delhi (Kashmiri Gate ISBT)', state: 'Delhi NCR', coordinates: [28.6667, 77.2333] },
  { id: 'DEL-AV', name: 'Delhi (Anand Vihar ISBT)', state: 'Delhi NCR', coordinates: [28.6502, 77.3150] },
  { id: 'DEL-DK', name: 'Delhi (Dhaula Kuan)', state: 'Delhi NCR', coordinates: [28.5921, 77.1610] },
  { id: 'DEL-RH', name: 'Rohini (Sector 14 & Metro)', state: 'Delhi NCR', coordinates: [28.7166, 77.1245] },
  { id: 'NOI-62', name: 'Noida (Sector 62)', state: 'Delhi NCR', coordinates: [28.6250, 77.3750] },
  { id: 'NOI-BG', name: 'Noida (Botanical Garden)', state: 'Delhi NCR', coordinates: [28.5645, 77.3340] },
  { id: 'GNO-PC', name: 'Greater Noida (Pari Chowk)', state: 'Delhi NCR', coordinates: [28.4671, 77.5138] },
  { id: 'GNO-KP', name: 'Greater Noida (Knowledge Park)', state: 'Delhi NCR', coordinates: [28.4600, 77.4900] },
  { id: 'GUR-CH', name: 'Gurugram (Cyber Hub)', state: 'Delhi NCR', coordinates: [28.4986, 77.0890] },
  { id: 'GUR-IC', name: 'Gurugram (IFFCO Chowk)', state: 'Delhi NCR', coordinates: [28.4720, 77.0720] },
  { id: 'GHA-BS', name: 'Ghaziabad (Old Bus Stand)', state: 'Delhi NCR', coordinates: [28.6692, 77.4538] },
  { id: 'GHA-VM', name: 'Ghaziabad (Vaishali Metro)', state: 'Delhi NCR', coordinates: [28.6496, 77.3396] },
  { id: 'FAR-MS', name: 'Faridabad (Main Stand)', state: 'Delhi NCR', coordinates: [28.4089, 77.3178] },
  { id: 'FAR-BC', name: 'Faridabad (Bata Chowk)', state: 'Delhi NCR', coordinates: [28.3842, 77.3094] },
];

export const INITIAL_ROUTES = [
  {
    id: 'R-100',
    name: 'Delhi - Noida Express',
    code: 'DN-100',
    from: 'Delhi (Kashmiri Gate ISBT)',
    to: 'Noida (Sector 62)',
    distance: '32 km',
    fare: 45,
    stops: ['Kashmiri Gate', 'Akshardham', 'Sector 18 Noida', 'Sector 62 Noida'],
    coordinates: [
      [28.6667, 77.2333],
      [28.6127, 77.2773],
      [28.5700, 77.3200],
      [28.6250, 77.3750],
    ]
  },
  {
    id: 'R-105',
    name: 'Delhi - Greater Noida Pari Chowk Express',
    code: 'DGN-105',
    from: 'Delhi (Kashmiri Gate ISBT)',
    to: 'Greater Noida (Pari Chowk)',
    distance: '48 km',
    fare: 65,
    stops: ['Kashmiri Gate', 'Akshardham', 'Sector 142 Advant', 'Pari Chowk Greater Noida'],
    coordinates: [
      [28.6667, 77.2333],
      [28.6127, 77.2773],
      [28.5080, 77.4170],
      [28.4671, 77.5138],
    ]
  },
  {
    id: 'R-106',
    name: 'Rohini - Noida Sector 62 Connect',
    code: 'RN-106',
    from: 'Rohini (Sector 14 & Metro)',
    to: 'Noida (Sector 62)',
    distance: '41 km',
    fare: 55,
    stops: ['Rohini Sector 14', 'Pitampura', 'ISBT Kashmiri Gate', 'Sector 62 Noida'],
    coordinates: [
      [28.7166, 77.1245],
      [28.6989, 77.1412],
      [28.6667, 77.2333],
      [28.6250, 77.3750],
    ]
  },
  {
    id: 'R-107',
    name: 'Rohini - Greater Noida Express Corridor',
    code: 'RG-107',
    from: 'Rohini (Sector 14 & Metro)',
    to: 'Greater Noida (Pari Chowk)',
    distance: '62 km',
    fare: 85,
    stops: ['Rohini Sector 14', 'Azadpur', 'Akshardham Flyover', 'Noida Expressway', 'Pari Chowk'],
    coordinates: [
      [28.7166, 77.1245],
      [28.7077, 77.1757],
      [28.6127, 77.2773],
      [28.5080, 77.4170],
      [28.4671, 77.5138],
    ]
  },
  {
    id: 'R-110',
    name: 'Noida - Greater Noida City Feeder',
    code: 'NG-110',
    from: 'Noida (Botanical Garden)',
    to: 'Greater Noida (Pari Chowk)',
    distance: '28 km',
    fare: 40,
    stops: ['Botanical Garden', 'Noida Sector 137', 'Knowledge Park II', 'Pari Chowk'],
    coordinates: [
      [28.5645, 77.3340],
      [28.5130, 77.4040],
      [28.4600, 77.4900],
      [28.4671, 77.5138],
    ]
  },
  {
    id: 'R-111',
    name: 'Rohini - Gurugram Cyber Hub Express',
    code: 'RGC-111',
    from: 'Rohini (Sector 14 & Metro)',
    to: 'Gurugram (Cyber Hub)',
    distance: '36 km',
    fare: 60,
    stops: ['Rohini Sector 14', 'Punjabi Bagh Club', 'Dhaula Kuan Flyover', 'Cyber Hub Gurugram'],
    coordinates: [
      [28.7166, 77.1245],
      [28.6690, 77.1320],
      [28.5921, 77.1610],
      [28.4986, 77.0890],
    ]
  },
  {
    id: 'R-113',
    name: 'Greater Noida - Anand Vihar Rapid',
    code: 'GDA-113',
    from: 'Greater Noida (Pari Chowk)',
    to: 'Delhi (Anand Vihar ISBT)',
    distance: '44 km',
    fare: 60,
    stops: ['Pari Chowk', 'Expressway Sector 142', 'Mayur Vihar Extension', 'Anand Vihar ISBT'],
    coordinates: [
      [28.4671, 77.5138],
      [28.5080, 77.4170],
      [28.5950, 77.2980],
      [28.6502, 77.3150],
    ]
  },
  {
    id: 'R-115',
    name: 'Delhi - Gurugram Cyber City Flyer',
    code: 'DG-115',
    from: 'Delhi (Dhaula Kuan)',
    to: 'Gurugram (Cyber Hub)',
    distance: '24 km',
    fare: 40,
    stops: ['Dhaula Kuan', 'Mahipalpur Aerocity', 'Ambience Mall', 'Cyber Hub Gurugram'],
    coordinates: [
      [28.5921, 77.1610],
      [28.5440, 77.1260],
      [28.5050, 77.0970],
      [28.4986, 77.0890],
    ]
  },
  {
    id: 'R-116',
    name: 'Delhi - Ghaziabad Trans-Hindon Express',
    code: 'DGH-116',
    from: 'Delhi (Anand Vihar ISBT)',
    to: 'Ghaziabad (Old Bus Stand)',
    distance: '18 km',
    fare: 30,
    stops: ['Anand Vihar ISBT', 'Mohan Nagar', 'Hindon River Metro', 'Ghaziabad Old Stand'],
    coordinates: [
      [28.6502, 77.3150],
      [28.6830, 77.3780],
      [28.6750, 77.4200],
      [28.6692, 77.4538],
    ]
  },
  {
    id: 'R-117',
    name: 'Gurugram - Faridabad Inter-NCR Express',
    code: 'GF-117',
    from: 'Gurugram (IFFCO Chowk)',
    to: 'Faridabad (Bata Chowk)',
    distance: '38 km',
    fare: 55,
    stops: ['IFFCO Chowk', 'Sikanderpur', 'Faridabad Pali Toll', 'Bata Chowk'],
    coordinates: [
      [28.4720, 77.0720],
      [28.4820, 77.0940],
      [28.4200, 77.2200],
      [28.3842, 77.3094],
    ]
  },
  {
    id: 'R-118',
    name: 'Noida - Ghaziabad City Connect',
    code: 'NGH-118',
    from: 'Noida (Sector 62)',
    to: 'Ghaziabad (Old Bus Stand)',
    distance: '16 km',
    fare: 25,
    stops: ['Sector 62 Noida', 'CISF Road', 'Vasundhara', 'Ghaziabad Old Stand'],
    coordinates: [
      [28.6250, 77.3750],
      [28.6410, 77.3910],
      [28.6600, 77.4100],
      [28.6692, 77.4538],
    ]
  },
  {
    id: 'R-119',
    name: 'Delhi - Faridabad Capital Corridor',
    code: 'DF-119',
    from: 'Delhi (Kashmiri Gate ISBT)',
    to: 'Faridabad (Main Stand)',
    distance: '39 km',
    fare: 50,
    stops: ['Kashmiri Gate', 'ITO', 'Ashram Chowk', 'Badarpur Border', 'Faridabad Main Stand'],
    coordinates: [
      [28.6667, 77.2333],
      [28.6289, 77.2410],
      [28.5700, 77.2600],
      [28.4900, 77.3000],
      [28.4089, 77.3178],
    ]
  }
];

export const formatTime = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const parseDurationMinutes = (durationStr) => {
  if (!durationStr) return 60;
  let total = 0;
  const hMatch = durationStr.match(/(\d+)\s*h/i);
  const mMatch = durationStr.match(/(\d+)\s*m/i);
  if (hMatch) total += parseInt(hMatch[1], 10) * 60;
  if (mMatch) total += parseInt(mMatch[1], 10);
  return total || 60;
};

// Generates dynamic, realistic departure and arrival times relative to current local time
export const getDynamicTimesForBus = (bus, index = 0, now = new Date()) => {
  const durationMins = parseDurationMinutes(bus.duration);
  // Stagger in-service bus departures realistically (departed 12-36 mins ago)
  const elapsedMins = Math.max(10, Math.min(durationMins - 15, Math.round(14 + (index * 5) % 25)));
  const depDate = new Date(now.getTime() - elapsedMins * 60000);
  const arrDate = new Date(depDate.getTime() + durationMins * 60000);

  // Dynamic next-stop ETA (between 4 and 26 mins)
  const dynamicGpsEta = Math.max(4, Math.min(26, Math.round(9 + (index * 3) % 17)));
  const dynamicMlEta = Math.round(dynamicGpsEta * 1.25);

  return {
    departureTime: formatTime(depDate),
    arrivalTime: formatTime(arrDate),
    gpsEtaMinutes: dynamicGpsEta,
    mlEtaMinutes: dynamicMlEta,
  };
};

export const createDynamicBuses = (now = new Date()) => {
  return RAW_INITIAL_BUSES.map((b, idx) => {
    const dynamicTimes = getDynamicTimesForBus(b, idx, now);
    return {
      ...b,
      ...dynamicTimes,
    };
  });
};

export const RAW_INITIAL_BUSES = [
  // 1. Delhi - Noida
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
    departureTime: '07:30 AM',
    arrivalTime: '08:35 AM',
    duration: '1h 05m',
    speed: 52,
    occupancy: 'HALF',
    status: 'ACTIVE',
    gpsEtaMinutes: 12,
    mlEtaMinutes: 15,
    historicalDelayFactor: '+3 mins (Akshardham flyover traffic)',
    lastSyncTime: 'Just now',
    heading: 120,
    fare: 45,
    busType: 'Jan Yatra Standard',
  },
  {
    id: 'BUS-100B',
    regNumber: 'DL-01-EV-5544',
    routeId: 'R-100',
    routeName: 'Delhi - Noida EV Smart Express',
    driver: 'Amit Khandelwal',
    driverPhone: '+91 98119 44332',
    currentLocation: { lat: 28.6400, lng: 77.2500 },
    from: 'Delhi (Kashmiri Gate ISBT)',
    to: 'Noida (Sector 62)',
    nextStop: 'Akshardham Flyover',
    departureTime: '08:15 AM',
    arrivalTime: '09:15 AM',
    duration: '1h 00m',
    speed: 58,
    occupancy: 'EMPTY',
    status: 'ACTIVE',
    gpsEtaMinutes: 20,
    mlEtaMinutes: 22,
    historicalDelayFactor: '+2 mins (Smooth morning corridor)',
    lastSyncTime: 'Just now',
    heading: 115,
    fare: 50,
    busType: 'Zero Emission EV AC',
  },

  // 2. Delhi - Greater Noida
  {
    id: 'BUS-105',
    regNumber: 'UP-16-GN-1122',
    routeId: 'R-105',
    routeName: 'Delhi - Greater Noida Pari Chowk Express',
    driver: 'Mohan Lal Verma',
    driverPhone: '+91 98118 77665',
    currentLocation: { lat: 28.5300, lng: 77.3900 },
    from: 'Delhi (Kashmiri Gate ISBT)',
    to: 'Greater Noida (Pari Chowk)',
    nextStop: 'Sector 142 Advant',
    departureTime: '07:45 AM',
    arrivalTime: '09:00 AM',
    duration: '1h 15m',
    speed: 54,
    occupancy: 'HALF',
    status: 'ACTIVE',
    gpsEtaMinutes: 16,
    mlEtaMinutes: 19,
    historicalDelayFactor: '+3 mins (Noida Expressway flow)',
    lastSyncTime: 'Just now',
    heading: 140,
    fare: 65,
    busType: 'AC BharatBenz Express',
  },
  {
    id: 'BUS-106',
    regNumber: 'UP-16-GN-8833',
    routeId: 'R-105',
    routeName: 'Delhi - Greater Noida Star Cityliner',
    driver: 'Surender Bhati',
    driverPhone: '+91 98122 88991',
    currentLocation: { lat: 28.6300, lng: 77.2600 },
    from: 'Delhi (Kashmiri Gate ISBT)',
    to: 'Greater Noida (Pari Chowk)',
    nextStop: 'Akshardham',
    departureTime: '08:30 AM',
    arrivalTime: '09:50 AM',
    duration: '1h 20m',
    speed: 50,
    occupancy: 'FULL',
    status: 'ACTIVE',
    gpsEtaMinutes: 28,
    mlEtaMinutes: 33,
    historicalDelayFactor: '+5 mins (Sarai Kale Khan bottleneck)',
    lastSyncTime: 'Just now',
    heading: 135,
    fare: 55,
    busType: 'Jan Yatra Non-AC',
  },

  // 3. Rohini - Noida
  {
    id: 'BUS-107',
    regNumber: 'DL-1P-RH-2211',
    routeId: 'R-106',
    routeName: 'Rohini - Noida Sector 62 Direct',
    driver: 'Praveen Dahiya',
    driverPhone: '+91 98104 33221',
    currentLocation: { lat: 28.6850, lng: 77.1800 },
    from: 'Rohini (Sector 14 & Metro)',
    to: 'Noida (Sector 62)',
    nextStop: 'ISBT Kashmiri Gate',
    departureTime: '08:15 AM',
    arrivalTime: '09:35 AM',
    duration: '1h 20m',
    speed: 53,
    occupancy: 'HALF',
    status: 'ACTIVE',
    gpsEtaMinutes: 24,
    mlEtaMinutes: 29,
    historicalDelayFactor: '+5 mins (Outer Ring Road morning rush)',
    lastSyncTime: 'Just now',
    heading: 110,
    fare: 55,
    busType: 'Jan Yatra Express',
  },

  // 4. Rohini - Greater Noida
  {
    id: 'BUS-108',
    regNumber: 'DL-1P-RH-9944',
    routeId: 'R-107',
    routeName: 'Rohini - Greater Noida Express Corridor',
    driver: 'Kuldeep Sehrawat',
    driverPhone: '+91 98115 66778',
    currentLocation: { lat: 28.6500, lng: 77.2500 },
    from: 'Rohini (Sector 14 & Metro)',
    to: 'Greater Noida (Pari Chowk)',
    nextStop: 'Akshardham Flyover',
    departureTime: '07:00 AM',
    arrivalTime: '08:45 AM',
    duration: '1h 45m',
    speed: 56,
    occupancy: 'HALF',
    status: 'ACTIVE',
    gpsEtaMinutes: 38,
    mlEtaMinutes: 44,
    historicalDelayFactor: '+6 mins (Yamuna crossing bottleneck)',
    lastSyncTime: 'Just now',
    heading: 130,
    fare: 85,
    busType: 'Long-Distance AC Shuttle',
  },

  // 5. Rohini - Gurugram
  {
    id: 'BUS-112',
    regNumber: 'DL-1P-RG-6612',
    routeId: 'R-111',
    routeName: 'Rohini - Gurugram Cyber Hub Express',
    driver: 'Ravinder Malik',
    driverPhone: '+91 98108 22119',
    currentLocation: { lat: 28.5921, lng: 77.1610 },
    from: 'Rohini (Sector 14 & Metro)',
    to: 'Gurugram (Cyber Hub)',
    nextStop: 'Dhaula Kuan Flyover',
    departureTime: '07:30 AM',
    arrivalTime: '08:40 AM',
    duration: '1h 10m',
    speed: 55,
    occupancy: 'FULL',
    status: 'ACTIVE',
    gpsEtaMinutes: 19,
    mlEtaMinutes: 26,
    historicalDelayFactor: '+7 mins (Gurugram border toll queue)',
    lastSyncTime: 'Just now',
    heading: 195,
    fare: 60,
    busType: 'Corporate Corridor Express',
  },

  // 6. Delhi - Gurugram
  {
    id: 'BUS-115',
    regNumber: 'DL-01-DK-3344',
    routeId: 'R-115',
    routeName: 'Delhi - Gurugram Cyber City Flyer',
    driver: 'Naresh Raghav',
    driverPhone: '+91 98114 22001',
    currentLocation: { lat: 28.5440, lng: 77.1260 },
    from: 'Delhi (Dhaula Kuan)',
    to: 'Gurugram (Cyber Hub)',
    nextStop: 'Ambience Mall',
    departureTime: '08:00 AM',
    arrivalTime: '08:45 AM',
    duration: '0h 45m',
    speed: 54,
    occupancy: 'HALF',
    status: 'ACTIVE',
    gpsEtaMinutes: 14,
    mlEtaMinutes: 18,
    historicalDelayFactor: '+4 mins (Aerocity-Mahipalpur traffic)',
    lastSyncTime: 'Just now',
    heading: 210,
    fare: 40,
    busType: 'EV AC Flyer',
  },

  // 7. Delhi - Ghaziabad
  {
    id: 'BUS-116',
    regNumber: 'UP-14-GZ-1022',
    routeId: 'R-116',
    routeName: 'Delhi - Ghaziabad Trans-Hindon Express',
    driver: 'Dharmendra Yadav',
    driverPhone: '+91 98109 44321',
    currentLocation: { lat: 28.6750, lng: 77.4200 },
    from: 'Delhi (Anand Vihar ISBT)',
    to: 'Ghaziabad (Old Bus Stand)',
    nextStop: 'Hindon River Metro',
    departureTime: '08:20 AM',
    arrivalTime: '09:00 AM',
    duration: '0h 40m',
    speed: 49,
    occupancy: 'FULL',
    status: 'ACTIVE',
    gpsEtaMinutes: 11,
    mlEtaMinutes: 15,
    historicalDelayFactor: '+4 mins (Mohan Nagar crossing queue)',
    lastSyncTime: 'Just now',
    heading: 65,
    fare: 30,
    busType: 'NCR Intercity Link',
  },

  // 8. Gurugram - Faridabad
  {
    id: 'BUS-117',
    regNumber: 'HR-51-FB-7711',
    routeId: 'R-117',
    routeName: 'Gurugram - Faridabad Inter-NCR Express',
    driver: 'Jagdish Tanwar',
    driverPhone: '+91 98124 66778',
    currentLocation: { lat: 28.4200, lng: 77.2200 },
    from: 'Gurugram (IFFCO Chowk)',
    to: 'Faridabad (Bata Chowk)',
    nextStop: 'Faridabad Pali Toll',
    departureTime: '07:45 AM',
    arrivalTime: '08:50 AM',
    duration: '1h 05m',
    speed: 57,
    occupancy: 'HALF',
    status: 'ACTIVE',
    gpsEtaMinutes: 20,
    mlEtaMinutes: 24,
    historicalDelayFactor: '+4 mins (Pali hill road speed control)',
    lastSyncTime: 'Just now',
    heading: 110,
    fare: 55,
    busType: 'Haryana Roadways Semi-Deluxe',
  },

  // 9. Noida - Ghaziabad
  {
    id: 'BUS-118',
    regNumber: 'UP-16-NG-2044',
    routeId: 'R-118',
    routeName: 'Noida - Ghaziabad City Connect',
    driver: 'Pramod Tomar',
    driverPhone: '+91 98116 88992',
    currentLocation: { lat: 28.6410, lng: 77.3910 },
    from: 'Noida (Sector 62)',
    to: 'Ghaziabad (Old Bus Stand)',
    nextStop: 'Vasundhara',
    departureTime: '09:00 AM',
    arrivalTime: '09:35 AM',
    duration: '0h 35m',
    speed: 46,
    occupancy: 'EMPTY',
    status: 'ACTIVE',
    gpsEtaMinutes: 12,
    mlEtaMinutes: 14,
    historicalDelayFactor: '+2 mins (Vasundhara road clear)',
    lastSyncTime: 'Just now',
    heading: 45,
    fare: 25,
    busType: 'Jan Yatra City Mini',
  },

  // 10. Delhi - Faridabad
  {
    id: 'BUS-119',
    regNumber: 'DL-1P-DF-8819',
    routeId: 'R-119',
    routeName: 'Delhi - Faridabad Capital Corridor',
    driver: 'Rajinder Bhatia',
    driverPhone: '+91 98103 55443',
    currentLocation: { lat: 28.5200, lng: 77.2900 },
    from: 'Delhi (Kashmiri Gate ISBT)',
    to: 'Faridabad (Main Stand)',
    nextStop: 'Badarpur Border',
    departureTime: '07:15 AM',
    arrivalTime: '08:25 AM',
    duration: '1h 10m',
    speed: 51,
    occupancy: 'HALF',
    status: 'ACTIVE',
    gpsEtaMinutes: 22,
    mlEtaMinutes: 26,
    historicalDelayFactor: '+4 mins (Badarpur flyover merging)',
    lastSyncTime: 'Just now',
    heading: 170,
    fare: 50,
    busType: 'DTC AC Cityliner',
  },

  // 11. Noida - Greater Noida
  {
    id: 'BUS-111',
    regNumber: 'UP-16-EV-3011',
    routeId: 'R-110',
    routeName: 'Noida - Greater Noida City Feeder',
    driver: 'Satish Bhati',
    driverPhone: '+91 98114 99001',
    currentLocation: { lat: 28.5130, lng: 77.4040 },
    from: 'Noida (Botanical Garden)',
    to: 'Greater Noida (Pari Chowk)',
    nextStop: 'Knowledge Park II',
    departureTime: '09:00 AM',
    arrivalTime: '09:50 AM',
    duration: '0h 50m',
    speed: 48,
    occupancy: 'HALF',
    status: 'ACTIVE',
    gpsEtaMinutes: 15,
    mlEtaMinutes: 18,
    historicalDelayFactor: '+3 mins (Pari Chowk roundabout signal)',
    lastSyncTime: 'Just now',
    heading: 145,
    fare: 40,
    busType: 'Electric City Feeder',
  },

  // 12. Greater Noida - Anand Vihar
  {
    id: 'BUS-114',
    regNumber: 'UP-16-AG-4499',
    routeId: 'R-113',
    routeName: 'Greater Noida - Anand Vihar Rapid',
    driver: 'Manoj Kumar Nagar',
    driverPhone: '+91 98117 00998',
    currentLocation: { lat: 28.5080, lng: 77.4170 },
    from: 'Greater Noida (Pari Chowk)',
    to: 'Delhi (Anand Vihar ISBT)',
    nextStop: 'Mayur Vihar Extension',
    departureTime: '08:00 AM',
    arrivalTime: '09:10 AM',
    duration: '1h 10m',
    speed: 57,
    occupancy: 'EMPTY',
    status: 'ACTIVE',
    gpsEtaMinutes: 22,
    mlEtaMinutes: 25,
    historicalDelayFactor: '+3 mins (Gazipur flyover delay)',
    lastSyncTime: 'Just now',
    heading: 310,
    fare: 60,
    busType: 'Express Suburban',
  }
];

export const INITIAL_BUSES = createDynamicBuses();

export const SAMPLE_VOICE_COMMANDS = [
  { label: 'दिल्ली से नोएडा बस खोज', text: 'दिल्ली से नोएडा की बस चाहिए', lang: 'hi-IN' },
  { label: 'दिल्ली से नोएडा टिकट बुकिंग', text: 'दिल्ली से नोएडा का 2 टिकट बुक करो', lang: 'hi-IN' },
  { label: 'Rohini to Greater Noida', text: 'Rohini se Greater Noida Pari Chowk ke liye agli bus kab aayegi?', lang: 'hi-IN' },
  { label: 'Delhi to Gurugram Bus', text: 'Book 1 ticket from Delhi to Gurugram Cyber Hub', lang: 'en-IN' },
  { label: 'Ghaziabad to Noida Search', text: 'Find express buses from Ghaziabad to Noida', lang: 'en-IN' },
];

export const SAMPLE_SMS_QUERIES = [
  { command: 'BUS 100 ETA', description: 'Query real-time ETA for Delhi-Noida Express' },
  { command: 'BOOK DELHI GURUGRAM 2', description: 'Book 2 tickets on Delhi-Gurugram Cyber Express' },
  { command: 'ROHINI NOIDA SCHEDULE', description: 'Get schedule for Rohini-Noida corridor' },
  { command: 'GHAZIABAD NOIDA STATUS', description: 'Get schedule for Ghaziabad-Noida link' },
];

// Generate realistic road-following arterial highway coordinates between Delhi NCR hubs
export const getRoadFollowingCoordinates = (fromCity, toCity, fromCoord, toCoord) => {
  const f = (fromCity || '').toLowerCase();
  const t = (toCity || '').toLowerCase();

  // Greater Noida <-> Ghaziabad arterial corridor (Surajpur, Gaur City, NH-9, Lal Kuan)
  if ((f.includes('greater noida') && t.includes('ghaziabad')) || (f.includes('ghaziabad') && t.includes('greater noida'))) {
    const coords = [
      [28.4671, 77.5138], // Pari Chowk
      [28.4950, 77.4980], // Surajpur Road
      [28.5320, 77.4720], // Ecotech
      [28.5780, 77.4520], // Bisrakh / Gr Noida West
      [28.6080, 77.4410], // Gaur City / Char Murti
      [28.6280, 77.4320], // Crossings Republik
      [28.6430, 77.4320], // NH-9 / NH-24 Bypass
      [28.6580, 77.4390], // Lal Kuan
      [28.6692, 77.4538]  // Ghaziabad Old Stand
    ];
    return f.includes('greater noida') ? coords : [...coords].reverse();
  }

  // Delhi <-> Noida (Ring Road, Akshardham, Chilla, Atta, Sec 62)
  if ((f.includes('delhi') && t.includes('noida') && !t.includes('greater')) || (f.includes('noida') && t.includes('delhi') && !f.includes('greater'))) {
    const coords = [
      [28.6667, 77.2333],
      [28.6360, 77.2510],
      [28.6127, 77.2773],
      [28.5870, 77.3160],
      [28.5700, 77.3200],
      [28.6010, 77.3550],
      [28.6250, 77.3750]
    ];
    return f.includes('delhi') ? coords : [...coords].reverse();
  }

  // Delhi <-> Greater Noida (Noida Expressway, Pari Chowk)
  if ((f.includes('delhi') && t.includes('greater noida')) || (f.includes('greater noida') && t.includes('delhi'))) {
    const coords = [
      [28.6667, 77.2333],
      [28.6360, 77.2510],
      [28.6127, 77.2773],
      [28.5680, 77.3280],
      [28.5260, 77.3790],
      [28.5080, 77.4170],
      [28.4671, 77.5138]
    ];
    return f.includes('delhi') ? coords : [...coords].reverse();
  }

  // Delhi / Rohini <-> Gurugram (NH-48, Dhaula Kuan, Aerocity, Cyber Hub)
  if (((f.includes('delhi') || f.includes('rohini')) && t.includes('gurugram')) || (f.includes('gurugram') && (t.includes('delhi') || t.includes('rohini')))) {
    const coords = [
      [28.5921, 77.1610],
      [28.5440, 77.1260],
      [28.5050, 77.0970],
      [28.4986, 77.0890],
      [28.4720, 77.0720]
    ];
    return (f.includes('delhi') || f.includes('rohini')) ? coords : [...coords].reverse();
  }

  // Gurugram <-> Faridabad (Gwal Pahari, Pali Toll, Bata Chowk)
  if ((f.includes('gurugram') && t.includes('faridabad')) || (f.includes('faridabad') && t.includes('gurugram'))) {
    const coords = [
      [28.4720, 77.0720],
      [28.4780, 77.1250],
      [28.4550, 77.1650],
      [28.4200, 77.2200],
      [28.3980, 77.2880],
      [28.3842, 77.3094]
    ];
    return f.includes('gurugram') ? coords : [...coords].reverse();
  }

  // Delhi <-> Faridabad (Mathura Road, Ashram, Badarpur)
  if ((f.includes('delhi') && t.includes('faridabad')) || (f.includes('faridabad') && t.includes('delhi'))) {
    const coords = [
      [28.6667, 77.2333],
      [28.6289, 77.2410],
      [28.5700, 77.2600],
      [28.4900, 77.3000],
      [28.4089, 77.3178]
    ];
    return f.includes('delhi') ? coords : [...coords].reverse();
  }

  // Noida <-> Ghaziabad (Sec 62, CISF Road, Vasundhara, Old Bus Stand)
  if ((f.includes('noida') && t.includes('ghaziabad')) || (f.includes('ghaziabad') && t.includes('noida'))) {
    const coords = [
      [28.6250, 77.3750],
      [28.6410, 77.3910],
      [28.6600, 77.4100],
      [28.6692, 77.4538]
    ];
    return f.includes('noida') ? coords : [...coords].reverse();
  }

  // Delhi / Anand Vihar <-> Ghaziabad (Mohan Nagar, Hindon)
  if (((f.includes('delhi') || f.includes('anand')) && t.includes('ghaziabad')) || (f.includes('ghaziabad') && (t.includes('delhi') || t.includes('anand')))) {
    const coords = [
      [28.6502, 77.3150],
      [28.6830, 77.3780],
      [28.6750, 77.4200],
      [28.6692, 77.4538]
    ];
    return (f.includes('delhi') || f.includes('anand')) ? coords : [...coords].reverse();
  }

  // Rohini <-> Noida (Outer Ring Road, ISBT Kashmiri Gate, Akshardham, Sector 62)
  if ((f.includes('rohini') && t.includes('noida')) || (f.includes('noida') && t.includes('rohini'))) {
    const coords = [
      [28.7166, 77.1245],
      [28.6989, 77.1412],
      [28.6667, 77.2333],
      [28.6360, 77.2510],
      [28.6127, 77.2773],
      [28.5870, 77.3160],
      [28.6250, 77.3750]
    ];
    return f.includes('rohini') ? coords : [...coords].reverse();
  }

  // Rohini <-> Greater Noida (Outer Ring Road, Kashmiri Gate, Akshardham, Noida Expressway, Pari Chowk)
  if ((f.includes('rohini') && t.includes('greater noida')) || (f.includes('greater noida') && t.includes('rohini'))) {
    const coords = [
      [28.7166, 77.1245],
      [28.7077, 77.1757],
      [28.6667, 77.2333],
      [28.6127, 77.2773],
      [28.5680, 77.3280],
      [28.5260, 77.3790],
      [28.5080, 77.4170],
      [28.4671, 77.5138]
    ];
    return f.includes('rohini') ? coords : [...coords].reverse();
  }

  // Smooth arterial curve through nearest NCR highway corridor
  const c1 = fromCoord || [28.6139, 77.2090];
  const c2 = toCoord || [28.5355, 77.3910];
  const midLat = (c1[0] + c2[0]) / 2;
  const midLng = (c1[1] + c2[1]) / 2;
  const offsetLat = (c1[1] - c2[1]) * 0.05;
  const offsetLng = (c2[0] - c1[0]) * 0.05;

  return [
    c1,
    [Number((c1[0] * 0.65 + (midLat + offsetLat) * 0.35).toFixed(4)), Number((c1[1] * 0.65 + (midLng + offsetLng) * 0.35).toFixed(4))],
    [Number((midLat + offsetLat).toFixed(4)), Number((midLng + offsetLng).toFixed(4))],
    [Number((c2[0] * 0.65 + (midLat + offsetLat) * 0.35).toFixed(4)), Number((c2[1] * 0.65 + (midLng + offsetLng) * 0.35).toFixed(4))],
    c2
  ];
};

// Dynamic bus matcher strictly for the Delhi NCR region
export const findBusesForRoute = (allBuses, fromCity, toCity, now = new Date()) => {
  if (!fromCity || !toCity) return allBuses;

  const getKeyArea = (str) => {
    if (!str) return '';
    const s = str.toLowerCase();
    if (s.includes('greater noida')) return 'greater noida';
    if (s.includes('rohini')) return 'rohini';
    if (s.includes('gurugram') || s.includes('gurgaon')) return 'gurugram';
    if (s.includes('ghaziabad')) return 'ghaziabad';
    if (s.includes('faridabad')) return 'faridabad';
    if (s.includes('noida')) return 'noida';
    if (s.includes('delhi')) return 'delhi';
    return str.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const fromArea = getKeyArea(fromCity);
  const toArea = getKeyArea(toCity);

  const assignUpcomingTimes = (busesList) => {
    return busesList.map((b, idx) => {
      const durationMins = parseDurationMinutes(b.duration);
      // Upcoming departures spaced every 15-20 minutes
      const depOffsetMins = 8 + idx * 18;
      const depDate = new Date(now.getTime() + depOffsetMins * 60000);
      const arrDate = new Date(depDate.getTime() + durationMins * 60000);
      const gpsEta = Math.max(3, depOffsetMins - 1);
      return {
        ...b,
        departureTime: formatTime(depDate),
        arrivalTime: formatTime(arrDate),
        gpsEtaMinutes: gpsEta,
        mlEtaMinutes: Math.max(5, Math.round(gpsEta * 1.25)),
      };
    });
  };

  // 1. Direct matches in current fleet
  const directMatches = allBuses.filter((b) => {
    const bFrom = getKeyArea(b.from);
    const bTo = getKeyArea(b.to);
    return bFrom === fromArea && bTo === toArea;
  });

  if (directMatches.length > 0) {
    return assignUpcomingTimes(directMatches);
  }

  // 2. Reverse matches (return trips in the same corridor)
  const reverseMatches = allBuses.filter((b) => {
    const bFrom = getKeyArea(b.from);
    const bTo = getKeyArea(b.to);
    return bFrom === toArea && bTo === fromArea;
  });

  if (reverseMatches.length > 0) {
    const reversed = reverseMatches.map((b, idx) => ({
      ...b,
      id: `${b.id}-REV-${idx + 1}`,
      regNumber: b.regNumber.replace(/(\d{2})$/, (_, d) => String((Number(d) + 17) % 99).padStart(2, '0')),
      routeName: `${fromCity.split('(')[0].trim()} - ${toCity.split('(')[0].trim()} Return Express`,
      from: fromCity,
      to: toCity,
      nextStop: toCity.split('(')[0].trim(),
    }));
    return assignUpcomingTimes(reversed);
  }

  // 3. Intermediate stop / corridor segment matches
  const segmentMatches = allBuses.filter((b) => {
    const bFrom = getKeyArea(b.from);
    const bTo = getKeyArea(b.to);
    const hasFrom = bFrom === fromArea || (b.stops && b.stops.some(s => getKeyArea(s) === fromArea));
    const hasTo = bTo === toArea || (b.stops && b.stops.some(s => getKeyArea(s) === toArea));
    return hasFrom && hasTo;
  });

  if (segmentMatches.length > 0) {
    return assignUpcomingTimes(segmentMatches);
  }

  // 4. Dynamic realistic synthesis for any other combination within Delhi NCR
  const fromName = fromCity.split('(')[0].trim();
  const toName = toCity.split('(')[0].trim();

  const fromEntry = CITIES_LIST.find((c) => c.name === fromCity);
  const toEntry = CITIES_LIST.find((c) => c.name === toCity);

  const fromCoord = fromEntry?.coordinates || [28.6139, 77.2090];
  const toCoord = toEntry?.coordinates || [28.5355, 77.3910];

  const latDiff = Math.abs(fromCoord[0] - toCoord[0]);
  const lngDiff = Math.abs(fromCoord[1] - toCoord[1]);
  const approxKm = Math.max(14, Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111));
  const baseFare = Math.min(85, Math.max(25, Math.round(approxKm * 1.35)));

  const stateCode = fromCity.includes('Delhi') || fromCity.includes('Rohini')
    ? 'DL-01'
    : fromCity.includes('Gurugram')
    ? 'HR-26'
    : fromCity.includes('Faridabad')
    ? 'HR-51'
    : fromCity.includes('Ghaziabad')
    ? 'UP-14'
    : 'UP-16';

  const hashSeed = Math.abs(fromName.length * 19 + toName.length * 29);

  const dur1 = Math.max(25, Math.round(approxKm * 1.6));
  const depDate1 = new Date(now.getTime() + 10 * 60000);
  const arrDate1 = new Date(depDate1.getTime() + dur1 * 60000);

  const dur2 = Math.max(25, Math.round(approxKm * 1.5));
  const depDate2 = new Date(now.getTime() + 28 * 60000);
  const arrDate2 = new Date(depDate2.getTime() + dur2 * 60000);

  const roadCoords = getRoadFollowingCoordinates(fromCity, toCity, fromCoord, toCoord);
  const loc1 = roadCoords[Math.min(roadCoords.length - 1, Math.max(1, Math.floor(roadCoords.length * 0.35)))];
  const loc2 = roadCoords[Math.min(roadCoords.length - 1, Math.max(1, Math.floor(roadCoords.length * 0.68)))];

  return [
    {
      id: `BUS-NCR-${hashSeed}`,
      regNumber: `${stateCode}-NC-${1000 + (hashSeed * 73) % 8999}`,
      routeId: `R-NCR-${hashSeed}`,
      routeName: `${fromName} - ${toName} NCR Metro Connector`,
      driver: 'Rajinder Kumar',
      driverPhone: '+91 98110 55432',
      currentLocation: {
        lat: loc1[0],
        lng: loc1[1],
      },
      routeCoordinates: roadCoords,
      from: fromCity,
      to: toCity,
      nextStop: `${toName} Ring Road`,
      departureTime: formatTime(depDate1),
      arrivalTime: formatTime(arrDate1),
      duration: `${dur1} mins`,
      speed: 50,
      occupancy: 'HALF',
      status: 'ACTIVE',
      gpsEtaMinutes: 8,
      mlEtaMinutes: 11,
      historicalDelayFactor: '+3 mins (Peak NCR arterial traffic)',
      lastSyncTime: 'Just now',
      heading: 180,
      fare: baseFare,
      busType: 'NCR Intercity Electric',
    },
    {
      id: `BUS-EV-${hashSeed + 3}`,
      regNumber: `${stateCode}-EV-${2000 + (hashSeed * 47) % 7999}`,
      routeId: `R-NCR-${hashSeed}`,
      routeName: `${fromName} - ${toName} Express Feeder`,
      driver: 'Subhash Chandra',
      driverPhone: '+91 98101 44321',
      currentLocation: {
        lat: loc2[0],
        lng: loc2[1],
      },
      routeCoordinates: roadCoords,
      from: fromCity,
      to: toCity,
      nextStop: `${toName} Main Terminal`,
      departureTime: formatTime(depDate2),
      arrivalTime: formatTime(arrDate2),
      duration: `${dur2} mins`,
      speed: 54,
      occupancy: 'EMPTY',
      status: 'ACTIVE',
      gpsEtaMinutes: 24,
      mlEtaMinutes: 28,
      historicalDelayFactor: '+4 mins (Corridor flow regular)',
      lastSyncTime: 'Just now',
      heading: 160,
      fare: Math.round(baseFare * 1.15),
      busType: 'AC Low-Floor Feeder',
    },
  ];
};
