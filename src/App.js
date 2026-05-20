import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import {
  collection, addDoc, doc, getDoc, updateDoc,
  arrayUnion, Timestamp, getDocs
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const ADMIN_EMAIL = "admin@dropwait.com";

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [dropId, setDropId] = useState(null);
  const [drop, setDrop] = useState(null);
  const [allDrops, setAllDrops] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auth forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usn, setUsn] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');

  // Seller form
  const [sellerName, setSellerName] = useState('');
  const [product, setProduct] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');

  // Buyer form
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerJoined, setBuyerJoined] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/drop/')) {
      const id = path.replace('/drop/', '');
      setDropId(id);
      setPage('buyerView');
      loadDrop(id);
    }
    onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && u.email === ADMIN_EMAIL) setPage('admin');
    });
  }, []);

  const loadDrop = async (id) => {
    setLoading(true);
    try {
      const ref = doc(db, 'drops', id);
      const snap = await getDoc(ref);
      if (snap.exists()) setDrop({ id: snap.id, ...snap.data() });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadAllDrops = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'drops'));
      setAllDrops(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAuth = async () => {
    setAuthError('');
    setLoading(true);
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      const u = auth.currentUser;
      if (u.email === ADMIN_EMAIL) setPage('admin');
      else setPage('sellerDashboard');
    } catch (e) {
      setAuthError(e.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setPage('home');
  };

  const createDrop = async () => {
    if (!sellerName || !product || !price || !deadline) {
      alert('Please fill all fields!'); return;
    }
    setLoading(true);
    try {
      const ref = await addDoc(collection(db, 'drops'), {
        sellerName,
        usn: user?.email || '',
        product,
        description,
        price: Number(price),
        commitment: Math.round(Number(price) * 0.2),
        deadline,
        buyers: [],
        reports: [],
        rating: 5,
        frozen: false,
        createdAt: Timestamp.now(),
        createdBy: user?.uid || '',
      });
      setDropId(ref.id);
      setPage('sellerSuccess');
    } catch (e) { alert('Error creating drop.'); }
    setLoading(false);
  };

  const joinWaitlist = async () => {
    if (!buyerName || !buyerPhone) {
      alert('Please fill your name and phone!'); return;
    }
    setLoading(true);
    try {
      const ref = doc(db, 'drops', dropId);
      await updateDoc(ref, {
        buyers: arrayUnion({
          name: buyerName,
          phone: buyerPhone,
          joinedAt: new Date().toISOString(),
          paid: false
        })
      });
      setBuyerJoined(true);
      loadDrop(dropId);
    } catch (e) { alert('Error joining.'); }
    setLoading(false);
  };

  const reportDrop = async () => {
    if (!buyerName) { alert('Enter your name first!'); return; }
    try {
      const ref = doc(db, 'drops', dropId);
      await updateDoc(ref, {
        reports: arrayUnion({ name: buyerName, reportedAt: new Date().toISOString() })
      });
      alert('Reported to admin. We will review within 24 hours.');
    } catch (e) { alert('Error reporting.'); }
  };

  const freezeDrop = async (id, freeze) => {
    await updateDoc(doc(db, 'drops', id), { frozen: freeze });
    loadAllDrops();
  };

  const shareLink = `https://dropwait.vercel.app/drop/${dropId}`;
  const commitmentAmount = drop ? Math.round(drop.price * 0.2) : 0;

  // STYLES
  const s = {
    page: { backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', sans-serif" },
    card: { backgroundColor: '#111', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '460px', border: '1px solid #222', boxShadow: '0 0 40px rgba(250,204,21,0.05)' },
    title: { fontSize: '26px', fontWeight: '800', color: '#FACC15', marginBottom: '6px', textAlign: 'center' },
    subtitle: { color: '#6B7280', marginBottom: '24px', textAlign: 'center', fontSize: '13px', lineHeight: '1.5' },
    input: { width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '13px 16px', marginBottom: '12px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' },
    textarea: { width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '13px 16px', marginBottom: '12px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '90px', resize: 'vertical' },
    btnY: { width: '100%', background: 'linear-gradient(135deg, #FACC15, #F59E0B)', color: '#000', fontWeight: '800', padding: '14px', borderRadius: '12px', fontSize: '15px', border: 'none', cursor: 'pointer', marginBottom: '10px', letterSpacing: '0.3px' },
    btnG: { width: '100%', background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff', fontWeight: '700', padding: '14px', borderRadius: '12px', fontSize: '15px', border: 'none', cursor: 'pointer', marginBottom: '10px' },
    btnR: { width: '100%', background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff', fontWeight: '700', padding: '14px', borderRadius: '12px', fontSize: '15px', border: 'none', cursor: 'pointer', marginBottom: '10px' },
    btnD: { width: '100%', backgroundColor: '#1a1a1a', color: '#9CA3AF', fontWeight: '600', padding: '13px', borderRadius: '12px', fontSize: '14px', border: '1px solid #2a2a2a', cursor: 'pointer', marginBottom: '10px' },
    linkBox: { backgroundColor: '#0a0a0a', border: '1px solid #FACC15', borderRadius: '12px', padding: '14px', marginBottom: '14px' },
    linkText: { color: '#FACC15', fontSize: '12px', wordBreak: 'break-all', textAlign: 'center', fontFamily: 'monospace' },
    badge: { backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', marginBottom: '10px', textAlign: 'center', flex: 1 },
    badgeNum: { fontSize: '32px', fontWeight: '800', color: '#FACC15' },
    badgeLabel: { color: '#6B7280', fontSize: '12px', marginTop: '2px' },
    tag: { display: 'inline-block', backgroundColor: '#1a1a1a', border: '1px solid #FACC15', borderRadius: '20px', padding: '4px 12px', color: '#FACC15', fontSize: '11px', marginBottom: '12px', fontWeight: '600' },
    frozen: { backgroundColor: '#1a1a1a', border: '1px solid #EF4444', borderRadius: '12px', padding: '14px', marginBottom: '14px', textAlign: 'center', color: '#EF4444', fontWeight: '700', fontSize: '14px' },
    error: { backgroundColor: '#1a0000', border: '1px solid #EF4444', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', color: '#EF4444', fontSize: '13px', textAlign: 'center' },
    upiBox: { backgroundColor: '#0a1a0a', border: '1px solid #22C55E', borderRadius: '12px', padding: '16px', marginBottom: '14px', textAlign: 'center' },
    divider: { borderTop: '1px solid #1a1a1a', margin: '16px 0' },
    adminCard: { backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', marginBottom: '10px' },
    logo: { fontSize: '42px', textAlign: 'center', marginBottom: '4px' },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  };

  // HOME
  if (page === 'home') return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>⚡</div>
        <h1 style={{ ...s.title, fontSize: '32px' }}>DropWait</h1>
        <p style={s.subtitle}>Validate demand before you make the product.<br />Smart sellers ship. Others guess.</p>
        <div style={{ height: '1px', backgroundColor: '#1a1a1a', margin: '20px 0' }} />
        <button style={s.btnY} onClick={() => setPage('auth')}>
          🚀 I'm a Seller — Get Started
        </button>
        <div style={{ textAlign: 'center', margin: '8px 0', color: '#333', fontSize: '12px' }}>or</div>
        <button style={s.btnD} onClick={() => setPage('auth')}>
          🔐 Login to My Account
        </button>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            {['✅ Verified Sellers', '🛡️ Buyer Protection', '📊 Live Demand'].map((f, i) => (
              <div key={i} style={{ color: '#6B7280', fontSize: '11px', textAlign: 'center' }}>{f}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // AUTH
  if (page === 'auth') return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.nav}>
          <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => setAuthMode(m)} style={{ background: authMode === m ? '#FACC15' : '#1a1a1a', color: authMode === m ? '#000' : '#9CA3AF', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>
        </div>
        <h1 style={s.title}>{authMode === 'login' ? 'Welcome Back 👋' : 'Join DropWait 🚀'}</h1>
        <p style={s.subtitle}>{authMode === 'login' ? 'Login to manage your drops' : 'Create your seller account'}</p>
        {authError && <div style={s.error}>{authError}</div>}
        <input style={s.input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={s.input} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {authMode === 'signup' && <input style={s.input} placeholder="USN (e.g. 1BM22CS001)" value={usn} onChange={e => setUsn(e.target.value)} />}
        <button style={s.btnY} onClick={handleAuth} disabled={loading}>
          {loading ? 'Please wait...' : authMode === 'login' ? 'Login →' : 'Create Account →'}
        </button>
      </div>
    </div>
  );

  // SELLER DASHBOARD
  if (page === 'sellerDashboard') return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.nav}>
          <h2 style={{ color: '#FACC15', fontWeight: '800', fontSize: '18px', margin: 0 }}>My Dashboard</h2>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #333', color: '#9CA3AF', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
        </div>
        <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '20px' }}>👋 {user?.email}</p>
        <button style={s.btnY} onClick={() => setPage('createDrop')}>
          + Create New Drop
        </button>
        <button style={s.btnD} onClick={() => { if (dropId) { setPage('sellerDropView'); loadDrop(dropId); } else alert('Create a drop first!'); }}>
          📊 View My Latest Drop
        </button>
      </div>
    </div>
  );

  // CREATE DROP
  if (page === 'createDrop') return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.nav}>
          <button onClick={() => setPage('sellerDashboard')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
          <span style={{ color: '#FACC15', fontWeight: '700', fontSize: '13px' }}>New Drop</span>
        </div>
        <h1 style={s.title}>Create Your Drop 📦</h1>
        <p style={s.subtitle}>Buyers will commit 20% upfront to show real interest</p>
        <input style={s.input} placeholder="Your Name" value={sellerName} onChange={e => setSellerName(e.target.value)} />
        <input style={s.input} placeholder="Product Name" value={product} onChange={e => setProduct(e.target.value)} />
        <textarea style={s.textarea} placeholder="Description — what are you selling?" value={description} onChange={e => setDescription(e.target.value)} />
        <input style={s.input} placeholder="Price (₹)" type="number" value={price} onChange={e => setPrice(e.target.value)} />
        {price && <div style={s.upiBox}>
          <div style={{ color: '#22C55E', fontWeight: '700', fontSize: '13px' }}>💰 Buyer Commitment Fee</div>
          <div style={{ color: 'white', fontSize: '24px', fontWeight: '800', margin: '4px 0' }}>₹{Math.round(Number(price) * 0.2)}</div>
          <div style={{ color: '#6B7280', fontSize: '12px' }}>20% of ₹{price} — paid before you make the product</div>
        </div>}
        <input style={s.input} placeholder="Delivery Deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        <button style={s.btnY} onClick={createDrop} disabled={loading}>
          {loading ? 'Launching...' : '🚀 Launch My Drop'}
        </button>
      </div>
    </div>
  );

  // SELLER SUCCESS
  if (page === 'sellerSuccess') return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ textAlign: 'center', fontSize: '52px', marginBottom: '8px' }}>🎉</div>
        <h1 style={s.title}>Drop is Live!</h1>
        <p style={s.subtitle}>Share this link — buyers commit 20% to join</p>
        <div style={s.linkBox}>
          <p style={s.linkText}>{shareLink}</p>
        </div>
        <button style={s.btnY} onClick={() => { navigator.clipboard.writeText(shareLink); alert('Copied!'); }}>
          📋 Copy Link
        </button>
        <button style={s.btnG} onClick={() => window.open(`https://wa.me/?text=🔥 Check out my drop on DropWait! Commit ₹${commitmentAmount} to reserve yours 👇 ${shareLink}`)}>
          💬 Share on WhatsApp
        </button>
        <button style={s.btnD} onClick={() => { setPage('sellerDropView'); loadDrop(dropId); }}>
          📊 View Dashboard
        </button>
      </div>
    </div>
  );

  // SELLER DROP VIEW
  if (page === 'sellerDropView') return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.nav}>
          <button onClick={() => setPage('sellerDashboard')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
          <span style={{ color: '#FACC15', fontWeight: '700', fontSize: '13px' }}>Live Dashboard</span>
        </div>
        {loading ? <p style={{ color: '#6B7280', textAlign: 'center' }}>Loading...</p> : drop ? <>
          {drop.frozen && <div style={s.frozen}>❄️ This drop is frozen by admin</div>}
          <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '4px' }}>{drop.product}</h2>
          <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '16px' }}>₹{drop.price} · Deadline: {drop.deadline}</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <div style={s.badge}>
              <div style={s.badgeNum}>{drop.buyers?.length || 0}</div>
              <div style={s.badgeLabel}>Buyers</div>
            </div>
            <div style={s.badge}>
              <div style={s.badgeNum}>₹{(drop.buyers?.length || 0) * (drop.commitment || 0)}</div>
              <div style={s.badgeLabel}>Committed</div>
            </div>
            <div style={s.badge}>
              <div style={s.badgeNum}>{drop.reports?.length || 0}</div>
              <div style={s.badgeLabel}>Reports</div>
            </div>
          </div>
          <button style={s.btnG} onClick={() => window.open(`https://wa.me/?text=Your order is ready! Please contact me to arrange delivery.`)}>
            📣 Notify All Buyers
          </button>
          <button style={s.btnY} onClick={() => { navigator.clipboard.writeText(shareLink); alert('Copied!'); }}>
            📋 Copy Drop Link
          </button>
          <div style={s.divider} />
          <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '10px', fontWeight: '600' }}>COMMITTED BUYERS</p>
          {drop.buyers?.map((b, i) => (
            <div key={i} style={s.adminCard}>
              <p style={{ color: 'white', fontSize: '14px', margin: '0 0 2px' }}>👤 {b.name}</p>
              <p style={{ color: '#6B7280', fontSize: '12px', margin: 0 }}>📞 {b.phone}</p>
            </div>
          ))}
        </> : <p style={{ color: '#6B7280', textAlign: 'center' }}>Drop not found</p>}
      </div>
    </div>
  );

  // BUYER VIEW
  if (page === 'buyerView') return (
    <div style={s.page}>
      <div style={s.card}>
        {loading ? <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px 0' }}>Loading drop...</p> : drop ? <>
          {drop.frozen && <div style={s.frozen}>❄️ This drop has been frozen by admin</div>}
          <div style={s.tag}>🔥 Live Drop</div>
          <h1 style={s.title}>{drop.product}</h1>
          <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '16px', textAlign: 'center', lineHeight: '1.6' }}>{drop.description}</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={s.badge}>
              <div style={s.badgeNum}>₹{drop.price}</div>
              <div style={s.badgeLabel}>Price</div>
            </div>
            <div style={s.badge}>
              <div style={s.badgeNum}>{drop.buyers?.length || 0}</div>
              <div style={s.badgeLabel}>Interested</div>
            </div>
          </div>
          <div style={s.upiBox}>
            <div style={{ color: '#22C55E', fontWeight: '700', fontSize: '13px' }}>💰 Commitment Fee to Join</div>
            <div style={{ color: 'white', fontSize: '28px', fontWeight: '800', margin: '4px 0' }}>₹{drop.commitment || Math.round(drop.price * 0.2)}</div>
            <div style={{ color: '#6B7280', fontSize: '12px' }}>20% of total — shows your serious interest</div>
          </div>
          <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>
            By {drop.sellerName} · Deadline: {drop.deadline}
          </p>
          {buyerJoined ? (
            <div style={{ ...s.badge, border: '1px solid #22C55E', marginBottom: '12px' }}>
              <div style={{ color: '#22C55E', fontWeight: '800', fontSize: '16px' }}>✅ You're on the waitlist!</div>
              <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>Pay ₹{drop.commitment} via UPI to confirm your spot</div>
              <button style={{ ...s.btnG, marginTop: '12px', marginBottom: '0' }} onClick={() => window.open(`upi://pay?pa=dropwait@upi&pn=DropWait&am=${drop.commitment}&cu=INR&tn=Commitment for ${drop.product}`)}>
                Pay ₹{drop.commitment} via UPI ✅
              </button>
            </div>
          ) : !drop.frozen ? <>
            <input style={s.input} placeholder="Your Name" value={buyerName} onChange={e => setBuyerName(e.target.value)} />
            <input style={s.input} placeholder="Your Phone Number" type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} />
            <button style={s.btnY} onClick={joinWaitlist} disabled={loading}>
              {loading ? 'Joining...' : '🙋 I Want This!'}
            </button>
          </> : null}
          <div style={s.divider} />
          <button style={s.btnR} onClick={reportDrop}>🚨 Report this Drop</button>
        </> : <p style={{ color: '#6B7280', textAlign: 'center' }}>Drop not found</p>}
      </div>
    </div>
  );

  // ADMIN PANEL
  if (page === 'admin') return (
    <div style={{ ...s.page, alignItems: 'flex-start', paddingTop: '40px' }}>
      <div style={{ ...s.card, maxWidth: '600px' }}>
        <div style={s.nav}>
          <h2 style={{ color: '#FACC15', fontWeight: '800', fontSize: '20px', margin: 0 }}>👑 Admin Panel</h2>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #333', color: '#9CA3AF', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={s.badge}>
            <div style={s.badgeNum}>{allDrops.length}</div>
            <div style={s.badgeLabel}>Total Drops</div>
          </div>
          <div style={s.badge}>
            <div style={s.badgeNum}>{allDrops.reduce((a, d) => a + (d.buyers?.length || 0), 0)}</div>
            <div style={s.badgeLabel}>Total Buyers</div>
          </div>
          <div style={s.badge}>
            <div style={s.badgeNum}>{allDrops.filter(d => d.frozen).length}</div>
            <div style={s.badgeLabel}>Frozen</div>
          </div>
        </div>
        <button style={s.btnY} onClick={loadAllDrops} disabled={loading}>
          {loading ? 'Loading...' : '🔄 Refresh All Drops'}
        </button>
        <div style={s.divider} />
        {allDrops.map((d) => (
          <div key={d.id} style={{ ...s.adminCard, border: d.frozen ? '1px solid #EF4444' : d.reports?.length > 0 ? '1px solid #F59E0B' : '1px solid #2a2a2a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '15px', margin: '0 0 4px' }}>{d.product}</p>
                <p style={{ color: '#6B7280', fontSize: '12px', margin: '0 0 4px' }}>By {d.sellerName} · ₹{d.price}</p>
                <p style={{ color: '#6B7280', fontSize: '12px', margin: 0 }}>
                  👥 {d.buyers?.length || 0} buyers · 🚨 {d.reports?.length || 0} reports
                </p>
                {d.reports?.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    {d.reports.map((r, i) => (
                      <p key={i} style={{ color: '#F59E0B', fontSize: '11px', margin: '2px 0' }}>⚠️ Reported by {r.name}</p>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {d.frozen ? (
                  <button onClick={() => freezeDrop(d.id, false)} style={{ backgroundColor: '#22C55E', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                    ✅ Unfreeze
                  </button>
                ) : (
                  <button onClick={() => freezeDrop(d.id, true)} style={{ backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                    ❄️ Freeze
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}

export default App;