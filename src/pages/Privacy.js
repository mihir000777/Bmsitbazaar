import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Privacy() {
  const navigate = useNavigate();
  const sections = [
    { title: 'What We Collect', body: 'We collect your institutional email address, name (optional), USN (optional), and phone number (only when you post a listing). We also collect listing data including photos, descriptions, and prices.' },
    { title: 'How We Use It', body: 'Your email is used for authentication and verification. Your listing contact details (phone/email) are only revealed to buyers who pay the ₹10 unlock fee. We do not use your data for advertising or sell it to third parties.' },
    { title: 'Data Storage', body: 'All data is stored securely on Google Firebase. Images are hosted on Cloudinary. Payments are processed by Razorpay — we do not store payment card details.' },
    { title: 'Who Can See Your Data', body: 'Your contact details are hidden by default. Only buyers who pay the unlock fee can see your phone and email. Your listing title, price, photos, and description are visible to all logged-in BMSIT users.' },
    { title: 'Your Rights', body: 'You can delete your listings at any time from your dashboard. To request full account deletion and data removal, email us at support@bmsitbazaar.com.' },
    { title: 'Cookies', body: 'We use session cookies for authentication only. We do not use tracking or advertising cookies.' },
    { title: 'Changes', body: 'We may update this policy periodically. Continued use of the platform after changes means you accept the updated policy.' },
  ];

  return (
    <div style={{ background: '#09090b', minHeight: '100vh', color: '#e5e1e4', fontFamily: 'Outfit, sans-serif' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Logo size={36} onClick={() => navigate('/')} />
        <button onClick={() => navigate(-1)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d1c6ab', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 13 }}>
          ← Back
        </button>
      </header>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: '#9a9078', marginBottom: 8, fontSize: 14 }}>Last updated: January 2026</p>
        <p style={{ color: '#d1c6ab', marginBottom: 48, fontSize: 16, lineHeight: 1.7 }}>
          Your privacy matters. Here's exactly what data we collect and how we use it.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {sections.map((s, i) => (
            <div key={i}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#facc15', marginBottom: 10 }}>{s.title}</h2>
              <p style={{ color: '#d1c6ab', lineHeight: 1.8, fontSize: 15 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </main>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 40px', textAlign: 'center', color: '#9a9078', fontSize: 13 }}>
        © 2026 BMSIT BAZAAR. For students, by students.
      </footer>
    </div>
  );
}
