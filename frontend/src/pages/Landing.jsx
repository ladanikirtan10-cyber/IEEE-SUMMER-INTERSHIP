import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import { 
  Activity, ShieldCheck, Globe, Users, ArrowRight, Lock, 
  Heart, Calendar, QrCode, MapPin, HelpCircle, Phone, 
  Mail, FileText, Languages, Check, 
  Sun, Moon, ShieldAlert, Award, Clock, ArrowDown, ChevronRight
} from 'lucide-react';

const Landing = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languagesList = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Header/Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-500/10">
              <Activity size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">NHM KERALA</span>
              <h1 className="text-sm font-black text-slate-800 dark:text-white font-heading tracking-tight leading-none">MIGRANT HEALTH</h1>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Why This Project?</a>
            <a href="#portals" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Portals</a>
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Workflow</a>
            <a href="#emergency" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-amber-600 dark:text-amber-400 font-bold">Emergency</a>
            <a href="#future" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Future Scope</a>
            <a href="#contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-bold"
                title="Switch Language"
              >
                <Languages size={15} />
                <span className="uppercase">{lang}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-fade-in">
                  {languagesList.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setShowLangMenu(false);
                      }}
                      className="flex items-center justify-between w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                    >
                      <span>{l.label}</span>
                      {lang === l.code && <Check size={14} className="text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <Link
              to="/login"
              className="px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center gap-1"
            >
              Access Portal
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        {/* Decorative Background Gradients */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-slide-up">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide">
              <Award size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
              IEEE TechForGood Initiative 2026
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight leading-tight">
              Digital Health Record <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">Management System</span> for Migrant Workers
            </h2>

            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              A secure digital platform that enables migrant workers to store, access, and share their health records anytime and anywhere. Bridges language, spatial, and diagnostic barriers across India.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
              <a
                href="#about"
                className="px-6 py-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-850 font-bold text-sm rounded-xl transition-all flex items-center gap-1.5"
              >
                Learn More
                <ArrowDown size={14} className="animate-bounce" />
              </a>
            </div>

            {/* Quick Metrics Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              {[
                { count: '10,000+', label: 'Workers Supported', icon: Users, color: 'text-emerald-500 bg-emerald-500/10' },
                { count: '500+', label: 'Providers Enrolled', icon: Heart, color: 'text-rose-500 bg-rose-500/10' },
                { count: '100%', label: 'Secure Records', icon: ShieldCheck, color: 'text-sky-500 bg-sky-500/10' },
                { count: '6 Langs', label: 'Multi-Lingual UI', icon: Globe, color: 'text-amber-500 bg-amber-500/10' }
              ].map((stat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
                  <div className={`p-2 rounded-xl w-max ${stat.color}`}>
                    <stat.icon size={18} />
                  </div>
                  <div className="mt-3">
                    <h4 className="text-lg font-black text-slate-800 dark:text-white leading-none">{stat.count}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Mockup Graphic Column */}
          <div className="lg:col-span-5 flex justify-center animate-fade-in">
            {/* Visual SVG Health Dashboard Card Mockup */}
            <div className="w-full max-w-[380px] bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between h-[360px] border border-emerald-700/30">
              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none"></div>
              <div className="absolute right-10 top-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">Government of Kerala</span>
                  <h4 className="font-heading font-extrabold text-base leading-tight">National Health Mission</h4>
                </div>
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <QrCode size={20} className="opacity-95" />
                </div>
              </div>

              {/* Central Simulated Health Card Details */}
              <div className="my-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-bold tracking-wider opacity-70">UNIQUE DIGITAL HEALTH ID</span>
                  <span className="text-[9px] font-extrabold bg-emerald-500 px-2 py-0.5 rounded-full">ACTIVE</span>
                </div>
                <h5 className="font-mono text-base font-bold tracking-widest text-center select-all">KL-MIGR-2026-0001</h5>
                
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/10 text-[10px]">
                  <div>
                    <span className="opacity-65 block">HOLDER NAME</span>
                    <strong className="font-bold">Manoj Kumar</strong>
                  </div>
                  <div>
                    <span className="opacity-65 block">BLOOD GROUP</span>
                    <strong className="font-bold text-rose-300">O+ (Penicillin Allergy)</strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-3">
                <div className="text-[9px] opacity-75">
                  <span className="block">STATE OF ORIGIN</span>
                  <span className="font-bold">Bihar</span>
                </div>
                <div className="text-[9px] text-right">
                  <span className="block opacity-65">VALID ACROSS</span>
                  <span className="font-bold">All Kerala Districts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About Project Section */}
      <section id="about" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Why This Project?</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white font-heading tracking-tight">
              Bridges Diagnostic Gaps for Kerala's Migrants
            </h2>
            <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Context Left Column */}
            <div className="lg:col-span-5 space-y-6">
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Migrant workers often face healthcare challenges due to scattered medical records, language barriers, and frequent relocation. This platform provides a centralized digital health ecosystem where workers can securely store their medical history and healthcare providers can access authorized records instantly.
              </p>
              
              <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 flex items-start gap-4">
                <ShieldCheck size={26} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wide">Secured Consultation Access</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Healthcare providers cannot query records without explicit user consent, validated instantly via a 24-hour expiration token scanned from their QR Card.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits Grid Right Column */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Centralized Health Records', desc: 'All medical data aggregated in one profile accessible across any state.' },
                { title: 'Faster Medical Treatment', desc: 'Immediate clinical review during emergency scenarios without waiting.' },
                { title: 'Reduced Paperwork', desc: 'Eliminates carrying files, lab prescriptions, or physical cards.' },
                { title: 'Secure Data Storage', desc: 'Encrypted storage with fine-grained role authorization policies.' },
                { title: 'Easy Access Across Locations', desc: 'Works seamlessly in local primary health clinics or central district hospitals.' },
                { title: 'Better Healthcare Continuity', desc: 'Keeps treatment history tracking consistent even when relocating work sites.' }
              ].map((benefit, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">0{idx + 1}.</span>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white mt-2 mb-1">{benefit.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Portal Selection Section */}
      <section id="portals" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Choose Your Portal</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white font-heading tracking-tight">
            Role-Based Access Portals
          </h2>
          <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              role: 'worker',
              title: 'Worker Portal',
              color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/40',
              btnColor: 'bg-emerald-600 hover:bg-emerald-700',
              features: ['Register/Login', 'View Medical Records', 'Upload Reports', 'Download Health Summary', 'QR Health Card'],
              buttonText: 'Access Worker Portal'
            },
            {
              role: 'doctor',
              title: 'Doctor Portal',
              color: 'from-rose-500/10 to-pink-500/10 border-rose-500/20 hover:border-rose-500/40',
              btnColor: 'bg-rose-600 hover:bg-rose-700',
              features: ['Search Patients', 'View Authorized Records', 'Add Diagnosis', 'Issue Prescriptions', 'Medical History Timeline'],
              buttonText: 'Access Doctor Portal'
            },
            {
              role: 'hospital',
              title: 'Hospital Portal',
              color: 'from-sky-500/10 to-blue-500/10 border-sky-500/20 hover:border-sky-500/40',
              btnColor: 'bg-sky-600 hover:bg-sky-700',
              features: ['Register Patients', 'Upload Lab Reports', 'Manage Health Records', 'Verify Documents'],
              buttonText: 'Access Hospital Portal'
            },
            {
              role: 'admin',
              title: 'Admin Portal',
              color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40',
              btnColor: 'bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900',
              features: ['Manage Users', 'Analytics Dashboard', 'Security Monitoring', 'Audit Logs'],
              buttonText: 'Access Admin Portal'
            }
          ].map((portal, idx) => (
            <div key={idx} className={`rounded-3xl bg-gradient-to-b ${portal.color} p-6 border shadow-sm flex flex-col justify-between h-[380px] transition-all hover:scale-[1.02] duration-300`}>
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4 border-b border-slate-200/55 dark:border-slate-850 pb-2 flex items-center justify-between">
                  {portal.title}
                  <ChevronRight size={16} />
                </h3>
                <ul className="space-y-2.5">
                  {portal.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-350">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => navigate(`/login?role=${portal.role}`)}
                className={`w-full py-2.5 rounded-xl text-white dark:text-inherit font-extrabold text-xs shadow-md transition-all cursor-pointer ${portal.btnColor}`}
              >
                {portal.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Key Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Key Features</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white font-heading tracking-tight">
              A Complete Digital Health System
            </h2>
            <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Digital Health ID', desc: 'Generate a unique identification number linked to NHM profiles.', icon: FileText, color: 'text-emerald-500 bg-emerald-500/10' },
              { title: 'QR Code Health Card', desc: 'Scan code to fetch consent access token in seconds.', icon: QrCode, color: 'text-rose-500 bg-rose-500/10' },
              { title: 'Secure Authentication', desc: 'Secure logins backed by standard hash salts and optional 2FA verification.', icon: Lock, color: 'text-sky-500 bg-sky-500/10' },
              { title: 'Cloud Record Storage', desc: 'Consolidated clinical registry to store PDFs and medical files safely.', icon: Globe, color: 'text-amber-500 bg-amber-500/10' },
              { title: 'Medical Report Upload', desc: 'Instantly upload prescriptions, lab scans, or vaccination details.', icon: FileText, color: 'text-indigo-500 bg-indigo-500/10' },
              { title: 'Prescription Management', desc: 'Write diagnoses, advise dosages, and issue clinical medications.', icon: Heart, color: 'text-pink-500 bg-pink-500/10' },
              { title: 'Multi-language Support', desc: 'Supports 6 major regional languages (ML, HI, BN, GU, TA, EN).', icon: Globe, color: 'text-emerald-500 bg-emerald-500/10' },
              { title: 'Emergency Medical Access', desc: 'Allows doctors instant view of critical conditions and allergies.', icon: ShieldAlert, color: 'text-rose-500 bg-rose-500/10' },
              { title: 'Doctor Authorization System', desc: 'Temporary sharing controls that automatically expire after 24 hours.', icon: Users, color: 'text-sky-500 bg-sky-500/10' },
              { title: 'AI Health Insights', desc: '(Future Scope) Predictive telemetry models flagging seasonal disease patterns.', icon: Activity, color: 'text-amber-500 bg-amber-500/10' },
              { title: 'Notification System', desc: 'Real-time alert notifications for diagnostics and approval registries.', icon: Clock, color: 'text-indigo-500 bg-indigo-500/10' },
              { title: 'Health Timeline Tracking', desc: 'Chronological list of all treatments logged for transparent reviews.', icon: Calendar, color: 'text-pink-500 bg-pink-500/10' }
            ].map((f, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 hover:border-emerald-500/30 transition-all flex flex-col justify-between h-[160px]">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${f.color}`}>
                    <f.icon size={18} />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{f.title}</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. System Workflow Section */}
      <section id="workflow" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">System Workflow</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white font-heading tracking-tight">
            How The Platform Operates
          </h2>
          <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
        </div>

        {/* Timeline body with dotted connectors */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative">
          {[
            { step: 'Step 1', title: 'Worker Creates Account', desc: 'Register with basic details and select preferred language.', icon: Users, color: 'border-emerald-500' },
            { step: 'Step 2', title: 'Health Profile Generated', desc: 'Unique Digital ID and secure sharing QR card is created.', icon: QrCode, color: 'border-rose-500' },
            { step: 'Step 3', title: 'Medical Records Uploaded', desc: 'Attach past prescriptions, checkups, and vaccination logs.', icon: FileText, color: 'border-sky-500' },
            { step: 'Step 4', title: 'Doctor Gets Authorized Access', desc: 'Doctor scans worker QR code to unlock medical record access.', icon: Lock, color: 'border-amber-500' },
            { step: 'Step 5', title: 'Treatment History Updated', desc: 'Doctor issues new diagnosis notes and prescription details.', icon: Heart, color: 'border-indigo-500' },
            { step: 'Step 6', title: 'Worker Accesses Records Anywhere', desc: 'Access treatment timeline records anywhere, completely paperless.', icon: Globe, color: 'border-pink-500' }
          ].map((w, idx) => (
            <div key={idx} className="relative group text-center md:text-left flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm hover:border-emerald-500/30 transition-all h-[200px]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{w.step}</span>
                <h4 className="text-xs font-black text-slate-800 dark:text-white mt-1 mb-2 leading-snug">{w.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{w.desc}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 ${w.color} text-slate-600 dark:text-slate-300`}>
                  <w.icon size={16} />
                </div>
                {idx < 5 && (
                  <ArrowRight size={14} className="hidden md:block text-slate-300 dark:text-slate-750" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Emergency Access Section */}
      <section id="emergency" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/20 dark:to-amber-950/20 border border-rose-500/20 shadow-xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Context */}
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-wide uppercase">
                <ShieldAlert size={14} className="animate-pulse" />
                Emergency Access
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white font-heading tracking-tight leading-tight">
                Emergency Healthcare Access
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                In emergencies, authorized healthcare providers can instantly access critical medical information through the patient's QR Health Card, ensuring faster and more accurate treatment.
              </p>
            </div>

            {/* Emergency Info pills list */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              {[
                { title: 'Blood Group Info', desc: 'Transfusion safety checks', icon: Activity },
                { title: 'Known Allergies', desc: 'Prevent drug conflict alerts', icon: ShieldAlert },
                { title: 'Current Medications', desc: 'Ongoing diagnostic treatments', icon: FileText },
                { title: 'Emergency Contacts', desc: 'Instantly notify family', icon: Users },
                { title: 'Medical History', desc: 'Consult previous records', icon: Calendar }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-rose-500/10 dark:border-slate-800 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                    <item.icon size={15} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-850 dark:text-slate-100 uppercase tracking-tight">{item.title}</h4>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Future Scope Section */}
      <section id="future" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Future Scope</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white font-heading tracking-tight">
            Upcoming Platform Releases
          </h2>
          <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'AI Disease Prediction', desc: 'Identifies geographical health trends and seasonal disease spread patterns using machine learning models.' },
            { title: 'Telemedicine Integration', desc: 'Connects migrant patients directly with native language speaking doctors across India.' },
            { title: 'Govt. Health Schemes Binds', desc: 'Direct link to Karunya Health Insurance and central Ayushman Bharat schemes.' },
            { title: 'Voice-Based Multi-Language support', desc: 'Interactive voice navigation allowing illiterate workers to control the portal easily.' },
            { title: 'Native Mobile App', desc: 'Offline health wallet card synchronization for remote areas with poor networks.' },
            { title: 'Wearable Device Telemetry', desc: 'Real-time heart rate and activity monitoring for workers at heavy construction sites.' }
          ].map((scope, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between hover:border-emerald-500/30 transition-all h-[150px]">
              <div>
                <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">{scope.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{scope.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Testimonials Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Testimonials</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white font-heading tracking-tight">
              What Users Say
            </h2>
            <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role: 'Migrant Worker',
                name: 'Manoj Kumar',
                quote: '“Since getting my QR Health Card, I no longer worry about carrying heavy files from Bihar to Kerala. Doctors here scanned it and understood my history instantly!”'
              },
              {
                role: 'Medical Practitioner',
                name: 'Dr. Rajesh Kumar',
                quote: '“The 24-hour QR consent access is a lifesaver. I can inspect medical history, see allergies, and prescribe safely without any language barrier.”'
              },
              {
                role: 'Hospital Administrator',
                name: 'Suresh Pillai',
                quote: '“It streamlines our entire patient registration pipeline and eliminates duplicates. Digital logs have made document auditing extremely easy.”'
              }
            ].map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 shadow-sm flex flex-col justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed mb-6">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center text-sm uppercase">
                    {t.name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white leading-none">{t.name}</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Contact / Team Section */}
      <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
          {/* Subtle decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">Project Information</span>
            <h2 className="text-2xl sm:text-4xl font-black font-heading tracking-tight leading-tight">
              Get in Touch with Team Sahashi
            </h2>
            <p className="text-slate-350 text-xs sm:text-sm leading-relaxed max-w-xl">
              We are working to create scalable health telemetry systems for low-literacy worker groups. Developed as part of TechForGood 2026.
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <Users size={14} className="text-emerald-400" />
                <strong>Team:</strong> Team Sahashi
              </p>
              <p className="flex items-center gap-2">
                <Award size={14} className="text-emerald-400" />
                <strong>Competition:</strong> IEEE TechForGood 2026
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-emerald-400" />
                <strong>Institution:</strong> MIT ADT University, Pune
              </p>
              <p className="flex items-center gap-2">
                <HelpCircle size={14} className="text-emerald-400" />
                <strong>Project Mentor:</strong> Dr. Vinodpuri R. Gosavi
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 space-y-4 text-xs text-slate-200">
            <h4 className="font-bold text-sm text-emerald-400 border-b border-white/10 pb-2">Send an Inquiry</h4>
            
            <div className="space-y-3">
              <a href="mailto:info@sahashi.tech" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                <Mail size={14} />
                support@nhm-kerala.gov.in
              </a>
              <p className="flex items-center gap-2">
                <Phone size={14} />
                +91 471 230 7874 (NHM Kerala Desk)
              </p>
            </div>
            
            <div className="pt-2">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Our support team is available from Mon-Sat (9:00 AM - 6:00 PM IST) to handle district hospital registrations and licensing inquiries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
          
          {/* Logo Context */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <Activity size={16} />
            </div>
            <div>
              <h4 className="font-bold text-white leading-none">NHM Kerala Migrant Health</h4>
              <span className="text-[9px] text-slate-500 mt-1 block">IEEE TechForGood 2026 Initiative</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#portals" className="hover:text-white transition-colors">Portals</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#emergency" className="hover:text-white transition-colors">Emergency</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            <Link to="/login" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/login" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center" title="GitHub">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center" title="LinkedIn">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="mailto:support@nhm-kerala.gov.in" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center" title="Email">
              <Mail size={14} />
            </a>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] text-slate-600 mt-8 pt-6 border-t border-slate-800">
          <p>© 2026 National Health Mission, Government of Kerala. All Rights Reserved. Powered by Team Sahashi, MIT ADT University.</p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
