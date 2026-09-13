/**
 * Intelligent parser for spoken driver delay reports.
 * Detects incident types (breakdowns, traffic jams, toll queues, accidents, weather)
 * and extracted delay minutes from speech.
 */
export function parseVoiceDelayDetails(transcript, currentBus) {
  const text = (transcript || '').toLowerCase().trim();
  let delayMinutes = null;

  // 1. Detect delay minutes via numbers (digits or words)
  const minMatch = text.match(/(\d{1,3})\s*(?:minute|minutes|min|mins|m)\b/i);
  const hourMatch = text.match(/(\d{1,2})\s*(?:hour|hours|hr|hrs|ghanta|ghante)\b/i);
  const delayPrefixedMatch = text.match(/delay\s*(?:of|by)?\s*(\d{1,3})/i);
  const generalNumberMatch = text.match(/(?:delay|late|rukavat|deri|traffic|breakdown)\D*(\d{1,3})/i);

  if (minMatch) {
    delayMinutes = parseInt(minMatch[1], 10);
  } else if (delayPrefixedMatch) {
    delayMinutes = parseInt(delayPrefixedMatch[1], 10);
  } else if (hourMatch) {
    delayMinutes = parseInt(hourMatch[1], 10) * 60;
  } else if (generalNumberMatch) {
    delayMinutes = parseInt(generalNumberMatch[1], 10);
  } else {
    // English & Hindi word numbers
    const wordNumbers = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'eleven': 11, 'twelve': 12, 'fifteen': 15, 'twenty': 20,
      'twenty five': 25, 'thirty': 30, 'forty': 40, 'forty five': 45,
      'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5,
      'chheh': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
      'gyarah': 11, 'barah': 12, 'pandrah': 15, 'bees': 20,
      'pachees': 25, 'tees': 30, 'aadha ghanta': 30
    };

    for (const [word, val] of Object.entries(wordNumbers)) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(text)) {
        delayMinutes = val;
        break;
      }
    }
  }

  // 2. Incident Category detection
  let incidentType = 'Traffic Congestion';
  let icon = '🚗';
  let severity = 'MODERATE';

  if (/breakdown|puncture|kharab|engine|mechanic|tyre|tire|technic/i.test(text)) {
    incidentType = 'Vehicle Breakdown';
    icon = '⚠️';
    severity = 'HIGH';
    if (!delayMinutes) delayMinutes = 20;
  } else if (/accident|collision|takkar|crash|ambulance|hit/i.test(text)) {
    incidentType = 'Road Accident';
    icon = '🚨';
    severity = 'HIGH';
    if (!delayMinutes) delayMinutes = 15;
  } else if (/toll|fastag|barrier|plaza|chungi/i.test(text)) {
    incidentType = 'Tollgate Congestion';
    icon = '🛑';
    severity = 'MODERATE';
    if (!delayMinutes) delayMinutes = 8;
  } else if (/water|rain|waterlog|barish|flood/i.test(text)) {
    incidentType = 'Weather / Waterlogging';
    icon = '🌧️';
    severity = 'MODERATE';
    if (!delayMinutes) delayMinutes = 15;
  } else if (/diversion|construction|closed|bandh|divert|road work/i.test(text)) {
    incidentType = 'Route Diversion';
    icon = '🚧';
    severity = 'MODERATE';
    if (!delayMinutes) delayMinutes = 12;
  } else if (/jam|traffic|congestion|slow|bheed|rush/i.test(text)) {
    incidentType = 'Traffic Jam';
    icon = '🚗';
    severity = 'MODERATE';
    if (!delayMinutes) delayMinutes = 10;
  } else {
    incidentType = 'Route Delay';
    icon = '⏱️';
    if (!delayMinutes) delayMinutes = 8;
  }

  delayMinutes = Math.min(Math.max(delayMinutes, 2), 120);

  // 3. Format clean report sentence
  let formattedReport = '';
  const trimmed = (transcript || '').trim();
  if (trimmed.length > 5) {
    let clean = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!/[.!?]$/.test(clean)) clean += '.';
    formattedReport = clean;
  } else {
    const nextLoc = currentBus?.nextStop || 'Bypass Toll';
    formattedReport = `Heavy traffic at ${nextLoc}. Delay ${delayMinutes} minutes.`;
  }

  return {
    rawTranscript: transcript,
    incidentType,
    delayMinutes,
    icon,
    severity,
    formattedReport,
  };
}
