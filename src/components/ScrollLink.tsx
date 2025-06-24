'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface ScrollLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function ScrollLink({ href, children, className, title }: ScrollLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Multiple scroll attempts to ensure it works
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    // Immediate scroll
    scrollToTop();
    
    // Additional scroll attempts
    setTimeout(scrollToTop, 10);
    setTimeout(scrollToTop, 50);
    
    // Navigate after ensuring scroll position is reset
    setTimeout(() => {
      router.push(href);
      // Additional scroll after navigation starts
      setTimeout(scrollToTop, 10);
      setTimeout(scrollToTop, 50);
      setTimeout(scrollToTop, 100);
    }, 100);
  };

  return (
    <Link 
      href={href} 
      className={className}
      title={title}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
} 