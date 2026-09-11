import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles } from 'lucide-react';
import { createSpeechRecognizer, speakText, parseVoiceIntent } from '../services/speech';
import { SAMPLE_VOICE_COMMANDS } from '../services/mockData';

export default function VoiceAssistant({ onAutoBookTicket }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'assistant',
      text: 'नमस्ते! मैं जन यात्रा वॉइस असिस्टेंट हूँ। आप बोलकर टिकट बुक कर सकते हैं या बस का समय पूछ सकते हैं।',
      time: 'Just now'
    }
  ]);

  const [recognizer, setRecognizer] = useState(null);

  useEffect(() => {
    if (isListening) {
      const rec = createSpeechRecognizer(
        (text, isFinal) => {
          setTranscript(text);
          if (isFinal && text.trim()) {
            handleUserVoiceInput(text);
            setIsListening(false);
          }
        },
        (err) => {
          console.error('Voice error:', err);
          setIsListening(false);
        },
        () => setIsListening(false),
        selectedLang
      );

      if (rec) {
        try {
          rec.start();
          setRecognizer(rec);
        } catch (e) {
          console.error(e);
        }
      } else {
        setIsListening(false);
      }
    } else {
      if (recognizer) {
        try {
          recognizer.stop();
        } catch (e) {}
      }
    }
  }, [isListening, selectedLang]);

  const handleUserVoiceInput = (inputText) => {
    if (!inputText.trim()) return;

    const userMsg = { sender: 'user', text: inputText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatHistory((prev) => [...prev, userMsg]);

    const intent = parseVoiceIntent(inputText);
    
    setTimeout(() => {
      const assistantMsg = {
        sender: 'assistant',
        text: intent.responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory((prev) => [...prev, assistantMsg]);
      speakText(intent.responseText, selectedLang);

      if (intent.type === 'BOOK_TICKET' && onAutoBookTicket) {
        onAutoBookTicket({
          from: intent.from,
          to: intent.to,
          count: intent.count
        });
      }
    }, 600);
  };

  const triggerSampleCommand = (cmdText, lang) => {
    setSelectedLang(lang);
    setTranscript(cmdText);
    handleUserVoiceInput(cmdText);
  };

  return (
    <>
      {/* Floating Stitch Saffron Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center space-x-3 bg-gradient-to-r from-saffron-500 via-saffron-600 to-navy-800 text-white px-5 py-3.5 rounded-full shadow-saffron border-2 border-white transition-all transform hover:scale-105 active:scale-95 voice-pulse"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-black tracking-wide uppercase block text-white/90">Voice Assistant</span>
              <span className="text-xs font-extrabold block">बोलकर टिकट बुक करें</span>
            </div>
          </button>
        )}
      </div>

      {/* Voice Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full sm:max-w-md h-[85vh] sm:h-[620px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-navy-100">
            
            {/* Widget Header with Official Logo Colors */}
            <div className="bg-gradient-to-r from-navy-800 via-saffron-500 to-forest-700 p-4 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base flex items-center space-x-1.5">
                    <span>JAN YATRA Voice</span>
                    <Sparkles className="w-4 h-4 text-saffron-200 fill-saffron-200" />
                  </h3>
                  <p className="text-[11px] text-white/90 font-bold">Bilingual Voice Assistant (Hindi / English)</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Selector Bar */}
            <div className="bg-navy-50 px-4 py-2 flex items-center justify-between border-b border-navy-100 text-xs">
              <span className="font-extrabold text-navy-800">Voice Language:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedLang('hi-IN')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    selectedLang === 'hi-IN' ? 'bg-saffron-500 text-white shadow-sm' : 'bg-white text-navy-800 border border-navy-200'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  onClick={() => setSelectedLang('en-IN')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    selectedLang === 'en-IN' ? 'bg-navy-800 text-white shadow-sm' : 'bg-white text-navy-800 border border-navy-200'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Chat History Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f9f9fc]">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-bold shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-navy-800 text-white rounded-br-none'
                        : 'bg-white text-navy-900 border border-navy-100 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div className="flex items-center justify-between mt-1 text-[9px] opacity-75">
                      <span>{msg.time}</span>
                      {msg.sender === 'assistant' && (
                        <button
                          onClick={() => speakText(msg.text, selectedLang)}
                          className="hover:underline flex items-center space-x-0.5 ml-2"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isListening && (
                <div className="flex justify-start">
                  <div className="bg-saffron-50 border border-saffron-200 text-saffron-900 rounded-2xl p-3 text-xs flex items-center space-x-2 animate-pulse font-bold">
                    <Mic className="w-4 h-4 text-saffron-600 animate-bounce" />
                    <span>Listening... {transcript || 'Speak now (boliye)'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Preset Quick Voice Test Commands */}
            <div className="p-3 bg-white border-t border-navy-100 space-y-2">
              <span className="text-[10px] font-black uppercase text-navy-600 block px-1">
                Try Sample Voice Phrases (Judge Demo):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {SAMPLE_VOICE_COMMANDS.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => triggerSampleCommand(cmd.text, cmd.lang)}
                    className="text-left text-[11px] font-bold bg-navy-50 hover:bg-saffron-50 border border-navy-100 hover:border-saffron-300 p-2 rounded-xl text-navy-900 transition-all line-clamp-1"
                  >
                    💬 {cmd.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Input Action Controls */}
            <div className="p-4 bg-white border-t border-navy-100 flex items-center space-x-3">
              <button
                onClick={() => setIsListening(!isListening)}
                className={`flex-1 py-3.5 px-4 rounded-xl font-black text-xs text-white transition-all flex items-center justify-center space-x-2 ${
                  isListening
                    ? 'bg-saffron-600 hover:bg-saffron-700 animate-pulse'
                    : 'bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 shadow-saffron'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span>{isListening ? 'Stop Listening' : 'Tap & Speak Voice Command'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
