// Web Speech API Service for JAN YATRA Bilingual Voice Assistant (Hindi & Indian English)
import { findBusesForRoute } from './mockData';

export const isSpeechSupported = () => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const isTtsSupported = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const speakText = (text, lang = 'hi-IN') => {
  if (!isTtsSupported() || !text) return;
  try {
    window.speechSynthesis.cancel(); // cancel any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const isHindi = lang.startsWith('hi');
    
    // Find best voice match: Hindi, Indian English, or matching regional voice
    const matchingVoice = voices.find(v => {
      const vLang = (v.lang || '').replace('_', '-').toLowerCase();
      if (isHindi) {
        return vLang.includes('hi') || v.name.toLowerCase().includes('hindi') || vLang.includes('hi-in');
      }
      return vLang.includes('en-in') || vLang.includes('in') || v.name.toLowerCase().includes('india');
    }) || voices.find(v => (v.lang || '').toLowerCase().startsWith(lang.split('-')[0].toLowerCase()));

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Text-to-speech error', e);
  }
};

export const createSpeechRecognizer = (onResult, onError, onEnd, lang = 'hi-IN') => {
  if (!isSpeechSupported()) return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  // Continuous listening to prevent stream abortion during natural pauses
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;
  recognition.lang = lang;

  let accumulatedFinal = '';

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const res = event.results[i];
      if (res.isFinal) {
        accumulatedFinal += res[0].transcript + ' ';
      } else {
        interim += res[0].transcript;
      }
    }
    const combined = (accumulatedFinal + interim).trim();
    const isFinalChunk = event.results[event.results.length - 1]?.isFinal || false;
    onResult(combined, isFinalChunk);
  };

  recognition.onerror = (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') {
      return;
    }
    console.warn('Speech recognition warning:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
};

// Delhi & Delhi NCR Locations Dictionary for NLP parsing
export const LOCATION_PATTERNS = [
  {
    key: 'greater noida',
    name: 'Greater Noida (Pari Chowk)',
    patterns: ['greater noida', 'ग्रेटर नोएडा', 'gr noida', 'pari chowk', 'परी चौक', 'knowledge park']
  },
  {
    key: 'rohini',
    name: 'Rohini (Sector 14 & Metro)',
    patterns: ['rohini', 'रोहिणी', 'sector 14', 'सेक्टर 14']
  },
  {
    key: 'gurugram',
    name: 'Gurugram (Cyber Hub)',
    patterns: ['gurugram', 'गुरुग्राम', 'gurgaon', 'गुड़गांव', 'cyber hub', 'iffco chowk']
  },
  {
    key: 'ghaziabad',
    name: 'Ghaziabad (Old Bus Stand)',
    patterns: ['ghaziabad', 'गाजियाबाद', 'vaishali', 'वैशाली', 'anand vihar link']
  },
  {
    key: 'faridabad',
    name: 'Faridabad (Main Stand)',
    patterns: ['faridabad', 'फरीदाबाद', 'ballabhgarh', 'bata chowk']
  },
  {
    key: 'noida',
    name: 'Noida (Sector 62)',
    patterns: ['noida', 'नोएडा', 'sector 62', 'सेक्टर 62', 'botanical garden']
  },
  {
    key: 'delhi',
    name: 'Delhi (Kashmiri Gate ISBT)',
    patterns: ['delhi', 'दिल्ली', 'dilli', 'kashmiri gate', 'कश्मीरी गेट', 'anand vihar', 'आनंद विहार', 'dhaula kuan', 'धौला कुआं']
  }
];

export const parseVoiceIntent = (text) => {
  if (!text) {
    return {
      type: 'GENERAL_QUERY',
      responseText: 'कृपया बोलिए: जैसे "दिल्ली से नोएडा की बस चाहिए" या "रोहिणी से गाजियाबाद का टिकट बुक करो"।'
    };
  }

  const normalized = text.toLowerCase();
  const isHindi = /[\u0900-\u097F]/.test(text) || 
    normalized.includes('se') || 
    normalized.includes('chahiye') || 
    normalized.includes('karo') || 
    normalized.includes('hai') ||
    normalized.includes('ki bus') ||
    normalized.includes('dikhao');

  // Identify mentioned locations in the speech input
  const foundLocations = [];
  LOCATION_PATTERNS.forEach(loc => {
    const matched = loc.patterns.some(p => normalized.includes(p));
    if (matched) {
      let firstIndex = 9999;
      loc.patterns.forEach(p => {
        const idx = normalized.indexOf(p);
        if (idx !== -1 && idx < firstIndex) firstIndex = idx;
      });
      foundLocations.push({ ...loc, index: firstIndex });
    }
  });

  // Sort by appearance order in sentence
  foundLocations.sort((a, b) => a.index - b.index);

  let from = 'Delhi (Kashmiri Gate ISBT)';
  let to = 'Noida (Sector 62)';

  if (foundLocations.length >= 2) {
    from = foundLocations[0].name;
    to = foundLocations[1].name;
  } else if (foundLocations.length === 1) {
    if (normalized.includes('se ') || normalized.includes('से ') || normalized.includes('from ')) {
      from = foundLocations[0].name;
      to = from.includes('Noida') ? 'Delhi (Kashmiri Gate ISBT)' : 'Noida (Sector 62)';
    } else {
      to = foundLocations[0].name;
      from = to.includes('Delhi') ? 'Noida (Sector 62)' : 'Delhi (Kashmiri Gate ISBT)';
    }
  }

  // Extract passenger count
  let count = 1;
  const matchCount = normalized.match(/(\d+)/);
  if (matchCount) count = parseInt(matchCount[1], 10);
  if (normalized.includes('दो') || normalized.includes('do') || normalized.includes('two')) count = 2;
  if (normalized.includes('तीन') || normalized.includes('teen') || normalized.includes('three')) count = 3;
  if (normalized.includes('चार') || normalized.includes('chaar') || normalized.includes('four')) count = 4;

  const fromShort = from.split(' ')[0];
  const toShort = to.split(' ')[0];

  // 1. Ticket booking intent: 'ticket', 'टिकट', 'book', 'बुक', 'reserve'
  if (normalized.includes('ticket') || normalized.includes('टिकट') || normalized.includes('book') || normalized.includes('बुक')) {
    const responseText = isHindi
      ? `${fromShort} से ${toShort} के लिए ${count} टिकट बुकिंग खोली जा रही है।`
      : `Initiating booking for ${count} ticket(s) from ${fromShort} to ${toShort}.`;

    return {
      type: 'BOOK_TICKET',
      from,
      to,
      count,
      isHindi,
      responseText
    };
  }

  // 2. Bus arrival / ETA query intent: 'kab aayegi', 'कब आएगी', 'eta', 'time', 'समय'
  if (normalized.includes('kab') || normalized.includes('कब') || normalized.includes('eta') || normalized.includes('time') || normalized.includes('समय') || normalized.includes('कहाँ') || normalized.includes('where')) {
    const responseText = isHindi
      ? `${fromShort} से ${toShort} एक्सप्रेस बस लगभग 14 मिनट (AI अनुमान 18 मिनट) में पहुँच रही है।`
      : `Next ${fromShort} to ${toShort} express bus is arriving in ~14 mins (AI predicted 18 mins).`;

    return {
      type: 'CHECK_ETA',
      from,
      to,
      isHindi,
      responseText
    };
  }

  // 3. Route search intent (e.g. 'दिल्ली से नोएडा की बस चाहिए', 'bus chahiye', 'search', 'dikhao', 'find buses')
  const responseText = isHindi
    ? `${fromShort} से ${toShort} के लिए उपलब्ध एक्सप्रेस बसें खोजी जा रही हैं।`
    : `Searching available express buses from ${fromShort} to ${toShort}.`;

  return {
    type: 'SEARCH_BUSES',
    from,
    to,
    count,
    isHindi,
    responseText
  };
};

// Helper to retrieve real-time matching bus recommendations based on voice query
export const getVoiceRecommendations = (queryText, allBuses = []) => {
  if (!allBuses || allBuses.length === 0) return [];

  const intent = parseVoiceIntent(queryText || '');
  let matched = [];

  if (intent.from && intent.to) {
    matched = findBusesForRoute(allBuses, intent.from, intent.to);
  }

  if (matched.length === 0 && queryText) {
    const q = queryText.toLowerCase();
    matched = allBuses.filter(b => 
      b.routeName?.toLowerCase().includes(q) ||
      b.from?.toLowerCase().includes(q) ||
      b.to?.toLowerCase().includes(q) ||
      b.regNumber?.toLowerCase().includes(q)
    );
  }

  // Fallback to top available buses if none matched
  return matched.length > 0 ? matched : allBuses.slice(0, 4);
};


