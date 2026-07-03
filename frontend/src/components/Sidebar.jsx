import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { 
  LayoutDashboard, User, FolderHeart, Share2, 
  CheckCircle, ShieldAlert, LogOut, Menu, X, PlusCircle, Home
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    const base = [
      { to: '/', label: t('homePage'), icon: Home }
    ];
    switch(user.role) {
      case 'worker':
        return [
          ...base,
          { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/profile', label: t('profile'), icon: User },
          { to: '/sharing', label: t('sharing'), icon: Share2 }
        ];
      case 'doctor':
        return [
          ...base,
          { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/profile', label: t('profile'), icon: User }
        ];
      case 'hospital':
        return [
          ...base,
          { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/register-patient', label: t('registerNewPatient'), icon: PlusCircle }
        ];
      case 'admin':
        return [
          ...base,
          { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/verifications', label: t('verifications'), icon: CheckCircle },
          { to: '/logs', label: t('auditLogs'), icon: ShieldAlert }
        ];
      default:
        return base;
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay on mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header/Logo */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
            <FolderHeart size={22} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-slate-800 dark:text-white leading-tight">
              Kerala Health ID
            </h1>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold tracking-wider uppercase">
              {t('keralaPrefix')}
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/30 dark:border-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-bold">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                {user.profile?.name || user.username}
              </p>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                {t(user.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white'}
                `}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
