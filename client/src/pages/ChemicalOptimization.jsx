import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Sliders,
  TrendingDown,
  Sparkles,
  Info,
  History
} from 'lucide-react';

const ChemicalOptimization = () => {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState(null);
  const [history, setHistory] = useState([]);
  const [adjustDoseValue, setAdjustDoseValue] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const canApprove = user?.role === 'OPERATOR' || user?.role === 'ADMIN';

  const fetchAIRecommendation = async () => {
    try {
      const res = await api.get('/ai/dose-recommendation');
      setRecommendation(res.data);
      setAdjustDoseValue(res.data.recommendedDose);
    } catch (err) {
      console.error('AI fetch error:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/dose-history');
      setHistory(res.data);
    } catch (err) {
      console.error('History fetch error:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchAIRecommendation(), fetchHistory()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleDecision = async (status, customDose = null) => {
    if (!recommendation) return;
    try {
      const payload = {
        plantId: '66f3e0000000000000000001', // Central Plant ID
        chemical: recommendation.chemical,
        currentValue: recommendation.currentValue,
        recommendedDose: recommendation.recommendedDose,
        approvedDose: customDose || recommendation.recommendedDose,
        confidence: recommendation.confidence,
        reason: recommendation.reason,
        status
      };

      await api.post('/ai/dose-decision', payload);
      setActionMessage(`Dose decision '${status}' recorded successfully in chemical audit logs.`);
      setShowAdjustModal(false);
      fetchHistory();
      fetchAIRecommendation();

      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error('Decision submit error:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white">AI Chemical Dose Optimization</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Statistical rule-based recommendation engine for disinfectant chemical dosage control.
          </p>
        </div>

        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium rounded-full">
          Academic Demo Engine
        </span>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Grid: Live AI Recommendation Card & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendation Card (Takes 2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Live AI Dosage Recommendation</h2>
                <p className="text-xs text-slate-400">Chlorine Disinfectant Agent</p>
              </div>
            </div>

            {recommendation && (
              <div className="text-right">
                <div className="text-xs text-slate-400">Confidence Score</div>
                <div className="text-lg font-extrabold text-blue-400">{recommendation.confidence}%</div>
              </div>
            )}
          </div>

          {loading || !recommendation ? (
            <div className="p-8 text-center text-slate-500 text-xs">Evaluating water parameters...</div>
          ) : (
            <div className="space-y-6">
              {/* Values Comparison Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 font-medium">Current Residual Chlorine</div>
                  <div className="text-2xl font-bold text-slate-200 mt-1">
                    {recommendation.currentValue.toFixed(2)} <span className="text-xs text-slate-500 font-normal">mg/L</span>
                  </div>
                </div>

                <div className="bg-blue-950/40 border border-blue-500/30 p-4 rounded-xl">
                  <div className="text-xs text-blue-300 font-medium">AI Recommended Optimal Dose</div>
                  <div className="text-3xl font-extrabold text-blue-400 mt-1">
                    {recommendation.recommendedDose.toFixed(2)} <span className="text-xs text-blue-300 font-normal">mg/L</span>
                  </div>
                </div>
              </div>

              {/* Rationale Explanation */}
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>AI Recommendation Rationale:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans pl-6">
                  {recommendation.reason}
                </p>
              </div>

              {/* Operator Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  {canApprove ? 'Human Approval Required before dosing' : 'Auditor Mode (Read-Only)'}
                </div>

                {canApprove && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDecision('APPROVED')}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-colors shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>APPROVE DOSE</span>
                    </button>

                    <button
                      onClick={() => setShowAdjustModal(true)}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg text-xs transition-colors shadow-lg shadow-amber-600/20"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>ADJUST</span>
                    </button>

                    <button
                      onClick={() => handleDecision('REJECTED')}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white font-medium rounded-lg text-xs transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>REJECT</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chemical Analytics & Savings Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Chemical Usage Analytics</h3>
            <p className="text-[11px] text-slate-400 mt-1">Comparative dosage baseline analysis</p>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Today's Consumption</span>
                <span className="font-bold text-slate-200">42.5 kg</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Weekly Total</span>
                <span className="font-bold text-slate-200">298.0 kg</span>
              </div>
              <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs">
                <span className="text-blue-300 font-medium">AI Optimization Savings</span>
                <span className="font-extrabold text-blue-400 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  14.5%
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
            <p className="text-[10px] text-slate-400 text-center italic">
              "Estimated reduction based on simulation/demo data. Formula accounts for turbidity demand, pH buffering and baseline dilution."
            </p>
          </div>
        </div>
      </div>

      {/* Adjust Modal Dialog */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Adjust Chemical Dose</h3>
            <p className="text-xs text-slate-400">Override AI recommended dosage with operator custom value.</p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Custom Dosage (mg/L)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="5.0"
                value={adjustDoseValue}
                onChange={(e) => setAdjustDoseValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision('ADJUSTED', parseFloat(adjustDoseValue))}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg text-xs"
              >
                Submit Adjusted Dose
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold text-slate-200">Historical Dose Decisions & Audit Log</h3>
          </div>
          <span className="text-xs text-slate-400">Total logged: {history.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Chemical</th>
                <th className="p-3">Current Val</th>
                <th className="p-3">AI Rec</th>
                <th className="p-3">Approved Dose</th>
                <th className="p-3">Status</th>
                <th className="p-3">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.map((h) => (
                <tr key={h._id} className="hover:bg-slate-950/50">
                  <td className="p-3 text-slate-400">{new Date(h.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-medium text-slate-200">{h.chemical}</td>
                  <td className="p-3">{h.currentValue} mg/L</td>
                  <td className="p-3 text-blue-400 font-semibold">{h.recommendedDose} mg/L</td>
                  <td className="p-3 font-semibold text-slate-100">{h.approvedDose || h.recommendedDose} mg/L</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : (h.status === 'ADJUSTED'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20')
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{h.createdBy?.name || 'System Operator'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChemicalOptimization;
