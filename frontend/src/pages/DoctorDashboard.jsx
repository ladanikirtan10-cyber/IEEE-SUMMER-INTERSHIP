import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { 
  Search, User, Heart, Award, FileText, Plus, 
  ArrowLeft, Upload, Lock, ShieldCheck, Phone, AlertCircle,
  QrCode, X, Activity, ShieldAlert, CheckCircle
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { t } = useLang();

  const [stats, setStats] = useState({ total_patients: 0, records_written: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Active Patient detail states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // New Record state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('diagnosis');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newFile, setNewFile] = useState(null);
  const [recordError, setRecordError] = useState('');
  const [recordSuccess, setRecordSuccess] = useState('');
  const [recordLoading, setRecordLoading] = useState(false);

  // QR Scanner simulation state
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerHealthId, setScannerHealthId] = useState('');
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [scannerSuccess, setScannerSuccess] = useState('');

  // Allergy & drug check states
  const [allergyCheckResult, setAllergyCheckResult] = useState(null); // 'pass', 'fail', null
  const [matchingAllergies, setMatchingAllergies] = useState([]);

  // Clinical Risk assessment state
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [calcHeight, setCalcHeight] = useState(170);
  const [calcWeight, setCalcWeight] = useState(70);
  const [calcSmoker, setCalcSmoker] = useState(false);
  const [calcDiabetes, setCalcDiabetes] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/doctor/dashboard');
      setStats(response.data.stats);
      setRecentPatients(response.data.recent_patients);
    } catch (error) {
      console.error("Failed to load doctor dashboard stats:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await api.get(`/doctor/search?query=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPatient = async (healthId) => {
    setLoadingPatient(true);
    setSelectedPatient(null);
    setRecordError('');
    setRecordSuccess('');
    try {
      // 1. Fetch patient profile & history (consent verified by backend)
      const response = await api.get(`/doctor/worker/${healthId}`);
      setSelectedPatient(response.data);
      setPatientRecords(response.data.medical_history || []);
    } catch (error) {
      alert(error.response?.data?.message || "Access Denied. Ensure sharing consent is active.");
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleRunAllergyCheck = () => {
    if (!selectedPatient) return;
    const allergiesStr = (selectedPatient.allergies || '').toLowerCase();
    const adviceText = (newDesc || '').toLowerCase();
    const titleText = (newTitle || '').toLowerCase();

    if (!allergiesStr || allergiesStr.trim() === 'none') {
      setAllergyCheckResult('pass');
      setMatchingAllergies([]);
      return;
    }

    const allergiesList = allergiesStr.split(',').map(a => a.trim()).filter(Boolean);
    const conflicts = allergiesList.filter(allergy => 
      adviceText.includes(allergy) || titleText.includes(allergy)
    );

    if (conflicts.length > 0) {
      setAllergyCheckResult('fail');
      setMatchingAllergies(conflicts);
    } else {
      setAllergyCheckResult('pass');
      setMatchingAllergies([]);
    }
  };

  const handleApplyTemplate = (type) => {
    if (type === 'fever') {
      setNewTitle('Viral Fever & Congestion Protocol');
      setNewType('diagnosis');
      setNewDesc('Patient presented with fever (101°F), dry cough, and mild congestion.\n\nPrescription:\n1. Paracetamol 650mg - 1 tablet thrice daily for 3 days.\n2. Levocetirizine 5mg - 1 tablet at bedtime for 5 days.\n3. Multivitamin syrup - 10ml once daily for 7 days.\n\nAdvice: Bed rest, drink plenty of warm fluids, and return if fever persists.');
    } else if (type === 'asthma') {
      setNewTitle('Asthma Exacerbation Rescue Therapy');
      setNewType('diagnosis');
      setNewDesc('Patient reported shortness of breath triggered by construction dust. Chest auscultation shows expiratory wheezing.\n\nPrescription:\n1. Salbutamol Inhaler (100mcg) - 2 puffs as needed for breathlessness (max 4 times/day).\n2. Budesonide Inhaler (200mcg) - 1 puff twice daily for 14 days.\n\nAdvice: Wear a dust mask at work sites. Avoid contact with known triggers.');
    } else if (type === 'hypertension') {
      setNewTitle('Essential Hypertension Control Review');
      setNewType('diagnosis');
      setNewDesc('Regular blood pressure checkup. Clinic reading: 142/92 mmHg.\n\nPrescription:\n1. Telmisartan 40mg - 1 tablet daily in the morning.\n\nAdvice: Restrict daily salt intake to under 5g. Avoid oily and fried foods. Check BP again in 2 weeks.');
    }
    setAllergyCheckResult(null);
  };

  const getSelectedPatientVitals = () => {
    const defaultMock = [
      { date: '06-01', Systolic: 118, Diastolic: 78, Sugar: 92, Pulse: 70 },
      { date: '06-05', Systolic: 121, Diastolic: 80, Sugar: 95, Pulse: 72 },
      { date: '06-10', Systolic: 120, Diastolic: 81, Sugar: 90, Pulse: 74 }
    ];

    const parsed = patientRecords
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

  const handleSaveRiskReport = async () => {
    const heightM = calcHeight / 100;
    const bmi = calcWeight / (heightM * heightM);
    const bmiVal = bmi.toFixed(1);
    
    let points = 0;
    const age = selectedPatient ? (new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()) : 30;
    if (age > 40) points += 2;
    if (age > 50) points += 4;
    
    const vitals = getSelectedPatientVitals();
    const latestBP = vitals.length > 0 ? vitals[vitals.length - 1].Systolic : 120;
    if (latestBP > 140) points += 3;
    if (latestBP > 160) points += 6;
    
    if (calcSmoker) points += 4;
    if (calcDiabetes) points += 4;
    if (bmi > 25) points += 2;
    if (bmi > 30) points += 4;
    
    const riskPct = Math.min(Math.max(Math.round(points * 2.5), 1), 100);
    
    let category = 'Low';
    if (riskPct >= 10 && riskPct <= 20) category = 'Moderate';
    if (riskPct > 20) category = 'High';

    const riskDesc = `Calculated BMI: ${bmiVal} (${bmi > 30 ? 'Obese' : bmi > 25 ? 'Overweight' : 'Normal'})\n10-Year Cardiovascular Risk Score: ${riskPct}%\nRisk Classification: ${category} Risk\nAssessments: Smoker: ${calcSmoker ? 'Yes' : 'No'}, Diabetes: ${calcDiabetes ? 'Yes' : 'No'}`;
    
    setRecordLoading(true);
    try {
      await api.post('/records', {
        health_id: selectedPatient.health_id,
        record_type: 'other',
        title: 'Clinical Risk Assessment Report',
        description: riskDesc,
        record_date: new Date().toISOString().split('T')[0]
      });
      
      alert('Risk assessment report successfully logged to patient history!');
      setShowRiskModal(false);
      
      // Refresh patient history
      const response = await api.get(`/doctor/worker/${selectedPatient.health_id}`);
      setSelectedPatient(response.data);
      setPatientRecords(response.data.medical_history || []);
    } catch (err) {
      alert('Failed to save risk report.');
    } finally {
      setRecordLoading(false);
    }
  };

  const handleQRScanSubmit = async (healthIdToScan) => {
    if (!healthIdToScan) return;
    setScannerLoading(true);
    setScannerError('');
    setScannerSuccess('');
    try {
      const response = await api.post('/doctor/share-via-qr', {
        health_id: healthIdToScan
      });
      setScannerSuccess(response.data.message || 'Access granted successfully!');
      
      setTimeout(async () => {
        setShowScannerModal(false);
        setScannerSuccess('');
        setScannerHealthId('');
        // Refresh doctor dashboard data
        await fetchDashboardData();
        // Immediately view this patient's medical records
        await handleSelectPatient(healthIdToScan);
      }, 1200);
    } catch (error) {
      setScannerError(error.response?.data?.message || 'Failed to authorize scanned QR code.');
    } finally {
      setScannerLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  const handleAddRecordSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle) {
      setRecordError("Please provide a record title.");
      return;
    }
    setRecordError('');
    setRecordSuccess('');
    setRecordLoading(true);

    const formData = new FormData();
    formData.append('health_id', selectedPatient.health_id);
    formData.append('record_type', newType);
    formData.append('title', newTitle);
    formData.append('description', newDesc);
    formData.append('record_date', newDate);
    if (newFile) {
      formData.append('file', newFile);
    }

    try {
      const response = await api.post('/records', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setRecordSuccess("Record added successfully to patient's history.");
      setNewTitle('');
      setNewDesc('');
      setNewFile(null);
      
      // Refresh timeline
      const recordsRes = await api.get(`/records?health_id=${selectedPatient.health_id}`);
      setPatientRecords(recordsRes.data);
      fetchDashboardData(); // Refresh clinical records count stat
    } catch (err) {
      setRecordError(err.response?.data?.message || 'Failed to submit medical record');
    } finally {
      setRecordLoading(false);
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
      alert("Failed to download file.");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Back button when patient is selected */}
      {selectedPatient && (
        <button
          onClick={() => { setSelectedPatient(null); fetchDashboardData(); }}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline mb-4"
        >
          <ArrowLeft size={16} />
          Back to Doctor Dashboard
        </button>
      )}

      {!selectedPatient ? (
        /* Regular Dashboard View */
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-900 dark:to-slate-900/40 p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <User size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Shared Patients</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.total_patients}</h3>
              </div>
            </div>

            <div className="glass-card bg-gradient-to-br from-white to-rose-50/20 dark:from-slate-900 dark:to-slate-900/40 p-5 flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                <Heart size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Clinical Records Authored</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.records_written}</h3>
              </div>
            </div>

            <div className="glass-card bg-gradient-to-br from-white to-sky-50/20 dark:from-slate-900 dark:to-slate-900/40 p-5 flex items-center gap-4">
              <div className="p-3 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Verification Status</p>
                <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                  <ShieldCheck size={18} />
                  Authorized License
                </h3>
              </div>
            </div>
          </div>

          {/* Search Patient Box */}
          <div className="glass-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white">
                {t('searchPatient')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setScannerError('');
                  setScannerSuccess('');
                  setShowScannerModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <QrCode size={14} />
                Scan Patient QR Code
              </button>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Enter Health ID (e.g. KL-MIGR-2026-0001), Name, or Phone Number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all"
              >
                {searching ? 'Searching...' : t('search')}
              </button>
            </form>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Search Matches</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider font-bold">
                        <th className="py-2.5">Name</th>
                        <th className="py-2.5">Health ID</th>
                        <th className="py-2.5">Origin</th>
                        <th className="py-2.5">Consent Status</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                      {searchResults.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{w.name}</td>
                          <td className="py-3 font-mono">{w.health_id}</td>
                          <td className="py-3">{w.state_of_origin}</td>
                          <td className="py-3">
                            {w.has_access ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                                Consent Granted
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-[10px] flex items-center gap-1 w-max">
                                <Lock size={10} />
                                Access Locked
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            {w.has_access ? (
                              <button
                                onClick={() => handleSelectPatient(w.health_id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-sm transition-all"
                              >
                                View Health Record
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setScannerHealthId(w.health_id);
                                  setScannerError('');
                                  setScannerSuccess('');
                                  setShowScannerModal(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shadow-sm transition-all cursor-pointer"
                              >
                                <QrCode size={12} />
                                Scan QR
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Active / Shared Patients Panel */}
          <div className="glass-card">
            <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-4">
              Active Patient Consultations
            </h3>
            {recentPatients.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active patient shares under your consultation catalog.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentPatients.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => handleSelectPatient(p.health_id)}
                    className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-emerald-500/40 cursor-pointer transition-all flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.health_id}</p>
                      <span className="inline-block text-[9px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-2">
                        State: {p.state_of_origin}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full block w-max ml-auto">
                        Active share
                      </span>
                      <p className="text-[10px] text-slate-400 mt-2 truncate max-w-[120px]">{p.last_diagnosis}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Patient Detail View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Patient Profile Details Column */}
          <div className="space-y-6 lg:col-span-1">
            <div className="glass-card bg-gradient-to-b from-white to-emerald-50/10 dark:from-slate-900 dark:to-slate-950/40">
              <div className="flex flex-col items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl mb-2">
                  {selectedPatient.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-heading font-extrabold text-slate-800 dark:text-white">{selectedPatient.name}</h3>
                <span className="font-mono text-[10px] text-slate-400 mt-0.5">{selectedPatient.health_id}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Blood Group:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPatient.blood_group}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Age/DOB:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPatient.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Gender:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPatient.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Origin State:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPatient.state_of_origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Phone:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Phone size={10} />
                    {selectedPatient.phone}
                  </span>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Known Allergies</span>
                  <p className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[11px] text-rose-600 dark:text-rose-400 font-medium leading-relaxed">
                    {selectedPatient.allergies || 'No allergies recorded'}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Existing Conditions</span>
                  <p className="p-2.5 bg-slate-500/5 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {selectedPatient.existing_diseases || 'No chronic diseases recorded'}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Emergency Contact</span>
                  <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[11px]">
                    <p className="font-bold text-slate-700 dark:text-slate-200">{selectedPatient.emergency_contact_name} ({selectedPatient.emergency_contact_relation})</p>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">{selectedPatient.emergency_contact_phone}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Vitals Telemetry Trends</span>
                  <div className="h-[120px] w-full text-[9px] bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800/60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getSelectedPatientVitals()}>
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <Tooltip contentStyle={{ fontSize: '10px', backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '6px' }} />
                        <Line type="monotone" dataKey="Systolic" stroke="#10b981" strokeWidth={2} dot={false} name="Sys BP" />
                        <Line type="monotone" dataKey="Sugar" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Sugar" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCalcHeight(170);
                      setCalcWeight(70);
                      setCalcSmoker(false);
                      setCalcDiabetes(false);
                      setShowRiskModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900 text-white font-extrabold text-[10px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Activity size={12} />
                    Assess Clinical Risk Index
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Records Timeline & Add Record Form Column */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Add record form */}
            <div className="glass-card">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
                <Plus className="text-emerald-500" size={18} />
                Add Diagnosis / Clinical Prescription
              </h3>

              {recordError && <div className="mb-4 p-2.5 bg-rose-500/10 text-rose-600 rounded-xl text-xs font-semibold">{recordError}</div>}
              {recordSuccess && <div className="mb-4 p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">{recordSuccess}</div>}
 
              {/* Quick Clinical Templates Row */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/40 dark:border-slate-800/40 space-y-1.5 mb-4">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                  Autofill Clinical Template Protocol
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('fever')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold cursor-pointer transition-all border border-emerald-500/20"
                  >
                    🤒 Viral Fever / Cold
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('asthma')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold cursor-pointer transition-all border border-emerald-500/20"
                  >
                    🫁 Asthma Emergency
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('hypertension')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold cursor-pointer transition-all border border-emerald-500/20"
                  >
                    ❤️ Hypertension Control
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddRecordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Record Title / Topic</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chronic Asthma Treatment Follow-up"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Record Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                    >
                      <option value="diagnosis">Diagnosis</option>
                      <option value="prescription">Prescription</option>
                      <option value="lab_report">Lab Report</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Clinical Advice & Notes</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details on diagnoses, dosage instructions for prescriptions, or test interpretations..."
                    value={newDesc}
                    onChange={(e) => {
                      setNewDesc(e.target.value);
                      if (allergyCheckResult) setAllergyCheckResult(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none resize-none text-slate-800 dark:text-white"
                  />

                  {/* Allergy Alert Checker */}
                  <div className="flex flex-col gap-2 mt-2 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-semibold">
                        Known Patient Allergies: <strong className="text-rose-500">{selectedPatient.allergies || 'None'}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleRunAllergyCheck}
                        disabled={!newDesc.trim()}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-[9px] font-black cursor-pointer hover:bg-black dark:hover:bg-white transition-all disabled:opacity-50"
                      >
                        ⚡ Run Allergy Check
                      </button>
                    </div>

                    {allergyCheckResult === 'fail' && (
                      <div className="mt-1.5 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
                        <ShieldAlert size={14} className="text-rose-500" />
                        Allergy Alert: Patient is allergic to: "{matchingAllergies.join(', ')}". revise prescription!
                      </div>
                    )}

                    {allergyCheckResult === 'pass' && (
                      <div className="mt-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-500" />
                        Allergy Check Passed: No allergen conflicts found.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Attach Report/Prescription (PDF/PNG/JPG)</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950 dark:file:text-emerald-300 file:cursor-pointer"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={recordLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    {recordLoading ? 'Adding...' : 'Add to Patient History'}
                  </button>
                </div>
              </form>
            </div>

            {/* Patient Medical History Timeline */}
            <div className="glass-card">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FileText className="text-emerald-500" size={18} />
                Medical History Timeline
              </h3>

              <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
                {patientRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6">No historical records logged for this worker.</p>
                ) : (
                  patientRecords.map((record) => (
                    <div key={record.id} className="relative group">
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-900 group-hover:scale-125 transition-transform"></div>
                      
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">{record.title}</span>
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              {record.record_type}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">{record.record_date}</span>
                        </div>
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                          {record.description}
                        </p>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/20 dark:border-slate-800/20 text-[10px] text-slate-400">
                          <span>Recorded at: <strong className="text-slate-500 dark:text-slate-300">{record.doctor_name}</strong></span>
                          
                          {/* Attached files */}
                          {record.documents && record.documents.map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() => handleDownloadFile(doc.id, doc.file_name)}
                              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                            >
                              <FileText size={12} />
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
          </div>
        </div>
      )}

      {/* QR Code Scanner Simulation Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <QrCode className="text-emerald-500" size={18} />
                Patient Health ID Scanner
              </h3>
              <button 
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Viewfinder simulation */}
            <div className="relative w-56 h-56 mx-auto bg-slate-950 dark:bg-slate-950/60 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner mb-4">
              {/* Glowing Scanner Line */}
              <div className="qr-scanner-line"></div>
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-500"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-500"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500"></div>
              
              {/* Mock QR graphic */}
              <QrCode size={110} className="text-slate-800 dark:text-slate-800/40 opacity-30 animate-pulse" />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mb-5 leading-relaxed">
              Scan a patient's physical or digital health card. In this simulation, select a worker below to simulate a QR scan, or enter their Health ID manually.
            </p>

            {/* Quick simulated buttons */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Simulate QR Scan (Select Worker)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { name: 'Manoj Kumar (Bihar)', health_id: 'KL-MIGR-2026-0001' },
                  { name: 'Babul Sheikh (West Bengal)', health_id: 'KL-MIGR-2026-0002' },
                  { name: 'Sunita Oraon (Jharkhand)', health_id: 'KL-MIGR-2026-0003' }
                ].map((w) => (
                  <button
                    key={w.health_id}
                    type="button"
                    disabled={scannerLoading}
                    onClick={() => {
                      setScannerHealthId(w.health_id);
                      handleQRScanSubmit(w.health_id);
                    }}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-left text-xs text-slate-700 dark:text-slate-200 font-semibold transition-all cursor-pointer"
                  >
                    <span>{w.name}</span>
                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                      {w.health_id}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual entry fallback */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                Or Enter Scanned ID Manually
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled={scannerLoading}
                  placeholder="e.g. KL-MIGR-2026-0001"
                  value={scannerHealthId}
                  onChange={(e) => setScannerHealthId(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  disabled={scannerLoading || !scannerHealthId.trim()}
                  onClick={() => handleQRScanSubmit(scannerHealthId.trim())}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </div>

            {/* Error Message */}
            {scannerError && (
              <div className="mt-3 p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle size={14} />
                {scannerError}
              </div>
            )}

            {/* Success Message */}
            {scannerSuccess && (
              <div className="mt-3 p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500 animate-bounce" />
                {scannerSuccess}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Clinical Risk Assessment Modal */}
      {showRiskModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up relative">
            <button 
              type="button"
              onClick={() => setShowRiskModal(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Activity className="text-rose-500" size={18} />
              <h3 className="text-base font-heading font-extrabold text-slate-850 dark:text-white">Clinical Risk Calculator</h3>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Calculate patient BMI and 10-year Cardiovascular (CV) Risk Score based on biometric metrics and known condition profiles.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-405 uppercase block">Height (cm): {calcHeight}</label>
                  <input
                    type="range"
                    min="120"
                    max="220"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-405 uppercase block">Weight (kg): {calcWeight}</label>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 py-2 border-y border-slate-100 dark:border-slate-850">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-205 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calcSmoker}
                    onChange={(e) => setCalcSmoker(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-500"
                  />
                  Active Smoker
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-205 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calcDiabetes}
                    onChange={(e) => setCalcDiabetes(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-500"
                  />
                  Diabetic Profile
                </label>
              </div>

              {/* Real-time Calculation Panel */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/85 text-center">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-855 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">BODY MASS INDEX</span>
                    <strong className="text-lg font-black text-slate-800 dark:text-white">
                      {(calcWeight / ((calcHeight / 100) * (calcHeight / 100))).toFixed(1)}
                    </strong>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {(() => {
                        const bmiVal = calcWeight / ((calcHeight / 100) * (calcHeight / 100));
                        if (bmiVal < 18.5) return 'Underweight';
                        if (bmiVal < 25) return 'Normal Weight';
                        if (bmiVal < 30) return 'Overweight';
                        return 'Obese Class';
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">CV RISK VALUE</span>
                    <strong className="text-lg font-black text-rose-500">
                      {(() => {
                        let pts = 0;
                        const age = selectedPatient ? (new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()) : 30;
                        if (age > 40) pts += 2;
                        if (age > 50) pts += 4;
                        const vitals = getSelectedPatientVitals();
                        const latestBP = vitals.length > 0 ? vitals[vitals.length - 1].Systolic : 120;
                        if (latestBP > 140) pts += 3;
                        if (latestBP > 160) pts += 6;
                        if (calcSmoker) pts += 4;
                        if (calcDiabetes) pts += 4;
                        const bmiVal = calcWeight / ((calcHeight / 100) * (calcHeight / 100));
                        if (bmiVal > 25) pts += 2;
                        if (bmiVal > 30) pts += 4;
                        return Math.min(Math.max(Math.round(pts * 2.5), 1), 100);
                      })()}%
                    </strong>
                    <span className="text-[9px] text-slate-400 block mt-0.5">10-Year Probability</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Classification:</span>
                  <span className={`font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase ${
                    (() => {
                      let pts = 0;
                      const age = selectedPatient ? (new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()) : 30;
                      if (age > 40) pts += 2;
                      if (age > 50) pts += 4;
                      const vitals = getSelectedPatientVitals();
                      const latestBP = vitals.length > 0 ? vitals[vitals.length - 1].Systolic : 120;
                      if (latestBP > 140) pts += 3;
                      if (latestBP > 160) pts += 6;
                      if (calcSmoker) pts += 4;
                      if (calcDiabetes) pts += 4;
                      const bmiVal = calcWeight / ((calcHeight / 100) * (calcHeight / 100));
                      if (bmiVal > 25) pts += 2;
                      if (bmiVal > 30) pts += 4;
                      const score = Math.min(Math.max(Math.round(pts * 2.5), 1), 100);
                      if (score < 10) return 'text-emerald-600 bg-emerald-500/10';
                      if (score <= 20) return 'text-amber-600 bg-amber-500/10';
                      return 'text-rose-600 bg-rose-500/10';
                    })()
                  }`}>
                    {(() => {
                      let pts = 0;
                      const age = selectedPatient ? (new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()) : 30;
                      if (age > 40) pts += 2;
                      if (age > 50) pts += 4;
                      const vitals = getSelectedPatientVitals();
                      const latestBP = vitals.length > 0 ? vitals[vitals.length - 1].Systolic : 120;
                      if (latestBP > 140) pts += 3;
                      if (latestBP > 160) pts += 6;
                      if (calcSmoker) pts += 4;
                      if (calcDiabetes) pts += 4;
                      const bmiVal = calcWeight / ((calcHeight / 100) * (calcHeight / 100));
                      if (bmiVal > 25) pts += 2;
                      if (bmiVal > 30) pts += 4;
                      const score = Math.min(Math.max(Math.round(pts * 2.5), 1), 100);
                      if (score < 10) return 'Low Risk';
                      if (score <= 20) return 'Moderate Risk';
                      return 'High Risk';
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 justify-end">
              <button
                type="button"
                onClick={() => setShowRiskModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={recordLoading}
                onClick={handleSaveRiskReport}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {recordLoading ? 'Saving...' : 'Save Report to Timeline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
