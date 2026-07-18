import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, addDoc, collection, increment, arrayUnion, Timestamp, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { ICON } from '../constants/theme';
import StitchNav, { StitchFooter, MobileBottomNav } from '../components/StitchNav';
import { openRazorpay } from '../utils/razorpay';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [unlockStep, setUnlockStep] = useState('idle');
  const [copied, setCopied] = useState('');
  const [busy, setBusy] = useState(false);
  const [unlockedState, setUnlockedState] = useState(false);
  const [buyerCoords, setBuyerCoords] = useState({ lat: null, lng: null });
  const [deliveryRequested, setDeliveryRequested] = useState(false);

  const getPlatformFee = (price) => {
    const p = Number(price) || 0;
    if (p < 100) return 10;
    if (p <= 500) return 20;
    if (p <= 1000) return 30;
    return 40;
  };

  const activeFee = ad ? getPlatformFee(ad.price) : 10;
  const totalFee = activeFee + (deliveryRequested ? 20 : 0);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => { loadAd(); }, [id]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBuyerCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation denied or unavailable for buyer.', error);
        }
      );
    }
  }, []);

  const loadAd = async () => {
    try {
      const snap = await getDoc(doc(db, 'ads', id));
      if (snap.exists()) {
        setAd({ id: snap.id, ...snap.data() });
      } else {
        navigate('/marketplace');
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const startConvo = async () => {
    if (!ad?.sellerEmail || ad.sellerEmail === currentUser?.email) return;
    try {
      const convoId = [currentUser.email, ad.sellerEmail, ad.id].sort().join('_').replace(/[@.]/g, '_');
      await setDoc(doc(db, 'conversations', convoId), {
        participants: [currentUser.email, ad.sellerEmail],
        adId: ad.id,
        adTitle: ad.title,
        createdAt: Timestamp.now(),
      }, { merge: true });
      navigate('/messages');
    } catch (e) { console.error(e); }
  };

  const copyText = (t) => {
    navigator.clipboard.writeText(t).then(() => {
      setCopied(t);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleRazorpayPayment = async () => {
    setBusy(true);
    setUnlockStep('processing');

    openRazorpay({
      amount: totalFee,
      name: 'BMSIT Bazaar',
      description: `Unlock & delivery fee for: ${ad.title}`,
      email: currentUser?.email,
      onSuccess: async (response) => {
        try {
          // Mark this buyer as unlocked
          await updateDoc(doc(db, 'ads', ad.id), {
            unlocks: increment(1),
            unlockedBuyers: arrayUnion(currentUser.email),
          });
          // Record the transaction
          await addDoc(collection(db, 'transactions'), {
            buyerEmail: currentUser.email,
            sellerEmail: ad.sellerEmail,
            adId: ad.id,
            adTitle: ad.title,
            amount: totalFee,
            deliveryRequested: deliveryRequested,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || '',
            signature: response.razorpay_signature || '',
            status: 'verified',
            paymentMethod: 'razorpay',
            createdAt: Timestamp.now(),
          });
          setUnlockedState(true);
          setUnlockStep('idle');
          // Refresh the ad to get updated unlockedBuyers
          loadAd();
        } catch (e) {
          console.error(e);
          alert('Payment succeeded but unlock failed. Please contact support.');
        }
        setBusy(false);
      },
      onFailure: (err) => {
        console.error('Payment failed:', err);
        setUnlockStep('idle');
        setBusy(false);
        if (err.error && err.error !== 'Payment cancelled.') {
          alert(err.description || err.error || 'Payment failed. Please try again.');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="bg-[#09090b] min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary-container text-5xl">progress_activity</span>
      </div>
    );
  }

  if (!ad) return null;

  const isMine = ad.sellerId === currentUser?.uid;
  const isUnlocked = unlockedState || isMine || (ad.unlockedBuyers || []).includes(currentUser?.email);
  const imgs = ad.images || [];

  return (
    <div className="bg-[#09090b] text-on-surface min-h-screen font-body-md pb-24 md:pb-0">
      {/* Background Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[120px] -z-10 opacity-15 bg-background-accent pointer-events-none"></div>
      <div className="fixed bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] -z-10 opacity-15 bg-primary-container pointer-events-none"></div>

      <StitchNav active="browse" />

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-xl animate-fadeUp"
        >
          <img src={imgs[lightbox]} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg border border-white/10" />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 bg-white/10 text-white rounded w-11 h-11 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      <main className="pt-28 pb-12 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 md:mb-8 text-on-surface-variant font-outfit text-label-sm overflow-x-auto no-scrollbar">
          <span onClick={() => navigate('/marketplace')} className="hover:text-primary-container cursor-pointer whitespace-nowrap">Marketplace</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span onClick={() => navigate(`/categories/${ad.category}`)} className="hover:text-primary-container cursor-pointer whitespace-nowrap">{ad.category?.toUpperCase()}</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary-container font-bold whitespace-nowrap truncate">{ad.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left - Images & Info */}
          <div className="lg:col-span-8 space-y-6">
            {/* Gallery */}
            {imgs.length > 0 ? (
              <div className="space-y-4">
                <div
                  onClick={() => setLightbox(imgIdx)}
                  className="rounded-lg overflow-hidden bg-surface-container-low border border-white/5 cursor-zoom-in aspect-video relative group"
                >
                  <img
                    src={imgs[imgIdx]}
                    alt={ad.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                {imgs.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {imgs.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border transition-all ${
                          i === imgIdx ? 'border-primary-container grayscale-0' : 'border-white/5 grayscale hover:grayscale-0'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-surface-container-low rounded-lg border border-white/5 flex items-center justify-center text-9xl">
                {ICON[ad.category]}
              </div>
            )}

            {/* Details Card */}
            <div className="glass-panel rounded-xl p-6 md:p-8">
              <div className="flex gap-2 flex-wrap mb-6">
                <div className="px-3 py-1 bg-secondary/20 text-secondary border border-secondary/30 text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-1.5 font-outfit">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full" style={{ animation: 'ping-anim 1.5s infinite' }}></span>
                  Live
                </div>
                <div className="px-3 py-1 bg-white/5 text-on-surface-variant border border-white/10 text-[10px] font-bold uppercase tracking-widest rounded font-outfit">
                  {ICON[ad.category]} {ad.category?.toUpperCase()}
                </div>
              </div>
              <h1 className="font-syne text-headline-lg md:text-display-lg text-on-surface tracking-tight leading-tight mb-4">
                {ad.title}
              </h1>
              <div className="font-syne text-display-lg text-primary-container tracking-tight mb-4">
                ₹{ad.price}
              </div>
              <div className="flex gap-4 flex-wrap mb-8 text-on-surface-variant font-outfit text-label-md">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary-container">history</span>
                  <span>Product Age: <strong className="text-on-surface ml-1">{ad.productAge || 'N/A'}</strong></span>
                </div>
              </div>
              <p className="text-on-surface-variant text-body-lg leading-relaxed whitespace-pre-line font-outfit">
                {ad.description || 'No description provided.'}
              </p>
              {ad.videoUrl && (
                <div className="mt-8 space-y-3">
                  <h4 className="font-outfit text-label-md text-primary-container uppercase tracking-widest">Verification Video</h4>
                  <div className="rounded-lg overflow-hidden border border-white/5 bg-surface-container-low max-w-lg aspect-video">
                    <video src={ad.videoUrl} controls className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {ad.deadline && (
                <div className="mt-8 glass-panel rounded p-4 flex items-center gap-3 text-label-md text-on-surface-variant font-outfit">
                  <span className="material-symbols-outlined text-primary-container">calendar_today</span>
                  <span>Available until: <strong className="text-on-surface ml-1">{ad.deadline}</strong></span>
                </div>
              )}
            </div>

            {!isMine && (
              <button
                onClick={() => {
                  if (window.confirm('Flag this listing for admin review?')) {
                    updateDoc(doc(db, 'ads', ad.id), {
                      flagged: true,
                      flags: arrayUnion({ by: currentUser.email, at: new Date().toISOString() })
                    }).then(() => {
                      alert('Flagged. Admin will review.');
                      navigate('/marketplace');
                    });
                  }
                }}
                className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors font-outfit text-label-md"
              >
                <span className="material-symbols-outlined">flag</span> Report listing
              </button>
            )}
          </div>

          {/* Right - Unlock Panel (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <div className="glass-panel rounded-xl p-6 md:p-8 space-y-6">
              <h3 className="font-outfit text-label-md uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">person</span> Seller Contact
              </h3>

              {isMine ? (
                <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-6 text-center">
                  <span className="material-symbols-outlined text-secondary text-4xl mb-2 block">verified_user</span>
                  <p className="text-secondary font-bold font-outfit text-label-md uppercase">Your Listing</p>
                  <p className="text-on-surface-variant text-label-sm mt-2 font-outfit">
                    You posted this. Edit or remove from your dashboard.
                  </p>
                  <button
                    onClick={() => navigate('/post', { state: { ad } })}
                    className="w-full mt-4 bg-primary-container text-on-primary-container font-syne font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all"
                  >
                    Edit Listing
                  </button>
                </div>
              ) : isUnlocked ? (
                <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-2 text-secondary font-bold font-outfit text-label-md uppercase">
                    <span className="material-symbols-outlined">lock_open</span> Unlocked
                  </div>
                  {[
                    { label: 'Phone', val: ad.sellerPhone, icon: 'phone' },
                    { label: 'Email', val: ad.sellerEmail, icon: 'mail' },
                  ].filter(f => f.val).map((f, i) => (
                    <div key={i} className="pb-3 border-b border-white/5 last:border-none">
                      <span className="text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1 font-outfit">{f.label}</span>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-body-md font-bold text-on-surface flex items-center gap-2 font-outfit truncate">
                          <span className="material-symbols-outlined text-primary-container text-[18px]">{f.icon}</span>
                          {f.val}
                        </span>
                        <button
                          onClick={() => copyText(f.val)}
                          className="bg-white/5 hover:bg-white/10 border border-white/5 text-on-surface-variant px-2 py-1 rounded text-[9px] font-bold uppercase font-outfit flex-shrink-0"
                        >
                          {copied === f.val ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {ad.sellerPhone && (
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => window.open(`https://wa.me/91${ad.sellerPhone.replace(/\D/g, '')}?text=Hi! I'm interested in your listing "${ad.title}" on BMSIT Bazaar.`)}
                        className="w-full bg-secondary-container text-on-secondary-container font-syne font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(78,222,163,0.3)] transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined">chat</span> WhatsApp
                      </button>
                      <button
                        onClick={startConvo}
                        className="w-full border border-white/10 text-on-surface font-syne font-semibold py-3 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined">forum</span> In-App Message
                      </button>
                    </div>
                  )}
                </div>
              ) : unlockStep === 'processing' ? (
                <div className="bg-primary-container/5 border border-primary-container/20 rounded-lg p-8 text-center space-y-4">
                  <span className="material-symbols-outlined text-primary-container text-5xl animate-spin">progress_activity</span>
                  <h4 className="font-syne font-bold text-on-surface text-headline-md">Processing Payment</h4>
                  <p className="text-on-surface-variant text-label-sm font-outfit">
                    Complete the payment in the Razorpay window.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Locked state */}
                  <div className="bg-surface-container-lowest border border-white/5 rounded-lg p-6 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                    </div>
                    <p className="text-on-surface-variant font-outfit text-label-md">
                      Contact info is hidden. Pay ₹{totalFee} to unlock.
                    </p>
                  </div>

                  {/* Unlock CTA - Razorpay */}
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={busy}
                    className="w-full bg-primary-container text-on-primary-container font-syne font-bold py-4 rounded-lg hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">lock_open</span>
                    Unlock Contact {deliveryRequested ? ' + Delivery' : ''} (₹{totalFee})
                  </button>

                  {/* Razorpay Trust Badge */}
                  <div className="flex items-center justify-center gap-2 text-on-surface-variant font-outfit text-label-sm">
                    <span className="material-symbols-outlined text-secondary text-[16px]">verified_user</span>
                    <span>Secured by Razorpay</span>
                  </div>
                </div>
              )}

              {/* Geolocation Delivery Service Panel */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <h3 className="font-outfit text-label-md uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">local_shipping</span> Delivery Option
                </h3>
                {buyerCoords.lat === null ? (
                  <div className="bg-white/5 border border-white/5 rounded-lg p-3 text-[11px] font-outfit text-on-surface-variant">
                    ⚠️ Enable location access to check doorstep delivery eligibility.
                  </div>
                ) : (() => {
                  const BMSIT_LAT = 13.13406;
                  const BMSIT_LNG = 77.56844;
                  const sDist = calculateDistance(ad.sellerLat || BMSIT_LAT, ad.sellerLng || BMSIT_LNG, BMSIT_LAT, BMSIT_LNG);
                  const bDist = calculateDistance(buyerCoords.lat, buyerCoords.lng, BMSIT_LAT, BMSIT_LNG);
                  const eligible = sDist !== null && bDist !== null && sDist <= 5.0 && bDist <= 5.0;

                  return eligible ? (
                    <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4 space-y-3">
                      <div className="text-secondary font-bold font-outfit text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Eligible for Campus Delivery
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-outfit leading-relaxed">
                        Both you and the seller are within a 5km radius of BMSIT. We can deliver it to your doorstep for a small extra convenience fee!
                      </p>
                      <label className="flex items-center gap-2.5 cursor-pointer select-none font-outfit text-label-sm text-on-surface font-semibold pt-1">
                        <input
                          type="checkbox"
                          checked={deliveryRequested}
                          onChange={(e) => setDeliveryRequested(e.target.checked)}
                          className="w-4 h-4 rounded border-white/10 bg-[#09090b] text-brand-yellow focus:ring-0 accent-brand-yellow cursor-pointer"
                        />
                        Request Delivery (+₹20 Fee)
                      </label>
                    </div>
                  ) : (
                    <div className="bg-brand-error/5 border border-brand-error/10 rounded-lg p-4">
                      <div className="text-brand-error font-bold font-outfit text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">cancel</span> Delivery Unavailable
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-outfit leading-relaxed mt-1">
                        Delivery is restricted to a 5km radius from BMSIT. Please contact the seller directly for on-campus handover.
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Trust card */}
              <div className="border-t border-white/5 pt-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">shield</span>
                  <div>
                    <p className="font-outfit text-label-md text-on-surface">Verified Student</p>
                    <p className="font-outfit text-label-sm text-on-surface-variant">From the BMSIT campus network. Identity verified by admin.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav />
      <StitchFooter />
    </div>
  );
}
