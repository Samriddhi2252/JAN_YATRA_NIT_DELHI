// Web Speech API Service for JAN YATRA Voice Assistant

export const isSpeechSupported = () => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const isTtsSupported = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const speakText = (text, lang = 'hi-IN') => {
  if (!isTtsSupported()) return;
  try {
    window.speechSynthesis.cancel(); // cancel any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Try to find a natural Hindi/Indian English voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.includes(lang.split('-')[0]) || v.lang.includes('hi') || v.lang.includes('IN'));
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
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang;

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    const isFinal = event.results[event.results.length - 1].isFinal;
    onResult(transcript, isFinal);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
};

export const parseVoiceIntent = (text) => {
  const normalized = text.toLowerCase();
  
  // Hindi ticket intent patterns: 'rohtak se hisar', 'ticket book', etc.
  if (normalized.includes('ticket') || normalized.includes('टिकट') || normalized.includes('book') || normalized.includes('बुक')) {
    let from = 'Rohtak Bus Stand';
    let to = 'Hisar Bypass Depot';
    let count = 1;

    if (normalized.includes('ambala') || normalized.includes('अंबाला')) from = 'Ambala Cantt';
    if (normalized.includes('karnal') || normalized.includes('करनाल')) to = 'Karnal New Bus Stand';
    if (normalized.includes('panipat') || normalized.includes('पानीपत')) from = 'Panipat Sugar Mill Chowk';
    if (normalized.includes('sonipat') || normalized.includes('सोनीपत')) to = 'Sonipat ISBT';

    const matchCount = normalized.match(/(\d+)/);
    if (matchCount) count = parseInt(matchCount[1], 10);
    if (normalized.includes('दो') || normalized.includes('2')) count = 2;

    return {
      type: 'BOOK_TICKET',
      from,
      to,
      count,
      responseText: `आपका ${from} से ${to} के लिए ${count} टिकट बुक किया जा रहा है।`
    };
  }

  // Check bus ETA intent patterns: 'kab aayegi', 'eta', 'where is bus', 'कहाँ है'
  if (normalized.includes('kab') || normalized.includes('कब') || normalized.includes('where') || normalized.includes('कहाँ') || normalized.includes('eta') || normalized.includes('time')) {
    return {
      type: 'CHECK_ETA',
      responseText: 'अगली बस HR-46-AT-9081 (रोहतक-हिसार एक्सप्रेस) 14 मिनट (ML अनुमान 21 मिनट) में पहुँच रही है।'
    };
  }

  // Default conversational query fallback
  return {
    type: 'GENERAL_QUERY',
    responseText: 'जन यात्रा सहायता: आप बोल सकते हैं "रोहतक से हिसार का 2 टिकट बुक करो" या "अगली बस कब आयेगी"।'
  };
};
