import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { CATS, ICON } from '../constants/theme';
import StitchNav, { StitchFooter, MobileBottomNav } from '../components/StitchNav';

export default function Marketplace() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catF, setCatF] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => { loadAds(); }, []);

  const loadAds = async () => {
    try {
      const snap = await getDocs(collection(db, 'ads'));
      const approvedAds = snap.docs
        .filter(d => d.data().status === 'approved')
        .map(d => ({ id: d.id, ...d.data() }));
      setAds(approvedAds);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (!search.trim() || loading) return;

    const timer = setTimeout(async () => {
      // Verify that it still yields 0 results
      const hasResults = ads.some(p => {
        if (catF !== 'all' && p.category !== catF) return false;
        return p.title?.toLowerCase().includes(search.toLowerCase()) ||
               p.description?.toLowerCase().includes(search.toLowerCase());
      });

      if (!hasResults) {
        try {
          await addDoc(collection(db, 'wishlist'), {
            query: search.trim().toLowerCase(),
            userEmail: currentUser?.email || 'anonymous',
            category: catF,
            createdAt: Timestamp.now()
          });
        } catch (err) {
          console.error('Error logging to wishlist:', err);
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [search, catF, ads, currentUser, loading]);

  let filtered = ads.filter(p => {
    if (catF !== 'all' && p.category !== catF) return false;
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) &&
        !p.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (sortBy === 'price_low') filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sortBy === 'price_high') filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sortBy === 'popular') filtered = [...filtered].sort((a, b) => (b.unlocks || 0) - (a.unlocks || 0));

  const counts = CATS.reduce((acc, c) => {
    acc[c.v] = ads.filter(a => a.category === c.v).length;
    return acc;
  }, {});

  const catIconMap = {
    food: 'restaurant', merch: 'checkroom', notes: 'menu_book',
    digital: 'devices', services: 'biotech', art: 'palette', other: 'category'
  };

  return (
    <div className="font-body-md text-body-md selection:bg-primary-container selection:text-on-primary-container bg-[#09090b] text-on-surface min-h-screen overflow-x-hidden pb-24 md:pb-0">
      {/* Atmospheric Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[120px] -z-10 opacity-15 bg-background-accent pointer-events-none"></div>
      <div className="fixed bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] -z-10 opacity-15 bg-primary-container pointer-events-none"></div>

      <StitchNav active="browse" />

      <main className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 pt-28">
        {/* Search & Filter Bar */}
        <section className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row gap-gutter items-stretch">
            <div className="flex-1 relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-container transition-colors">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tech, books, or gear..."
                className="w-full bg-[#09090b] border border-white/10 rounded-lg py-4 pl-12 pr-4 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none font-outfit text-body-md"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 glass-panel px-4 md:px-6 py-4 rounded-lg hover:border-primary-container transition-all active:scale-95">
                <span className="material-symbols-outlined">tune</span>
                <span className="font-outfit text-label-md hidden md:inline">Filters</span>
              </button>
              <button
                onClick={() => navigate('/post')}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-6 py-4 rounded-lg font-syne text-headline-md font-bold hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">add_circle</span>
                <span>Post Listing</span>
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col md:flex-row gap-gutter">
          {/* Sidebar - hidden on mobile */}
          <aside className="hidden md:block w-64 shrink-0 space-y-8">
            <div>
              <h3 className="font-outfit text-label-md uppercase tracking-widest text-on-surface-variant mb-4">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setCatF('all')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all group ${
                      catF === 'all'
                        ? 'bg-primary-container/10 text-primary-container border border-primary-container/20'
                        : 'hover:bg-white/5 text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined">apps</span>
                      <span className="font-outfit text-body-md font-semibold">All Items</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${catF === 'all' ? 'bg-primary-container text-on-primary-container' : 'opacity-40'}`}>{ads.length}</span>
                  </button>
                </li>
                {CATS.map(c => (
                  <li key={c.v}>
                    <button
                      onClick={() => setCatF(c.v)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all group ${
                        catF === c.v
                          ? 'bg-primary-container/10 text-primary-container border border-primary-container/20'
                          : 'hover:bg-white/5 text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">{catIconMap[c.v] || 'sell'}</span>
                        <span className="font-outfit text-body-md">{c.l.replace(/^.{2}\s*/, '')}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${catF === c.v ? 'bg-primary-container text-on-primary-container' : 'opacity-40 group-hover:opacity-100 transition-opacity'}`}>{counts[c.v] || 0}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 glass-panel rounded-xl">
              <h4 className="font-outfit text-label-md text-primary-container mb-2">Student Hub Tip</h4>
              <p className="text-label-sm text-on-surface-variant leading-relaxed font-outfit">
                Verify your bmsit.in email to unlock contacts and chat with sellers securely.
              </p>
            </div>
          </aside>

          {/* Mobile category pills */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
            <button
              onClick={() => setCatF('all')}
              className={`px-4 py-2 rounded-full font-outfit text-label-sm whitespace-nowrap transition-all ${
                catF === 'all' ? 'bg-primary-container text-on-primary-container font-bold' : 'glass-panel text-on-surface-variant'
              }`}
            >
              All ({ads.length})
            </button>
            {CATS.map(c => (
              <button
                key={c.v}
                onClick={() => setCatF(c.v)}
                className={`px-4 py-2 rounded-full font-outfit text-label-sm whitespace-nowrap transition-all ${
                  catF === c.v ? 'bg-primary-container text-on-primary-container font-bold' : 'glass-panel text-on-surface-variant'
                }`}
              >
                {c.l.replace(/^.{2}\s*/, '')}
              </button>
            ))}
          </div>

          {/* Grid */}
          <section className="flex-1">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="font-syne text-headline-md text-on-surface">Active Listings</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="ping-indicator"></div>
                  <span className="font-outfit text-label-sm text-secondary">{ads.length} verified listings</span>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <span className="font-outfit text-label-sm text-on-surface-variant hidden md:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-on-surface font-outfit text-label-sm focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="newest" className="bg-surface">Newest</option>
                  <option value="price_low" className="bg-surface">Price ↑</option>
                  <option value="price_high" className="bg-surface">Price ↓</option>
                  <option value="popular" className="bg-surface">Popular</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary-container mb-4">progress_activity</span>
                <p className="font-outfit text-label-md">Loading listings...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 glass-panel rounded-xl">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">inventory_2</span>
                <h3 className="font-syne text-headline-md text-on-surface mb-2">No listings found</h3>
                <p className="font-outfit text-body-md text-on-surface-variant">Try a different category or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-gutter">
                {filtered.map(p => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="product-card group flex flex-col glass-panel rounded-xl overflow-hidden hover:border-primary-container/30 transition-all cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="product-card-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl md:text-7xl bg-surface-container-low">
                          {ICON[p.category]}
                        </div>
                      )}
                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-secondary-container/90 backdrop-blur-md text-on-secondary-container px-2 md:px-3 py-1 rounded font-outfit text-[10px] md:text-label-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-on-secondary-container"></span>
                        Live
                      </div>
                    </div>
                    <div className="p-3 md:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-syne text-sm md:text-body-lg font-bold text-on-surface group-hover:text-primary-container transition-colors line-clamp-1">
                            {p.title}
                          </h4>
                          <span className="font-syne text-sm md:text-body-lg text-primary-container whitespace-nowrap">₹{p.price}</span>
                        </div>
                        <p className="text-[11px] md:text-label-sm text-on-surface-variant line-clamp-2 font-outfit">
                          {p.description || 'No description provided.'}
                        </p>
                      </div>
                      <div className="mt-3 md:mt-4 flex items-center justify-between border-t border-white/5 pt-2 md:pt-4 text-[10px] md:text-label-sm">
                        <span className="font-outfit text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] md:text-[16px]">{catIconMap[p.category] || 'sell'}</span>
                          <span className="hidden sm:inline">{p.category?.toUpperCase()}</span>
                        </span>
                        <span className="font-outfit text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] md:text-[16px]">verified</span>
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <MobileBottomNav active="home" />
      <StitchFooter />
    </div>
  );
}
