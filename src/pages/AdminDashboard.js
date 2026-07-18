import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import StatBox from '../components/StatBox';
import Pill from '../components/Pill';
import { UNLOCK_FEE } from '../constants/theme';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, LogOut, Check, X, ShieldAlert } from 'lucide-react';
import Card from '../components/Card';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [busy, setBusy] = useState(false);
  const [allAds, setAllAds] = useState([]);
  const [txns, setTxns] = useState([]);
  
  const UPI_ID = process.env.REACT_APP_UPI_ID || '9900115056@kotakbank';

  useEffect(() => { loadAdmin(); }, []);

  const loadAdmin = async () => {
    setBusy(true);
    try {
      const [aSnap, tSnap] = await Promise.all([
        getDocs(collection(db, 'ads')),
        getDocs(collection(db, 'transactions'))
      ]);
      setAllAds(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTxns(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
  };

  const adminUpdate = async (id, data) => {
    await updateDoc(doc(db, 'ads', id), data);
    loadAdmin();
  };

  const verifyTxn = async (t) => {
    await updateDoc(doc(db, 'transactions', t.id), { status: 'verified' });
    await updateDoc(doc(db, 'ads', t.adId), { unlockedBuyers: arrayUnion(t.buyerEmail) });
    loadAdmin();
    alert('Payment verified! Buyer can now see seller contact.');
  };

  const doLogout = async () => {
    await logout();
    navigate('/');
  };

  const totalRev = txns.reduce((a, t) => a + t.amount, 0);
  const pendingTxns = txns.filter(t => t.status === 'pending_verification');
  const uniqueSellers = [...new Set(allAds.map(a => a.sellerId))].length;
  const pendingAds = allAds.filter(a => a.status === 'pending');
  const liveAds = allAds.filter(a => a.status === 'approved');

  return (
    <div className="min-h-screen bg-brand-dark text-brand-on-surface font-sans selection:bg-brand-yellow/30 selection:text-brand-yellow">
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Admin Header */}
      <div className="flex justify-between items-center px-4 md:px-10 py-4 glass border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="font-syne font-extrabold text-xl text-brand-on-surface cursor-pointer" onClick={() => navigate('/')}>
            BMSIT<span className="text-brand-yellow">Bazaar</span>
          </span>
          <Pill type="yellow">ADMIN</Pill>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAdmin} disabled={busy} className="flex items-center gap-1.5 bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow hover:bg-brand-yellow hover:text-black font-bold text-[10px] tracking-widest uppercase px-4 py-2 rounded transition-all font-outfit">
            <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} /> {busy ? '...' : 'REFRESH'}
          </button>
          <button onClick={doLogout} className="bg-white/5 hover:bg-white/10 text-brand-on-surface-variant border border-white/5 font-bold text-[10px] tracking-widest uppercase px-4 py-2 rounded transition-all flex items-center gap-1.5 font-outfit">
            <LogOut className="w-3.5 h-3.5" /> EXIT
          </button>
        </div>
      </div>

      <div className="max-w-container mx-auto px-4 md:px-10 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatBox n={liveAds.length} label="LIVE" color="#4edea3"/>
          <StatBox n={pendingAds.length} label="PENDING" color="#facc15"/>
          <StatBox n={uniqueSellers} label="SELLERS" color="#c7f5ff"/>
          <StatBox n={txns.length} label="TXNS" color="#c7f5ff"/>
          <StatBox n={`₹${totalRev}`} label="REVENUE" color="#4edea3"/>
        </div>

        {/* Finance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-10">
          <div className="bg-brand-emerald/5 border border-brand-emerald/20 rounded p-6 text-center space-y-2">
            <span className="text-[9px] font-bold text-brand-emerald uppercase tracking-[0.2em] block font-outfit">REVENUE</span>
            <div className="font-syne font-extrabold text-[36px] text-brand-emerald">₹{totalRev}</div>
            <div className="text-[10px] text-brand-on-surface-variant font-bold uppercase tracking-widest font-outfit">{UPI_ID}</div>
          </div>
          <div className="bg-brand-yellow/5 border border-brand-yellow/20 rounded p-6 text-center space-y-2">
            <span className="text-[9px] font-bold text-brand-yellow uppercase tracking-[0.2em] block font-outfit">PENDING PAYMENTS</span>
            <div className="font-syne font-extrabold text-[36px] text-brand-yellow">{pendingTxns.length}</div>
            <div className="text-[10px] text-brand-on-surface-variant font-bold uppercase tracking-widest font-outfit">₹{pendingTxns.reduce((a,t)=>a+t.amount,0)} unverified</div>
          </div>
          <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded p-6 text-center space-y-2">
            <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-[0.2em] block font-outfit">REVIEW QUEUE</span>
            <div className="font-syne font-extrabold text-[36px] text-brand-cyan">{pendingAds.length}</div>
            <div className="text-[10px] text-brand-on-surface-variant font-bold uppercase tracking-widest font-outfit">{allAds.length} total</div>
          </div>
        </div>

        {/* Payment Verifications */}
        {pendingTxns.length > 0 && (
          <div className="mb-10">
            <h3 className="font-syne font-bold text-label-md text-brand-yellow mb-4 uppercase tracking-[0.2em]">
              💰 VERIFY PAYMENTS ({pendingTxns.length})
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {pendingTxns.map(t => (
                  <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass border-brand-yellow/20 rounded p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="text-label-sm font-bold text-brand-on-surface uppercase tracking-widest font-outfit">₹{t.amount} · {t.adTitle}</div>
                      <div className="text-[10px] text-brand-on-surface-variant font-bold uppercase tracking-widest font-outfit">Buyer: {t.buyerEmail}</div>
                      <div className="text-[10px] text-brand-on-surface-variant font-bold uppercase tracking-widest font-outfit">TXN: <span className="text-brand-yellow font-mono">{t.txnId}</span></div>
                    </div>
                    <button onClick={() => verifyTxn(t)} className="bg-brand-emerald-container text-brand-on-emerald font-bold text-[10px] tracking-widest uppercase px-5 py-3 rounded transition-all flex items-center gap-2 font-outfit hover:shadow-glow-emerald">
                      <Check className="w-4 h-4" /> VERIFY
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Pending Ads */}
        {pendingAds.length > 0 && (
          <div className="mb-10">
            <h3 className="font-syne font-bold text-label-md text-amber-500 mb-4 uppercase tracking-[0.2em]">
              ⏳ REVIEW QUEUE ({pendingAds.length})
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {pendingAds.map(p => (
                  <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass border-white/5 rounded p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="font-syne font-bold text-lg text-brand-on-surface mb-1 uppercase tracking-tight">{p.title}</h4>
                          <p className="text-[10px] text-brand-on-surface-variant font-bold tracking-widest uppercase font-outfit">
                            ₹{p.price} · {p.category.toUpperCase()} · Age: {p.productAge || 'N/A'}
                          </p>
                        </div>
                        {p.description && (
                          <p className="text-label-sm text-brand-on-surface-variant bg-[#09090b] border border-white/5 rounded p-3 leading-relaxed font-outfit">{p.description}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(p.images || []).length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-[0.2em] block font-outfit">Photos</span>
                              <div className="flex gap-2 flex-wrap">
                                {p.images.map((img, i) => (
                                  <img key={i} src={img} alt="" className="w-20 h-20 rounded-lg object-cover border border-white/5 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                                ))}
                              </div>
                            </div>
                          )}
                          {p.videoUrl && (
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-[0.2em] block font-outfit">Verification Video</span>
                              <video src={p.videoUrl} controls className="w-full max-h-[160px] rounded-lg border border-white/5" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto md:min-w-[140px]">
                        <button onClick={() => adminUpdate(p.id, { status: 'approved', flagged: false, flags: [] })} className="flex-1 bg-brand-emerald-container text-brand-on-emerald font-bold text-[10px] tracking-widest uppercase px-4 py-2.5 rounded transition-all flex items-center justify-center gap-1.5 font-outfit hover:shadow-glow-emerald">
                          <Check className="w-4 h-4" /> APPROVE
                        </button>
                        <button onClick={() => adminUpdate(p.id, { status: 'rejected' })} className="flex-1 bg-brand-error/10 border border-brand-error/20 text-brand-error font-bold text-[10px] tracking-widest uppercase px-4 py-2.5 rounded transition-all flex items-center justify-center gap-1.5 font-outfit">
                          <X className="w-4 h-4" /> REJECT
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* All Ads */}
        <div>
          <h3 className="font-syne font-bold text-label-md text-brand-on-surface-variant mb-6 uppercase tracking-[0.2em]">ALL LISTINGS ({allAds.length})</h3>
          <div className="border-t border-white/5">
            {[...allAds].sort((a, b) => {
              const o = { pending: 0, approved: 1, rejected: 2, removed: 3 };
              return (o[a.status] || 0) - (o[b.status] || 0);
            }).map(p => {
              const statusStyles = { pending: "text-brand-yellow", approved: "text-brand-emerald", rejected: "text-brand-error", removed: "text-white/20" };
              const currentStatusColor = statusStyles[p.status] || "text-white";

              return (
                <div key={p.id} className="py-4 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/[0.02] px-2 transition-all group">
                  <div className="flex-1 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/5 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#09090b] flex items-center justify-center text-xl">📦</div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-syne font-bold text-label-md text-brand-on-surface uppercase tracking-tight">{p.title}</span>
                        <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${currentStatusColor} font-outfit`}>
                          [{p.status === 'approved' ? 'LIVE' : p.status.toUpperCase()}]
                        </span>
                        {p.flagged && (
                          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-error flex items-center gap-1 font-outfit">
                            <ShieldAlert className="w-3 h-3" /> FLAGGED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-brand-on-surface-variant font-outfit">
                        ₹{p.price} · {p.category.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto justify-end opacity-60 group-hover:opacity-100 transition-all">
                    {p.status === 'pending' && (
                      <button onClick={() => adminUpdate(p.id, { status: 'approved', flagged: false })} className="text-brand-emerald font-bold text-[9px] tracking-widest uppercase hover:underline font-outfit">APPROVE</button>
                    )}
                    {p.status === 'approved' && (
                      <button onClick={() => adminUpdate(p.id, { status: 'rejected' })} className="text-brand-error font-bold text-[9px] tracking-widest uppercase hover:underline font-outfit">REMOVE</button>
                    )}
                    {(p.status === 'rejected' || p.status === 'removed') && (
                      <button onClick={() => adminUpdate(p.id, { status: 'approved' })} className="text-brand-emerald/60 font-bold text-[9px] tracking-widest uppercase hover:underline font-outfit">RESTORE</button>
                    )}
                    {p.flagged && (
                      <button onClick={() => adminUpdate(p.id, { flagged: false, flags: [] })} className="text-brand-on-surface font-bold text-[9px] tracking-widest uppercase hover:underline font-outfit">CLEAR</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
