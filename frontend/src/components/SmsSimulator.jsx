import React, { useState, useRef, useEffect } from 'react';
import { Phone, Send, MessageSquare, Sparkles } from 'lucide-react';
import { SAMPLE_SMS_QUERIES, INITIAL_BUSES, INITIAL_ROUTES } from '../services/mockData';

export default function SmsSimulator() {
  const messagesEndRef = useRef(null);
  const [smsInput, setSmsInput] = useState('');
  const [smsMessages, setSmsMessages] = useState(() => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      {
        sender: 'user',
        text: 'BUS 100 ETA',
        time: nowTime
      },
      {
        sender: 'system',
        text: 'JAN YATRA: Bus DL-01-PC-7788 (Delhi - Noida Express) is 12 mins away. Next stop: Sector 18 Noida. ML Predicted ETA: 15 mins (Akshardham flyover traffic). Fare: Rs 45. Seats: Half Full.',
        time: nowTime
      }
    ];
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [smsMessages]);

  const processSmsCommand = (rawText) => {
    const text = (rawText || '').trim().toUpperCase();

    // 1. Bus ETA Query: e.g. "BUS 100 ETA", "BUS 105 ETA"
    if (text.includes('ETA') || text.startsWith('BUS')) {
      const busNumberMatch = text.match(/\b(?:BUS\s*[-]?\s*)?(\d{3}[A-Z]?)\b/i) || text.match(/\d+/);
      const busQuery = busNumberMatch ? busNumberMatch[0].replace(/\s+/g, '') : '100';

      const foundBus = INITIAL_BUSES.find((b) => 
        b.id.toUpperCase().includes(busQuery) || 
        b.regNumber.toUpperCase().includes(busQuery)
      ) || INITIAL_BUSES[0];

      const occupancyText = 
        foundBus.occupancy === 'EMPTY' ? 'Available (>75% empty)' :
        foundBus.occupancy === 'HALF' ? 'Seats Available (Half Full)' :
        foundBus.occupancy === 'FULL' ? 'Filling Fast (Few seats left)' :
        'Overcrowded';

      return `JAN YATRA: Bus ${foundBus.regNumber} (${foundBus.routeName}). Current Stop: ${foundBus.from.split('(')[0].trim()}. Next: ${foundBus.nextStop}. GPS ETA: ${foundBus.gpsEtaMinutes}m | ML Traffic ETA: ${foundBus.mlEtaMinutes}m. Seats: ${occupancyText}. Fare: Rs ${foundBus.fare}.`;
    }

    // 2. Ticket Booking: e.g. "BOOK DELHI GURUGRAM 2", "BOOK NOIDA 1"
    if (text.includes('BOOK')) {
      const seatMatch = text.match(/\b([1-9])\b(?:\s*(?:SEATS?|TICKETS?))?/);
      const seats = seatMatch ? parseInt(seatMatch[1], 10) : 2;

      let matchedRoute = INITIAL_ROUTES[0];
      if (text.includes('GURUGRAM') || text.includes('GURGAON')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-115') || INITIAL_ROUTES[0];
      } else if (text.includes('GREATER NOIDA') || text.includes('PARI CHOWK')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-105') || INITIAL_ROUTES[0];
      } else if (text.includes('NOIDA') && text.includes('ROHINI')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-106') || INITIAL_ROUTES[0];
      } else if (text.includes('NOIDA')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-100') || INITIAL_ROUTES[0];
      } else if (text.includes('GHAZIABAD')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-116') || INITIAL_ROUTES[0];
      } else if (text.includes('FARIDABAD')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-117') || INITIAL_ROUTES[0];
      }

      const totalFare = matchedRoute.fare * seats;
      const passNum = Math.floor(1000 + Math.random() * 9000);
      const passId = `JYSMS-${passNum}`;

      return `JAN YATRA TICKET CONFIRMED! Pass ID: ${passId}. Route: ${matchedRoute.name}. Seats: ${seats}. Total Fare: Rs ${totalFare}. Conductor Verification PIN: #${passNum.toString().slice(-3)}. Show this SMS upon boarding.`;
    }

    // 3. Schedule Query: e.g. "ROHINI NOIDA SCHEDULE"
    if (text.includes('SCHEDULE') || text.includes('TIMING')) {
      let matchedRoute = INITIAL_ROUTES[0];
      if (text.includes('ROHINI') && text.includes('NOIDA')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-106') || INITIAL_ROUTES[0];
      } else if (text.includes('GURUGRAM') || text.includes('GURGAON')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-115') || INITIAL_ROUTES[0];
      } else if (text.includes('GHAZIABAD')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-116') || INITIAL_ROUTES[0];
      } else if (text.includes('FARIDABAD')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-117') || INITIAL_ROUTES[0];
      } else if (text.includes('GREATER NOIDA')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-105') || INITIAL_ROUTES[0];
      }

      const now = new Date();
      const formatMin = (m) => new Date(now.getTime() + m * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const t1 = formatMin(12);
      const t2 = formatMin(35);
      const t3 = formatMin(60);
      const t4 = formatMin(90);

      return `JAN YATRA SCHEDULE [${matchedRoute.name} - ${matchedRoute.code}]: Upcoming Departures Today: ${t1}, ${t2}, ${t3}, ${t4}. Frequency: Every 20-25m. Fare: Rs ${matchedRoute.fare}. Next departure in 12 mins.`;
    }

    // 4. Corridor Status Query: e.g. "GHAZIABAD NOIDA STATUS"
    if (text.includes('STATUS') || text.includes('LIVE') || text.includes('CORRIDOR')) {
      let matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-118') || INITIAL_ROUTES[0];
      if (text.includes('ROHINI')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-106') || INITIAL_ROUTES[0];
      } else if (text.includes('GURUGRAM')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-115') || INITIAL_ROUTES[0];
      } else if (text.includes('GHAZIABAD') && text.includes('NOIDA')) {
        matchedRoute = INITIAL_ROUTES.find((r) => r.id === 'R-118') || INITIAL_ROUTES[0];
      }

      const activeBus = INITIAL_BUSES.find((b) => b.routeId === matchedRoute.id) || INITIAL_BUSES[0];

      return `JAN YATRA LIVE STATUS: Corridor [${matchedRoute.name}] is ACTIVE & RUNNING. Frequency: Every 15 mins. Active fleet: 8 buses. Next bus (${activeBus.regNumber}) reaching ${activeBus.nextStop} in ${activeBus.mlEtaMinutes}m. Fare: Rs ${matchedRoute.fare}.`;
    }

    // Default fallback
    return 'JAN YATRA SMS GATEWAY: Command not recognized. Send "BUS [ID] ETA", "BOOK [ROUTE] [SEATS]", "[ROUTE] SCHEDULE", or "[ROUTE] STATUS" to 56161.';
  };

  const handleExecuteCommand = (cmdText) => {
    if (!cmdText || !cmdText.trim()) return;

    const formattedCmd = cmdText.trim().toUpperCase();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      sender: 'user',
      text: formattedCmd,
      time: currentTime
    };

    setSmsMessages((prev) => [...prev, userMsg]);
    setSmsInput('');

    setTimeout(() => {
      const replyText = processSmsCommand(formattedCmd);
      const sysMsg = {
        sender: 'system',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSmsMessages((prev) => [...prev, sysMsg]);
    }, 350);
  };

  const handleSendSms = (e) => {
    e.preventDefault();
    handleExecuteCommand(smsInput);
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
            <div ref={messagesEndRef} />
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
                  onClick={() => handleExecuteCommand(sample.command)}
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

