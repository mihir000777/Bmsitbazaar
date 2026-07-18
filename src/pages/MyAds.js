import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { UNLOCK_FEE, ICON } from '../constants/theme';
import StitchNav, { StitchFooter, MobileBottomNav } from '../components/StitchNav';

export default function MyAds() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');

  useEffect(() => {
    if (currentUser) loadMine(currentUser.uid);
  }, [currentUser]);

  const loadMine = async (uid) => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'ads'));
      setMyAds(snap.docs.filter(d => d.data().sellerId === uid).map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    await updateDoc(doc(db, 'ads', id), { status: 'removed' });
    loadMine(currentUser.uid);
  };

  const needsPriceDrop = (ad) => {
    if (ad.status !== 'approved') return false;
    const createdAt = ad.createdAt?.seconds ? ad.createdAt.seconds * 1000 : null;
    const updatedAt = ad.updatedAt?.seconds ? ad.updatedAt.seconds * 1000 : null;
    const referenceTime = updatedAt || createdAt;
    if (!referenceTime) return false;
    const diffTime = Date.now() - referenceTime;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays > 5;
  };

  const promptPriceDrop = async (ad) => {
    const newPriceStr = window.prompt(`Enter new reduced price for "${ad.title}" (current price: ₹${ad.price}):`, Math.round(ad.price * 0.9));
    if (newPriceStr === null) return;
    const newPrice = Number(newPriceStr);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert('Please enter a valid price.');
      return;
    }
    if (newPrice >= ad.price) {
      alert('New price must be lower than the current price to clear the 5-day warning.');
      return;
    }
    try {
      await updateDoc(doc(db, 'ads', ad.id), {
        price: newPrice,
        updatedAt: Timestamp.now()
      });
      alert('Price reduced successfully! Listing refreshed.');
      loadMine(currentUser.uid);
    } catch (e) {
      console.error(e);
      alert('Error updating price.');
    }
  };

  const totalUnlocks = myAds.reduce((a, p) => a + (p.unlocks || 0), 0);
  const totalEarned = totalUnlocks * UNLOCK_FEE;
  const liveCount = myAds.filter(a => a.status === 'approved').length;
  const pendingCount = myAds.filter(a => a.status === 'pending').length;

  const userName = currentUser?.email?.split('@')[0] || 'User';
  const userInitial = userName[0]?.toUpperCase() || 'U';

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] -z-10 opacity-15 bg-primary-container pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] -z-10 opacity-15 bg-background-accent pointer-events-none"></div>

      <StitchNav active="activity" />

      <main className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop pt-32 pb-12">
        {/* Stale Ads Warning Banner */}
        {myAds.filter(needsPriceDrop).length > 0 && (
          <div className="mb-8 p-6 bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeUp">
            <div className="space-y-1">
              <h3 className="font-syne font-bold text-md text-brand-yellow flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                ACTION REQUIRED: PRICE DECAY REMINDER
              </h3>
              <p className="text-brand-on-surface-variant font-outfit text-label-md">
                Your listings below have been active for more than 5 days. Consider reducing the price to boost visibility and prompt campus buyers:
              </p>
              <div className="flex gap-3 flex-wrap pt-2">
                {myAds.filter(needsPriceDrop).map(ad => (
                  <div key={ad.id} className="bg-black/40 border border-white/5 px-3 py-1.5 rounded-lg font-outfit text-label-sm flex items-center gap-3">
                    <span className="text-brand-on-surface">{ad.title} (₹{ad.price})</span>
                    <button
                      onClick={() => promptPriceDrop(ad)}
                      className="text-brand-yellow font-bold hover:underline cursor-pointer"
                    >
                      Reduce Price
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bento Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* User Info Card */}
          <div className="md:col-span-4 glass-panel p-8 rounded-xl flex flex-col items-center text-center">
            <div className="relative w-32 h-32 mb-6 group">
              <div className="absolute inset-0 bg-primary-container rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-full h-full rounded-full border-2 border-primary-container relative z-10 bg-surface-container-high flex items-center justify-center">
                <span className="font-syne text-display-lg text-primary-container">{userInitial}</span>
              </div>
            </div>
            <h1 className="font-syne text-headline-lg mb-1 capitalize">{userName}</h1>
            <p className="text-on-surface-variant font-outfit text-label-md uppercase tracking-widest mb-6 truncate max-w-full">{currentUser?.email}</p>
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-low border border-white/5">
                <span className="text-on-surface-variant font-outfit text-label-sm">Listings</span>
                <span className="text-primary-fixed font-bold">{myAds.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-low border border-white/5">
                <span className="text-on-surface-variant font-outfit text-label-sm">Unlocks</span>
                <span className="text-primary-fixed font-bold">{totalUnlocks}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-low border border-white/5">
                <span className="text-on-surface-variant font-outfit text-label-sm">Reputation</span>
                <div className="flex gap-1 text-primary-container items-center">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-bold">5.0</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/post')}
              className="w-full mt-8 bg-primary-container text-on-primary-container font-syne py-4 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-95 transition-all"
            >
              Post New Listing
            </button>
          </div>

          {/* Stats & Quick Actions */}
          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Earnings Card */}
            <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="font-syne text-headline-md mb-2">Marketplace Impact</h2>
                  <p className="text-on-surface-variant font-outfit text-label-sm">Total earned from unlocks</p>
                </div>
                <span className="material-symbols-outlined text-primary-container text-4xl">payments</span>
              </div>
              <div className="font-syne text-display-lg text-primary-container">₹{totalEarned}</div>
              <div className="mt-4 flex items-center gap-2 text-secondary font-bold">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>{liveCount} live · {pendingCount} pending</span>
              </div>
            </div>

            {/* Live Listings Mini-Grid */}
            <div className="glass-panel p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-syne text-headline-md">Live Listings</h2>
                <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                  <div className="w-2 h-2 bg-secondary rounded-full relative">
                    <div className="absolute inset-0 bg-secondary rounded-full" style={{ animation: 'ping-anim 1.5s cubic-bezier(0,0,0.2,1) infinite' }}></div>
                  </div>
                  <span className="text-secondary font-bold text-[10px] uppercase font-outfit">Active</span>
                </div>
              </div>
              <div className="space-y-4">
                {myAds.filter(a => a.status === 'approved').slice(0, 3).map(ad => (
                  <div key={ad.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/product/${ad.id}`)}>
                    {ad.images?.[0] ? (
                      <img src={ad.images[0]} alt={ad.title} className="w-14 h-14 rounded object-cover grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <div className="w-14 h-14 rounded bg-surface-container-high flex items-center justify-center text-2xl">{ICON[ad.category]}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface truncate">{ad.title}</p>
                      <p className="text-on-surface-variant font-outfit text-label-sm">₹{ad.price} · {ad.unlocks || 0} Unlocks</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate('/post', { state: { ad } }); }}
                        className="material-symbols-outlined text-on-surface-variant hover:text-primary-container transition-colors active:scale-90"
                      >
                        edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(ad.id); }}
                        className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors active:scale-90"
                      >
                        delete
                      </button>
                    </div>
                  </div>
                ))}
                {myAds.filter(a => a.status === 'approved').length === 0 && (
                  <p className="text-center text-on-surface-variant text-sm py-4 font-outfit">No active listings yet.</p>
                )}
              </div>
            </div>

            {/* All Listings Tab Section */}
            <div className="md:col-span-2 glass-panel rounded-xl">
              <div className="flex border-b border-white/5">
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`flex-1 py-4 font-bold transition-colors ${
                    activeTab === 'listings' ? 'text-primary-container border-b-2 border-primary-container' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  All Listings ({myAds.length})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex-1 py-4 font-bold transition-colors ${
                    activeTab === 'pending' ? 'text-primary-container border-b-2 border-primary-container' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined animate-spin text-primary-container text-3xl">progress_activity</span>
                    <p className="text-on-surface-variant mt-2 font-outfit text-label-md">Loading...</p>
                  </div>
                ) : (() => {
                  const tabAds = activeTab === 'pending'
                    ? myAds.filter(a => a.status === 'pending')
                    : myAds;
                  if (tabAds.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-3">inventory_2</span>
                        <p className="text-on-surface-variant font-outfit text-body-md mb-4">
                          {activeTab === 'pending' ? 'No pending listings.' : 'No listings yet.'}
                        </p>
                        <button
                          onClick={() => navigate('/post')}
                          className="text-primary-container font-bold hover:underline"
                        >
                          Post your first listing →
                        </button>
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {tabAds.map(ad => {
                        const statusColor = {
                          pending: 'bg-primary-container/10 text-primary-container border-primary-container/20',
                          approved: 'bg-secondary/10 text-secondary border-secondary/20',
                          rejected: 'bg-error/10 text-error border-error/20',
                          removed: 'bg-white/5 text-on-surface-variant border-white/5'
                        }[ad.status] || 'bg-white/5 text-on-surface-variant';

                        return (
                          <div
                            key={ad.id}
                            className="group cursor-pointer active:scale-95 transition-transform"
                            onClick={() => ad.status === 'approved' ? navigate(`/product/${ad.id}`) : navigate('/post', { state: { ad } })}
                          >
                            <div className="aspect-square rounded-lg overflow-hidden mb-3 border border-white/5 relative">
                              {ad.images?.[0] ? (
                                <img
                                  src={ad.images[0]}
                                  alt={ad.title}
                                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                />
                              ) : (
                                <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-4xl">
                                  {ICON[ad.category]}
                                </div>
                              )}
                              <div className={`absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${statusColor} font-outfit`}>
                                {ad.status === 'approved' ? 'Live' : ad.status}
                              </div>
                            </div>
                            <p className="font-bold text-on-surface truncate font-outfit">{ad.title}</p>
                            <p className="text-primary-container font-outfit text-label-sm">₹{ad.price}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <section className="mt-gutter mt-8">
          <h2 className="font-syne text-headline-lg mb-8">Recent Activity</h2>
          <div className="glass-panel rounded-xl p-8 space-y-8 relative">
            <div className="absolute left-10 top-12 bottom-12 w-[1px] bg-white/5"></div>
            {myAds.slice(0, 3).map((ad, i) => (
              <div key={ad.id} className="flex gap-6 relative">
                <div className={`w-5 h-5 rounded-full mt-1.5 z-10 ${
                  ad.status === 'approved' ? 'bg-secondary shadow-[0_0_10px_rgba(78,222,163,0.5)]' :
                  ad.status === 'pending' ? 'bg-primary-container shadow-[0_0_10px_rgba(250,204,21,0.5)]' :
                  'bg-surface-container-highest border border-white/20'
                }`}></div>
                <div>
                  <p className="text-on-surface font-bold text-body-lg">
                    {ad.status === 'approved' ? 'Listed' : ad.status === 'pending' ? 'Submitted' : 'Updated'} '{ad.title}'
                  </p>
                  <p className="text-on-surface-variant font-outfit text-label-sm mt-1">
                    {ad.category.toUpperCase()} · ₹{ad.price} · Status: {ad.status}
                  </p>
                </div>
              </div>
            ))}
            {myAds.length === 0 && (
              <p className="text-center text-on-surface-variant py-8 font-outfit">No activity yet. Post your first listing to get started.</p>
            )}
          </div>
        </section>
      </main>

      <MobileBottomNav active="profile" />
      <StitchFooter />
    </div>
  );
}
