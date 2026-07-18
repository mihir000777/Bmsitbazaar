import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { CATS, ICON } from '../constants/theme';
import Logo from '../components/Logo';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [recentAds, setRecentAds] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  // Exact node data from Stitch HTML
  const dataNodes = useMemo(() => [
    { left: '30.19%', dur: '6533ms',  del: '38ms'   },
    { left: '98.39%', dur: '9859ms',  del: '2475ms'  },
    { left: '53.79%', dur: '12781ms', del: '1232ms'  },
    { left: '51.74%', dur: '11978ms', del: '4905ms'  },
    { left: '84.68%', dur: '10963ms', del: '1281ms'  },
    { left: '89.57%', dur: '10234ms', del: '3523ms'  },
    { left: '46.63%', dur: '6235ms',  del: '4271ms'  },
    { left: '75.97%', dur: '10541ms', del: '1979ms'  },
    { left: '56.84%', dur: '7342ms',  del: '3189ms'  },
    { left: '5.53%',  dur: '5753ms',  del: '1227ms'  },
    { left: '63.23%', dur: '9379ms',  del: '426ms'   },
    { left: '32.07%', dur: '8949ms',  del: '2880ms'  },
    { left: '92.92%', dur: '7370ms',  del: '15ms'    },
    { left: '23.68%', dur: '11002ms', del: '3611ms'  },
    { left: '26.43%', dur: '11055ms', del: '1146ms'  },
  ], []);

  useEffect(() => { loadRecent(); }, []);

  const loadRecent = async () => {
    try {
      const snap = await getDocs(collection(db, 'ads'));
      setRecentAds(
        snap.docs
          .filter(d => d.data().status === 'approved')
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 4)
      );
    } catch (e) { console.error(e); }
  };

  const go = (path) => navigate(currentUser ? path : '/auth?mode=login');
  const handleLogout = async () => { try { await logout(); } catch (_) {} };

  const filteredAds = activeCategory === 'all'
    ? recentAds
    : recentAds.filter(a => a.category === activeCategory);

  const ago = (ts) => {
    if (!ts?.seconds) return 'Just now';
    const d = Date.now() / 1000 - ts.seconds;
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  };

  return (
    <>
      {/* ── Cyber-Grid Background (position:fixed, z-index:0) ── */}
      <div id="cyber-background">
        <div className="grid-container">
          <div className="grid-fade" />
          <div className="grid-ground" />
        </div>
        {dataNodes.map((n, i) => (
          <div key={i} className="data-node" style={{
            left: n.left,
            animation: `node-float ${n.dur} linear ${n.del} infinite`,
          }} />
        ))}
      </div>

      {/* ── All page content (z-index:1 via .page-content) ── */}
      <div className="page-content min-h-screen text-on-surface font-body-md overflow-x-hidden">

        {/* Floating pill nav */}
        <nav style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          width: '92%', maxWidth: 1280, zIndex: 50,
          background: 'rgba(19,19,21,0.7)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 9999,
          boxShadow: '0 8px 32px rgba(250,204,21,0.15)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Logo size={36} onClick={() => navigate('/')} />
            <div className="hidden md:flex items-center gap-8">
              <span className="font-outfit text-label-md text-primary-container font-bold cursor-pointer" style={{ borderBottom: '2px solid #facc15', paddingBottom: 2 }}>Browse</span>
              <span onClick={() => go('/categories')} className="font-outfit text-label-md text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer">Categories</span>
              <span onClick={() => go('/post')} className="font-outfit text-label-md text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer">Sell</span>
              <span onClick={() => go('/messages')} className="font-outfit text-label-md text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer">Community</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer">notifications</span>
            {currentUser ? (
              <>
                <button onClick={() => navigate('/myads')} style={{ background: '#facc15', color: '#000', borderRadius: 9999, padding: '8px 20px', fontWeight: 700, fontFamily: 'Outfit', fontSize: 14, border: 'none', cursor: 'pointer' }}>Dashboard</button>
                <button onClick={handleLogout} className="hidden md:flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9999, padding: '8px 16px', color: '#d1c6ab', fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span> Logout
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/auth?mode=login')} style={{ background: '#facc15', color: '#000', borderRadius: 9999, padding: '8px 20px', fontWeight: 700, fontFamily: 'Outfit', fontSize: 14, border: 'none', cursor: 'pointer' }}>Sign In</button>
            )}
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ paddingTop: 120, paddingBottom: 80, minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
          <div className="px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
            {/* Left text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 9999, background: 'rgba(78,222,163,0.1)', border: '1px solid rgba(78,222,163,0.2)', width: 'fit-content' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4edea3', animation: 'ping-anim 1.5s infinite' }} />
                <span className="font-outfit text-label-sm text-secondary uppercase tracking-widest">@bmsit.in only</span>
              </div>

              <h1 className="font-syne" style={{ fontSize: 'clamp(36px,5vw,56px)', lineHeight: 1.1, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Buy and sell within{' '}
                <span style={{ background: 'linear-gradient(90deg,#facc15,#4edea3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  BMSIT.
                </span>
                <br />
                <span style={{ color: '#e5e1e4' }}>No outsiders.</span>
              </h1>

              <p className="font-outfit text-body-lg text-on-surface-variant" style={{ maxWidth: 480, lineHeight: 1.6 }}>
                The exclusive student marketplace for BMSIT. Our strict ₹10 seller filter ensures only serious, verified campus peers can list.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => navigate(currentUser ? '/marketplace' : '/auth?mode=signup')}
                  style={{ background: '#facc15', color: '#000', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontFamily: 'Outfit', fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 24px rgba(250,204,21,0.35)' }}>
                  Join with BMSIT email <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
                </button>
                <button onClick={() => navigate(currentUser ? '/marketplace' : '/auth?mode=login')}
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#e5e1e4', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontFamily: 'Outfit', fontSize: 14, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                  Login
                </button>
              </div>
            </div>

            {/* Right decorative cards */}
            <div className="hidden md:block" style={{ position: 'relative', height: 480 }}>
              {[
                { top: 0, right: 0, rotate: 6, w: 240, price: '₹32,000', tag: 'iPad Air', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn8FogLpN7qUVbJdjs89BxYkGMZzEsHPSU_JuSHTqu05FEd1mlnLn-Baq7ugjFey4fszxvbU9ZrMj-Xle9tpNBTVvaLKx9e4GoNA_nXxtxfd3gKfJ55QDx-9xyM0Ip-NAz5fqyjeOiRrwhs4GJvTBjMOeSlcgIEp-ZDgNrW39jgTeuZuwZGwG_V_Hj0LLEe_iObggavtKUBBqiZF4vWvBew96iqxJrGmQaVKEyRHlGEeuonXSwtaYNKn-PPR43xqsXrQjyidmHwRQ' },
                { bottom: 40, left: 0, rotate: -12, w: 210, price: '₹450', tag: 'Lab Coat', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHh6zkil6g8OF3vlBE9PFIFzYhH_E3av8q6tcG3P9YiwktdjzyOBibSGA1NGCpbD_kF-kBz45rwuB_brqDFr-tam--wxXAqK7bHELK0MnwWkP1XntpHuXSIHIpN9YrI2HAX7Hmn2nN61r2Ft5ZhMpmVSgWQbt0duQsy-WoJK2OZTI1houLIa_-i_7hNZux4GzHQR4FDQNPS2JR3lyjUOWDB_bt2B0bfgmiXkvBZOPHCKly8HwS12MaUof38ImEw_OJXAaJ4NT0zTY' },
                { top: '50%', left: '50%', rotate: 2, w: 230, price: '₹800', tag: 'Sem 4 Books', transform: 'translate(-50%,-50%) rotate(2deg)', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0tcsbzFStQelnb6w633RZUVXtT6QTTMUmqKr-62nt7Lx4vEZGXOJJ-Orpt7kV9elmUcpvneld8wYQbqF9Ga0tlo9OimBQks7a80tK1GUK1SPT676yjQMWNy7HTmf3rbNZmqlXEe33ViE_-_z6b8aThli6D37GS7_zfgJSzGKGGJ8RF0v3drY2x9QUElLLunMVWPk8y74hU7WW6oRSjLx5ZgZAW9dUlJ_Iznx_mp8pgHdMveOu6tzfKoHzBDCCjx0TH-rihaGU_pw' },
              ].map((c, i) => (
                <div key={i} onClick={() => go('/marketplace')} style={{
                  position: 'absolute', top: c.top, bottom: c.bottom, left: c.left, right: c.right,
                  width: c.w, transform: c.transform || `rotate(${c.rotate}deg)`,
                  background: 'rgba(24,24,27,0.7)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
                  padding: 14, cursor: 'pointer',
                }}>
                  <img src={c.img} alt={c.tag} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 10, filter: 'grayscale(0.3)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#facc15', fontWeight: 700, fontFamily: 'Outfit', fontSize: 14 }}>{c.price}</span>
                    <span style={{ background: 'rgba(78,222,163,0.15)', color: '#4edea3', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontFamily: 'Outfit' }}>{c.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it Works ── */}
        <section style={{ padding: '80px 0', background: 'rgba(14,14,16,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
            <div style={{ marginBottom: 56 }}>
              <h2 className="font-syne text-headline-lg" style={{ marginBottom: 12 }}>How it Works</h2>
              <div style={{ height: 3, width: 80, background: '#facc15', borderRadius: 4 }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {[
                { icon: 'person_add', title: 'Sign up',  desc: 'Use your @bmsit.in email to join the campus circle.', path: '/auth?mode=signup' },
                { icon: 'add_box',    title: 'Post Ad',  desc: 'Upload photos and details of the gear you\'re selling.', path: '/post' },
                { icon: 'payments',   title: 'Pay ₹10',  desc: 'A micro-commitment to filter out bots and fake listings.', accent: true },
                { icon: 'chat_bubble',title: 'Connect',  desc: 'Chat with verified buyers and close the deal on campus.', path: '/messages' },
              ].map((s, i) => (
                <div key={i} onClick={() => s.path && go(s.path)} className="glass-panel" style={{
                  padding: 28, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 14,
                  cursor: 'pointer', transition: 'border-color 0.2s',
                  borderColor: s.accent ? 'rgba(250,204,21,0.2)' : undefined,
                  background: s.accent ? 'rgba(250,204,21,0.04)' : undefined,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: s.accent ? '#facc15' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: s.accent ? '#000' : '#facc15', fontSize: 22 }}>{s.icon}</span>
                  </div>
                  <h3 className="font-syne text-headline-md">{s.title}</h3>
                  <p className="font-outfit text-body-md text-on-surface-variant">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Filter section ── */}
        <section style={{ padding: '80px 0' }}>
          <div className="px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-syne" style={{ fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.15, fontWeight: 800, marginBottom: 20 }}>Filter out the fakers</h2>
              <p className="font-outfit text-body-lg text-on-surface-variant" style={{ marginBottom: 28, lineHeight: 1.7 }}>
                Ever been ghosted on OLX? We hate it too. That's why every seller pays a non-refundable ₹10 verification fee per listing. It's not about the money; it's about the{' '}
                <span style={{ color: '#facc15', fontWeight: 700 }}>intent</span>.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['No Scammy Profiles', 'Zero Spam Notifications', 'Verified Student Interactions'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="font-outfit text-label-md">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,204,21,0.08)', filter: 'blur(80px)', borderRadius: '50%' }} />
              <div className="glass-panel" style={{ position: 'relative', padding: 40, borderRadius: 24, textAlign: 'center', border: '1px solid rgba(250,204,21,0.15)' }}>
                <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}>lock</span>
                </div>
                <h3 className="font-syne text-headline-md" style={{ marginBottom: 10 }}>Locked Listing</h3>
                <p className="font-outfit text-on-surface-variant" style={{ marginBottom: 24 }}>Seller details are hidden until the verification fee is cleared.</p>
                <button onClick={() => go('/marketplace')} style={{ width: '100%', background: '#facc15', color: '#000', padding: '14px 0', borderRadius: 12, fontWeight: 700, fontFamily: 'Outfit', fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 0 24px rgba(250,204,21,0.3)' }}>
                  Unlock Seller Contact (₹10)
                </button>
                <p style={{ marginTop: 12, fontSize: 11, color: 'rgba(209,198,171,0.5)', fontFamily: 'Outfit' }}>Secure payment via Razorpay. Instant unlock.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Marketplace preview ── */}
        <section style={{ padding: '80px 0', background: 'rgba(14,14,16,0.5)', backdropFilter: 'blur(8px)' }}>
          <div className="px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 className="font-syne text-headline-lg" style={{ marginBottom: 6 }}>Marketplace</h2>
                <p className="font-outfit text-on-surface-variant">Active listings from your branch and beyond.</p>
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {[{ v: 'all', l: 'All' }, ...CATS.slice(0, 4)].map(cat => (
                  <button key={cat.v} onClick={() => setActiveCategory(cat.v)} style={{
                    padding: '8px 20px', borderRadius: 9999, fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s',
                    background: activeCategory === cat.v ? '#facc15' : 'rgba(255,255,255,0.05)',
                    color: activeCategory === cat.v ? '#000' : '#d1c6ab',
                    border: activeCategory === cat.v ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  }}>
                    {cat.v === 'all' ? 'All' : cat.l.replace(/^.{2}\s*/, '')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {filteredAds.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#9a9078' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>storefront</span>
                  <p className="font-outfit">No listings yet. Be the first to post!</p>
                </div>
              ) : filteredAds.map(ad => (
                <div key={ad.id} onClick={() => go(`/product/${ad.id}`)} className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                    {ad.images?.[0]
                      ? <img src={ad.images[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.5)', transition: 'filter 0.3s' }}
                          onMouseEnter={e => e.target.style.filter = 'grayscale(0)'}
                          onMouseLeave={e => e.target.style.filter = 'grayscale(0.5)'} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, background: 'rgba(32,31,34,1)' }}>{ICON[ad.category]}</div>
                    }
                    <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(19,19,21,0.8)', backdropFilter: 'blur(8px)', padding: '3px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4edea3' }} />
                      <span style={{ color: '#4edea3', fontSize: 11, fontFamily: 'Outfit', fontWeight: 600 }}>Live</span>
                    </div>
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
                      <h4 className="font-syne" style={{ fontSize: 16, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{ad.title}</h4>
                      <span style={{ color: '#facc15', fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>₹{ad.price}</span>
                    </div>
                    <p style={{ color: '#9a9078', fontFamily: 'Outfit', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 8 }}>{ad.description || 'No description.'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(154,144,120,0.6)', fontSize: 11, fontFamily: 'Outfit' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                      {ago(ad.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <button onClick={() => go('/marketplace')} className="glass-panel" style={{ padding: '14px 48px', borderRadius: 12, fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#e5e1e4' }}>
                View All Listings
              </button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(14,14,16,0.8)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Logo size={32} onClick={() => navigate('/')} />
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <span onClick={() => navigate('/support')} style={{ color: '#9a9078', fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer' }}>Support</span>
            <span onClick={() => navigate('/support')} style={{ color: '#9a9078', fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer' }}>Safety Guide</span>
            <span onClick={() => navigate('/terms')} style={{ color: '#9a9078', fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer' }}>Terms of Trade</span>
            <span onClick={() => navigate('/privacy')} style={{ color: '#9a9078', fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer' }}>Privacy</span>
          </div>
          <span style={{ color: '#9a9078', fontFamily: 'Outfit', fontSize: 12 }}>© 2026 BMSIT BAZAAR</span>
        </footer>

        {/* Floating + button */}
        <button onClick={() => go('/post')} style={{
          position: 'fixed', bottom: 28, right: 28, width: 56, height: 56, borderRadius: '50%',
          background: '#facc15', color: '#000', border: 'none', cursor: 'pointer', zIndex: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(250,204,21,0.5)', transition: 'transform 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>add</span>
        </button>

      </div>
    </>
  );
}
