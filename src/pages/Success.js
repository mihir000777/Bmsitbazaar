import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StitchFooter } from '../components/StitchNav';

export default function Success() {
  const navigate = useNavigate();
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowIcon(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Generate a fake order ID
  const orderId = `BMS-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 900 + 100)}`;

  return (
    <div className="bg-surface-container-lowest min-h-screen flex flex-col font-body-md text-on-surface antialiased">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] -z-10 opacity-15 bg-primary-container pointer-events-none"></div>
      <div className="fixed bottom-[5%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[120px] -z-10 opacity-15 bg-secondary-container pointer-events-none"></div>

      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-gutter relative z-10">
        <div className="max-w-xl w-full flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="relative mb-base mb-6 flex items-center justify-center">
            <div className="absolute w-32 h-32 bg-primary-container/20 rounded-full blur-2xl" style={{ animation: 'pulse 3s infinite ease-in-out' }}></div>
            <div className="glass-panel w-24 h-24 rounded-full flex items-center justify-center border-primary-container/30 relative z-20 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
              <span
                className="material-symbols-outlined text-primary-container text-5xl"
                style={{
                  fontVariationSettings: "'FILL' 1",
                  opacity: showIcon ? 1 : 0,
                  transform: showIcon ? 'scale(1)' : 'scale(0.5)',
                  transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                check_circle
              </span>
            </div>
          </div>

          <h1 className="font-syne text-display-lg text-primary-container mb-4 tracking-tighter">
            Transaction Successful
          </h1>
          <p className="font-outfit text-body-lg text-on-surface-variant max-w-md mx-auto mb-10">
            Your payment has been received. Admin will verify it shortly and the seller's contact will be unlocked.
          </p>

          {/* Details Card */}
          <div className="glass-panel w-full rounded-xl p-gutter p-6 mb-12 text-left">
            <div className="flex justify-between items-center mb-6">
              <span className="font-outfit text-label-md text-on-surface-variant">Order ID</span>
              <span className="font-outfit text-label-md text-primary-container">#{orderId}</span>
            </div>
            <div className="flex items-center gap-4 border-t border-white/5 pt-6">
              <div className="w-16 h-16 rounded-lg bg-surface-container-highest overflow-hidden flex items-center justify-center text-3xl">
                ✓
              </div>
              <div>
                <h4 className="font-syne text-headline-md">Payment Recorded</h4>
                <p className="font-outfit text-label-sm text-on-surface-variant uppercase tracking-widest mt-1">Awaiting admin verification</p>
              </div>
              <div className="ml-auto text-right">
                <div className="flex items-center gap-1 justify-end text-secondary">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span className="font-outfit text-label-sm">Secured</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <button
              onClick={() => navigate('/myads')}
              className="flex-1 bg-primary-container text-on-primary-container font-syne text-headline-md py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex-1 border border-white/10 text-on-surface font-syne text-headline-md py-4 rounded-xl font-semibold hover:bg-white/5 active:scale-95 transition-all duration-300"
            >
              Back to Marketplace
            </button>
          </div>

          <p className="mt-12 font-outfit text-label-sm text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">info</span>
            A confirmation email has been sent to {`{your email}`}.
          </p>
        </div>
      </main>

      <StitchFooter />
    </div>
  );
}
