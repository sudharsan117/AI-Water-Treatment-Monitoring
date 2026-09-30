import React, { useState, useEffect } from 'react';
import api from '../api';
import { Bot, CheckCircle2, Cpu, Sparkles } from 'lucide-react';

const AIModelStatus = () => {
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get('/ai/model-status');
        setModelInfo(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInfo();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            AI Model & Optimization Engine Status
          </h1>
          <p className="text-xs text-slate-400 mt-1">Rule-based machine intelligence specs and monitored parameter matrix.</p>
        </div>
        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded-full">
          Academic Rule Engine Prototype
        </span>
      </div>

      {modelInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              Engine Metadata
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">Model Name:</span>
                <span className="font-bold text-slate-200">{modelInfo.modelName}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">Engine Type:</span>
                <span className="font-semibold text-blue-400">{modelInfo.type}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">Simulated Validation Accuracy:</span>
                <span className="font-bold text-emerald-400">{modelInfo.accuracyRating}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">Operational Status:</span>
                <span className="font-bold text-emerald-400">{modelInfo.status}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Monitored Chemical Drivers
            </h2>
            <div className="space-y-2 text-xs">
              {modelInfo.monitoredParameters?.map((param, i) => (
                <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{param}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIModelStatus;
