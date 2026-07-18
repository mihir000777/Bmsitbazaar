import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

/**
 * Floating pill navbar - exact Stitch design
 * Used across all main pages
 */
export default function StitchNav({ active = 'browse' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { key: 'browse', label: 'Browse', path: '/marketplace' },
    { key: 'categories', label: 'Categories', path: '/categories' },
    { key: 'sell', label: 'Sell', path: '/post' },
    { key: 'community', label: 'Community', path: '/messages' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) { console.error(e); }
  };

  const initial = currentUser?.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] rounded-full z-50 bg-surface/60 backdrop-blur-xl border border-white/5 shadow-2xl shadow-[rgba(250,204,21,0.4)] flex justify-between items-center px-4 sm:px-6 md:px-8 py-3 mx-auto max-w-[1280px]">
        <div className="flex items-center gap-4 md:gap-8">
          <Logo size={40} onClick={() => navigate('/')} />
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <span
                key={link.key}
                onClick={() => navigate(link.path)}
                className={`font-outfit text-label-md cursor-pointer transition-all duration-300 ${
                  active === link.key
                    ? 'text-primary-container font-bold border-b-2 border-primary-container pb-1'
                    : 'text-on-surface-variant font-medium hover:text-primary-container'
                }`}
              >
                {link.label}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => navigate('/messages')}
            className="material-symbols-outlined text-on-surface-variant hover:text-primary-container transition-colors active:scale-95"
            title="Messages"
          >
            notifications
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => navigate('/myads')}
                className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-label-sm cursor-pointer active:scale-95 transition-transform"
                title="Dashboard"
              >
                {initial}
              </button>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 bg-surface-container-low border border-white/5 text-on-surface-variant hover:text-error hover:border-error/20 font-outfit text-label-sm px-4 py-2 rounded-full transition-all active:scale-95"
                title="Logout"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Logout</span>
              </button>
              <button
                onClick={handleLogout}
                className="md:hidden material-symbols-outlined text-on-surface-variant hover:text-error transition-colors active:scale-95"
                title="Logout"
              >
                logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="bg-primary-container text-on-primary-container font-outfit text-label-md px-5 py-2 rounded-full active:scale-95 transition-transform font-bold"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden material-symbols-outlined text-on-surface-variant hover:text-primary-container ml-1"
          >
            {mobileOpen ? 'close' : 'menu'}
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 w-[92%] z-40 glass-panel rounded-xl p-4 mx-auto max-w-[1280px] animate-fadeUp">
          <div className="flex flex-col gap-2">
            {navLinks.map(link => (
              <button
                key={link.key}
                onClick={() => { navigate(link.path); setMobileOpen(false); }}
                className={`text-left p-3 rounded-lg font-outfit text-label-md transition-all ${
                  active === link.key
                    ? 'bg-primary-container/10 text-primary-container font-bold'
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                }`}
              >
                {link.label}
              </button>
            ))}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="text-left p-3 rounded-lg font-outfit text-label-md text-error hover:bg-error/10 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/** Standard footer */
export function StitchFooter() {
  const navigate = useNavigate();
  return (
    <footer className="w-full rounded-t-xl mt-gutter border-t border-white/5 bg-surface-container-lowest flex flex-col md:flex-row justify-between items-center px-4 md:px-10 py-6 gap-4">
      <Logo size={32} onClick={() => navigate('/')} />
      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        <span onClick={() => navigate('/support')} className="font-outfit text-label-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">Support</span>
        <span onClick={() => navigate('/support')} className="font-outfit text-label-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">Safety Guide</span>
        <span onClick={() => navigate('/terms')} className="font-outfit text-label-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">Terms of Trade</span>
        <span onClick={() => navigate('/privacy')} className="font-outfit text-label-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">Privacy</span>
      </div>
      <div className="text-on-surface-variant font-outfit text-label-sm">
        © 2026 BMSIT BAZAAR
      </div>
    </footer>
  );
}

/** Mobile bottom navigation - matches Stitch mobile design */
export function MobileBottomNav({ active = '' }) {
  const navigate = useNavigate();
  const items = [
    { key: 'home', label: 'Home', icon: 'home', path: '/marketplace' },
    { key: 'categories', label: 'Browse', icon: 'category', path: '/categories' },
    { key: 'sell', label: 'Sell', icon: 'add_circle', path: '/post', accent: true },
    { key: 'messages', label: 'Chat', icon: 'chat_bubble', path: '/messages' },
    { key: 'profile', label: 'Profile', icon: 'person', path: '/myads' },
  ];
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(14,14,16,0.98)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }} className="md:hidden">
      <div className="flex justify-around items-center px-2 py-2">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-90 ${
              active === item.key ? 'text-primary-container' : 'text-on-surface-variant'
            } ${item.accent ? 'relative' : ''}`}
          >
            {item.accent ? (
              <div className="w-12 h-12 -mt-5 bg-primary-container rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.4)] border-2" style={{ borderColor: '#09090b' }}>
                <span className="material-symbols-outlined text-on-primary-container text-2xl">{item.icon}</span>
              </div>
            ) : (
              <span className="material-symbols-outlined" style={active === item.key ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
            )}
            <span className="text-[10px] font-medium uppercase font-outfit tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export function StitchOrbs() {
  return (
    <>
      <div className="fixed top-[-100px] left-[-100px] w-[600px] h-[600px] rounded-full blur-[120px] -z-10 opacity-15 bg-primary-container pointer-events-none"></div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full blur-[120px] -z-10 opacity-15 bg-background-accent pointer-events-none"></div>
    </>
  );
}
