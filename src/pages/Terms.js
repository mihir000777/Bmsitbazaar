import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Terms() {
  const navigate = useNavigate();
  const sections = [
    { title: '1. Eligibility', body: 'BMSIT Bazaar is exclusively available to students and staff with a verified @bmsit.in institutional email address. By creating an account, you confirm you are a current member of the BMSIT community.' },
    { title: '2. Listings', body: 'Sellers are responsible for the accuracy of their listings. All items must be legal, campus-appropriate, and accurately described. Prohibited items include weapons, controlled substances, counterfeit goods, and anything that violates BMSIT\'s code of conduct. Listings are reviewed by admin before going live.' },
    { title: '3. Unlock Fee', body: 'Buyers pay a non-refundable ₹10 unlock fee per listing to access seller contact details. This fee is processed securely via Razorpay. The fee is used to maintain the platform and filter out non-serious inquiries.' },
    { title: '4. Transactions', body: 'BMSIT Bazaar is a platform that connects buyers and sellers. We do not handle the actual exchange of goods or money beyond the unlock fee. All transactions between buyers and sellers are conducted independently. We are not liable for disputes arising from these transactions.' },
    { title: '5. User Conduct', body: 'Users must interact respectfully. Harassment, spam, fraudulent listings, or any behavior that disrupts the community will result in immediate account suspension. Report violations using the "Report listing" feature.' },
    { title: '6. Privacy', body: 'Seller contact information (phone, email) is only revealed to buyers who have paid the unlock fee. We do not sell or share your personal data with third parties. See our Privacy Policy for full details.' },
    { title: '7. Modifications', body: 'BMSIT Bazaar reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.' },
    { title: '8. Disclaimer', body: 'BMSIT Bazaar is a student-run platform. We make no warranties about the quality, safety, or legality of items listed. Use the platform at your own discretion.' },
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
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Terms of Trade</h1>
        <p style={{ color: '#9a9078', marginBottom: 8, fontSize: 14 }}>Last updated: January 2026</p>
        <p style={{ color: '#d1c6ab', marginBottom: 48, fontSize: 16, lineHeight: 1.7 }}>
          By using BMSIT Bazaar, you agree to the following terms. Please read them carefully.
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
