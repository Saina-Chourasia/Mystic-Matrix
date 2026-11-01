import React, { useState, useEffect } from 'react';
import { ShieldAlert, Sun, Moon, ArrowLeft, Sparkles, CheckCircle2, Lock, Mail, User, KeyRound, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { PixelIcon } from '../components/PixelArt';
import { api } from '../services/api';
import { sound } from '../utils/audioSynth';
import { useClerkAuth } from '../context/ClerkAuthContext';

export default function LoginPage({ 
  onLoginSuccess, 
  onBackToHome, 
  theme = 'night', 
  setTheme 
}) {
  const isNight = theme === 'night';
  const { isClerkConfigured, signInWithGoogle: clerkSignInWithGoogle } = useClerkAuth();
  const [authConfig, setAuthConfig] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [attemptedEmail, setAttemptedEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1 = request, 2 = enter token & new password

  // Check URL query parameters for OAuth callback error states
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const emailParam = params.get('email');

    if (error === 'access_denied') {
      setErrorMessage("Access Denied! You are not authorized to enter Madam Hex's private sanctum.");
      if (emailParam) setAttemptedEmail(emailParam);
    } else if (error === 'not_configured') {
      setErrorMessage('Google OAuth credentials are not configured in server .env. Please use secure Email & Password authentication below.');
    } else if (error === 'state_mismatch') {
      setErrorMessage('Security token mismatch. Please try signing in again.');
    } else if (error) {
      setErrorMessage(params.get('msg') || `Authentication error: ${error}`);
    }

    // Clean up error query parameters from URL immediately to prevent resurrection on Browser Back / Refresh
    if (error || emailParam || params.has('msg')) {
      params.delete('error');
      params.delete('email');
      params.delete('msg');
      if (!params.has('tab')) {
        params.set('tab', 'login');
      }
      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
      window.history.replaceState({ tab: 'login' }, '', newUrl);
    }

    // Fetch public auth configuration
    api.getAuthConfig()
      .then((res) => {
        if (res.success) setAuthConfig(res.data);
      })
      .catch((err) => console.error('Failed to load auth config:', err));
  }, []);

  // Standard Email & Password Login
  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both your scroll address (email) and secret passphrase.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      sound.playCastSpell();

      const res = await api.login({ email, password });
      if (res.success) {
        sound.playSparkle();
        if (onLoginSuccess) onLoginSuccess(res.user);
      }
    } catch (err) {
      sound.playWarningHex();
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Customer Registration (Strictly creates role USER)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMessage('Please provide your name, scroll address, and a secure passphrase.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Passphrase must be at least 8 runes (characters) long.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      sound.playCastSpell();

      const res = await api.register({ name, email, password, phone });
      if (res.success) {
        sound.playSparkle();
        if (onLoginSuccess) onLoginSuccess(res.user);
      }
    } catch (err) {
      sound.playWarningHex();
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Request Password Reset Token
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your registered scroll address (email).');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      sound.playPotionBubble();

      const res = await api.forgotPassword({ email });
      if (res.success) {
        setSuccessMessage(res.message);
        if (res.devToken) {
          setResetToken(res.devToken);
        }
        setResetStep(2);
      }
    } catch (err) {
      sound.playWarningHex();
      setErrorMessage(err.message || 'Failed to dispatch reset spell.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Password Reset with Token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      setErrorMessage('Please provide the reset spell token and your new passphrase.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      sound.playPotionBubble();

      const res = await api.resetPassword({ token: resetToken, newPassword });
      if (res.success) {
        sound.playSparkle();
        setSuccessMessage(res.message);
        setAuthMode('login');
        setPassword('');
        setResetStep(1);
      }
    } catch (err) {
      sound.playWarningHex();
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Flow powered by Clerk Authentication
  const handleContinueWithGoogle = async () => {
    sound.playCastSpell();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isClerkConfigured) {
      try {
        setLoading(true);
        await clerkSignInWithGoogle();
      } catch (err) {
        sound.playWarningHex();
        setErrorMessage(err.message || 'Clerk Google Sign-In could not be initialized.');
        setLoading(false);
      }
    } else {
      sound.playWarningHex();
      setErrorMessage(
        'Clerk Authentication is pending configuration. Please set VITE_CLERK_PUBLISHABLE_KEY (frontend/.env) and CLERK_SECRET_KEY (backend/.env) from dashboard.clerk.com.'
      );
    }
  };

  // Quick-Login for Testing & Evaluation
  const handleQuickLogin = async (targetEmail, targetPassword) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      sound.playPotionBubble();

      const res = await api.login({ email: targetEmail, password: targetPassword });
      if (res.success) {
        sound.playSparkle();
        if (onLoginSuccess) onLoginSuccess(res.user);
      }
    } catch (err) {
      sound.playWarningHex();
      setErrorMessage(err.message || 'Quick sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    sound.playPotionBubble();
    setTheme(isNight ? 'day' : 'night');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden transition-colors duration-500">
      
      {/* Background Pixel Art Landscape with Soft Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{
          backgroundImage: `url(${isNight ? '/images/mystic_hero_clean_night_2x.png' : '/images/mystic_hero_clean_day_2x.png'})`,
          imageRendering: 'pixelated',
          filter: 'blur(3px) brightness(0.65)'
        }}
      />
      <div className={`absolute inset-0 transition-colors duration-500 ${
        isNight ? 'bg-purple-950/45 backdrop-blur-xs' : 'bg-amber-950/25 backdrop-blur-xs'
      }`} />

      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 max-w-5xl mx-auto">
        <button
          onClick={onBackToHome}
          className={`px-4 py-2 rounded-full text-xs font-serif font-bold flex items-center gap-2 backdrop-blur-md border transition-all ${
            isNight
              ? 'bg-[#150A26]/80 border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-300'
              : 'bg-white/90 border-purple-200 text-purple-950 hover:border-purple-400 shadow-sm'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Hallowmere</span>
        </button>

        {/* Theme Switcher Toggle */}
        <div 
          id="login-theme-toggle"
          onClick={toggleTheme}
          className={`flex items-center p-1 rounded-full cursor-pointer select-none border backdrop-blur-md transition-all ${
            isNight 
              ? 'bg-[#1B0D36]/80 border-purple-500/40' 
              : 'bg-white/90 border-purple-300 shadow-sm'
          }`}
          title={isNight ? 'Switch to Day Mode' : 'Switch to Night Mode'}
        >
          <div className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
            !isNight 
              ? 'bg-amber-400 text-purple-950 shadow-sm' 
              : 'text-purple-400 hover:text-amber-300'
          }`}>
            <Sun className="w-3.5 h-3.5" />
          </div>
          <div className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
            isNight 
              ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.8)]' 
              : 'text-purple-300 hover:text-purple-600'
          }`}>
            <Moon className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Unified Authentication Portal Card */}
      <div className="relative z-10 w-full max-w-md mx-auto my-12">
        
        <div className={`pixel-card p-6 sm:p-8 shadow-2xl backdrop-blur-xl border text-center space-y-5 ${
          isNight
            ? 'bg-[#130728]/95 border-purple-500/40 shadow-purple-950/80 text-purple-100'
            : 'bg-white/95 border-purple-300 shadow-purple-900/20 text-purple-950'
        }`}>
          
          {/* Brand Header */}
          <div className="space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl p-2 bg-[var(--bg-primary)] border-2 border-[var(--color-purple)] flex items-center justify-center shadow-lg relative group">
              <PixelIcon name="WitchHat" size={36} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
            </div>

            <div>
              <div className="text-[10px] font-pixel tracking-widest text-[var(--color-purple)] uppercase">
                MYSTIC MATRIX • DUAL PORTALS
              </div>
              <h1 className="font-serif font-black text-xl sm:text-2xl mt-0.5">
                {authMode === 'login' ? 'Enter the Sanctum' : authMode === 'register' ? 'Join the Guild' : 'Recover Access'}
              </h1>
              <p className="font-serif text-xs text-[var(--text-secondary)] mt-0.5">
                {authMode === 'login' && 'Sign in as Madam Hex (Admin) or Apprentice Customer'}
                {authMode === 'register' && 'Create your customer account to browse & order magical potions'}
                {authMode === 'forgot' && 'Dispatch a secure recovery token to renew your passphrase'}
              </p>
            </div>
          </div>

          {/* Mode Tabs (Sign In / Register / Recovery) */}
          <div className="flex rounded-xl bg-purple-950/40 p-1 border border-purple-500/20 text-xs font-serif font-bold">
            <button
              type="button"
              onClick={() => { 
                setAuthMode('login'); 
                setErrorMessage(null); 
                setSuccessMessage(null); 
                setPassword('');
                setResetToken('');
                setNewPassword('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authMode === 'login' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { 
                setAuthMode('register'); 
                setErrorMessage(null); 
                setSuccessMessage(null); 
                setPassword('');
                setResetToken('');
                setNewPassword('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authMode === 'register' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => { 
                setAuthMode('forgot'); 
                setErrorMessage(null); 
                setSuccessMessage(null); 
                setPassword('');
                setResetToken('');
                setNewPassword('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authMode === 'forgot' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Reset Key
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-red-500/50 bg-red-950/30 text-left space-y-1 animate-shake">
              <div className="flex items-center gap-2 text-red-400 text-xs font-serif font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>Notice</span>
              </div>
              <p className="text-xs text-red-200 font-sans leading-relaxed">
                {errorMessage}
              </p>
              {attemptedEmail && (
                <div className="text-[10px] font-mono text-red-300 pt-1 border-t border-red-500/20">
                  Attempted account: <span className="underline">{attemptedEmail}</span>
                </div>
              )}
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="p-3.5 rounded-xl border border-emerald-500/50 bg-emerald-950/30 text-left space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-serif font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Success</span>
              </div>
              <p className="text-xs text-emerald-200 font-sans leading-relaxed">
                {successMessage}
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 1: SECURE LOGIN FORM
              ══════════════════════════════════════════════════════════ */}
          {authMode === 'login' && (
            <form onSubmit={handleEmailPasswordLogin} className="space-y-3.5 text-left pt-1">
              <div>
                <label className="block text-[11px] font-serif font-bold text-[var(--text-secondary)] mb-1">
                  Scroll Address (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. madam.hex@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-serif font-bold text-[var(--text-secondary)] mb-1">
                  Secret Passphrase
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-serif font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Consulting the Grimoire...' : 'Sign In to Portal'}</span>
              </button>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 2: CUSTOMER REGISTRATION FORM (Strictly Role USER)
              ══════════════════════════════════════════════════════════ */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 text-left pt-1">
              <div>
                <label className="block text-[11px] font-serif font-bold text-[var(--text-secondary)] mb-1">
                  Alchemist Moniker / Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Valerius the Apprentice"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-serif font-bold text-[var(--text-secondary)] mb-1">
                  Scroll Address (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@realm.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-serif font-bold text-[var(--text-secondary)] mb-1">
                  Passphrase (8+ runes)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="p-2 rounded-lg bg-purple-900/20 border border-purple-500/20 text-[10px] text-purple-300 flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Registers as an authorized customer with access to browse & buy potions.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-serif font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{loading ? 'Etching Grimoire...' : 'Create Customer Account'}</span>
              </button>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 3: FORGOT PASSWORD & RECOVERY
              ══════════════════════════════════════════════════════════ */}
          {authMode === 'forgot' && (
            <div className="space-y-3 text-left pt-1">
              {resetStep === 1 ? (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-serif font-bold text-[var(--text-secondary)] mb-1">
                      Registered Scroll Address (Email)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. apprentice@hallowmere.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-serif font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{loading ? 'Dispatching Owl...' : 'Request Single-Use Token'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-serif font-bold text-[var(--text-secondary)] mb-1">
                      Reset Token
                    </label>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Hex Token"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-serif font-bold text-[var(--text-secondary)] mb-1">
                      New Passphrase
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 runes"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-serif font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{loading ? 'Renewing...' : 'Save New Passphrase'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              ALTERNATIVE SIGN-IN & QUICK-ACCESS
              ══════════════════════════════════════════════════════════ */}
          <div className="pt-3 border-t border-[var(--border-card)] space-y-3">
            
            {/* Google OAuth Option via Clerk */}
            <button
              onClick={handleContinueWithGoogle}
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-xl font-serif font-bold text-xs flex items-center justify-center gap-2.5 transition-all select-none border ${
                isNight
                  ? 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300 shadow-sm'
              }`}
              title={isClerkConfigured ? "Continue with Google via Clerk" : "Clerk Google Sign-In requires VITE_CLERK_PUBLISHABLE_KEY in .env"}
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isClerkConfigured ? 'Continue with Google' : 'Continue with Google (Clerk Config Required)'}</span>
            </button>

            {/* Quick Demo Credentials Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                <span>EVALUATION TEST ACCOUNTS</span>
                <span className="text-amber-400 font-bold">1-Click Sign In</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('madam.hex@gmail.com', 'MadamHex2026!Sanctum')}
                  className="px-2.5 py-2 rounded-xl bg-purple-900/30 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-[11px] font-serif font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Log in as Madam Hex (Admin)"
                >
                  <PixelIcon name="WitchHat" size={16} />
                  <span>Madam Hex (Admin)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('apprentice@hallowmere.com', 'Hallowmere2026!Spell')}
                  className="px-2.5 py-2 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-[11px] font-serif font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Log in to Customer User Portal"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Customer (Apprentice)</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Lore */}
        <div className="mt-4 text-center text-xs text-purple-300/60 font-serif">
          Hallowmere Nocturnal Market • Two Secure Portals, One Magical Database
        </div>

      </div>

    </div>
  );
}
