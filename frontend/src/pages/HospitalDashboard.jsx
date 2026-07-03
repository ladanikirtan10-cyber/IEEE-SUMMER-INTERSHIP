import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { 
  UserPlus, Upload, ShieldCheck, FileText, 
  User, CheckCircle, Info, Copy, ClipboardCheck
} from 'lucide-react';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const { t } = useLang();

  const [stats, setStats] = useState({ records_created: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Patient Registration Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientBlood, setPatientBlood] = useState('O+');
  const [patientState, setPatientState] = useState('Bihar');
  const [patientLang, setPatientLang] = useState('en');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(null); // stores {username, default_password, worker}
  const [regLoading, setRegLoading] = useState(false);

  // Document Upload Form State
  const [uploadHealthId, setUploadHealthId] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('lab_report');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Copy state
  const [copied, setCopied] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/hospital/dashboard');
      setStats(response.data.stats);
      setRecentActivity(response.data.recent_activity);
    } catch (error) {
      console.error("Failed to load hospital dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePatientRegister = async (e) => {
    e.preventDefault();
    if (!patientName || !patientPhone || !patientDob) return;
    setRegError('');
    setRegSuccess(null);
    setRegLoading(true);

    try {
      const response = await api.post('/hospital/register-worker', {
        name: patientName,
        phone: patientPhone,
        dob: patientDob,
        gender: patientGender,
        blood_group: patientBlood,
        state_of_origin: patientState,
        language_preference: patientLang
      });
      setRegSuccess(response.data);
      // Reset form
      setPatientName('');
      setPatientPhone('');
      setPatientDob('');
      fetchDashboardData();
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!uploadHealthId || !uploadTitle || !uploadFile) {
      setUploadError("Please provide Health ID, record title, and select a file.");
      return;
    }
    setUploadError('');
    setUploadSuccess('');
    setUploadLoading(true);

    const formData = new FormData();
    formData.append('health_id', uploadHealthId);
    formData.append('record_type', uploadType);
    formData.append('title', uploadTitle);
    formData.append('description', uploadDesc);
    formData.append('record_date', uploadDate);
    formData.append('file', uploadFile);

    try {
      await api.post('/records', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadSuccess("Medical report successfully uploaded and linked to patient health profile.");
      setUploadHealthId('');
      setUploadTitle('');
      setUploadDesc('');
      setUploadFile(null);
      fetchDashboardData();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Report upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!regSuccess) return;
    const text = `Username: ${regSuccess.username}\nPassword: ${regSuccess.default_password}\nHealth ID: ${regSuccess.worker.health_id}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-900 dark:to-slate-900/40 p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Reports Authored & Uploaded</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.records_created}</h3>
          </div>
        </div>

        <div className="glass-card bg-gradient-to-br from-white to-sky-50/20 dark:from-slate-900 dark:to-slate-900/40 p-5 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Hospital License Verification</p>
            <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle size={18} />
              Verified Clinic Node
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Patient Registration form */}
        <div className="glass-card">
          <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-4 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <UserPlus className="text-emerald-500" size={18} />
            {t('registerNewPatient')}
          </h3>

          {regError && <div className="mb-4 p-2.5 bg-rose-500/10 text-rose-600 rounded-xl text-xs font-semibold">{regError}</div>}
          
          {/* Registration Success Banner with credentials copy option */}
          {regSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3 relative">
              <div className="flex gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Patient Registered Successfully!</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Please hand over these digital health credential details to the worker.</p>
                </div>
              </div>
              <div className="p-3.5 bg-white dark:bg-slate-950 rounded-xl space-y-1.5 border border-slate-200/50 dark:border-slate-800 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">Health ID:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{regSuccess.worker.health_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Portal Username:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{regSuccess.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Default Password:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{regSuccess.default_password}</span>
                </div>
              </div>
              <button
                onClick={handleCopyCredentials}
                className="w-full py-2.5 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                {copied ? <ClipboardCheck size={14} /> : <Copy size={14} />}
                {copied ? 'Copied Details!' : 'Copy Login Details'}
              </button>
            </div>
          )}

          <form onSubmit={handlePatientRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{t('patientName')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manoj Kumar"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{t('patientPhone')}</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{t('dob')}</label>
                <input
                  type="date"
                  required
                  value={patientDob}
                  onChange={(e) => setPatientDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{t('gender')}</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{t('bloodGroup')}</label>
                <select
                  value={patientBlood}
                  onChange={(e) => setPatientBlood(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{t('originState')}</label>
                <select
                  value={patientState}
                  onChange={(e) => setPatientState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                >
                  {['Bihar', 'West Bengal', 'Assam', 'Odisha', 'Jharkhand', 'Uttar Pradesh', 'Kerala', 'Tamil Nadu', 'Other'].map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Preferred Language</label>
                <select
                  value={patientLang}
                  onChange={(e) => setPatientLang(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="ml">Malayalam (മലയാളം)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="gu">Gujarati (ગુજરાતી)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
            >
              {regLoading ? 'Registering...' : 'Register Worker Patient'}
            </button>
          </form>
        </div>

        {/* Lab report upload form */}
        <div className="glass-card">
          <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-4 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Upload className="text-emerald-500" size={18} />
            {t('uploadReport')}
          </h3>

          {uploadError && <div className="mb-4 p-2.5 bg-rose-500/10 text-rose-600 rounded-xl text-xs font-semibold">{uploadError}</div>}
          {uploadSuccess && <div className="mb-4 p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">{uploadSuccess}</div>}

          <form onSubmit={handleUploadReport} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Patient Digital Health ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KL-MIGR-2026-0001"
                  value={uploadHealthId}
                  onChange={(e) => setUploadHealthId(e.target.value.trim())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Report Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBC Blood Test Report"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Report Category</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                >
                  <option value="lab_report">Lab Report / Investigation</option>
                  <option value="vaccination">Vaccination Record</option>
                  <option value="other">Clinic Note / Other Report</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Investigation Date</label>
                <input
                  type="date"
                  required
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Brief Notes / Remarks</label>
              <textarea
                rows={2}
                placeholder="Enter details like key findings, normal ranges, or clinical observations..."
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none resize-none text-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select File (PDF, PNG, JPG)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950 dark:file:text-emerald-300 file:cursor-pointer"
                />
              </div>
              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                {uploadLoading ? 'Uploading File...' : 'Upload & Link Report'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Activity Log Feed */}
      <div className="glass-card">
        <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-4 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <User className="text-emerald-500" size={18} />
          Clinic Registration & Upload Activity Feed
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider font-bold">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Patient Name</th>
                <th className="py-2.5">Health ID</th>
                <th className="py-2.5">Activity Record</th>
                <th className="py-2.5">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">No recent activity logged by this clinic node.</td>
                </tr>
              ) : (
                recentActivity.map((act) => (
                  <tr key={act.record_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3 font-medium text-slate-400">{act.date}</td>
                    <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{act.patient_name}</td>
                    <td className="py-3 font-mono">{act.health_id}</td>
                    <td className="py-3 font-semibold">{act.title}</td>
                    <td className="py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] uppercase">
                        {act.type}
                      </span>
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

export default HospitalDashboard;
