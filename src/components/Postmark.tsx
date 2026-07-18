import React from 'react';
import { motion } from 'motion/react';

interface PostmarkProps {
  textLine1?: string;
  textLine2?: string;
  textLine3?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'seal' | 'ink';
  className?: string;
  rotateDeg?: number;
}

export default function Postmark({
  textLine1 = 'DOST',
  textLine2 = 'MAILKIT',
  textLine3 = 'STUDIO',
  size = 'md',
  variant = 'seal',
  className = '',
  rotateDeg = -6
}: PostmarkProps) {
  // Check reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const sizeClasses = {
    sm: 'w-12 h-12 text-[7px]',
    md: 'w-24 h-24 text-[10px]',
    lg: 'w-28 h-28 text-[12px]'
  };

  const ringStyles = variant === 'seal' 
    ? 'border-2 border-seal text-seal bg-paper/95' 
    : 'border-2 border-ink text-ink bg-paper/95';

  const innerRingStyles = variant === 'seal'
    ? 'border border-dashed border-seal/80'
    : 'border border-dashed border-ink/80';

  // Settle animation: rotates slightly from 0 to target degree on load
  const initialRotate = prefersReducedMotion ? rotateDeg : 0;
  const animateRotate = rotateDeg;

  return (
    <motion.div
      initial={{ rotate: initialRotate, scale: prefersReducedMotion ? 1 : 0.9, opacity: 0 }}
      animate={{ rotate: animateRotate, scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 120, 
        damping: 14, 
        delay: 0.15 
      }}
      className={`relative rounded-full flex items-center justify-center font-serif font-semibold shadow-sm select-none pointer-events-none ${sizeClasses[size]} ${ringStyles} ${className}`}
      id="postmark-badge"
    >
      {/* Dashed Inner Ring */}
      <div className={`absolute inset-1 rounded-full ${innerRingStyles} flex flex-col items-center justify-center p-1 text-center leading-tight tracking-[0.12em]`}>
        <span className="font-medium">{textLine1}</span>
        <span className="font-extrabold tracking-[0.16em] my-0.5">{textLine2}</span>
        <span className="font-medium opacity-90">{textLine3}</span>
      </div>
    </motion.div>
  );
}
