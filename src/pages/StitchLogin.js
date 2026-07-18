import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login page - exact clone of Stitch design
 */
export default function StitchLogin() {
  const { currentUser, login, signup, googleSignIn, resendVerification, ADMIN_EMAIL } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState(searchParams.get('mode') || 'login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.email === ADMIN_EMAIL) navigate('/admin');
      else if (!currentUser.emailVerified) navigate('/verify');
      else navigate('/marketplace');
    }
  }, [currentUser, navigate, ADMIN_EMAIL]);

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode && (urlMode === 'login' || urlMode === 'signup')) setMode(urlMode);
  }, [searchParams]);

  // Mouse parallax for orbs
  useEffect(() => {
    const handleMouse = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      const orbs = document.querySelectorAll('.auth-orb');
      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 20;
        orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };
    document.addEventListener('mousemove', handleMouse);
    return () => document.removeEventListener('mousemove', handleMouse);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !pass.trim()) { setError('Fill in all fields.'); return; }
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signup(email, pass);
        navigate('/verify');
      } else {
        await login(email, pass);
      }
    } catch (e) {
      const messages = {
        'auth/invalid-credential': 'Wrong email or password.',
        'auth/email-already-in-use': 'Email already registered.',
        'auth/weak-password': 'Password needs 6+ characters.',
        'auth/invalid-email': 'Invalid email address.'
      };
      setError(messages[e.code] || e.message || 'Authentication failed.');
    }
    setBusy(false);
  };

  const handleGoogle = async () => {
    setError('');
    setBusy(true);
    try { await googleSignIn(); }
    catch (e) { setError(e.message || 'Google sign-in failed.'); }
    setBusy(false);
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body-md min-h-screen overflow-x-hidden relative selection:bg-primary-container selection:text-on-primary-container">
      {/* Background Orbs */}
      <div className="auth-orb fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container/5 rounded-full blur-[120px] pointer-events-none z-0 transition-transform duration-300"></div>
      <div className="auth-orb fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/5 rounded-full blur-[100px] pointer-events-none z-0 transition-transform duration-300"></div>

      <div className="relative z-10 min-h-screen flex flex-col bg-grid-pattern">
        {/* Header */}
        <header className="w-full py-8 px-margin-mobile md:px-margin-desktop flex justify-center">
          <span
            onClick={() => navigate('/')}
            className="text-headline-md font-syne font-bold text-primary-container tracking-tighter hover:scale-105 transition-transform cursor-pointer"
          >
            BMSIT Bazaar
          </span>
        </header>

        {/* Main */}
        <main className="flex-grow flex items-center justify-center px-margin-mobile">
          <div className="w-full max-w-[480px] animate-fadeUp">
            {/* Card */}
            <div className="glass-panel p-8 md:p-10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="text-center mb-10">
                <h1 className="font-syne text-headline-lg text-on-surface mb-2">
                  {mode === 'login' ? 'Welcome Back' : 'Join the Bazaar'}
                </h1>
                <p className="font-outfit text-body-md text-on-surface-variant">
                  {mode === 'login' ? 'The campus marketplace is waiting for you.' : 'Create your account to start trading.'}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-error-container/10 border border-error/20 text-error text-label-sm font-outfit">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="font-outfit text-label-md text-on-surface-variant block ml-1">Institute Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">alternate_email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@bmsit.in"
                      className="w-full bg-surface-container-lowest border border-white/5 focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/50 transition-all outline-none font-outfit"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="font-outfit text-label-md text-on-surface-variant">Password</label>
                    {mode === 'login' && (
                      <span className="text-label-md font-outfit text-primary-container hover:underline decoration-2 underline-offset-4 cursor-pointer">
                        Forgot Password?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">lock</span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-lowest border border-white/5 focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-xl py-4 pl-12 pr-12 text-on-surface placeholder:text-outline/50 transition-all outline-none font-outfit"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">{showPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-primary-container text-on-primary-container font-syne font-bold text-body-lg py-4 rounded-xl hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-[0.98] transition-all flex justify-center items-center gap-2 group disabled:opacity-50"
                >
                  {busy ? 'Processing...' : mode === 'login' ? 'Login Securely' : 'Create Account'}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>

                {/* Divider */}
                <div className="relative py-4 flex items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="px-4 text-label-sm font-outfit text-outline/40 uppercase tracking-widest">or continue with</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={busy}
                  className="w-full bg-white/5 border border-white/5 text-on-surface font-outfit text-label-md py-4 rounded-xl hover:bg-white/10 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {mode === 'login' ? 'Login with Google' : 'Sign up with Google'}
                </button>
              </form>

              {/* Footer Link */}
              <div className="mt-8 text-center">
                <p className="font-outfit text-body-md text-on-surface-variant">
                  {mode === 'login' ? 'New to the bazaar? ' : 'Already have an account? '}
                  <span
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                    className="text-secondary font-bold hover:underline decoration-2 underline-offset-4 ml-1 cursor-pointer"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Login'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-white/5 bg-surface-container-lowest">
          <div className="flex flex-col md:flex-row justify-between items-center py-12 px-4 md:px-10 max-w-[1280px] mx-auto space-y-6 md:space-y-0">
            <div className="flex flex-col items-center md:items-start space-y-2">
              <span className="font-syne text-headline-md font-extrabold text-primary-container">BMSIT Bazaar</span>
              <p className="font-outfit text-label-sm text-on-surface-variant">© 2026 BMSIT Bazaar. For students, by students.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <span onClick={() => navigate('/support')} className="font-outfit text-label-sm text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer">Contact Support</span>
              <span onClick={() => navigate('/privacy')} className="font-outfit text-label-sm text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer">Privacy Policy</span>
              <span onClick={() => navigate('/terms')} className="font-outfit text-label-sm text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer">Terms of Trade</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
