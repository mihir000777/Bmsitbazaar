import React from 'react';

const commonClasses = "w-full bg-[#09090b] border border-white/5 rounded px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-brand-on-surface placeholder:text-brand-on-surface-variant/50 focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed caret-brand-yellow";

export const Inp = ({ placeholder, value, onChange, type = 'text', min, autoFocus, disabled }) => (
  <input
    autoFocus={autoFocus}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    min={min}
    disabled={disabled}
    className={commonClasses}
  />
);

export const Tex = ({ placeholder, value, onChange, rows = 4 }) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    className={`${commonClasses} resize-none font-outfit text-sm normal-case tracking-normal`}
  />
);

export const Sel = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={onChange}
    className={commonClasses}
  >
    {options.map((o) => (
      <option key={o.v} value={o.v} className="bg-[#09090b] text-brand-on-surface uppercase">
        {o.l}
      </option>
    ))}
  </select>
);
