import React, { useState, useEffect } from 'react';
import api from '../api';
import { FileText, Download, Eye, Plus, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

const REPORT_TYPES = [
  { value: 'WEEKLY', label: 'Weekly Compliance Report' },
  { value: 'DAILY_WATER_QUALITY', label: 'Daily Water Quality Report' },
  { value: 'EQUIPMENT_HEALTH', label: 'Equipment Health Report' },
  { value: 'CHEMICAL_USAGE', label: 'Chemical Usage Report' },
  { value: 'PLANT_OPERATIONS', label: 'Plant Operations Summary' }
];

const getReportLabel = (type) => {
  const found = REPORT_TYPES.find(r => r.value === type);
  if (found) return found.label;
  if (type === 'MONTHLY') return 'Monthly Audit Report';
  return type || 'Compliance Report';
};

const ComplianceReports = () => {
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('WEEKLY');
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage('');
    try {
      await api.post('/reports/generate', {
        reportType
      });
      setMessage(`${getReportLabel(reportType)} generated successfully!`);
      await fetchReports();
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const getApiBase = () =>
    import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

  const handleView = (filePath) => {
    if (!filePath) return;
    // filePath stored as relative /uploads/... — prepend backend base URL for production
    const base = import.meta.env.VITE_API_URL || '';
    window.open(`${base}${filePath}`, '_blank');
  };

  const handleDownload = (reportId) => {
    window.open(`${getApiBase()}/reports/${reportId}/download`, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Compliance & Regulatory Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated PDF report generation with EPA & WHO compliance auditing and digital twin simulation statistics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
          >
            {REPORT_TYPES.map(rt => (
              <option key={rt.value} value={rt.value}>{rt.label}</option>
            ))}
          </select>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{generating ? 'Generating PDF...' : 'GENERATE REPORT'}</span>
          </button>
        </div>
      </div>

      {/* Prototype Notice Alert */}
      <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-blue-300">
        <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold text-blue-200">Academic Prototype Compliance Engine:</span> Reports generated here synthesize live plant telemetry, equipment health scores, AI chemical optimizations, and Digital Twin predictions into a downloadable 7-section PDF document.
        </div>
      </div>

      {/* Success Notification */}
      {message && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Generated Reports History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs">
            Report Generation History ({reports.length})
          </h2>
          <span className="text-[11px] text-slate-500">Stored in MongoDB & Disk</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Generated Timestamp</th>
                <th className="p-4">Report Type</th>
                <th className="p-4">Facility</th>
                <th className="p-4">Generated By</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    No compliance reports generated yet. Select a report type above and click 'GENERATE REPORT' to build a PDF.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-blue-300 whitespace-nowrap">
                      {getReportLabel(r.reportType)}
                    </td>
                    <td className="p-4 text-slate-300 whitespace-nowrap">
                      {r.plantId?.name || 'Central Water Treatment Plant'}
                    </td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {r.generatedBy?.name || 'System Administrator'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(r.filePath)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium rounded text-xs transition-colors cursor-pointer"
                          title="View PDF inline in browser"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>VIEW</span>
                        </button>
                        <button
                          onClick={() => handleDownload(r._id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-medium rounded text-xs transition-colors cursor-pointer"
                          title="Download PDF file"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>DOWNLOAD</span>
                        </button>
                      </div>
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

export default ComplianceReports;
