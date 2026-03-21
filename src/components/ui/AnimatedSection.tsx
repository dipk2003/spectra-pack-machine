'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useInView, Variant } from 'framer-motion';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  initialVisible?: boolean;
}

export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  initialVisible = false,
}: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const dirVariants: Record<string, { hidden: Variant; visible: Variant }> = {
    up: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 }
    },
    down: {
      hidden: { opacity: 0, y: -40 },
      visible: { opacity: 1, y: 0 }
    },
    left: {
      hidden: { opacity: 0, x: -40 },
      visible: { opacity: 1, x: 0 }
    },
    right: {
      hidden: { opacity: 0, x: 40 },
      visible: { opacity: 1, x: 0 }
    },
    none: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    }
  };

  const v = dirVariants[direction] || dirVariants.up;

  return (
    <motion.div
      ref={ref}
      initial={initialVisible ? 'visible' : 'hidden'}
      animate={initialVisible || isInView ? 'visible' : 'hidden'}
      variants={v}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
