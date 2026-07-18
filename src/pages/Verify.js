import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const Verify = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-dark text-brand-on-surface font-sans flex items-center justify-center p-4 md:p-10 relative overflow-hidden selection:bg-brand-yellow/30 selection:text-brand-yellow">
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md w-full text-center relative z-10"
      >
        <Card className="p-8 md:p-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-brand-yellow/10 rounded flex items-center justify-center text-brand-yellow mb-8">
            <Mail className="w-7 h-7" />
          </div>
          
          <h2 className="font-syne font-extrabold text-headline-lg-mobile md:text-headline-lg text-brand-on-surface tracking-tight mb-4 uppercase">
            VERIFY EMAIL
          </h2>

          <div className="bg-brand-yellow/5 border border-brand-yellow/20 rounded p-5 mb-8 w-full text-left">
            <p className="text-[10px] text-brand-on-surface-variant font-bold tracking-widest uppercase leading-relaxed font-outfit">
              A verification link has been sent to your BMSIT inbox. <strong className="text-brand-yellow">Click the link</strong> to activate your account.
            </p>
          </div>

          <div className="w-full space-y-2 mb-10 text-left">
            {[
              '01. Open your BMSIT email',
              '02. Find the verification email',
              '03. Click the secure link',
              '04. Return here to login'
            ].map((s, i) => (
              <div key={i} className="text-[9px] text-brand-on-surface-variant px-4 py-3 bg-[#09090b] rounded border border-white/5 font-bold tracking-[0.2em] font-outfit">
                {s}
              </div>
            ))}
          </div>

          <Button onClick={() => navigate('/auth?mode=login')} className="py-4 uppercase tracking-[0.2em] text-[10px]">
            <ArrowLeft className="w-4 h-4 mr-1" /> BACK TO LOGIN
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default Verify;
