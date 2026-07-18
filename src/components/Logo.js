import React from 'react';

/**
 * BMSIT Bazaar Logo - yellow B mark with key cutout on black
 */
export default function Logo({ size = 40, showText = true, onClick, className = '' }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}>
      <img
        src="/logo.svg"
        alt="BMSIT Bazaar"
        style={{ height: size, width: size }}
        className="object-contain"
      />
      {showText && (
        <span className="font-syne text-headline-md text-primary-container tracking-tighter font-extrabold hidden sm:inline">
          BMSIT BAZAAR
        </span>
      )}
    </div>
  );
}
