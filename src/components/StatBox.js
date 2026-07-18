import React from 'react';
import { motion } from 'framer-motion';

export const StatBox = ({ n, label, color }) => (
  <motion.div 
    whileHover={{ y: -1, borderColor: 'rgba(255, 255, 255, 0.1)' }}
    className="glass rounded p-4 text-center flex-1 min-w-[80px]"
  >
    <div 
      className="font-syne text-2xl font-bold tracking-tight"
      style={{ color: color || '#facc15' }}
    >
      {n}
    </div>
    <div className="text-[9px] text-brand-on-surface-variant mt-1 uppercase tracking-widest font-bold font-outfit">
      {label}
    </div>
  </motion.div>
);

export default StatBox;
