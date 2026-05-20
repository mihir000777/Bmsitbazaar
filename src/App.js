import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';

function App() {
  const [page, setPage] = useState('home');
  const [dropId, setDropId] = useState(null);
  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Seller form
  const [sellerName, setSellerName] = useState('');
  const [usn, setUsn] = useState('');
  const [product, setProduct] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');

  // Buyer form
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  // Check URL for drop ID
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/drop/')) {
      const id = path.replace('/drop/', '');
      setDropId(id);
      setPage('buyerView');
      loadDrop(id);
    }
  }, []);

  const loadDrop = async (id) => {
    setLoading(true);
    try {
      const ref = doc(db, 'drops', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setDrop({ id: snap.id, ...snap.data() });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const createDrop = async () => {
    if (!sellerName || !usn || !product || !price || !deadline) {
      alert('Please fill all fields!');
      return;
    }
    setLoading(true);
    try {
      const ref = await addDoc(collection(db, 'drops'), {
        sellerName,
        usn,
        product,
        description,
        price: Number(price),
        deadline,
        buyers: [],
        rating: 0,
        reports: 0,
        frozen: false,
        createdAt: Timestamp.now(),
      });
      setDropId(ref.id);
      setPage('sellerSuccess');
    } catch (e) {
      alert('Error creating drop. Try again.');
    }
    setLoading(false);
  };

  const joinWaitlist = async () => {
    if (!buyerName || !buyerPhone) {
      alert('Please fill your name and phone!');
      return;
    }
    setLoading(true);
    try {
      const ref = doc(db, 'drops', dropId);
      await updateDoc(ref, {
        buyers: arrayUnion({ name: buyerName, phone: buyerPhone, joinedAt: new Date().toISOString() })
      });
      setSuccess('joined');
      loadDrop(dropId);
    } catch (e) {
      alert('Error joining. Try again.');
    }
    setLoading(false);
  };

  const reportDrop = async () => {
    try {
      const ref = doc(db, 'drops', dropId);
      const snap = await getDoc(ref);
      const current = snap.data().reports || 0;
      await updateDoc(ref, { reports: current + 1, frozen: current + 1 >= 3 });
      alert('Drop reported. Thank you!');
    } catch (e) {
      alert('Error reporting.');
    }
  };

  const shareLink = 'https://dropwait.vercel.app/drop/' + dropId;

  // STYLES
  const s = {
    container: { backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' },
    card: { backgroundColor: '#111', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px', border: '1px solid #222' },
    title: { fontSize: '28px', fontWeight: 'bold', color: '#FACC15', marginBottom: '8px', textAlign: 'center' },
    subtitle: { color: '#9CA3AF', marginBottom: '24px', textAlign: 'center', fontSize: '14px' },
    input: { width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', padding: '12px', marginBottom: '12px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
    textarea: { width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', padding: '12px', marginBottom: '12px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box', minHeight: '80px' },
    btnYellow: { width: '100%', backgroundColor: '#FACC15', color: '#000', fontWeight: 'bold', padding: '14px', borderRadius: '10px', fontSize: '16px', border: 'none', cursor: 'pointer', marginBottom: '12px' },
    btnGreen: { width: '100%', backgroundColor: '#22C55E', color: '#fff', fontWeight: 'bold', padding: '14px', borderRadius: '10px', fontSize: '16px', border: 'none', cursor: 'pointer', marginBottom: '12px' },
    btnRed: { width: '100%', backgroundColor: '#EF4444', color: '#fff', fontWeight: 'bold', padding: '14px', borderRadius: '10px', fontSize: '16px', border: 'none', cursor: 'pointer', marginBottom: '12px' },
    btnGray: { width: '100%', backgroundColor: '#222', color: '#fff', fontWeight: 'bold', padding: '14px', borderRadius: '10px', fontSize: '16px', border: 'none', cursor: 'pointer', marginBottom: '12px' },
    linkBox: { backgroundColor: '#1a1a1a', border: '1px solid #FACC15', borderRadius: '10px', padding: '14px', marginBottom: '16px' },
    linkText: { color: '#FACC15', fontSize: '12px', wordBreak: 'break-all', textAlign: 'center' },
    badge: { backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', padding: '16px', marginBottom: '12px', textAlign: 'center' },
    badgeNum: { fontSize: '36px', fontWeight: 'bold', color: '#FACC15' },
    badgeLabel: { color: '#9CA3AF', fontSize: '13px' },
    tag: { display: 'inline-block', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '4px 10px', color: '#9CA3AF', fontSize: '12px', marginBottom: '16px' },
    frozen: { backgroundColor: '#1a1a1a', border: '1px solid #EF4444', borderRadius: '10px', padding: '16px', marginBottom: '16px', textAlign: 'center', color: '#EF4444', fontWeight: 'bold' },
  };

  // HOME PAGE
  if (page === 'home') return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={{ textAlign: 'center', fontSize: '48px', marginBottom: '8px' }}>🚀</div>
        <h1 style={s.title}>DropWait</h1>
        <p style={s.subtitle}>Validate demand before you make the product</p>
        <button style={s.btnYellow} onClick={() => setPage('createDrop')}>
          I'm a Seller — Create Drop ⚡
        </button>
        <div style={{ textAlign: 'center', color: '#555', fontSize: '12px', marginTop: '8px' }}>
          Trusted campus commerce. Verified sellers. Protected buyers.
        </div>
      </div>
    </div>
  );

  // CREATE DROP PAGE
  if (page === 'createDrop') return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.title}>Create Your Drop 📦</h1>
        <p style={s.subtitle}>Fill details — buyers will see this page</p>
        <input style={s.input} placeholder="Your Name" value={sellerName} onChange={e => setSellerName(e.target.value)} />
        <input style={s.input} placeholder="Your USN (e.g. 1BM22CS001)" value={usn} onChange={e => setUsn(e.target.value)} />
        <input style={s.input} placeholder="Product Name" value={product} onChange={e => setProduct(e.target.value)} />
        <textarea style={s.textarea} placeholder="Description (what are you selling?)" value={description} onChange={e => setDescription(e.target.value)} />
        <input style={s.input} placeholder="Price (₹)" type="number" value={price} onChange={e => setPrice(e.target.value)} />
        <input style={s.input} placeholder="Delivery Deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        <button style={s.btnYellow} onClick={createDrop} disabled={loading}>
          {loading ? 'Creating...' : 'Launch My Drop 🚀'}
        </button>
        <button style={s.btnGray} onClick={() => setPage('home')}>Back</button>
      </div>
    </div>
  );

  // SELLER SUCCESS PAGE
  if (page === 'sellerSuccess') return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={{ textAlign: 'center', fontSize: '48px', marginBottom: '8px' }}>🎉</div>
        <h1 style={s.title}>Drop is Live!</h1>
        <p style={s.subtitle}>Share this link with potential buyers:</p>
        <div style={s.linkBox}>
          <p style={s.linkText}>{shareLink}</p>
        </div>
        <button style={s.btnYellow} onClick={() => { navigator.clipboard.writeText(shareLink); alert('Link copied!'); }}>
          Copy Link 📋
        </button>
        <button style={s.btnGreen} onClick={() => window.open('https://wa.me/?text=Check out my drop on DropWait! ' + shareLink)}>
          Share on WhatsApp 💬
        </button>
        <button style={s.btnGray} onClick={() => { setPage('sellerDashboard'); loadDrop(dropId); }}>
          View My Dashboard 📊
        </button>
      </div>
    </div>
  );

  // SELLER DASHBOARD
  if (page === 'sellerDashboard') return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.title}>Live Dashboard 📊</h1>
        {loading ? <p style={{ color: '#9CA3AF', textAlign: 'center' }}>Loading...</p> : drop ? (
          <>
            <p style={{ color: '#FACC15', fontWeight: 'bold', marginBottom: '4px' }}>{drop.product}</p>
            <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '16px' }}>₹{drop.price} · Deadline: {drop.deadline}</p>
            <div style={s.badge}>
              <div style={s.badgeNum}>{drop.buyers ? drop.buyers.length : 0}</div>
              <div style={s.badgeLabel}>Buyers Want This</div>
            </div>
            {drop.frozen && <div style={s.frozen}>⚠️ This drop has been frozen due to reports</div>}
            <button style={s.btnGreen} onClick={() => window.open('https://wa.me/?text=Your order is ready! Please contact me to arrange delivery.')}>
              Notify All Buyers 📣
            </button>
            <button style={s.btnYellow} onClick={() => { navigator.clipboard.writeText(shareLink); alert('Link copied!'); }}>
              Copy Drop Link 📋
            </button>
            <div style={{ marginTop: '8px' }}>
              {drop.buyers && drop.buyers.map((b, i) => (
                <div key={i} style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
                  <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>👤 {b.name}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0 }}>📞 {b.phone}</p>
                </div>
              ))}
            </div>
          </>
        ) : <p style={{ color: '#9CA3AF', textAlign: 'center' }}>Drop not found</p>}
      </div>
    </div>
  );

  // BUYER VIEW PAGE
  if (page === 'buyerView') return (
    <div style={s.container}>
      <div style={s.card}>
        {loading ? <p style={{ color: '#9CA3AF', textAlign: 'center' }}>Loading drop...</p> : drop ? (
          <>
            {drop.frozen && <div style={s.frozen}>⚠️ This drop has been frozen due to reports</div>}
            <div style={s.tag}>🔥 Live Drop</div>
            <h1 style={s.title}>{drop.product}</h1>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{drop.description}</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ ...s.badge, flex: 1 }}>
                <div style={s.badgeNum}>₹{drop.price}</div>
                <div style={s.badgeLabel}>Price</div>
              </div>
              <div style={{ ...s.badge, flex: 1 }}>
                <div style={s.badgeNum}>{drop.buyers ? drop.buyers.length : 0}</div>
                <div style={s.badgeLabel}>Interested</div>
              </div>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>
              By {drop.sellerName} · USN: {drop.usn} · Deadline: {drop.deadline}
            </p>
            {success === 'joined' ? (
              <div style={{ ...s.badge, border: '1px solid #22C55E' }}>
                <div style={{ color: '#22C55E', fontWeight: 'bold' }}>✅ You're on the waitlist!</div>
                <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '4px' }}>Seller will contact you when ready</div>
              </div>
            ) : !drop.frozen ? (
              <>
                <input style={s.input} placeholder="Your Name" value={buyerName} onChange={e => setBuyerName(e.target.value)} />
                <input style={s.input} placeholder="Your Phone Number" type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} />
                <button style={s.btnYellow} onClick={joinWaitlist} disabled={loading}>
                  {loading ? 'Joining...' : 'I Want This! 🙋'}
                </button>
              </>
            ) : null}
            <button style={s.btnRed} onClick={reportDrop}>🚨 Report Scam</button>
          </>
        ) : <p style={{ color: '#9CA3AF', textAlign: 'center' }}>Drop not found</p>}
      </div>
    </div>
  );

  return null;
}

export default App;