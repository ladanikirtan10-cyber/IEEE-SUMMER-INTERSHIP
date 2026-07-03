import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { FolderHeart, User, Lock, Mail, ShieldAlert, Check, Home } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [role, setRole] = useState('worker'); // default 'worker'
  
  // Base fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Worker specific fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [stateOfOrigin, setStateOfOrigin] = useState('Bihar');
  const [languagePreference, setLanguagePreference] = useState('en');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Family');
  const [allergies, setAllergies] = useState('');
  const [existingDiseases, setExistingDiseases] = useState('');

  // Doctor specific fields
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');

  // Hospital specific fields
  const [hospitalRegNumber, setHospitalRegNumber] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [hospitalPhone, setHospitalPhone] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const baseData = { username, email, password, role };
    let finalData = { ...baseData };

    if (role === 'worker') {
      finalData = {
        ...finalData,
        name, phone, dob, gender, blood_group: bloodGroup,
        state_of_origin: stateOfOrigin, language_preference: languagePreference,
        emergency_contact_name: emergencyName, emergency_contact_phone: emergencyPhone,
        emergency_contact_relation: emergencyRelation, allergies, existing_diseases: existingDiseases
      };
    } else if (role === 'doctor') {
      finalData = {
        ...finalData,
        name, specialization, license_number: licenseNumber,
        hospital_name: hospitalName, phone: doctorPhone
      };
    } else if (role === 'hospital') {
      finalData = {
        ...finalData,
        name, registration_number: hospitalRegNumber,
        address: hospitalAddress, phone: hospitalPhone
      };
    }

    try {
      await register(finalData);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err || 'Registration failed. Try a different username/email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30 transition-all duration-300">
      {/* Floating Home Button */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:hover:text-emerald-400 hover:border-emerald-500/35 transition-all shadow-sm z-50"
      >
        <Home size={16} className="text-emerald-500" />
        {t('homePage')}
      </Link>

      <div className="w-full max-w-2xl my-8">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 mb-2">
            <FolderHeart size={26} />
          </div>
          <h1 className="text-xl font-extrabold font-heading text-slate-800 dark:text-white leading-tight">
            Create Health ID Account
          </h1>
        </div>

        {/* Form Container */}
        <div className="glass-card animate-slide-up">
          {error && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center p-3.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mb-2">
                <Check size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('success')}</h2>
              
              {role === 'worker' ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your Digital Health ID has been generated successfully. You can now log in to view your records, emergency profile, and share access.
                </p>
              ) : (
                <div className="max-w-md mx-auto space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Registration received! To protect patient safety, all healthcare accounts require Administrator verification before activation.
                  </p>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-[11px] font-medium flex gap-2 justify-center items-center">
                    <ShieldAlert size={14} className="flex-shrink-0" />
                    Please check back soon. The administrator is reviewing your license details.
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              
              {/* Role selector buttons */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Select User Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {['worker', 'doctor', 'hospital'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`
                        py-3 px-2 rounded-xl text-xs font-bold capitalize transition-all border
                        ${role === r 
                          ? 'bg-emerald-600/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-sm' 
                          : 'bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/30'}
                      `}
                    >
                      {t(r)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Credentials Section */}
              <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Account Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                        placeholder="username"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Profiles Section */}
              <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Profile Information</h3>

                {role === 'worker' && (
                  /* Worker Fields */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Manoj Kumar"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Mobile Phone</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Date of Birth</label>
                        <input
                          type="date"
                          required
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Blood Group</label>
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        >
                          {['Bihar', 'West Bengal', 'Assam', 'Odisha', 'Jharkhand', 'Uttar Pradesh', 'Kerala', 'Tamil Nadu', 'Other'].map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Language Preferred</label>
                        <select
                          value={languagePreference}
                          onChange={(e) => setLanguagePreference(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
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

                    {/* Emergency details */}
                    <div className="border-t border-slate-200/30 dark:border-slate-800/30 pt-3">
                      <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5">Emergency Contact Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Contact Name</label>
                          <input
                            type="text"
                            required
                            value={emergencyName}
                            onChange={(e) => setEmergencyName(e.target.value)}
                            placeholder="Suman Devi"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Contact Phone</label>
                          <input
                            type="tel"
                            required
                            value={emergencyPhone}
                            onChange={(e) => setEmergencyPhone(e.target.value)}
                            placeholder="9876543211"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Relationship</label>
                          <input
                            type="text"
                            required
                            value={emergencyRelation}
                            onChange={(e) => setEmergencyRelation(e.target.value)}
                            placeholder="Mother / Father / Spouse"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Allergies / Medical details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200/30 dark:border-slate-800/30 pt-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Allergies (If any)</label>
                        <input
                          type="text"
                          value={allergies}
                          onChange={(e) => setAllergies(e.target.value)}
                          placeholder="Penicillin, Peanuts, Dust (leave empty if none)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Existing Diseases (If any)</label>
                        <input
                          type="text"
                          value={existingDiseases}
                          onChange={(e) => setExistingDiseases(e.target.value)}
                          placeholder="Asthma, Diabetes, Hypertension (leave empty if none)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {role === 'doctor' && (
                  /* Doctor Fields */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Doctor Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Dr. Rajesh Kumar"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Specialization</label>
                        <input
                          type="text"
                          required
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          placeholder="General Medicine / Pulmonology"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Medical License Number</label>
                        <input
                          type="text"
                          required
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          placeholder="MC-KL-2015-879"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Affiliated Hospital Name</label>
                        <input
                          type="text"
                          required
                          value={hospitalName}
                          onChange={(e) => setHospitalName(e.target.value)}
                          placeholder="Ernakulam Medical College"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Mobile Phone</label>
                        <input
                          type="tel"
                          required
                          value={doctorPhone}
                          onChange={(e) => setDoctorPhone(e.target.value)}
                          placeholder="9447102030"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {role === 'hospital' && (
                  /* Hospital Fields */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Hospital / Clinic Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ernakulam District Hospital"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">State Registry Number</label>
                        <input
                          type="text"
                          required
                          value={hospitalRegNumber}
                          onChange={(e) => setHospitalRegNumber(e.target.value)}
                          placeholder="HOSP-ER-02"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Contact Phone</label>
                        <input
                          type="tel"
                          required
                          value={hospitalPhone}
                          onChange={(e) => setHospitalPhone(e.target.value)}
                          placeholder="04842360015"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Full Physical Address</label>
                      <textarea
                        required
                        rows={2}
                        value={hospitalAddress}
                        onChange={(e) => setHospitalAddress(e.target.value)}
                        placeholder="Banerji Rd, Kacheripady, Ernakulam, Kerala 682018"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center justify-center"
                >
                  {loading ? t('loading') : t('register')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Back Link */}
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            Log In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
