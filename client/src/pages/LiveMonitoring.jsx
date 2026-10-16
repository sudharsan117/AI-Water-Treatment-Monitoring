import React, { useState, useEffect } from 'react';
import api from '../api';
import { Activity, Radio, RefreshCw } from 'lucide-react';

const LiveMonitoring = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSensors = async () => {
    try {
      const res = await api.get('/sensors/readings/latest');
      setSensors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
            Live Plant Telemetry Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time stream of physical plant sensors across treatment stages.</p>
        </div>
        <button onClick={fetchSensors} className="p-2 bg-slate-800 text-slate-200 rounded-lg">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((item) => {
          const s = item.sensor;
          const r = item.latestReading;
          if (!s) return null;

          const getStatusStyle = (status) => {
            switch (status) {
              case 'ONLINE':
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
              case 'WARNING':
                return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
              case 'CRITICAL':
                return 'bg-red-500/10 text-red-400 border border-red-500/20';
              default:
                return 'bg-slate-800 text-slate-400';
            }
          };

          const getQualityStyle = (quality) => {
            switch (quality) {
              case 'GOOD':
                return 'text-emerald-400 font-bold';
              case 'FAIR':
                return 'text-amber-400 font-bold';
              case 'POOR':
                return 'text-red-400 font-bold';
              default:
                return 'text-slate-300 font-bold';
            }
          };

          return (
            <div key={s._id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 shadow-lg hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{s.name}</h3>
                  <p className="text-[11px] text-slate-500">{s.location}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusStyle(s.status)}`}>
                  {s.status}
                </span>
              </div>

              <div className="flex items-baseline space-x-2 pt-2 border-t border-slate-800">
                <span className="text-3xl font-extrabold text-white">{r ? r.value : '--'}</span>
                <span className="text-xs text-slate-400 font-mono">{s.unit}</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Quality: <strong className={getQualityStyle(r ? r.quality : 'GOOD')}>{r ? r.quality : 'GOOD'}</strong></span>
                <span>Type: {s.type}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveMonitoring;
