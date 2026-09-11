import React from 'react';
import { Bus, AlertTriangle, TrendingUp, ShieldAlert, Zap, Radio } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminView({ buses, routes, onDispatchBackup }) {
  
  const chartData = {
    labels: ['Rohtak-Hisar (R101)', 'Ambala-Karnal (R102)', 'Panipat-Sonipat (R103)', 'Hisar-Bhiwani (R104)'],
    datasets: [
      {
        label: 'GPS-Only ETA Error (Mins)',
        data: [7.2, 5.8, 8.5, 6.1],
        backgroundColor: '#F46522',
        borderRadius: 8,
      },
      {
        label: 'GPS + ML Model ETA Error (Mins)',
        data: [1.8, 1.4, 2.1, 1.6],
        backgroundColor: '#00205B',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter', size: 12, weight: 'bold' }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ±${context.raw} mins error`
        }
      }
    },
    scales: {
      y: {
        title: { display: true, text: 'ETA Prediction Error (Minutes)' },
        beginAtZero: true,
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f9f9fc] p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="JAN YATRA" className="h-10 w-auto bg-navy-50 p-1 rounded-xl" />
            <h1 className="text-2xl font-black text-navy-900 tracking-tight">
              Haryana State Fleet Operations Dashboard
            </h1>
          </div>
          <p className="text-xs text-navy-700 font-bold mt-1">
            Real-Time Fleet Health, ML Delay Predictions & Dispatch Control Center
          </p>
        </div>

        <button
          onClick={onDispatchBackup}
          className="bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-saffron border border-saffron-400 text-xs flex items-center space-x-2"
        >
          <Zap className="w-4 h-4" />
          <span>Dispatch Emergency Backup Bus</span>
        </button>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-navy-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-navy-600 block uppercase">Active Buses</span>
            <span className="text-2xl font-black text-navy-900 mt-1 block">{buses.length} Fleet Units</span>
            <span className="text-[10px] text-forest-700 font-extrabold mt-1 inline-block">● 100% Signal Synced</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-800 flex items-center justify-center font-bold">
            <Bus className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-navy-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-navy-600 block uppercase">ML ETA Accuracy</span>
            <span className="text-2xl font-black text-forest-700 mt-1 block">94.2%</span>
            <span className="text-[10px] text-forest-700 font-extrabold mt-1 inline-block">Within ±2.1 mins error</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-saffron-50 text-saffron-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-navy-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-navy-600 block uppercase">Overcrowded Alert</span>
            <span className="text-2xl font-black text-saffron-600 mt-1 block">
              {buses.filter(b => b.occupancy === 'OVERCROWDED').length} Bus(es)
            </span>
            <span className="text-[10px] text-saffron-600 font-extrabold mt-1 inline-block">Samalkha Corridor alert</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-saffron-50 text-saffron-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-navy-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-navy-600 block uppercase">Offline Sync Mesh</span>
            <span className="text-2xl font-black text-navy-800 mt-1 block">18 Depots</span>
            <span className="text-[10px] text-forest-700 font-extrabold mt-1 inline-block">Zero data loss reported</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center font-bold">
            <Radio className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Chart.js ML vs GPS ETA accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-navy-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-navy-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-forest-700" />
                <span>ETA Prediction Accuracy: GPS-Only vs. GPS + ML Model</span>
              </h2>
              <p className="text-xs text-navy-600 font-bold">
                Comparative error metrics showing how ML delay model reduces commuter waiting time uncertainty.
              </p>
            </div>
            <span className="bg-saffron-100 text-saffron-900 text-[10px] font-black px-2.5 py-1 rounded-full border border-saffron-300">
              ML Delay Performance Chart
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Live Alerts & Depot Operations Side Feed */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-navy-100 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-navy-900 flex items-center space-x-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-saffron-600" />
              <span>Real-Time Fleet Alerts</span>
            </h2>

            <div className="space-y-3">
              <div className="bg-saffron-50 border border-saffron-200 text-saffron-950 p-3.5 rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between font-black">
                  <span>Overcrowding Alert (BUS-103)</span>
                  <span className="text-[10px] bg-saffron-600 text-white px-2 py-0.5 rounded-md">HIGH</span>
                </div>
                <p className="text-[11px] text-saffron-900 font-bold">
                  Panipat - Sonipat local reached 120% capacity at Samalkha stop.
                </p>
              </div>

              <div className="bg-navy-50 border border-navy-200 text-navy-950 p-3.5 rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between font-black">
                  <span>Toll Bottleneck Delay (BUS-101)</span>
                  <span className="text-[10px] bg-navy-800 text-white px-2 py-0.5 rounded-md">MEDIUM</span>
                </div>
                <p className="text-[11px] text-navy-900 font-bold">
                  ML model adjusted ETA +7 mins due to Hansi toll congestion.
                </p>
              </div>

              <div className="bg-forest-50 border border-forest-200 text-forest-950 p-3.5 rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between font-black">
                  <span>Offline Sync Status</span>
                  <span className="text-[10px] bg-forest-700 text-white px-2 py-0.5 rounded-md">OK</span>
                </div>
                <p className="text-[11px] text-forest-900 font-bold">
                  Rohtak depot local mesh synced 42 offline queued tickets.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onDispatchBackup}
            className="w-full py-3 bg-navy-800 hover:bg-navy-900 text-white font-black rounded-xl text-xs shadow-md"
          >
            Dispatch Emergency Bus to Samalkha
          </button>
        </div>

      </div>

      {/* Fleet Overview Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-navy-100 space-y-4">
        <h2 className="text-base font-black text-navy-900">Active Haryana Fleet Summary</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-100 text-navy-600 font-black uppercase bg-navy-50/60">
                <th className="p-3">Bus ID & Reg</th>
                <th className="p-3">Route Name</th>
                <th className="p-3">Driver</th>
                <th className="p-3">GPS Speed</th>
                <th className="p-3">GPS ETA</th>
                <th className="p-3">ML ETA</th>
                <th className="p-3">Occupancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100 font-bold text-navy-900">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-navy-50/50">
                  <td className="p-3 font-black text-navy-800">{bus.regNumber} ({bus.id})</td>
                  <td className="p-3">{bus.routeName}</td>
                  <td className="p-3">{bus.driver}</td>
                  <td className="p-3 font-black">{bus.speed} km/h</td>
                  <td className="p-3 text-navy-700">{bus.gpsEtaMinutes} mins</td>
                  <td className="p-3 font-black text-saffron-600">{bus.mlEtaMinutes} mins</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      bus.occupancy === 'EMPTY' ? 'bg-forest-100 text-forest-800' :
                      bus.occupancy === 'HALF' ? 'bg-navy-100 text-navy-800' :
                      bus.occupancy === 'FULL' ? 'bg-saffron-100 text-saffron-900' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {bus.occupancy}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
