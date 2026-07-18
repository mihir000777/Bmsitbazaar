import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { CATS } from '../constants/theme';
import StitchNav, { StitchFooter, MobileBottomNav } from '../components/StitchNav';

export default function PostAd() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const editAd = location.state?.ad || null;
  const fileRef = useRef();
  const dropRef = useRef();
  const videoFileRef = useRef();

  const [sf, setSf] = useState({
    name: editAd?.sellerName || '',
    usn: editAd?.sellerUSN || '',
    phone: editAd?.sellerPhone || '',
    title: editAd?.title || '',
    desc: editAd?.description || '',
    price: editAd ? String(editAd.price) : '',
    cat: editAd?.category || 'food',
    deadline: editAd?.deadline || '',
    productAge: editAd?.productAge || '< 3 months'
  });
  const upd = (k, v) => setSf(p => ({ ...p, [k]: v }));

  const [images, setImages] = useState(editAd?.images || []);
  const [videoUrl, setVideoUrl] = useState(editAd?.videoUrl || '');
  const [coords, setCoords] = useState({
    lat: editAd?.sellerLat || 13.13406,
    lng: editAd?.sellerLng || 77.56844
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (navigator.geolocation && !editAd) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation access denied, using BMSIT default coordinates.', error);
        }
      );
    }
  }, [editAd]);

  const CLOUDINARY_CLOUD = process.env.REACT_APP_CLOUDINARY_CLOUD || 'dd8mkgqng';
  const CLOUDINARY_PRESET = process.env.REACT_APP_CLOUDINARY_PRESET || 'bmsitbazzar';

  const uploadFiles = async files => {
    const arr = [...files].filter(f => f.type.startsWith('image/')).slice(0, 3 - images.length);
    if (!arr.length) return;
    setUploading(true);
    const urls = [];
    for (const file of arr) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', CLOUDINARY_PRESET);
        fd.append('folder', 'bmsitbazaar');
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.secure_url) urls.push(data.secure_url);
      } catch (e) { console.error(e); }
    }
    setImages(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const uploadVideo = async files => {
    const file = files[0];
    if (!file || !file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('Video file size exceeds the 15MB limit.');
      return;
    }
    setVideoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', CLOUDINARY_PRESET);
      fd.append('folder', 'bmsitbazaar');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/video/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) {
        setVideoUrl(data.secure_url);
      } else {
        alert('Video upload failed. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Error uploading video.');
    }
    setVideoUploading(false);
  };

  const onDrop = e => {
    e.preventDefault();
    dropRef.current?.classList.remove('bg-surface-container-high/60', 'scale-[1.02]');
    uploadFiles(e.dataTransfer.files);
  };
  const onDragOver = e => {
    e.preventDefault();
    dropRef.current?.classList.add('bg-surface-container-high/60', 'scale-[1.02]');
  };
  const onDragLeave = e => {
    e.preventDefault();
    dropRef.current?.classList.remove('bg-surface-container-high/60', 'scale-[1.02]');
  };

  const doPost = async (e) => {
    e?.preventDefault();
    if (!sf.name || !sf.phone || !sf.title || !sf.price) {
      alert('Please fill in all required fields.');
      return;
    }
    if (images.length !== 3) {
      alert('Please upload exactly 3 product photos.');
      return;
    }
    if (!videoUrl) {
      alert('Please upload exactly 1 product verification video.');
      return;
    }
    if (isNaN(+sf.price) || +sf.price <= 0) {
      alert('Invalid price.');
      return;
    }

    setBusy(true);
    try {
      const data = {
        sellerId: currentUser.uid,
        sellerEmail: currentUser.email,
        sellerName: sf.name,
        sellerPhone: sf.phone,
        sellerUSN: sf.usn,
        title: sf.title,
        description: sf.desc,
        price: +sf.price,
        category: sf.cat,
        deadline: sf.deadline,
        productAge: sf.productAge,
        images,
        videoUrl,
        sellerLat: coords.lat,
        sellerLng: coords.lng,
        unlocks: editAd ? editAd.unlocks : 0,
        views: editAd ? editAd.views : 0,
        status: 'pending',
        flagged: false,
        flags: [],
        updatedAt: Timestamp.now(),
      };

      if (editAd) {
        await updateDoc(doc(db, 'ads', editAd.id), data);
      } else {
        data.createdAt = Timestamp.now();
        await addDoc(collection(db, 'ads'), data);
      }

      setShowSuccess(true);
      setTimeout(() => navigate('/myads'), 2500);
    } catch (e) {
      alert('Error posting listing. Please try again.');
    }
    setBusy(false);
  };

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-background-accent opacity-30 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[80px] -z-10 pointer-events-none" style={{ background: '#574500', opacity: 0.2 }}></div>

      <StitchNav active="sell" />

      <main className="min-h-screen pt-32 pb-20 px-margin-mobile md:px-margin-desktop flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Back */}
          <div className="mb-6">
            <button
              onClick={() => navigate(editAd ? '/myads' : '/marketplace')}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary-container transition-colors font-outfit text-label-md uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Cancel and Return
            </button>
          </div>

          {/* Form Card */}
          <div className="glass-panel rounded-[2rem] p-8 md:p-12">
            <div className="mb-10 text-center">
              <h1 className="font-syne text-headline-lg text-primary-container mb-2">
                {editAd ? 'Edit Listing' : 'Create New Listing'}
              </h1>
              <p className="text-on-surface-variant font-outfit text-body-md">
                Post your ad and reach students across the campus instantly.
              </p>
            </div>

            <form onSubmit={doPost} className="space-y-8">
              {/* Seller Name */}
              <div className="space-y-2">
                <label className="font-outfit text-label-md text-primary-container uppercase tracking-widest ml-1 block">Your Name</label>
                <input
                  type="text"
                  value={sf.name}
                  onChange={e => upd('name', e.target.value)}
                  placeholder="Full name"
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 transition-all duration-300 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                />
              </div>

              {/* Phone & USN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-outfit text-label-md text-primary-container uppercase tracking-widest ml-1 block">Phone</label>
                  <input
                    type="tel"
                    value={sf.phone}
                    onChange={e => upd('phone', e.target.value)}
                    placeholder="9876543210"
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 transition-all duration-300 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-outfit text-label-md text-primary-container uppercase tracking-widest ml-1 block">USN (Optional)</label>
                  <input
                    type="text"
                    value={sf.usn}
                    onChange={e => upd('usn', e.target.value.toUpperCase())}
                    placeholder="1BY20XX000"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 transition-all duration-300 uppercase focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="font-outfit text-label-md text-primary-container uppercase tracking-widest ml-1 block">Listing Title</label>
                <input
                  type="text"
                  value={sf.title}
                  onChange={e => upd('title', e.target.value)}
                  placeholder="What are you selling?"
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 transition-all duration-300 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                />
              </div>

              {/* Category & Product Age */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-outfit text-label-md text-primary-container uppercase tracking-widest ml-1 block">Category</label>
                  <div className="relative">
                    <select
                      value={sf.cat}
                      onChange={e => upd('cat', e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-4 text-on-surface appearance-none transition-all duration-300 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    >
                      {CATS.map(c => (
                        <option key={c.v} value={c.v} className="bg-surface">{c.l}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-outfit text-label-md text-primary-container uppercase tracking-widest ml-1 block">Product Age</label>
                  <div className="relative">
                    <select
                      value={sf.productAge}
                      onChange={e => upd('productAge', e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-4 text-on-surface appearance-none transition-all duration-300 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    >
                      <option value="< 3 months" className="bg-surface">Less than 3 months</option>
                      <option value="3 - 6 months" className="bg-surface">3 to 6 months</option>
                      <option value="6 - 12 months" className="bg-surface">6 to 12 months</option>
                      <option value="1 - 2 years" className="bg-surface">1 to 2 years</option>
                      <option value="2+ years" className="bg-surface">More than 2 years</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Price & Available Until */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-outfit text-label-md text-primary-container uppercase tracking-widest ml-1 block">Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={sf.price}
                      onChange={e => upd('price', e.target.value)}
                      placeholder="0"
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 transition-all duration-300 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-outfit text-label-md text-primary-container uppercase tracking-widest ml-1 block">Available Until (Optional)</label>
                  <input
                    type="date"
                    value={sf.deadline}
                    onChange={e => upd('deadline', e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-4 text-on-surface transition-all duration-300 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="font-outfit text-label-md text-primary-container uppercase tracking-widest ml-1 block">Description</label>
                <textarea
                  value={sf.desc}
                  onChange={e => upd('desc', e.target.value)}
                  rows="4"
                  placeholder="Mention usage period, condition, or negotiable details..."
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 transition-all duration-300 resize-none focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="font-outfit text-label-md text-primary-container uppercase tracking-widest ml-1 block">Product Photos (Exactly 3 Required)</label>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {images.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/5 bg-surface-container-lowest group">
                        <img src={url} alt={`upload-${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/80 text-error rounded flex items-center justify-center text-sm hover:bg-error-container hover:text-white transition-colors"
                        >
                          ×
                        </button>
                        {i === 0 && (
                          <div className="absolute bottom-2 left-2 bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest">Cover</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {images.length < 3 && (
                  <div
                    ref={dropRef}
                    onClick={() => fileRef.current?.click()}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    className="h-48 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-surface-container-high/40 transition-all duration-300 group"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%234D4632' stroke-width='2' stroke-dasharray='12%2c 12' stroke-linecap='square'/%3e%3c/svg%3e\")" }}
                  >
                    {uploading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-display-lg text-primary-container">progress_activity</span>
                        <p className="text-body-md font-semibold text-on-surface">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-display-lg text-outline-variant group-hover:text-primary-container group-hover:scale-110 transition-all duration-300">cloud_upload</span>
                        <div className="text-center">
                          <p className="text-body-md font-semibold text-on-surface">Drag and drop your product photos</p>
                          <p className="text-label-sm text-on-surface-variant">PNG, JPG up to 10MB · {3 - images.length} more required</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={e => uploadFiles(e.target.files)}
                />
              </div>

              {/* Video Upload */}
              <div className="space-y-2">
                <label className="font-outfit text-label-md text-primary-container uppercase tracking-widest ml-1 block">Product Verification Video (Exactly 1 Required)</label>
                {videoUrl ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/5 bg-surface-container-lowest group">
                    <video src={videoUrl} controls className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      className="absolute top-4 right-4 w-8 h-8 bg-black/80 text-brand-error rounded-full flex items-center justify-center text-lg hover:bg-brand-error/20 hover:text-white transition-colors z-10"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => videoFileRef.current?.click()}
                    className="h-36 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-surface-container-high/40 transition-all duration-300 group"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%234D4632' stroke-width='2' stroke-dasharray='12%2c 12' stroke-linecap='square'/%3e%3c/svg%3e\")" }}
                  >
                    {videoUploading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-display-lg text-primary-container">progress_activity</span>
                        <p className="text-body-md font-semibold text-on-surface">Uploading video...</p>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-display-lg text-outline-variant group-hover:text-primary-container group-hover:scale-110 transition-all duration-300">video_call</span>
                        <div className="text-center">
                          <p className="text-body-md font-semibold text-on-surface">Click to upload verification video</p>
                          <p className="text-label-sm text-on-surface-variant">MP4, MOV up to 15MB · 1 video required</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={videoFileRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={e => uploadVideo(e.target.files)}
                />
              </div>

              {/* CTA */}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-5 bg-primary-container hover:brightness-110 text-on-primary-container font-bold rounded-xl text-body-lg uppercase tracking-wider shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 font-syne disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    {editAd ? 'Update Listing' : 'Post Listing for Approval'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] bg-surface/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel rounded-[2rem] p-12 text-center border-primary-container/20 animate-fadeUp">
            <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(78,222,163,0.3)]">
              <span className="material-symbols-outlined text-on-secondary-container text-display-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="font-syne text-headline-lg text-secondary mb-4">Ad Submitted!</h2>
            <p className="text-on-surface-variant font-outfit text-body-md mb-10">
              Your listing is being reviewed by the BMSIT moderators. It will go live once approved.
            </p>
            <button
              onClick={() => navigate('/myads')}
              className="w-full py-4 border border-outline-variant hover:border-primary-container rounded-xl text-on-surface font-semibold transition-all"
            >
              Go to My Ads
            </button>
          </div>
        </div>
      )}

      <MobileBottomNav active="sell" />
      <StitchFooter />
    </div>
  );
}

export function PostedAd() {
  const navigate = useNavigate();
  return (
    <div className="bg-surface-container-lowest min-h-screen flex flex-col font-body-md text-on-surface antialiased">
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] -z-10 opacity-15 bg-primary-container pointer-events-none"></div>
      <div className="fixed bottom-[5%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[120px] -z-10 opacity-15 bg-secondary-container pointer-events-none"></div>

      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-gutter relative z-10">
        <div className="max-w-xl w-full flex flex-col items-center text-center">
          <div className="relative mb-base flex items-center justify-center">
            <div className="absolute w-32 h-32 bg-primary-container/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="glass-panel w-24 h-24 rounded-full flex items-center justify-center border-primary-container/30 relative z-20 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
              <span className="material-symbols-outlined text-primary-container text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>

          <h1 className="font-syne text-display-lg text-primary-container mb-4 tracking-tighter">Listing Submitted</h1>
          <p className="font-outfit text-body-lg text-on-surface-variant max-w-md mx-auto mb-10">
            Your request has been processed securely. The item will be visible to the campus community after admin approval.
          </p>

          <div className="flex flex-col md:flex-row gap-4 w-full">
            <button
              onClick={() => navigate('/myads')}
              className="flex-1 bg-primary-container text-on-primary-container font-syne text-headline-md py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
            >
              Go to My Ads
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex-1 border border-white/10 text-on-surface font-syne text-headline-md py-4 rounded-xl font-semibold hover:bg-white/5 active:scale-95 transition-all duration-300"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </main>

      <StitchFooter />
    </div>
  );
}
