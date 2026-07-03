import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { 
  Heart, ShieldAlert, Award, FileText, Share2, 
  Trash2, UserPlus, Download, Plus, Eye, Calendar, User, FolderHeart,
  Volume2, Activity, X
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const { lang, t } = useLang();

  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [sharing, setSharing] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sharing form
  const [doctorLicense, setDoctorLicense] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');

  // Record upload form
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('prescription');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Vitals tracker state
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [sugar, setSugar] = useState(90);
  const [pulse, setPulse] = useState(72);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [vitalsError, setVitalsError] = useState('');
  const [vitalsSuccess, setVitalsSuccess] = useState('');
  
  // TTS State
  const [activeSpeechId, setActiveSpeechId] = useState(null);

  // Vaccine Certificate Modal State
  const [showVaccineModal, setShowVaccineModal] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, recordsRes, sharingRes] = await Promise.all([
        api.get('/worker/profile'),
        api.get('/records'),
        api.get('/worker/sharing')
      ]);
      setProfile(profileRes.data);
      setRecords(recordsRes.data);
      setSharing(sharingRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeakText = (recordId, title, description) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (activeSpeechId === recordId) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setActiveSpeechId(recordId);

    const speechText = `${title}. Instructions: ${description}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    
    const langLocales = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'ml': 'ml-IN',
      'ta': 'ta-IN',
      'gu': 'gu-IN'
    };
    
    utterance.lang = langLocales[profile?.language_preference] || 'en-US';
    
    utterance.onend = () => {
      setActiveSpeechId(null);
    };

    utterance.onerror = () => {
      setActiveSpeechId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleLogVitals = async (e) => {
    e.preventDefault();
    setVitalsError('');
    setVitalsSuccess('');
    setVitalsLoading(true);

    const vitalsDesc = `Blood Pressure: ${systolic}/${diastolic} mmHg\nBlood Sugar: ${sugar} mg/dL\nHeart Rate: ${pulse} bpm\nLogged by: Patient`;

    try {
      await api.post('/records', {
        health_id: profile.health_id,
        record_type: 'other',
        title: 'Vitals Log',
        description: vitalsDesc,
        record_date: new Date().toISOString().split('T')[0]
      });

      setVitalsSuccess('Vitals logged successfully!');
      const recordsRes = await api.get('/records');
      setRecords(recordsRes.data);
    } catch (err) {
      setVitalsError(err.response?.data?.message || 'Failed to log vitals.');
    } finally {
      setVitalsLoading(false);
    }
  };

  const getVitalsHistory = () => {
    const defaultMock = [
      { date: '06-01', Systolic: 118, Diastolic: 78, Sugar: 92, Pulse: 70 },
      { date: '06-05', Systolic: 121, Diastolic: 80, Sugar: 95, Pulse: 72 },
      { date: '06-10', Systolic: 120, Diastolic: 81, Sugar: 90, Pulse: 74 }
    ];

    const parsed = records
      .filter(r => r.title === 'Vitals Log')
      .map(r => {
        const desc = r.description || '';
        const bpMatch = desc.match(/Blood Pressure:\s*(\d+)\/(\d+)/);
        const sugarMatch = desc.match(/Blood Sugar:\s*(\d+)/);
        const pulseMatch = desc.match(/Heart Rate:\s*(\d+)/);

        const s = bpMatch ? parseInt(bpMatch[1]) : 120;
        const d = bpMatch ? parseInt(bpMatch[2]) : 80;
        const sg = sugarMatch ? parseInt(sugarMatch[1]) : 90;
        const p = pulseMatch ? parseInt(pulseMatch[1]) : 72;

        const dateParts = r.record_date.split('-');
        const formattedDate = dateParts.length === 3 ? `${dateParts[1]}-${dateParts[2]}` : r.record_date;

        return {
          date: formattedDate,
          Systolic: s,
          Diastolic: d,
          Sugar: sg,
          Pulse: p
        };
      });

    return [...defaultMock, ...[...parsed].reverse()];
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!doctorLicense) return;
    setShareError('');
    setShareSuccess('');

    try {
      const response = await api.post('/worker/share', {
        license_number: doctorLicense,
        duration_days: durationDays
      });
      setShareSuccess(response.data.message);
      setDoctorLicense('');
      // Refresh sharing list
      const sharingRes = await api.get('/worker/sharing');
      setSharing(sharingRes.data);
    } catch (err) {
      setShareError(err.response?.data?.message || 'Failed to grant sharing permission');
    }
  };

  const handleRevokeShare = async (id) => {
    if (!window.confirm("Are you sure you want to revoke consent for this doctor?")) return;
    try {
      await api.delete(`/worker/share/revoke/${id}`);
      setSharing(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Failed to revoke sharing permissions");
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadTitle || !uploadFile) {
      setUploadError("Please provide a title and select a file.");
      return;
    }
    setUploadError('');
    setUploadLoading(true);

    const formData = new FormData();
    formData.append('health_id', profile.health_id);
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
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      setUploadFile(null);
      // Refresh records
      const recordsRes = await api.get('/records');
      setRecords(recordsRes.data);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownloadFile = async (docId, fileName) => {
    try {
      const response = await api.get(`/records/document/${docId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download file. Please check authorization.");
    }
  };

  const generatePDFSummary = () => {
    if (!profile) return;
    
    const doc = new jsPDF();
    
    // Primary colors
    doc.setFillColor(5, 150, 105); // Emerald 600
    doc.rect(0, 0, 210, 40, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text("KERALA MIGRANT HEALTH MANAGEMENT SYSTEM", 14, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text("OFFICIAL HEALTH RECORD SUMMARY REPORT", 14, 28);
    
    // Profile info block
    doc.setTextColor(33, 41, 54);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("Personal Profile", 14, 55);
    doc.line(14, 58, 196, 58);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Name:", 14, 66);
    doc.text("Health ID:", 14, 73);
    doc.text("Phone:", 14, 80);
    doc.text("Date of Birth:", 14, 87);
    doc.text("Gender:", 14, 94);
    
    doc.setFont('helvetica', 'normal');
    doc.text(profile.name, 50, 66);
    doc.text(profile.health_id, 50, 73);
    doc.text(profile.phone, 50, 80);
    doc.text(profile.dob, 50, 87);
    doc.text(profile.gender, 50, 94);
    
    // Medical metrics block
    doc.setFont('helvetica', 'bold');
    doc.text("Blood Group:", 110, 66);
    doc.text("State of Origin:", 110, 73);
    doc.text("Allergies:", 110, 80);
    doc.text("Existing Diseases:", 110, 87);
    
    doc.setFont('helvetica', 'normal');
    doc.text(profile.blood_group, 150, 66);
    doc.text(profile.state_of_origin, 150, 73);
    doc.text(profile.allergies || 'None', 150, 80);
    doc.text(profile.existing_diseases || 'None', 150, 87);
    
    // Emergency Contact
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("Emergency Contacts", 14, 110);
    doc.line(14, 113, 196, 113);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Contact Name:", 14, 121);
    doc.text("Contact Phone:", 14, 128);
    doc.text("Relationship:", 14, 135);
    
    doc.setFont('helvetica', 'normal');
    doc.text(profile.emergency_contact_name, 50, 121);
    doc.text(profile.emergency_contact_phone, 50, 128);
    doc.text(profile.emergency_contact_relation, 50, 135);
    
    // Timeline records
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("Medical History & Diagnoses Timeline", 14, 150);
    doc.line(14, 153, 196, 153);
    
    let y = 162;
    if (records.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text("No medical entries found in this digital health timeline.", 14, y);
    } else {
      records.slice(0, 5).forEach((record, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${record.record_date} - ${record.title} (${record.record_type.toUpperCase()})`, 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`Provider: ${record.doctor_name || 'Clinic'}`, 14, y + 5);
        if (record.description) {
          const splitDesc = doc.splitTextToSize(record.description, 170);
          doc.text(splitDesc, 14, y + 10);
          y += 15 + (splitDesc.length * 4);
        } else {
          y += 12;
        }
      });
    }
    
    // Save report
    doc.save(`Kerala_Health_Summary_${profile.health_id}.pdf`);
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Derived stats
  const totalReportsCount = records.length;
  const recentDiagnosesList = records.filter(r => r.record_type === 'diagnosis').slice(0, 3);
  const vaccinationCount = records.filter(r => r.record_type === 'vaccination').length;

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Quick metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total records */}
        <div className="glass-card bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-900 dark:to-slate-900/40 p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('totalReports')}</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalReportsCount}</h3>
          </div>
        </div>

        {/* Latest diagnosis */}
        <div className="glass-card bg-gradient-to-br from-white to-rose-50/20 dark:from-slate-900 dark:to-slate-900/40 p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('recentDiagnoses')}</p>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[150px] mt-1">
              {recentDiagnosesList[0]?.title || 'No diagnosis logged'}
            </h3>
          </div>
        </div>

        {/* Vaccination count */}
        <div className="glass-card bg-gradient-to-br from-white to-sky-50/20 dark:from-slate-900 dark:to-slate-900/40 p-5 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('vaccinationStatus')}</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{vaccinationCount} Doses</h3>
          </div>
        </div>

        {/* Emergency quick look */}
        <div className="glass-card bg-gradient-to-br from-white to-amber-50/20 dark:from-slate-900 dark:to-slate-900/40 p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Emergency Contact</p>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white mt-1">
              {profile.emergency_contact_name} ({profile.emergency_contact_phone})
            </h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Card & Consent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Digital Health ID Card */}
        <div className="glass-card bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between h-[360px]">
          {/* Subtle decorations */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none"></div>
          <div className="absolute right-10 top-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none"></div>

          {/* Card header */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Government of Kerala</span>
              <h4 className="font-heading font-extrabold text-lg leading-tight">National Health Mission</h4>
            </div>
            <FolderHeart size={28} className="opacity-90" />
          </div>

          {/* QR and Health ID */}
          <div className="flex gap-4 items-center my-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <div className="p-2 bg-white rounded-xl shadow-md">
              {/* Scan link can point to a simulation view for doctor search */}
              <QRCodeSVG value={profile.health_id} size={100} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase opacity-70">Unique Digital Health ID</p>
              <h5 className="font-mono text-sm font-bold tracking-wide mt-1 select-all">{profile.health_id}</h5>
              <span className="inline-block mt-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                State: {profile.state_of_origin}
              </span>
            </div>
          </div>

          {/* Card footer details */}
          <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-2">
            <div>
              <span className="text-[9px] uppercase tracking-wider opacity-60">Holder Name</span>
              <p className="font-bold text-sm leading-tight">{profile.name}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider opacity-60">Blood Type</span>
              <p className="font-bold text-sm leading-tight">{profile.blood_group}</p>
            </div>
          </div>
        </div>

        {/* Consent Manager */}
        <div className="glass-card lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Share2 className="text-emerald-500" size={18} />
                {t('shareWithDoctor')}
              </h3>
              <button 
                onClick={generatePDFSummary}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Download size={14} />
                {t('downloadSummary')}
              </button>
            </div>

            {/* Grant sharing form */}
            <form onSubmit={handleShareSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t('enterLicense')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MC-KL-2015-879"
                  value={doctorLicense}
                  onChange={(e) => setDoctorLicense(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus size={14} />
                Authorize Access
              </button>
            </form>

            {shareError && <p className="text-xs text-rose-500 mb-4 font-semibold">{shareError}</p>}
            {shareSuccess && <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-4 font-semibold">{shareSuccess}</p>}

            {/* Active Permissions List */}
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              {t('activePermissions')}
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-36 overflow-y-auto">
              {sharing.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No active doctor consents granted.</p>
              ) : (
                sharing.map((share) => (
                  <div key={share.id} className="flex justify-between items-center py-2.5">
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{share.doctor_name}</p>
                      <span className="text-[10px] text-slate-400">{share.specialization} • {share.hospital_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                        Expires: {new Date(share.expires_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleRevokeShare(share.id)}
                        className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Revoke Permission"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Card */}
        <div className="glass-card lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Activity className="text-emerald-500" size={18} />
                Vitals Telemetry & Health Trends
              </h3>
            </div>
            
            <div className="h-[220px] w-full text-xs text-slate-800 dark:text-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getVitalsHistory()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" className="opacity-30" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', color: '#fff', borderRadius: '8px', border: 'none' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Systolic" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} name="Systolic BP" />
                  <Line type="monotone" dataKey="Diastolic" stroke="#3b82f6" strokeWidth={2.5} name="Diastolic BP" />
                  <Line type="monotone" dataKey="Sugar" stroke="#f59e0b" strokeWidth={2} name="Blood Sugar (mg/dL)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Log Vitals Input Card */}
        <div className="glass-card">
          <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-4 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Plus className="text-emerald-500" size={18} />
            Log Health Metrics
          </h3>

          <form onSubmit={handleLogVitals} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Systolic BP: {systolic}</label>
                <input
                  type="range"
                  min="90"
                  max="180"
                  value={systolic}
                  onChange={(e) => setSystolic(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Diastolic BP: {diastolic}</label>
                <input
                  type="range"
                  min="60"
                  max="110"
                  value={diastolic}
                  onChange={(e) => setDiastolic(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Blood Sugar: {sugar}</label>
                <input
                  type="range"
                  min="70"
                  max="250"
                  value={sugar}
                  onChange={(e) => setSugar(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Pulse: {pulse} bpm</label>
                <input
                  type="range"
                  min="50"
                  max="120"
                  value={pulse}
                  onChange={(e) => setPulse(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={vitalsLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {vitalsLoading ? 'Saving...' : 'Submit Vitals Log'}
            </button>

            {vitalsError && <p className="text-[10px] text-rose-500 font-semibold">{vitalsError}</p>}
            {vitalsSuccess && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{vitalsSuccess}</p>}
          </form>
        </div>
      </div>

      {/* Row 3: Vaccine Passport & Health Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Immunization Registry Card */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Award className="text-emerald-500" size={18} />
              Immunization Passport
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Kerala National Health Mission official migrant worker vaccination registry.
            </p>

            {/* Progress Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>VACCINATION STATUS</span>
                <span>{records.filter(r => r.record_type === 'vaccination').length} OF 4 DOSES</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(records.filter(r => r.record_type === 'vaccination').length * 25, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowVaccineModal(true)}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText size={14} />
            Generate Vaccine Passport
          </button>
        </div>

        {/* Health Video & Language-Specific Safety Tips */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <ShieldAlert className="text-emerald-500" size={18} />
              Workplace Health & Safety Tips
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Daily safety protocols adjusted to your preferred language setting.
            </p>

            <div className="space-y-3">
              {[
                { 
                  tip: lang === 'ml' 
                    ? 'സൂര്യതാപം പ്രതിരോധിക്കുക: വെയിലത്ത് ജോലി ചെയ്യുമ്പോൾ ദിവസവും 4-5 ലിറ്റർ വെള്ളം കുടിക്കുക.' 
                    : lang === 'hi'
                    ? 'लू से सुरक्षा: धूप में खुले स्थानों में काम करते समय प्रतिदिन 4-5 लीटर पानी पिएं।'
                    : lang === 'bn'
                    ? 'সানস্ট্রোক সুরক্ষা: রোদে খোলা জায়গায় কাজ করার সময় প্রতিদিন ৪-৫ লিটার জল পান করুন।'
                    : lang === 'gu'
                    ? 'લૂથી બચાવ: તડકામાં કામ કરતી વખતે દરરોજ 4-5 લીટર પાણી પીવો.'
                    : lang === 'ta'
                    ? 'வெப்பத்தாக்குதல் பாதுகாப்பு: வெயிலில் வேலை செய்யும் போது தினமும் 4-5 லிட்டர் தண்ணீர் குடிக்கவும்.'
                    : 'Heatstroke Safety: Drink 4-5 liters of water daily while working under the sun.'
                },
                {
                  tip: lang === 'ml' 
                    ? 'കെട്ടിട നിർമാണ പൊടി: പൊടി ശ്വസിക്കുന്നത് തടയാൻ എപ്പോഴും മാസ്ക് ധരിക്കുക.' 
                    : lang === 'hi'
                    ? 'निर्माण धूल: धूल साँस में जाने से रोकने के लिए हमेशा डबल-लेयर मास्क पहनें।'
                    : lang === 'bn'
                    ? 'নির্মাণ ধূলিকণা: ধূলিকণা শ্বাসগ্রহণ রোধ করতে সর্বদা মাস্ক ব্যবহার করুন।'
                    : lang === 'gu'
                    ? 'બાંધકામ ધૂળ: ધૂળ શ્વાસમાં ન જાય તે માટે હંમેશા માસ્ક પહેરો.'
                    : profile?.language_preference === 'ta'
                    ? 'கட்டுமான தூசி: ஆஸ்துமா மற்றும் தூசி அலர்ஜியை தடுக்க எப்போதும் முகக்கவசம் அணியுங்கள்.'
                    : 'Construction Dust: Always wear a double-layer mask to prevent dust inhalation.'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-xs font-semibold text-slate-700 dark:text-slate-350 leading-relaxed">
                  💡 {item.tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Medical History Timeline & Upload Button */}
      <div className="glass-card">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="text-emerald-500" size={18} />
            {t('historyTimeline')}
          </h3>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all"
          >
            <Plus size={14} />
            Upload Report
          </button>
        </div>

        {/* Timeline body */}
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
          {records.length === 0 ? (
            <p className="text-xs text-slate-400 py-6">No medical timeline entries found.</p>
          ) : (
            records.map((record) => (
              <div key={record.id} className="relative group">
                {/* Bullet */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-900 group-hover:scale-125 transition-transform"></div>
                
                {/* Content Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 group-hover:border-emerald-500/30 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">{record.title}</span>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {record.record_type}
                      </span>
                      
                      {(record.record_type === 'prescription' || record.record_type === 'diagnosis') && (
                        <button
                          type="button"
                          onClick={() => handleSpeakText(record.id, record.title, record.description)}
                          className={`p-1 rounded-lg transition-all cursor-pointer ${
                            activeSpeechId === record.id 
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse' 
                              : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={activeSpeechId === record.id ? "Stop Listening" : "Listen in Preferred Language"}
                        >
                          <Volume2 size={13} />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{record.record_date}</span>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                    {record.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/20 dark:border-slate-800/20 text-[10px] text-slate-400">
                    <span>Logged by: <strong className="text-slate-500 dark:text-slate-300">{record.doctor_name}</strong></span>
                    
                    {/* Attached files */}
                    {record.documents && record.documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleDownloadFile(doc.id, doc.file_name)}
                        className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        <Eye size={12} />
                        {doc.file_name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Vaccine Certificate Modal */}
      {showVaccineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up relative">
            <button 
              type="button"
              onClick={() => setShowVaccineModal(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer animate-fade-in"
            >
              <X size={18} />
            </button>

            {/* Certificate Box */}
            <div className="border-4 border-double border-emerald-500 p-5 rounded-2xl bg-emerald-50/50 dark:bg-slate-950/40 text-center">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-emerald-600 rounded-xl text-white animate-pulse">
                  <Activity size={22} />
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">GOVERNMENT OF KERALA</span>
              <h4 className="text-xs font-black text-slate-800 dark:text-white font-heading mt-0.5">DEPARTMENT OF HEALTH SERVICES</h4>
              <h5 className="text-[9px] font-bold text-slate-400 tracking-wide mt-1 uppercase border-b border-emerald-500/30 pb-2">Immunization Passport Card</h5>

              <div className="grid grid-cols-2 gap-3.5 text-left text-xs my-4 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <div>
                  <span className="text-[9px] text-slate-400 block">HOLDER NAME</span>
                  <strong className="text-slate-800 dark:text-slate-200">{profile.name}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">HEALTH ID</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{profile.health_id}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">DATE OF BIRTH</span>
                  <strong className="text-slate-800 dark:text-slate-200">{profile.dob}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">ORIGIN STATE</span>
                  <strong className="text-slate-800 dark:text-slate-200">{profile.state_of_origin}</strong>
                </div>
              </div>

              <h5 className="text-[10px] font-bold text-slate-400 text-left uppercase tracking-wide mb-2">Doses Administered</h5>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-855 divide-y divide-slate-100 dark:divide-slate-800 text-left text-xs overflow-hidden max-h-36 overflow-y-auto">
                {records.filter(r => r.record_type === 'vaccination').length === 0 ? (
                  <p className="p-3 text-center text-slate-400 italic text-[11px]">No vaccinations registered in database.</p>
                ) : (
                  records.filter(r => r.record_type === 'vaccination').map((v) => (
                    <div key={v.id} className="p-2.5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{v.title}</p>
                        <span className="text-[9px] text-slate-400 font-medium">Date: {v.record_date}</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase">VERIFIED</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center mt-5 pt-3 border-t border-emerald-500/20">
                <div className="text-left text-[9px] text-slate-400">
                  <p>Certified by National Health Mission</p>
                  <p className="mt-0.5 font-bold text-emerald-600">ID: CERT-KMHS-{profile.health_id.split('-').pop()}</p>
                </div>
                <div className="p-1 bg-white rounded-lg border border-slate-200">
                  <QRCodeSVG value={`CERT-KMHS-${profile.health_id}`} size={40} />
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => window.print()}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Print Official Vaccination Certificate
            </button>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Upload Medical Document</h3>
            
            {uploadError && <div className="mb-4 p-2.5 bg-rose-500/10 text-rose-600 rounded-xl text-xs font-semibold">{uploadError}</div>}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blood Test Report June"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Record Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                  >
                    <option value="prescription">Prescription</option>
                    <option value="lab_report">Lab Report</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Record Date</label>
                  <input
                    type="date"
                    required
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Normal blood sugar levels, checked at general clinic."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none resize-none"
                />
              </div>

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

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 justify-end">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  {uploadLoading ? 'Uploading...' : 'Upload Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
