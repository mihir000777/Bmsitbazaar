import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { CATS, ICON } from '../constants/theme';
import StitchNav, { StitchFooter, MobileBottomNav } from '../components/StitchNav';

const CATEGORY_META = {
  food: {
    name: 'Food & Drinks', desc: 'Snacks, meals, beverages.', icon: 'restaurant',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQc_W2mvCa89gyCn3S2-sgqKKm2Zds55GcHFa8WnznZQjrIO1Mau8ai27KwEpuDVClunhKSLcqc6x3UtgJiTB0SW6dTATBwZPWYq6_QRELFdWjElSIpjoXuJ7QpPZgLZuWpXADovbcRN8MxI370VGOWF8G1wgyfhHrU2_r3ACTVue3jtouWQikar-A5y12ifsFrEg9HhYc6dGNvAf0aymGbb9oij5gRoZ12IX2ak2HUxcxXBM-sjO5Up_zMHM8iQW03dJznFmM1xs',
  },
  merch: {
    name: 'Style & Merch', desc: 'BMSIT hoodies, caps, and streetwear.', icon: 'checkroom',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO3X5ljoZYcFkXYeyM16DNI-cDZaXyOs2ZjUa2Mngp01NJsKnpQrIEspufkj0FKMoAcbTvoT0DLa6Rwlqi4dteOOdawp97xFPXpE9tQgpEeEDVlGU7CazGzJ5yg98t1ShXJU2VX8AagBM-VLf7pT_72NxCU00GaomBxyTg_ydy40sfwD9n8zBha7GR596asGmgcGeDK6DvVGYsnrlCZkaG2Z9agDO3rUyrJzV-6NxZpIHu47lgyALmxiaKvezAO57h2yqMOwm4U7M',
  },
  notes: {
    name: 'Academics', desc: 'Textbooks, notes, and drafting tools.', icon: 'menu_book',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkRPQIbJmRyDbXqpNCoCayQ5mxPuo_HwJlYMEMFUs_XadM4YO3zWMTMmrEim8z7wTI1xwgl2u2gyFMGqKwK2C9sIVVyVAtt8BSKm4vPn_Wn1N6xNiJg7qUbwPHk_KO1zUGmD-WB1sjcUnfRq1aGRTjCxUNXGi6Qe6Z1HUfBjinzTq-Bwtm2VYT6CkfaLTlEj1i4z2b7wYCvYHTnwwdy2rrLeB_I-HKJjem4qBtqxc4lHn_O9usPnDgy4uQU0Ax8USHEzg3T8Cr9R0',
  },
  digital: {
    name: 'Electronics', desc: 'Laptops, gadgets, and accessories.', icon: 'devices',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpmDeGrImOCYvv1noQNe76S9amHFxQC8FXAz_uFgs7LdQsE02Pv70Tk4745CuZl34EV0Z5miBUU_f5wJQvpwmKv9KfX1btz9hgvj2iEWO6JYpkIc6OHOsAo_NQE7JI5N2PmKxPgtigiFdqnRiwXMB_nJGCg6Yx96fkWPS4cMymSrOL1wbOYRWtNI1sY2YHhby3ChFiwAzXddzLR8McUMcVgCjDJOFiONxdskrt2nlH-eR6v6GHlPIP-L8NzLvjMfsRfwX73cKie3U',
  },
  services: {
    name: 'Lab Gear', desc: 'Aprons, kits, and engineering tools.', icon: 'biotech',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsBqOLjEwIfs4-BcwnblgcaCDQGwMO7Wm7mu9K4dq0OsnSo5aaOD8H69yIfAhagprCWzUlCBbYGNPD5aOPupSFE5HjrxbTpr--Q0xfAVWK0c9At6HscYVcxXzQ73FW7fcbmn3KFXm7F1XBXvjUXHOkuNdbwoxn2zKMfTWXSMQicujJo29iGDyIANf7JYIeEm71NSJoc4jzdMhWvxqN7ItTS3Ro1-unAYI95Pjux8x9B1XPuJTdjopVpLFe3Zl02t4-fzYYdb7SH6U',
  },
  art: {
    name: 'Art & Crafts', desc: 'Creative supplies and DIY gear.', icon: 'palette',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq9UFgSSJrNXmLrVfXVo4h660wZ6ul5mX7k56ZLaOTCRrh6MvNK9lrnNnLkirZZE6b6o0zUhpHuyiKbAkkY_2ZJkZeHxWB2SSDALDL73kvJL-tPRhlmQmid7Egnmi_98h2H11LhMtoCm-ac47BxgVEurMu7YIUY2xQOS2wnAQxMny2vVepmmCkXVxnSO1k0n66QAPlPvRM4QcoCv4r_GATi-ed-jV4sq6CgMaUGZDARhQ0WJ0nLZhyZJI0YM54ctDX-6P8QnDpIMw',
  },
  other: {
    name: 'Misc', desc: 'Uncategorized gems and curiosities.', icon: 'category',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqCUj-ea6bIRpC8KbEd0CuPTDh5OudcOUn8tIhS-UGdOrAs1FVeGbLF1q2EuWjiXVh-j-dWmmaJnWIi1msZOa1b_KYIufQim8yNJpOrj8DFWkX-5EhecYb0xXL62VSKV4EOx1dH_En_fCvBmnxpOCylMUaAnD9KGmt0VqcW3bdoe4MZf83gNepUpJmC4VyrKVGDIdsFASx5HHL1beLijXlLSZ5Px_MdHVMh--j-Eifzz1hy4l56iAOIhyIhlTSPf8uwV9e4q1U8fo',
  },
};

export default function Categories() {
  const navigate = useNavigate();
  const { category } = useParams();
  const { currentUser } = useAuth();
  const [ads, setAds] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, [category]);

  const loadAds = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'ads'));
      const approved = snap.docs
        .filter(d => d.data().status === 'approved')
        .map(d => ({ id: d.id, ...d.data() }));

      const cnts = {};
      approved.forEach(a => { cnts[a.category] = (cnts[a.category] || 0) + 1; });
      setCounts(cnts);

      if (category) {
        setAds(approved.filter(a => a.category === category));
      } else {
        setAds(approved);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Category overview
  if (!category) {
    return (
      <div className="bg-background text-on-background font-body-md overflow-x-hidden min-h-screen pb-24 md:pb-0">
        <div className="fixed top-[-100px] left-[-100px] w-[600px] h-[600px] rounded-full blur-[120px] -z-10 opacity-15 bg-primary-container pointer-events-none"></div>
        <div className="fixed bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full blur-[120px] -z-10 opacity-15 bg-secondary-container pointer-events-none"></div>

        <StitchNav active="categories" />

        <main className="pt-32 pb-12 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
          <section className="mb-12 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary/20 bg-secondary/10 text-secondary mb-4">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-outfit text-label-sm">LIVE CAMPUS LISTINGS</span>
            </div>
            <h2 className="font-syne text-[28px] md:text-headline-lg text-on-surface mb-2" style={{ textShadow: '0 0 15px rgba(250, 204, 21, 0.4)' }}>
              Browse by Category
            </h2>
            <p className="font-outfit text-body-lg text-on-surface-variant max-w-xl">
              Find exactly what you need for your semester. From tech to gear, the bazaar has it all.
            </p>
          </section>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-gutter">
            {CATS.map(cat => {
              const meta = CATEGORY_META[cat.v] || { name: cat.l, desc: '', icon: 'sell' };
              return (
                <div
                  key={cat.v}
                  onClick={() => navigate(`/categories/${cat.v}`)}
                  className="glass-panel group overflow-hidden rounded-xl cursor-pointer hover:border-primary-container/30 transition-all"
                >
                  <div className="h-36 md:h-48 overflow-hidden relative">
                    {meta.img ? (
                      <img
                        src={meta.img}
                        alt={meta.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-container/10 to-secondary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl md:text-7xl text-primary-container group-hover:scale-110 transition-transform duration-500">{meta.icon}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <div className="w-9 h-9 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>{meta.icon}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 md:p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-syne text-base md:text-headline-md group-hover:text-primary-container transition-colors">{meta.name}</h3>
                      <span className="font-outfit text-label-sm bg-primary-container/10 text-primary-container px-2 py-1 rounded">
                        {counts[cat.v] || 0}
                      </span>
                    </div>
                    <p className="text-on-surface-variant font-outfit text-label-sm md:text-body-md hidden md:block">{meta.desc}</p>
                    <div className="flex items-center text-primary-container font-outfit text-label-sm gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        <MobileBottomNav active="categories" />
        <StitchFooter />
      </div>
    );
  }

  // Category-specific listings
  const meta = CATEGORY_META[category] || { name: category, desc: '', icon: 'sell' };

  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden min-h-screen pb-24 md:pb-0">
      <div className="fixed top-[-100px] left-[-100px] w-[600px] h-[600px] rounded-full blur-[120px] -z-10 opacity-15 bg-primary-container pointer-events-none"></div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full blur-[120px] -z-10 opacity-15 bg-secondary-container pointer-events-none"></div>

      <StitchNav active="categories" />

      <main className="pt-28 pb-12 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
        <button
          onClick={() => navigate('/categories')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary-container transition-colors mb-6 font-outfit text-label-md group"
        >
          <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
          All Categories
        </button>

        <section className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-container text-3xl">{meta.icon}</span>
            </div>
            <div>
              <h1 className="font-syne text-[28px] md:text-headline-lg text-on-surface">{meta.name}</h1>
              <p className="font-outfit text-label-md text-on-surface-variant">{ads.length} listings · {meta.desc}</p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary-container mb-4">progress_activity</span>
            <p className="font-outfit text-label-md">Loading listings...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-xl">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">inventory_2</span>
            <h3 className="font-syne text-headline-md text-on-surface mb-2">No listings yet</h3>
            <p className="font-outfit text-body-md text-on-surface-variant mb-6">Be the first to post in this category.</p>
            <button
              onClick={() => navigate('/post')}
              className="bg-primary-container text-on-primary-container font-syne font-bold px-8 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all"
            >
              Post Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-gutter">
            {ads.map(p => (
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
                  <div className="mt-3 md:mt-4 flex items-center justify-between border-t border-white/5 pt-2 md:pt-4">
                    <span className="font-outfit text-[10px] md:text-label-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] md:text-[16px]">{meta.icon}</span>
                      <span className="hidden sm:inline">{p.category?.toUpperCase()}</span>
                    </span>
                    <span className="font-outfit text-[10px] md:text-label-sm text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] md:text-[16px]">verified</span>
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileBottomNav active="categories" />
      <StitchFooter />
    </div>
  );
}
