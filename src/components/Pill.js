import React from 'react';
import { motion } from 'framer-motion';

export const Pill = ({ children, type = 'default', sm, className = "" }) => {
  const styles = {
    live: "bg-brand-emerald-container/20 border-brand-emerald/30 text-brand-emerald",
    frozen: "bg-brand-error/20 border-brand-error/30 text-brand-error",
    warn: "bg-amber-950/40 border-amber-900/50 text-amber-400",
    yellow: "bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow",
    blue: "bg-brand-cyan/20 border-brand-cyan/30 text-brand-cyan",
    default: "bg-white/5 border-white/10 text-brand-on-surface-variant"
  };

  const selectedStyle = styles[type] || styles.default;
  const sizeStyle = sm ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]";

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`inline-flex items-center gap-1.5 border rounded font-bold uppercase tracking-widest whitespace-nowrap ${selectedStyle} ${sizeStyle} ${className}`}
    >
      {children}
    </motion.span>
  );
};

export default Pill;
