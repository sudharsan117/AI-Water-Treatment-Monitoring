import React, { useState, useEffect } from 'react';
import api from '../api';
import { Cpu, Play, CheckCircle2, ArrowRight, History, AlertCircle } from 'lucide-react';

const DigitalTwin = () => {
  const [inputs, setInputs] = useState({
    pH: 7.2,
    turbidity: 2.4,
    chlorine: 1.1,
    flow: 135,
    pressure: 46,
    chemicalDose: 2.1
  });

  const [simulationResult, setSimulationResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/digital-twin/history');
      setHistory(res.data);
    } catch (err) {
      console.error('History fetch error:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/digital-twin/simulate', {
        plantId: '66f3e0000000000000000001',
        ...inputs
      });

      setSimulationResult(res.data);
      fetchHistory();
    } catch (err) {
      console.error('Simulation run error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white">Digital Twin — What-If Simulation</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate operational outcomes and water quality score shifts before applying chemical dosing.
          </p>
        </div>

        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold rounded-full">
          Software Simulation / Prototype Digital Twin
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Input Controls Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">
            Simulation Parameters
          </h2>

          <form onSubmit={handleRunSimulation} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Inflow pH Level</label>
              <input
                type="number"
                step="0.1"
                name="pH"
                value={inputs.pH}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Turbidity (NTU)</label>
              <input
                type="number"
                step="0.1"
                name="turbidity"
                value={inputs.turbidity}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Current Chlorine Residual (mg/L)</label>
              <input
                type="number"
                step="0.1"
                name="chlorine"
                value={inputs.chlorine}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Plant Flow Rate (GPM)</label>
              <input
                type="number"
                name="flow"
                value={inputs.flow}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Chlorine Addition Dose (mg/L)</label>
              <input
                type="number"
                step="0.1"
                name="chemicalDose"
                value={inputs.chemicalDose}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/25"
            >
              <Play className="w-4 h-4" />
              <span>{loading ? 'Running Twin Physics Model...' : 'RUN SIMULATION'}</span>
            </button>
          </form>
        </div>

        {/* What-If Predicted State Results Card (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">
            Current State vs Predicted Digital Twin State
          </h2>

          {!simulationResult ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Configure parameters on the left and click 'RUN SIMULATION' to compute what-if outcomes.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Predicted Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Turbidity comparison */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400">Turbidity</div>
                  <div className="flex items-center space-x-2 text-lg font-bold">
                    <span className="text-slate-400 line-through">{simulationResult.inputParameters?.turbidity}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <span className="text-emerald-400">{simulationResult.predictedOutput?.predictedTurbidity} NTU</span>
                  </div>
                </div>

                {/* Chlorine comparison */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400">Residual Chlorine</div>
                  <div className="flex items-center space-x-2 text-lg font-bold">
                    <span className="text-slate-400 line-through">{simulationResult.inputParameters?.chlorine}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <span className="text-cyan-400">{simulationResult.predictedOutput?.predictedChlorine} mg/L</span>
                  </div>
                </div>

                {/* Water Quality Score */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400">Predicted Quality Score</div>
                  <div className="text-2xl font-extrabold text-purple-400">
                    {simulationResult.predictedOutput?.waterQualityScore || simulationResult.waterQualityScore}/100
                  </div>
                </div>
              </div>

              {/* Recommendation Banner */}
              <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-1">
                <div className="flex items-center space-x-2 text-xs font-semibold text-purple-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>Digital Twin Recommendation:</span>
                </div>
                <p className="text-xs text-slate-300 pl-6">
                  {simulationResult.recommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulation History Table */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold text-slate-200">Recent Digital Twin Simulations</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Input pH</th>
                <th className="p-3">Input Turbidity</th>
                <th className="p-3">Dose Input</th>
                <th className="p-3">Predicted Turbidity</th>
                <th className="p-3">Predicted Chlorine</th>
                <th className="p-3">Predicted Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.map((s) => (
                <tr key={s._id} className="hover:bg-slate-950/50">
                  <td className="p-3 text-slate-400">{new Date(s.timestamp).toLocaleString()}</td>
                  <td className="p-3">{s.inputParameters?.pH}</td>
                  <td className="p-3">{s.inputParameters?.turbidity} NTU</td>
                  <td className="p-3 font-semibold text-purple-400">{s.chemicalDose} mg/L</td>
                  <td className="p-3 text-emerald-400">{s.predictedOutput?.predictedTurbidity} NTU</td>
                  <td className="p-3 text-cyan-400">{s.predictedOutput?.predictedChlorine} mg/L</td>
                  <td className="p-3 font-bold text-slate-100">{s.waterQualityScore}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwin;
