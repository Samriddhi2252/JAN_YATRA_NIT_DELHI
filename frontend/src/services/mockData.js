// Expanded Inter-City mock dataset for JAN YATRA public transport fleet
// Covers Delhi NCR (Delhi, Noida, Gurgaon, Faridabad) and Haryana (Rohtak, Hisar, Ambala, Karnal, Panipat, Sonipat)

export const CITIES_LIST = [
  { id: 'DEL-KG', name: 'Delhi (Kashmiri Gate ISBT)', state: 'Delhi NCR' },
  { id: 'DEL-AV', name: 'Delhi (Anand Vihar ISBT)', state: 'Delhi NCR' },
  { id: 'DEL-DK', name: 'Delhi (Dhaula Kuan)', state: 'Delhi NCR' },
  { id: 'NOI-62', name: 'Noida (Sector 62)', state: 'Delhi NCR' },
  { id: 'NOI-BG', name: 'Noida (Botanical Garden)', state: 'Delhi NCR' },
  { id: 'NOI-PC', name: 'Greater Noida (Pari Chowk)', state: 'Delhi NCR' },
  { id: 'GUR-CH', name: 'Gurgaon (Cyber Hub)', state: 'Delhi NCR' },
  { id: 'GUR-IC', name: 'Gurgaon (IFFCO Chowk)', state: 'Delhi NCR' },
  { id: 'FAR-BS', name: 'Faridabad (Main Stand)', state: 'Delhi NCR' },
  { id: 'RTK-BS', name: 'Rohtak (Bus Stand)', state: 'Haryana' },
  { id: 'HSR-DP', name: 'Hisar (Bypass Depot)', state: 'Haryana' },
  { id: 'AMB-CT', name: 'Ambala (Cantt)', state: 'Haryana' },
  { id: 'KRN-BS', name: 'Karnal (New Stand)', state: 'Haryana' },
  { id: 'PNP-MC', name: 'Panipat (Mill Chowk)', state: 'Haryana' },
  { id: 'SNP-IS', name: 'Sonipat (ISBT)', state: 'Haryana' },
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
      [28.6667, 77.2333], // Kashmiri Gate Delhi
      [28.6127, 77.2773], // Akshardham
      [28.5700, 77.3200], // Sector 18 Noida
      [28.6250, 77.3750], // Sector 62 Noida
    ]
  },
  {
    id: 'R-101',
    name: 'Delhi - Gurgaon - Rohtak Intercity',
    code: 'DGR-101',
    from: 'Delhi (Anand Vihar ISBT)',
    to: 'Rohtak (Bus Stand)',
    distance: '86 km',
    fare: 105,
    stops: ['Anand Vihar', 'IFFCO Chowk Gurgaon', 'Bahadurgarh', 'Rohtak Stand'],
    coordinates: [
      [28.6502, 77.3150], // Anand Vihar
      [28.4720, 77.0720], // IFFCO Chowk Gurgaon
      [28.6925, 76.9230], // Bahadurgarh
      [28.8955, 76.6066], // Rohtak
    ]
  },
  {
    id: 'R-102',
    name: 'Noida - Panipat Superfast',
    code: 'NP-102',
    from: 'Noida (Botanical Garden)',
    to: 'Panipat (Mill Chowk)',
    distance: '94 km',
    fare: 120,
    stops: ['Botanical Garden Noida', 'Kashmiri Gate Delhi', 'Samalkha Toll', 'Panipat Stand'],
    coordinates: [
      [28.5645, 77.3340], // Botanical Garden Noida
      [28.6667, 77.2333], // Kashmiri Gate
      [29.2334, 77.0125], // Samalkha
      [29.3909, 76.9635], // Panipat
    ]
  },
  {
    id: 'R-103',
    name: 'Rohtak - Hisar Express',
    code: 'HK-103',
    from: 'Rohtak (Bus Stand)',
    to: 'Hisar (Bypass Depot)',
    distance: '98 km',
    fare: 110,
    stops: ['Rohtak Stand', 'Meham Chowk', 'Hansi Bypass', 'Hisar Depot'],
    coordinates: [
      [28.8955, 76.6066], // Rohtak
      [28.9634, 76.2828], // Meham
      [29.1004, 75.9602], // Hansi
      [29.1492, 75.7217], // Hisar
    ]
  },
  {
    id: 'R-104',
    name: 'Delhi - Karnal - Ambala Superliner',
    code: 'DKA-104',
    from: 'Delhi (Dhaula Kuan)',
    to: 'Ambala (Cantt)',
    distance: '210 km',
    fare: 240,
    stops: ['Dhaula Kuan Delhi', 'Sonipat ISBT', 'Karnal Stand', 'Ambala Cantt'],
    coordinates: [
      [28.5921, 77.1610], // Dhaula Kuan
      [28.9931, 77.0198], // Sonipat
      [29.6857, 76.9905], // Karnal
      [30.3752, 76.7821], // Ambala
    ]
  }
];

export const INITIAL_BUSES = [
  {
    id: 'BUS-100',
    regNumber: 'DL-01-PC-7788',
    routeId: 'R-100',
    routeName: 'Delhi - Noida Express',
    driver: 'Virender Tyagi',
    driverPhone: '+91 98112 33445',
    currentLocation: { lat: 28.6127, lng: 77.2773 }, // Akshardham
    from: 'Delhi (Kashmiri Gate ISBT)',
    to: 'Noida (Sector 62)',
    nextStop: 'Sector 18 Noida',
    speed: 52,
    occupancy: 'HALF',
    status: 'ACTIVE',
    gpsEtaMinutes: 12,
    mlEtaMinutes: 15,
    historicalDelayFactor: '+3 mins (Akshardham flyover slow traffic)',
    lastSyncTime: 'Just now',
    heading: 120,
    fare: 45,
  },
  {
    id: 'BUS-101',
    regNumber: 'UP-16-BT-9090',
    routeId: 'R-102',
    routeName: 'Noida - Panipat Superfast',
    driver: 'Rajesh Gurjar',
    driverPhone: '+91 99102 88776',
    currentLocation: { lat: 28.6667, lng: 77.2333 }, // Kashmiri Gate
    from: 'Noida (Botanical Garden)',
    to: 'Panipat (Mill Chowk)',
    nextStop: 'Samalkha Toll',
    speed: 62,
    occupancy: 'FULL',
    status: 'ACTIVE',
    gpsEtaMinutes: 28,
    mlEtaMinutes: 34,
    historicalDelayFactor: '+6 mins (GT Road bottleneck)',
    lastSyncTime: 'Just now',
    heading: 340,
    fare: 120,
  },
  {
    id: 'BUS-102',
    regNumber: 'HR-46-AT-9081',
    routeId: 'R-103',
    routeName: 'Rohtak - Hisar Express',
    driver: 'Ram Pal Singh',
    driverPhone: '+91 98123 45678',
    currentLocation: { lat: 28.9800, lng: 76.2400 }, // Near Meham
    from: 'Rohtak (Bus Stand)',
    to: 'Hisar (Bypass Depot)',
    nextStop: 'Hansi Bypass',
    speed: 58,
    occupancy: 'HALF',
    status: 'ACTIVE',
    gpsEtaMinutes: 14,
    mlEtaMinutes: 21,
    historicalDelayFactor: '+7 mins (Hansi toll delay)',
    lastSyncTime: 'Just now',
    heading: 280,
    fare: 110,
  },
  {
    id: 'BUS-103',
    regNumber: 'HR-55-N-3312',
    routeId: 'R-101',
    routeName: 'Delhi - Gurgaon - Rohtak Intercity',
    driver: 'Sanjay Yadav',
    driverPhone: '+91 98134 55667',
    currentLocation: { lat: 28.4720, lng: 77.0720 }, // Cyber Hub Gurgaon
    from: 'Delhi (Anand Vihar ISBT)',
    to: 'Rohtak (Bus Stand)',
    nextStop: 'Bahadurgarh',
    speed: 48,
    occupancy: 'OVERCROWDED',
    status: 'DELAYED',
    gpsEtaMinutes: 22,
    mlEtaMinutes: 31,
    historicalDelayFactor: '+9 mins (Gurgaon peak hour boarding)',
    lastSyncTime: '1 min ago',
    heading: 290,
    fare: 105,
  },
  {
    id: 'BUS-104',
    regNumber: 'DL-01-PB-4455',
    routeId: 'R-104',
    routeName: 'Delhi - Karnal - Ambala Superliner',
    driver: 'Harpreet Singh',
    driverPhone: '+91 98765 44321',
    currentLocation: { lat: 29.6857, lng: 76.9905 }, // Karnal
    from: 'Delhi (Dhaula Kuan)',
    to: 'Ambala (Cantt)',
    nextStop: 'Ambala Cantt',
    speed: 70,
    occupancy: 'HALF',
    status: 'ACTIVE',
    gpsEtaMinutes: 35,
    mlEtaMinutes: 33,
    historicalDelayFactor: '-2 mins (Smooth NH-44 highway run)',
    lastSyncTime: 'Just now',
    heading: 350,
    fare: 240,
  }
];

export const SAMPLE_VOICE_COMMANDS = [
  { label: 'Delhi to Noida Ticket', text: 'Delhi Kashmiri Gate se Noida Sector 62 ka 2 ticket book karo', lang: 'hi-IN' },
  { label: 'Check Bus ETA', text: 'Agli bus kab aayegi Noida ke liye?', lang: 'hi-IN' },
  { label: 'English Booking', text: 'Book 1 ticket from Delhi to Gurgaon', lang: 'en-IN' },
  { label: 'Rohtak to Hisar Query', text: 'Where is bus HR 46 AT 9081 right now?', lang: 'en-IN' },
];

export const SAMPLE_SMS_QUERIES = [
  { command: 'BUS 100 ETA', description: 'Query real-time ETA for Delhi-Noida Express' },
  { command: 'BOOK DELHI NOIDA 2', description: 'Book 2 tickets on Delhi-Noida Express' },
  { command: 'DELHI ROHTAK SCHEDULE', description: 'Get schedule for Delhi-Gurgaon-Rohtak corridor' },
];
