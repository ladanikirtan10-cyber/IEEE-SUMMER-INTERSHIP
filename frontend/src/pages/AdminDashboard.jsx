import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, UserCheck, ShieldAlert, FileSpreadsheet, 
  Download, Database, Server, RefreshCw, Cpu
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useLang();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch admin dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBackupTrigger = async () => {
    setBackupLoading(true);
    try {
      const response = await api.post('/admin/backup', {}, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `kerala_health_db_backup_${today}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download database backup.");
    } finally {
      setBackupLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats, growth_chart, upload_chart, access_stats, system_metrics } = dashboardData;
  const PIE_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#3b82f6', '#ec4899'];

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Dashboard Title & Backup */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-heading text-slate-800 dark:text-white">NHM Kerala System Control</h1>
          <p className="text-xs text-slate-400">Manage hospital nodes, verify doctors, and view security audits.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
            title="Refresh Statistics"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleBackupTrigger}
            disabled={backupLoading}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center gap-1.5"
          >
            <Database size={14} />
            {backupLoading ? 'Creating Backup...' : t('triggerBackup')}
          </button>
        </div>
      </div>

      {/* Stats Counter tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* Workers */}
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Workers Registered</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.workers}</h3>
          </div>
        </div>

        {/* Doctors */}
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Doctors Registered</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.doctors}</h3>
          </div>
        </div>

        {/* Hospitals */}
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Server size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Hospital Nodes</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.hospitals}</h3>
          </div>
        </div>

        {/* Uploads */}
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Uploaded Reports</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.records}</h3>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Growth area chart */}
        <div className="glass-card lg:col-span-2">
          <h3 className="font-heading font-bold text-xs text-slate-400 uppercase tracking-wide mb-4">
            User Growth Trend (Last 7 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/40" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Healthcare access statistics category pie chart */}
        <div className="glass-card lg:col-span-1 flex flex-col justify-between">
          <h3 className="font-heading font-bold text-xs text-slate-400 uppercase tracking-wide mb-4">
            Record Distribution by Category
          </h3>
          <div className="h-48 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={access_stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="category"
                >
                  {access_stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-400 font-semibold px-2">
            {access_stats.map((entry, index) => (
              <div key={entry.category} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                <span>{entry.category} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Upload trends and System telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload trends bar chart */}
        <div className="glass-card lg:col-span-2">
          <h3 className="font-heading font-bold text-xs text-slate-400 uppercase tracking-wide mb-4">
            Document Upload Trends (Daily transfer logs)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={upload_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/40" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: 'none' }} />
                <Bar dataKey="uploads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System telemetry status card */}
        <div className="glass-card lg:col-span-1">
          <h3 className="font-heading font-bold text-xs text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-1.5">
            <Cpu size={16} className="text-emerald-500" />
            System Health Monitoring
          </h3>
          
          <div className="space-y-5 text-xs">
            {/* CPU usage */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-400">Server CPU Load</span>
                <span className="text-slate-800 dark:text-slate-200">{system_metrics.cpu_usage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${system_metrics.cpu_usage}%` }}></div>
              </div>
            </div>

            {/* Memory usage */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-400">System Memory Consumption</span>
                <span className="text-slate-800 dark:text-slate-200">{system_metrics.memory_usage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${system_metrics.memory_usage}%` }}></div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Disk Storage:</span>
                <span className="text-slate-800 dark:text-slate-200">{system_metrics.disk_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Database Connection:</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  {system_metrics.db_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">API Gateway URL:</span>
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[150px]">http://localhost:5000/api</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
