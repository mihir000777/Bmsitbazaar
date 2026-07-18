import React, { useState, useRef } from 'react';

export default function ImageUploader({ images, setImages }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const CLOUDINARY_CLOUD = process.env.REACT_APP_CLOUDINARY_CLOUD || 'dd8mkgqng';
  const CLOUDINARY_PRESET = process.env.REACT_APP_CLOUDINARY_PRESET || 'bmsitbazzar';

  const uploadFiles = async files => {
    const arr = [...files].filter(f => f.type.startsWith('image/')).slice(0, 6 - images.length);
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

  const onDrop = e => { e.preventDefault(); e.currentTarget.classList.remove('drag'); uploadFiles(e.dataTransfer.files); };
  const onDragOver = e => { e.preventDefault(); e.currentTarget.classList.add('drag'); };
  const onDragLeave = e => e.currentTarget.classList.remove('drag');

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {images.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/5 bg-[#09090b] group">
            <img src={url} alt={`photo ${i + 1}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
            <button
              className="absolute top-1.5 right-1.5 bg-black/80 text-brand-error rounded w-5 h-5 flex items-center justify-center text-xs hover:bg-brand-error-container hover:text-white transition-colors"
              onClick={() => setImages(p => p.filter((_, j) => j !== i))}
            >
              ×
            </button>
            {i === 0 && (
              <div className="absolute bottom-2 left-2 bg-brand-yellow text-black rounded px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest font-outfit">
                COVER
              </div>
            )}
          </div>
        ))}
        {images.length < 6 && (
          <div
            className="aspect-square rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 hover:border-brand-yellow transition-all text-brand-on-surface-variant hover:text-brand-yellow"
            onClick={() => fileRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/10 border-t-brand-yellow rounded-full animate-spin" />
                <span className="text-[8px] font-bold uppercase tracking-widest font-outfit">UPLOADING...</span>
              </div>
            ) : (
              <>
                <div className="text-xl">📷</div>
                <span className="text-[8px] font-bold uppercase tracking-widest font-outfit">ADD</span>
              </>
            )}
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => uploadFiles(e.target.files)} />
      <div className={`text-[9px] font-bold tracking-[0.2em] uppercase font-outfit ${images.length < 3 ? 'text-brand-yellow' : 'text-brand-emerald'}`}>
        {images.length < 3 ? `${3 - images.length} more photo(s) needed` : '✓ Photos complete'}
      </div>
    </div>
  );
}
