import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { ShieldAlert, RefreshCw } from 'lucide-react';

const AuditLogs = () => {
  const { user } = useAuth();
  const { t } = useLang();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/audit-logs');
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold font-heading text-slate-800 dark:text-white">Security Audits</h1>
          <p className="text-xs text-slate-400">{t('auditLogsHeader')}</p>
        </div>
        <button
          onClick={fetchAuditLogs}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
          title="Refresh Audit Logs"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Logs Table */}
      <div className="glass-card">
        <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <ShieldAlert className="text-rose-500" size={18} />
          System Activity & Access Audit Log Logs (Showing last 100 entries)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider font-bold">
                <th className="py-2.5">Timestamp</th>
                <th className="py-2.5">User</th>
                <th className="py-2.5">Action Code</th>
                <th className="py-2.5">Details</th>
                <th className="py-2.5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">No activity logs recorded.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3 text-slate-400 font-normal">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 font-bold">{log.username}</td>
                    <td className="py-3">
                      <span className={`
                        inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase
                        ${log.action.includes('FAIL') || log.action.includes('UNAUTHORIZED') 
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                          : log.action.includes('CREATE') || log.action.includes('SHARE')
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'}
                      `}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-400">{log.ip_address}</td>
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

export default AuditLogs;
