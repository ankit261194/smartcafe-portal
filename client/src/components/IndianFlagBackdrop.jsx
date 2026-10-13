import React from 'react';

/**
 * IndianFlagBackdrop (तिरंगा पृष्ठभूमि - शुद्ध भारतीय ध्वज, बिना अशोक चक्र)
 * Full-screen patriotic Indian National Flag atmosphere spanning 100% of the viewport:
 * - Top Third (33.3%): Saffron (केसरिया - #FF9933 / #FF671F)
 * - Middle Third (33.3%): White (श्वेत - #FFFFFF)
 * - Bottom Third (33.3%): Green (हरा - #138808 / #046A38)
 * Clean, seamless, ultra-modern backdrop with ZERO Ashok Chakra watermark.
 */
export default function IndianFlagBackdrop({ theme = 'light' }) {
  const isDark = theme === 'dark';

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500 no-print"
    >
      {/* =================================================================== */}
      {/* 1. TOP SECTION: PURE SAFFRON (केसरिया) - 33.33% */}
      {/* =================================================================== */}
      <div 
        className={`absolute top-0 left-0 right-0 h-[34vh] transition-opacity duration-500 ${
          isDark 
            ? 'bg-gradient-to-b from-[#FF671F]/30 via-[#FF9933]/15 to-transparent' 
            : 'bg-gradient-to-b from-[#FF671F]/28 via-[#FF9933]/18 to-transparent'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-24 bg-[#FF671F]/15 blur-2xl pointer-events-none" />
      </div>

      {/* =================================================================== */}
      {/* 2. MIDDLE SECTION: PURE CLEAN WHITE (श्वेत) - 33.33% */}
      {/* =================================================================== */}
      <div 
        className={`absolute top-[32vh] bottom-[32vh] left-0 right-0 transition-colors duration-500 ${
          isDark ? 'bg-transparent' : 'bg-white/40'
        }`}
      />

      {/* =================================================================== */}
      {/* 3. BOTTOM SECTION: PURE INDIA GREEN (हरा) - 33.33% */}
      {/* =================================================================== */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-[34vh] transition-opacity duration-500 ${
          isDark 
            ? 'bg-gradient-to-t from-[#046A38]/32 via-[#138808]/15 to-transparent' 
            : 'bg-gradient-to-t from-[#046A38]/28 via-[#138808]/18 to-transparent'
        }`}
      >
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[#046A38]/15 blur-2xl pointer-events-none" />
      </div>
    </div>
  );
}
