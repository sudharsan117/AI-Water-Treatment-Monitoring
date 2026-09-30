import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Building2, Plus, Edit } from 'lucide-react';

const PlantsAdmin = () => {
  const [plants, setPlants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', capacityMGD: 10, status: 'ACTIVE' });

  const fetchPlants = async () => {
    try {
      const res = await api.get('/plants');
      setPlants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/plants', formData);
      setShowModal(false);
      setFormData({ name: '', location: '', capacityMGD: 10, status: 'ACTIVE' });
      fetchPlants();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            Treatment Plants Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Admin control panel for registered water treatment facilities.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Plant</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Plant Name</th>
              <th className="p-4">Location</th>
              <th className="p-4">Capacity (MGD)</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {plants.map((p) => (
              <tr key={p._id} className="hover:bg-slate-950/50">
                <td className="p-4 font-bold text-slate-100">{p.name}</td>
                <td className="p-4 text-slate-400">{p.location}</td>
                <td className="p-4">{p.capacityMGD} MGD</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-white">Add Treatment Plant</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Location / Zone</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Capacity (MGD)</label>
                <input
                  type="number"
                  required
                  value={formData.capacityMGD}
                  onChange={(e) => setFormData({ ...formData, capacityMGD: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded font-medium">Save Facility</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantsAdmin;
