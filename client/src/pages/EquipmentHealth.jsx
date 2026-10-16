import React, { useState, useEffect } from 'react';
import api from '../api';
import { Wrench, ShieldAlert, CheckCircle2, Thermometer, Activity, RefreshCw } from 'lucide-react';

const EquipmentHealth = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipment = async () => {
    try {
      const res = await api.get('/equipment');
      setEquipment(res.data);
    } catch (err) {
      console.error('Equipment fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
    const interval = setInterval(fetchEquipment, 3500); // Live polling every 3.5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            Equipment Health Monitoring
          </h1>
          <p className="text-xs text-slate-400 mt-1">Predictive health scoring and telemetry analysis for plant machinery.</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full">
            Prototype Equipment Health Score
          </span>
          <button
            onClick={fetchEquipment}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            title="Refresh Equipment Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <div key={item._id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{item.name}</h3>
                <p className="text-xs text-slate-500">{item.type}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  item.status === 'OPERATIONAL'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : item.status === 'WARNING'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {item.status}
              </span>
            </div>

            {/* Health Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Prototype Health Score</span>
                <span className={`font-bold ${item.healthScore > 80 ? 'text-emerald-400' : (item.healthScore > 50 ? 'text-amber-400' : 'text-red-400')}`}>
                  {item.healthScore}%
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    item.healthScore > 80 ? 'bg-emerald-500' : item.healthScore > 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${item.healthScore}%` }}
                />
              </div>
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
              <div className="bg-slate-950 p-2.5 rounded-lg flex items-center space-x-2">
                <Activity className={`w-4 h-4 ${item.vibration > 4.5 ? 'text-red-400' : (item.vibration > 2.5 ? 'text-amber-400' : 'text-blue-400')}`} />
                <div>
                  <div className="text-[10px] text-slate-500">Vibration</div>
                  <div className="font-bold text-slate-200">{item.vibration} mm/s</div>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg flex items-center space-x-2">
                <Thermometer className={`w-4 h-4 ${item.temperature > 80 ? 'text-red-400' : (item.temperature > 65 ? 'text-amber-400' : 'text-emerald-400')}`} />
                <div>
                  <div className="text-[10px] text-slate-500">Temp</div>
                  <div className="font-bold text-slate-200">{item.temperature}°C</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentHealth;
