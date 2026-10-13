import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

/**
 * ScrollToTopWidget (1-क्लिक फ्लोटिंग स्क्रॉल कंट्रोलर)
 * Provides high-visibility, 1-click smooth scrolling to top and bottom
 * with live page scroll percentage indicator.
 */
export default function ScrollToTopWidget() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (scrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }

      // Always visible once page has any scroll height, or if scrolled > 80px
      setIsVisible(scrollTop > 60 || (document.documentElement.scrollHeight > window.innerHeight + 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  if (!isVisible || scrollProgress === 0) return null;

  return (
    <aside
      aria-label="पेज स्क्रॉल नियंत्रण"
      className="fixed bottom-6 right-5 z-40 flex flex-col items-center gap-1.5 select-none no-print transition-all duration-300"
    >
      {/* 3-Stripe Indian Flag Micro Indicator on Floating Widget */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-orange-400/60 dark:border-orange-500/50 shadow-2xl rounded-2xl p-1.5 flex flex-col items-center gap-1 hover:border-orange-500 transition-all">
        
        {/* Scroll To Top Button */}
        <button
          type="button"
          onClick={scrollToTop}
          title="शीर्ष पर जाएं (Scroll to Top)"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white shadow-md transition cursor-pointer"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Live Percentage & Scroll Indicator */}
        <div className="px-1 py-0.5 text-center">
          <span className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 block leading-tight">
            {scrollProgress}%
          </span>
          <span className="text-[8px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-tighter block leading-tight">
            स्क्रॉल
          </span>
        </div>

        {/* Scroll To Bottom Button */}
        <button
          type="button"
          onClick={scrollToBottom}
          title="नीचे जाएं (Scroll to Bottom)"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-95 text-white shadow-md transition cursor-pointer"
        >
          <ArrowDown className="w-5 h-5 stroke-[2.5]" />
        </button>

      </div>
    </aside>
  );
}
