import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ children, style = {}, className = "", ...props }) {
  return (
    <motion.div 
      whileHover={{ y: -2, borderColor: 'rgba(250, 204, 21, 0.15)' }}
      className={`glass rounded p-6 transition-all duration-300 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
}
