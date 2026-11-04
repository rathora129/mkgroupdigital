'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import styled from 'styled-components';
import siteConfig from '@/data/site';

const Float = styled(motion.a)`
  position: fixed;
  right: clamp(1rem, 3vw, 1.75rem);
  bottom: clamp(1rem, 3vw, 1.75rem);
  z-index: 150;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(140deg, #2bde73 0%, #1fae56 100%);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 18px 42px -14px rgba(31, 174, 86, 0.65);

  &:hover {
    transform: translateY(-3px) scale(1.04);
    box-shadow: 0 24px 52px -16px rgba(31, 174, 86, 0.75);
  }

  &:focus-visible {
    outline: 2px solid #2bde73;
    outline-offset: 3px;
  }

  @media (max-width: 640px) {
    width: 50px;
    height: 50px;
  }
`;

export default function WhatsAppFloat() {
  const reduceMotion = useReducedMotion();

  return (
    <Float
      href={siteConfig.whatsappFloatUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.6, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
    >
      <MessageCircle size={26} strokeWidth={1.9} aria-hidden="true" />
    </Float>
  );
}
