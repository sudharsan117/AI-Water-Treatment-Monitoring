import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, CheckCircle, ShieldCheck, Filter } from 'lucide-react';

const AlertsPage = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';
  const isOperator = user?.role === 'OPERATOR' || isAdmin;

  const fetchAlerts = async () => {
    try {
      let query = [];
      if (filterSeverity !== 'ALL') query.push(`severity=${filterSeverity}`);
      if (filterStatus !== 'ALL') query.push(`status=${filterStatus}`);
      const queryString = query.length > 0 ? `?${query.join('&')}` : '';

      const res = await api.get(`/alerts${queryString}`);
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterSeverity, filterStatus]);

  const handleAcknowledge = async (id) => {
    try {
      await api.put(`/alerts/${id}/acknowledge`);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.put(`/alerts/${id}/resolve`);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            System Anomaly & Incident Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time alerts triggered by threshold evaluation and sensor simulator anomalies.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Severity:</span>
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Type</th>
                <th className="p-4">Alert Message</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No alerts match selected filter criteria.
                  </td>
                </tr>
              ) : (
                alerts.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-950/50">
                    <td className="p-4 text-slate-400 whitespace-nowrap">{new Date(a.timestamp).toLocaleString()}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.severity === 'CRITICAL'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : a.severity === 'WARNING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-medium">{a.type}</td>
                    <td className="p-4 font-semibold text-slate-100 max-w-md">{a.message}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          a.status === 'NEW'
                            ? 'bg-red-500/20 text-red-300'
                            : a.status === 'ACKNOWLEDGED'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap space-x-2">
                      {a.status === 'NEW' && isOperator && (
                        <button
                          onClick={() => handleAcknowledge(a._id)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded text-[11px] transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {a.status !== 'RESOLVED' && isAdmin && (
                        <button
                          onClick={() => handleResolve(a._id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-[11px] transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
