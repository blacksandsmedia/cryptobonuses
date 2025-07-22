'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

interface TOCItem {
  id: string;
  label: string;
  icon: string;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Add translation support with fallback
  let t;
  try {
    const translation = useTranslation();
    t = translation.t;
  } catch {
    // Not in translation context, use fallback
    t = (key: string) => key.split('.').pop() || key;
  }

  // Translation mapping for TOC labels
  const getTranslatedLabel = (label: string) => {
    const labelMap: { [key: string]: string } = {
      'How to Redeem': t('casino.howToRedeem') || 'How to Redeem',
      'About': t('casino.aboutCasino') || 'About',
      'Screenshots': t('casino.screenshots') || 'Screenshots', 
      'Games': t('casino.gamesAvailable') || 'Games',
      'Bonus Details': t('casino.bonusDetails') || 'Bonus Details',
      'Reviews': t('casino.reviews') || 'Reviews',
      'Analytics': t('casino.analytics') || 'Analytics',
      'Terms': t('casino.terms') || 'Terms',
      'More Offers': t('casino.moreOffers') || 'More Offers',
      'FAQ': t('casino.faq') || 'FAQ',
      'Popular This Week': t('casino.popularThisWeek') || 'Popular This Week'
    };

    // Handle dynamic labels like "Recent {casino} Updates"
    if (label.includes('Recent') && label.includes('Updates')) {
      return label.replace('Recent', t('casino.recent') || 'Recent').replace('Updates', t('casino.updates') || 'Updates');
    }

    return labelMap[label] || label;
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map(item => document.getElementById(item.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 100; // Offset for better UX

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(items[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial active section

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  // Check if content is scrollable and update indicator visibility
  useEffect(() => {
    const checkScrollable = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const isScrollable = container.scrollWidth > container.clientWidth;
        const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
        setShowScrollIndicator(isScrollable && !isAtEnd);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      // Check initial state
      checkScrollable();
      
      // Add scroll listener to container
      container.addEventListener('scroll', checkScrollable);
      
      // Add resize listener to window
      window.addEventListener('resize', checkScrollable);
      
      return () => {
        container.removeEventListener('scroll', checkScrollable);
        window.removeEventListener('resize', checkScrollable);
      };
    }
  }, [items]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for any fixed headers
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="bg-[#3e4050] rounded-xl px-4 py-3 mb-6 sticky top-4 z-10 shadow-lg">
      <div className="flex items-center justify-center relative">
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide"
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap text-white/70 hover:text-white hover:bg-[#343541]"
            >
              {item.icon && <span className="text-base">{item.icon}</span>}
              <span className={item.icon ? "hidden sm:inline" : ""}>{getTranslatedLabel(item.label)}</span>
            </button>
          ))}
        </div>
        
        {/* Enhanced fade/blur indicator to show scrollability - only when there's more content */}
        {showScrollIndicator && (
          <>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#3e4050] via-[#3e4050]/80 to-transparent pointer-events-none backdrop-blur-[1px]"></div>
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#3e4050] to-transparent pointer-events-none"></div>
          </>
        )}
      </div>
    </nav>
  );
} 