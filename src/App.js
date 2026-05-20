import React, { useState } from 'react';
import './App.css';

function App() {
  const [step, setStep] = useState('home');
  const [sellerName, setSellerName] = useState('');
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [upi, setUpi] = useState('');
  const [link, setLink] = useState('');

  const createWaitlist = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setLink('dropwait.vercel.app/wait/' + id);
    setStep('success');
  };

  return (
    <div style={styles.container}>
      {step === 'home' && (
        <div style={styles.card}>
          <h1 style={styles.title}>DropWait 🚀</h1>
          <p style={styles.subtitle}>Create a waitlist & collect UPI payments in 60 seconds</p>

          <input
            style={styles.input}
            placeholder="Your Name / Shop Name"
            value={sellerName}
            onChange={function(e){ setSellerName(e.target.value); }}
          />
          <input
            style={styles.input}
            placeholder="What are you selling?"
            value={product}
            onChange={function(e){ setProduct(e.target.value); }}
          />
          <input
            style={styles.input}
            placeholder="Price (₹)"
            value={price}
            onChange={function(e){ setPrice(e.target.value); }}
          />
          <input
            style={styles.input}
            placeholder="Your UPI ID (ex: name@upi)"
            value={upi}
            onChange={function(e){ setUpi(e.target.value); }}
          />

          <button style={styles.btnYellow} onClick={createWaitlist}>
            Create My Waitlist ⚡
          </button>
        </div>
      )}

      {step === 'success' && (
        <div style={styles.card}>
          <div style={styles.emoji}>🎉</div>
          <h2 style={styles.title}>Your Waitlist is Live!</h2>
          <p style={styles.subtitle}>Share this link with your buyers:</p>

          <div style={styles.linkBox}>
            <p style={styles.linkText}>{link}</p>
          </div>

          <button
            style={styles.btnYellow}
            onClick={function(){ navigator.clipboard.writeText(link); alert('Link copied!'); }}
          >
            Copy Link 📋
          </button>

          <button
            style={styles.btnGreen}
            onClick={function(){ window.open('https://wa.me/?text=Join my waitlist: ' + link); }}
          >
            Share on WhatsApp 💬
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#000',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    border: '1px solid #222',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#FACC15',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#9CA3AF',
    marginBottom: '28px',
    textAlign: 'center',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '14px',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    display: 'block',
  },
  btnYellow: {
    width: '100%',
    backgroundColor: '#FACC15',
    color: '#000',
    fontWeight: 'bold',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '12px',
    display: 'block',
  },
  btnGreen: {
    width: '100%',
    backgroundColor: '#22C55E',
    color: '#fff',
    fontWeight: 'bold',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    display: 'block',
  },
  linkBox: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #FACC15',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '20px',
  },
  linkText: {
    color: '#FACC15',
    fontSize: '13px',
    wordBreak: 'break-all',
    textAlign: 'center',
  },
  emoji: {
    fontSize: '60px',
    textAlign: 'center',
    marginBottom: '16px',
  },
};

export default App;