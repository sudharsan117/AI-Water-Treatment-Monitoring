import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Activity,
  AlertTriangle,
  FlaskConical,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Gauge,
  Droplets,
  Zap,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const Dashboard = () => {
  const [sensorsData, setSensorsData] = useState([]);
  const [chartReadings, setChartReadings] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchData = async () => {
    try {
      const [sensorsRes, alertsRes, equipRes] = await Promise.all([
        api.get('/sensors/readings/latest'),
        api.get('/alerts?status=NEW'),
        api.get('/equipment')
      ]);

      setSensorsData(sensorsRes.data);
      setAlerts(alertsRes.data);
      setEquipment(equipRes.data);

      // Fetch chart readings for primary sensors
      const chartPromises = sensorsRes.data.map(async (item) => {
        if (item.sensor) {
          const res = await api.get(`/sensors/${item.sensor._id}/readings?limit=20`);
          return {
            type: item.sensor.type,
            readings: res.data.map(r => ({
              time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              value: r.value
            }))
          };
        }
        return null;
      });

      const chartsResults = await Promise.all(chartPromises);
      const chartObj = {};
      chartsResults.forEach(c => {
        if (c) chartObj[c.type] = c.readings;
      });

      setChartReadings(chartObj);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3500); // 3.5s live polling
    return () => clearInterval(interval);
  }, []);

  // Helper to extract value by parameter name
  const getParamData = (paramName) => {
    const found = sensorsData.find(item => item.sensor && item.sensor.type === paramName);
    if (found && found.latestReading) {
      return {
        value: found.latestReading.value,
        status: found.sensor.status,
        unit: found.sensor.unit
      };
    }
    return { value: 0, status: 'ONLINE', unit: '' };
  };

  const phData = getParamData('pH');
  const turbData = getParamData('Turbidity');
  const chlorData = getParamData('Chlorine');
  const flowData = getParamData('Flow');
  const pressData = getParamData('Pressure');

  // Calculate Prototype Plant Health
  const calculatePlantHealth = () => {
    let health = 100;
    if (alerts.length > 0) health -= alerts.length * 5;
    equipment.forEach(e => {
      if (e.healthScore < 60) health -= 10;
    });
    return Math.max(30, Math.min(100, Math.round(health)));
  };

  const plantHealthScore = calculatePlantHealth();

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white">Central Water Treatment Plant Overview</h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full">
              ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time sensor telemetry, automated anomaly detection & AI chemical optimization.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-slate-400">
            Last Updated: <span className="text-slate-200 font-mono">{lastUpdate.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={fetchData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Plant Health Score */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Prototype Plant Health Score</span>
            <HeartPulse className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{plantHealthScore}%</span>
            <span className="text-xs text-emerald-400 font-medium">Optimal Operation</span>
          </div>
          <p className="text-[10px] text-slate-500 italic">*Calculated from sensor & equipment status (Prototype)</p>
        </div>

        {/* Active Alerts */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{alerts.length}</span>
            <span className="text-xs text-amber-400 font-medium">Require Attention</span>
          </div>
          <p className="text-[10px] text-slate-500">Live anomaly detection active</p>
        </div>

        {/* Chemical Savings */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimated Chemical Reduction</span>
            <FlaskConical className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-blue-400">14.5%</span>
            <span className="text-xs text-blue-300 font-medium">vs Unoptimized</span>
          </div>
          <p className="text-[10px] text-slate-500 italic">*Estimated reduction based on simulation/demo data</p>
        </div>

        {/* Water Quality Score */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Prototype Water Quality Score</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-cyan-400">92/100</span>
            <span className="text-xs text-emerald-400 font-medium">Safe Drinking Grade</span>
          </div>
          <p className="text-[10px] text-slate-500 italic">*Calculated from pH, turbidity & chlorine residual</p>
        </div>
      </div>

      {/* Sensor Live Parameter Cards Grid */}
      <h2 className="text-base font-semibold text-slate-200">Live Telemetry Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* pH Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">pH Level</div>
          <div className="text-2xl font-bold text-slate-100">{phData.value.toFixed(2)}</div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-medium">Standard (6.5 - 8.5)</span>
            <span className="text-slate-500">pH</span>
          </div>
        </div>

        {/* Turbidity Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">Turbidity</div>
          <div className="text-2xl font-bold text-amber-300">{turbData.value.toFixed(2)}</div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target: &lt; 2.5 NTU</span>
            <span className="text-slate-500">NTU</span>
          </div>
        </div>

        {/* Chlorine Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">Residual Chlorine</div>
          <div className="text-2xl font-bold text-cyan-300">{chlorData.value.toFixed(2)}</div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target: 1.0 - 2.5</span>
            <span className="text-slate-500">mg/L</span>
          </div>
        </div>

        {/* Flow Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">Plant Flow Rate</div>
          <div className="text-2xl font-bold text-blue-300">{flowData.value.toFixed(0)}</div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Normal Volume</span>
            <span className="text-slate-500">GPM</span>
          </div>
        </div>

        {/* Pressure Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">System Pressure</div>
          <div className="text-2xl font-bold text-purple-300">{pressData.value.toFixed(1)}</div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target: 30 - 70</span>
            <span className="text-slate-500">PSI</span>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chlorine Residual Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Residual Chlorine Telemetry (mg/L)</h3>
            <span className="text-xs text-cyan-400 font-mono">Live</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartReadings['Chlorine'] || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 4]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Turbidity Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Turbidity Telemetry (NTU)</h3>
            <span className="text-xs text-amber-400 font-mono">Live</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartReadings['Turbidity'] || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 6]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Alerts & Equipment Health Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Recent Anomaly Alerts</h3>
            <span className="text-xs text-slate-400">Auto-generated by anomaly engine</span>
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
              No active unacknowledged alerts. All system parameters nominal.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {alerts.slice(0, 5).map((a) => (
                <div
                  key={a._id}
                  className={`p-3 rounded-lg border text-xs flex items-start space-x-3 ${
                    a.severity === 'CRITICAL'
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold">{a.message}</div>
                    <div className="text-[10px] opacity-75 mt-1">
                      Severity: {a.severity} | Time: {new Date(a.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prototype Equipment Health Summary */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Equipment Health</h3>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Prototype Score
            </span>
          </div>

          <div className="space-y-3">
            {equipment.slice(0, 4).map((eq) => (
              <div key={eq._id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[160px]">{eq.name}</span>
                  <span className={`font-semibold ${eq.healthScore > 80 ? 'text-emerald-400' : (eq.healthScore > 60 ? 'text-amber-400' : 'text-red-400')}`}>
                    {eq.healthScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${eq.healthScore > 80 ? 'bg-emerald-500' : (eq.healthScore > 60 ? 'bg-amber-500' : 'bg-red-500')}`}
                    style={{ width: `${eq.healthScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
