import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import { Sun, Moon, Bell, Languages, Check, RefreshCw, Home } from 'lucide-react';

const Topbar = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  const notifRef = useRef(null);
  const langRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await api.get('/auth/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/auth/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const languagesList = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' }
  ];

  return (
    <header className="flex items-center justify-between h-20 px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 w-full z-30">
      {/* Title */}
      <div className="pl-12 lg:pl-0">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
          {t(user?.role)} {t('dashboard')}
        </h2>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        {/* Home Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
          title={t('homePage')}
        >
          <Home size={18} className="text-emerald-500" />
          <span className="text-xs font-semibold hidden md:inline">{t('homePage')}</span>
        </button>

        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
            title="Switch Language"
          >
            <Languages size={18} />
            <span className="text-xs font-semibold uppercase hidden md:inline">{lang}</span>
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
                  className="flex items-center justify-between w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
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
          className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Tray */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-3 z-50 animate-fade-in max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Recent System Updates</span>
                <button 
                  onClick={fetchNotifications}
                  className="text-slate-400 hover:text-emerald-500 transition-all"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {notifications.length === 0 ? (
                  <p className="text-xs text-center py-6 text-slate-400">No new notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                      className={`p-3 text-left transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!notif.is_read ? 'bg-emerald-500/5' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate-2-lines">
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-slate-400 mt-2 block">
                        {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
