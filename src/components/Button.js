import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ children, onClick, disabled, v = 'yellow', block = true, className = '' }) => {
  const styles = {
    yellow: "bg-brand-yellow text-black border-none hover:shadow-glow-yellow",
    dark: "bg-transparent text-gray-200 border border-white/10 hover:bg-white/5",
    green: "bg-brand-emerald-container text-brand-on-emerald border-none hover:shadow-glow-emerald",
    red: "bg-brand-error text-brand-dark border-none",
    blue: "bg-brand-cyan text-brand-dark border-none hover:shadow-glow-cyan",
    white: "bg-white text-black border-none hover:bg-gray-200"
  };

  const selectedStyle = styles[v] || styles.yellow;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
      className={`
        ${block ? 'w-full' : 'w-auto'} 
        ${selectedStyle}
        px-6 py-3 rounded font-syne font-bold text-sm tracking-wide
        flex items-center justify-center gap-2
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

export default Button;
