import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Navbar';
import Pill from '../components/Pill';
import Button from '../components/Button';
import { Inp } from '../components/Input';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Info } from 'lucide-react';

export const Auth = () => {
  const { currentUser, login, signup, googleSignIn, resendVerification, ADMIN_EMAIL } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState(searchParams.get('mode') || 'login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [aErr, setAErr] = useState('');
  const [aOk, setAOk] = useState('');

  const ALLOWED_DOMAIN = process.env.REACT_APP_ALLOWED_DOMAIN || 'bmsit.in';

  useEffect(() => {
    if (currentUser) {
      if (currentUser.email === ADMIN_EMAIL) {
        navigate('/admin');
      } else if (!currentUser.emailVerified) {
        navigate('/verify');
      } else {
        navigate('/marketplace');
      }
    }
  }, [currentUser, navigate, ADMIN_EMAIL]);

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode && (urlMode === 'login' || urlMode === 'signup')) {
      setMode(urlMode);
    }
  }, [searchParams]);

  const handleAuth = async () => {
    setAErr('');
    setAOk('');
    if (!email.trim() || !pass.trim()) {
      setAErr('Please fill in both email and password.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signup(email, pass);
        setAOk('✓ Account created! Check your BMSIT email inbox and click the verification link before logging in.');
        setMode('login');
      } else {
        await login(email, pass);
      }
    } catch (e) {
      console.error(e);
      let errorMsg = e.message;
      if (e.code) {
        const messages = {
          'auth/invalid-credential': 'Wrong email or password.',
          'auth/email-already-in-use': 'Email already registered. Please login.',
          'auth/weak-password': 'Password needs 6+ characters.',
          'auth/invalid-email': 'Invalid email address.'
        };
        errorMsg = messages[e.code] || 'Authentication failed. Please try again.';
      }
      setAErr(errorMsg);
    }
    setBusy(false);
  };

  const handleGoogle = async () => {
    setAErr('');
    setBusy(true);
    try {
      await googleSignIn();
    } catch (e) {
      console.error(e);
      setAErr(e.message || 'Google sign-in failed. Please try again.');
    }
    setBusy(false);
  };

  const handleResend = async () => {
    if (!email.trim() || !pass.trim()) {
      setAErr('Enter your email and password first, then click Resend.');
      return;
    }
    setBusy(true);
    try {
      await resendVerification(email, pass);
      setAOk('Verification email resent! Check your BMSIT inbox.');
    } catch (e) {
      setAErr('Could not resend. Please check your credentials.');
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-on-surface font-sans flex items-center justify-center p-4 md:p-10 relative overflow-hidden selection:bg-brand-yellow/30 selection:text-brand-yellow">
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-brand-on-surface-variant hover:text-brand-yellow transition-colors mb-6 bg-none border-none cursor-pointer font-outfit"
        >
          <ArrowLeft className="w-4 h-4" /> RETURN TO HOME
        </button>

        <div className="glass rounded p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Logo size={28} onClick={() => navigate('/')} />
            <div className="mt-3">
              <Pill type="yellow" className="text-[10px] tracking-widest font-bold">INSTITUTIONAL ACCESS ONLY</Pill>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex gap-1 bg-[#09090b] p-1 rounded border border-white/5 mb-6">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setAErr('');
                  setAOk('');
                }}
                className={`flex-1 py-3 rounded text-[10px] font-bold tracking-widest uppercase transition-all font-outfit ${
                  mode === m
                    ? 'bg-brand-yellow text-black shadow-glow-yellow'
                    : 'text-brand-on-surface-variant hover:text-brand-on-surface'
                }`}
              >
                {m === 'login' ? 'SIGN IN' : 'REGISTER'}
              </button>
            ))}
          </div>

          {/* Error */}
          {aErr && (
            <div className="bg-brand-error/10 border border-brand-error/20 rounded p-4 mb-4 text-[10px] font-bold tracking-widest uppercase text-brand-error flex items-start gap-2.5 font-outfit">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{aErr}</span>
            </div>
          )}

          {/* Success */}
          {aOk && (
            <div className="bg-brand-emerald-container/10 border border-brand-emerald/20 rounded p-4 mb-4 text-[10px] font-bold tracking-widest uppercase text-brand-emerald flex items-start gap-2.5 font-outfit">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{aOk}</span>
            </div>
          )}

          {/* Google Sign-In */}
          <Button v="white" onClick={handleGoogle} disabled={busy} className="py-3 uppercase tracking-[0.1em] text-[10px]">
            <svg width="18" height="18" viewBox="0 0 48 48" className="mr-2 flex-shrink-0">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" />
            </svg>
            {busy ? 'PROCESSING...' : 'CONTINUE WITH GOOGLE'}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-[0.2em] font-outfit">OR EMAIL</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>

          {/* Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-[0.2em] mb-2 font-outfit">EMAIL</label>
              <Inp
                placeholder={`ID@${ALLOWED_DOMAIN}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-[0.2em] mb-2 font-outfit">PASSWORD</label>
              <Inp
                placeholder="••••••••"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleAuth} disabled={busy} className="py-4 uppercase tracking-[0.2em] text-[10px]">
            {busy ? 'PROCESSING...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </Button>

          {mode === 'login' && (
            <div className="text-center text-[10px] font-bold tracking-widest uppercase text-brand-on-surface-variant mt-4 font-outfit">
              Missing verification?{' '}
              <span onClick={handleResend} className="text-brand-yellow hover:underline cursor-pointer">
                RESEND
              </span>
            </div>
          )}

          {/* Trust */}
          <div className="mt-8 p-4 glass rounded text-center">
            <p className="text-[9px] text-brand-on-surface-variant font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 font-outfit">
              🎓 BMSIT ONLY · 🔒 ENCRYPTED · 👑 VERIFIED
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
