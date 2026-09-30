import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Radio, Plus } from 'lucide-react';

const SensorsAdmin = () => {
  const [sensors, setSensors] = useState([]);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const res = await api.get('/sensors');
        setSensors(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSensors();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            Sensor Hardware Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure and manage hardware telemetry sensors across plants.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Sensor Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Location</th>
              <th className="p-4">Unit</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sensors.map((s) => (
              <tr key={s._id} className="hover:bg-slate-950/50">
                <td className="p-4 font-bold text-slate-100">{s.name}</td>
                <td className="p-4 text-blue-400 font-semibold">{s.type}</td>
                <td className="p-4 text-slate-400">{s.location}</td>
                <td className="p-4 text-slate-400 font-mono">{s.unit}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SensorsAdmin;
