import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { Check, X, ShieldAlert, Award, Server } from 'lucide-react';

const Verifications = () => {
  const { user } = useAuth();
  const { t } = useLang();

  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingVerifications = async () => {
    try {
      const response = await api.get('/admin/verifications');
      setDoctors(response.data.doctors || []);
      setHospitals(response.data.hospitals || []);
    } catch (error) {
      console.error("Failed to load verifications queue:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const handleVerifyAction = async (role, id, action) => {
    const confirmMsg = `Are you sure you want to ${action} this ${role} registration?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.post(`/admin/verify/${role}/${id}`, { action });
      // Remove from list
      if (role === 'doctor') {
        setDoctors(prev => prev.filter(d => d.id !== id));
      } else {
        setHospitals(prev => prev.filter(h => h.id !== id));
      }
      alert(`Account has been successfully ${action === 'approve' ? 'approved & activated' : 'rejected & deleted'}.`);
    } catch (error) {
      alert("Failed to process verification action.");
    }
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
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold font-heading text-slate-800 dark:text-white">Healthcare Licensing approvals</h1>
        <p className="text-xs text-slate-400">{t('pendingVerifications')}</p>
      </div>

      {/* Doctors Section */}
      <div className="glass-card">
        <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Award className="text-emerald-500" size={18} />
          Pending Doctor Verifications ({doctors.length})
        </h3>

        {doctors.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No pending medical license verification approvals.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider font-bold">
                  <th className="py-2.5">Doctor Name</th>
                  <th className="py-2.5">Specialization</th>
                  <th className="py-2.5">License Number</th>
                  <th className="py-2.5">Affiliated Hospital</th>
                  <th className="py-2.5">Phone</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{doc.name}</td>
                    <td className="py-3">{doc.specialization}</td>
                    <td className="py-3 font-mono">{doc.license_number}</td>
                    <td className="py-3 font-semibold">{doc.hospital_name}</td>
                    <td className="py-3">{doc.phone}</td>
                    <td className="py-3 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleVerifyAction('doctor', doc.id, 'approve')}
                        className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                        title="Approve"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleVerifyAction('doctor', doc.id, 'reject')}
                        className="p-1.5 bg-rose-500/10 text-rose-600 rounded-lg hover:bg-rose-50 hover:text-white transition-all"
                        title="Reject"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hospitals Section */}
      <div className="glass-card">
        <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Server className="text-emerald-500" size={18} />
          Pending Hospital Verifications ({hospitals.length})
        </h3>

        {hospitals.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No pending hospital registration approvals.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider font-bold">
                  <th className="py-2.5">Hospital Name</th>
                  <th className="py-2.5">Registry Number</th>
                  <th className="py-2.5">Address</th>
                  <th className="py-2.5">Phone</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {hospitals.map((hosp) => (
                  <tr key={hosp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{hosp.name}</td>
                    <td className="py-3 font-mono">{hosp.registration_number}</td>
                    <td className="py-3 max-w-[200px] truncate">{hosp.address}</td>
                    <td className="py-3">{hosp.phone}</td>
                    <td className="py-3 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleVerifyAction('hospital', hosp.id, 'approve')}
                        className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                        title="Approve"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleVerifyAction('hospital', hosp.id, 'reject')}
                        className="p-1.5 bg-rose-500/10 text-rose-600 rounded-lg hover:bg-rose-50 hover:text-white transition-all"
                        title="Reject"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verifications;
