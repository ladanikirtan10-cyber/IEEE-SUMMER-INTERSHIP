import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { User, Phone, Mail, MapPin, Heart, ShieldAlert, Award } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLang();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [stateOfOrigin, setStateOfOrigin] = useState('Bihar');
  const [languagePreference, setLanguagePreference] = useState('en');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Family');
  const [allergies, setAllergies] = useState('');
  const [existingDiseases, setExistingDiseases] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch full details
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        const response = await api.get(`/${user.role}/profile`);
        const p = response.data;
        setName(p.name);
        setPhone(p.phone);
        setBloodGroup(p.blood_group);
        setStateOfOrigin(p.state_of_origin);
        setLanguagePreference(p.language_preference);
        setEmergencyName(p.emergency_contact_name);
        setEmergencyPhone(p.emergency_contact_phone);
        setEmergencyRelation(p.emergency_contact_relation);
        setAllergies(p.allergies || '');
        setExistingDiseases(p.existing_diseases || '');
      } catch (err) {
        console.error("Failed to load profile details:", err);
      }
    };
    fetchProfileData();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile({
        name, phone, blood_group: bloodGroup,
        state_of_origin: stateOfOrigin, language_preference: languagePreference,
        emergency_contact_name: emergencyName, emergency_contact_phone: emergencyPhone,
        emergency_contact_relation: emergencyRelation, allergies, existing_diseases: existingDiseases
      });
      setSuccess("Profile settings successfully updated.");
    } catch (err) {
      setError(err || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold font-heading text-slate-800 dark:text-white">{t('profile')}</h1>
        <p className="text-xs text-slate-400">View and update account information.</p>
      </div>

      {user.role === 'worker' ? (
        /* Worker Profile Editor Form */
        <div className="glass-card">
          {error && <div className="mb-4 p-2.5 bg-rose-500/10 text-rose-600 rounded-xl text-xs font-semibold">{error}</div>}
          {success && <div className="mb-4 p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">{success}</div>}

          <form onSubmit={handleUpdate} className="space-y-6">
            
            {/* General Info */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <User size={14} className="text-emerald-500" />
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">State of Origin</label>
                  <select
                    value={stateOfOrigin}
                    onChange={(e) => setStateOfOrigin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                  >
                    {['Bihar', 'West Bengal', 'Assam', 'Odisha', 'Jharkhand', 'Uttar Pradesh', 'Kerala', 'Tamil Nadu', 'Other'].map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Preferred Language</label>
                  <select
                    value={languagePreference}
                    onChange={(e) => setLanguagePreference(e.target.value)}
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
            </div>

            {/* Emergency Info */}
            <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <ShieldAlert size={14} className="text-amber-500" />
                Emergency Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Relationship</label>
                  <input
                    type="text"
                    required
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Chronic condition / allergies */}
            <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Heart size={14} className="text-rose-500" />
                Medical Alerts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Allergies</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Existing Chronic Diseases</label>
                  <input
                    type="text"
                    value={existingDiseases}
                    onChange={(e) => setExistingDiseases(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center justify-center"
            >
              {loading ? 'Saving Changes...' : t('save')}
            </button>
          </form>
        </div>
      ) : (
        /* Doctor or Hospital read-only credentials profile info */
        <div className="glass-card space-y-4 text-xs font-semibold">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              {name ? name.slice(0, 2).toUpperCase() : user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">{name || user.username}</h3>
              <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-slate-400">Username:</span>
              <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl font-normal text-slate-700 dark:text-slate-200">{user.username}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-slate-400">Email Address:</span>
              <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl font-normal text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" />
                {user.email}
              </p>
            </div>
          </div>

          {user.role === 'doctor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <span className="text-slate-400">Medical License Number:</span>
                <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl font-mono text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Award size={14} className="text-slate-400" />
                  {phone} {/* Note: Phone field stores license/phone in doctor details rendering */}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-slate-400">Verification Status:</span>
                <p className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <Award size={14} />
                  License Approved & Active
                </p>
              </div>
            </div>
          )}

          {user.role === 'hospital' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <span className="text-slate-400">Registry Phone Number:</span>
                <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl font-normal text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  {phone}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-slate-400">Node Status:</span>
                <p className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <MapPin size={14} />
                  Clinic Gateway Node Verified
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
