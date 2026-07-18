import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Support() {
  const navigate = useNavigate();
  const faqs = [
    { q: 'How do I unlock a seller\'s contact?', a: 'Click "Unlock Contact" on any listing and pay ₹10 via Razorpay. Once payment is confirmed, the seller\'s phone and email are revealed instantly.' },
    { q: 'Why is there a ₹10 unlock fee?', a: 'The fee filters out spam and ensures only serious buyers contact sellers. It keeps the marketplace clean and high-quality for everyone.' },
    { q: 'How do I post a listing?', a: 'Sign in with your @bmsit.in email, click "Sell" or the + button, fill in your item details, upload at least 1 photo, and submit for admin review. Listings go live within 2-4 hours.' },
    { q: 'My listing was rejected. What do I do?', a: 'Listings are rejected if they violate our guidelines (prohibited items, poor photos, misleading descriptions). Edit your listing and resubmit.' },
    { q: 'Can I edit or remove my listing?', a: 'Yes. Go to Dashboard → My Listings, then click Edit or Remove on any listing.' },
    { q: 'Who can use BMSIT Bazaar?', a: 'Only students and staff with a verified @bmsit.in email address. This keeps the marketplace exclusive and safe.' },
    { q: 'What if a seller doesn\'t respond?', a: 'Try messaging them via WhatsApp using the unlocked number. If there\'s no response within 48 hours, flag the listing for admin review.' },
    { q: 'How do I report a suspicious listing?', a: 'Open the listing and click "Report listing" at the bottom. Our admin team reviews all reports within 24 hours.' },
  ];

  return (
    <div style={{ background: '#09090b', minHeight: '100vh', color: '#e5e1e4', fontFamily: 'Outfit, sans-serif' }}>
      {/* Nav */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Logo size={36} onClick={() => navigate('/')} />
        <button onClick={() => navigate(-1)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d1c6ab', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 13 }}>
          ← Back
        </button>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Support</h1>
        <p style={{ color: '#9a9078', marginBottom: 48, fontSize: 16 }}>Get help with BMSIT Bazaar. We're here for you.</p>

        {/* Contact */}
        <div style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 16, padding: 28, marginBottom: 48, display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <span className="material-symbols-outlined" style={{ color: '#facc15', fontSize: 32 }}>support_agent</span>
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Contact Admin</h3>
            <p style={{ color: '#d1c6ab', marginBottom: 12 }}>For urgent issues, reach out directly to the BMSIT Bazaar admin team.</p>
            <a href="mailto:support@bmsitbazaar.com" style={{ color: '#facc15', fontWeight: 600, textDecoration: 'none' }}>support@bmsitbazaar.com</a>
          </div>
        </div>

        {/* FAQs */}
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, i) => (
            <details key={i} style={{ background: 'rgba(24,24,27,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px' }}>
              <summary style={{ fontWeight: 600, cursor: 'pointer', fontSize: 15, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {faq.q}
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#facc15' }}>expand_more</span>
              </summary>
              <p style={{ marginTop: 12, color: '#d1c6ab', lineHeight: 1.7, fontSize: 14 }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 40px', textAlign: 'center', color: '#9a9078', fontSize: 13 }}>
        © 2026 BMSIT BAZAAR. For students, by students.
      </footer>
    </div>
  );
}
