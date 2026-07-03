import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { FolderHeart, Lock, User, ShieldCheck, Mail, Info, Home } from 'lucide-react';

const Login = () => {
  const { login, verify2FA } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // 2FA Flow states
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [tempToken, setTempToken] = useState(''); // Mock OTP displayed for demo convenience
  
  // Forgot Password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      if (data.two_factor_required) {
        setIs2FARequired(true);
        setTempToken(data.temp_token); // Set for easy demo purposes
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (!otpCode) return;

    setError('');
    setLoading(true);
    try {
      await verify2FA(username, otpCode);
      navigate('/dashboard');
    } catch (err) {
      setError(err || 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotSuccess('');
    setError('');
    setLoading(true);
    try {
      // Simulate API call
      setForgotSuccess("Password reset instructions sent. Verification token generated successfully.");
      setForgotEmail('');
    } catch (err) {
      setError('Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30 transition-all duration-300">
      {/* Floating Home Button */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/35 transition-all shadow-sm z-50"
      >
        <Home size={16} className="text-emerald-500" />
        {t('homePage')}
      </Link>

      <div className="w-full max-w-md">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 mb-3 animate-fade-in">
            <FolderHeart size={30} />
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-800 dark:text-white leading-tight">
            Kerala Health ID
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase mt-1">
            {t('keralaPrefix')}
          </p>
        </div>

        {/* Auth Box */}
        <div className="glass-card animate-slide-up">
          
          {error && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Forgot Password Modal Panel */}
          {showForgot ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Forgot Password?</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your email address to receive password recovery instructions.
              </p>
              
              {forgotSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  {forgotSuccess}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex justify-center items-center gap-2"
              >
                {loading ? 'Requesting...' : 'Send Recovery Token'}
              </button>

              <button
                type="button"
                onClick={() => { setShowForgot(false); setForgotSuccess(''); }}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-emerald-500 transition-all pt-2"
              >
                Back to Log In
              </button>
            </form>
          ) : is2FARequired ? (
            /* 2FA Form */
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="text-center pb-2">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mb-2">
                  <ShieldCheck size={26} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Two-Factor Authentication</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter the 6-digit OTP sent to your registered contact details.
                </p>
              </div>

              {/* Demo Assist Banner */}
              {tempToken && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium flex gap-2">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Demo Mode:</span> Use code <span className="font-extrabold text-sm">{tempToken}</span> to bypass this security screen.
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Security Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-center text-lg font-bold tracking-widest focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 text-slate-800 dark:text-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all"
              >
                {loading ? t('loading') : 'Verify & Log In'}
              </button>

              <button
                type="button"
                onClick={() => { setIs2FARequired(false); setOtpCode(''); }}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-emerald-500 transition-all pt-2"
              >
                Cancel & Go Back
              </button>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center justify-center"
              >
                {loading ? t('loading') : t('login')}
              </button>
            </form>
          )}
        </div>

        {/* Extra Navigation (Register) */}
        {!showForgot && !is2FARequired && (
          <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 mt-6 animate-fade-in">
            Need a health account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              Create an Account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
