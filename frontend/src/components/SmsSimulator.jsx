import React, { useState } from 'react';
import { Phone, Send, MessageSquare, Sparkles } from 'lucide-react';
import { SAMPLE_SMS_QUERIES } from '../services/mockData';

export default function SmsSimulator() {
  const [smsInput, setSmsInput] = useState('BUS 101 ETA');
  const [smsMessages, setSmsMessages] = useState([
    {
      sender: 'user',
      text: 'BUS 101 ETA',
      time: '10:02 AM'
    },
    {
      sender: 'system',
      text: 'JAN YATRA: Bus HR-46-AT-9081 (Rohtak-Hisar) is 14 mins away at Meham. ML Predicted ETA: 21 mins due to Hansi toll bottleneck.',
      time: '10:02 AM'
    }
  ]);

  const handleSendSms = (e) => {
    e.preventDefault();
    if (!smsInput.trim()) return;

    const userMsg = {
      sender: 'user',
      text: smsInput.toUpperCase(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSmsMessages((prev) => [...prev, userMsg]);
    const inputUpper = smsInput.toUpperCase();
    setSmsInput('');

    setTimeout(() => {
      let replyText = 'JAN YATRA SMS: Invalid command. Send "BUS [ID] ETA" or "BOOK [ROUTE] [SEATS]" to 56161.';

      if (inputUpper.includes('ETA') || inputUpper.includes('BUS')) {
        replyText = 'JAN YATRA: Bus HR-46-AT-9081 (Rohtak-Hisar Express) Next Stop: Hansi. GPS ETA: 14m, ML ETA: 21m. Seats: Half Full.';
      } else if (inputUpper.includes('BOOK') || inputUpper.includes('R101')) {
        replyText = 'JAN YATRA TICKET CONFIRMED! Pass ID: JYSMS-8841. Route: Rohtak-Hisar. 2 Seats. Fare: Rs 220. Show code to conductor.';
      } else if (inputUpper.includes('SCHEDULE') || inputUpper.includes('ROHTAK')) {
        replyText = 'JAN YATRA SCHEDULE (Rohtak-Hisar): 08:30 AM, 10:15 AM, 12:00 PM, 02:30 PM. Fare: Rs 110.';
      }

      const sysMsg = {
        sender: 'system',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSmsMessages((prev) => [...prev, sysMsg]);
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f9f9fc] p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-forest-900 text-white p-6 rounded-3xl shadow-lg border border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-saffron-500 text-white flex items-center justify-center font-black shadow-saffron border border-saffron-400">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Feature Phone SMS Fallback Simulator</h1>
            <p className="text-xs text-navy-100 font-bold">Shortcode: 56161 | Zero-smartphone accessibility</p>
          </div>
        </div>

        <span className="bg-saffron-500 text-white text-xs font-black px-3 py-1 rounded-full border border-saffron-400">
          PRD Requirement 4.6
        </span>
      </div>

      {/* Feature Phone Simulator Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Mobile Screen View */}
        <div className="bg-navy-950 text-white p-6 rounded-3xl shadow-2xl border-4 border-navy-800 flex flex-col h-[520px]">
          
          <div className="bg-navy-900 p-3 rounded-2xl border border-navy-800 flex items-center justify-between text-xs font-mono mb-4 text-saffron-300">
            <span>To: 56161 (JAN YATRA SMS)</span>
            <span>2G Signal Strong</span>
          </div>

          {/* SMS Messages Screen */}
          <div className="flex-1 overflow-y-auto space-y-3 p-2 font-mono text-xs">
            {smsMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-saffron-500 text-white font-black'
                      : 'bg-navy-900 text-navy-100 border border-navy-800'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[9px] opacity-75 block text-right mt-1">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* SMS Input Box */}
          <form onSubmit={handleSendSms} className="mt-4 pt-3 border-t border-navy-800 flex items-center space-x-2">
            <input
              type="text"
              value={smsInput}
              onChange={(e) => setSmsInput(e.target.value)}
              placeholder="Type SMS command..."
              className="flex-1 bg-navy-900 text-white px-3.5 py-2.5 rounded-xl text-xs font-mono border border-navy-800 focus:outline-none focus:border-saffron-400 font-bold"
            />
            <button
              type="submit"
              className="bg-saffron-500 hover:bg-saffron-600 text-white p-2.5 rounded-xl font-bold transition-all shadow-saffron border border-saffron-400"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Right: Quick Sample Command Prompts */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-navy-100 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-navy-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-saffron-500" />
              <span>SMS Command Quick Test</span>
            </h2>

            <p className="text-xs text-navy-700 font-bold my-2">
              Test how feature phone users without internet can query bus arrival ETAs and book seats via standard SMS messages.
            </p>

            <div className="space-y-2 mt-4">
              {SAMPLE_SMS_QUERIES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setSmsInput(sample.command)}
                  className="w-full text-left p-3.5 rounded-2xl bg-navy-50/50 hover:bg-saffron-50 border border-navy-100 hover:border-saffron-300 transition-all text-xs font-bold text-navy-900 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-black text-saffron-600 block">{sample.command}</span>
                    <span className="text-[11px] text-navy-600">{sample.description}</span>
                  </div>
                  <MessageSquare className="w-4 h-4 text-navy-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-forest-50 border border-forest-200 text-forest-950 p-4 rounded-2xl text-xs space-y-1">
            <span className="font-black block">Inclusive Accessibility Note:</span>
            <p className="text-forest-900 text-[11px] font-bold">
              Provides full parity for non-smartphone riders in Tier-2/3 villages with patchy or no 4G data coverage.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
