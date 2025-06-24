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
    
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Navigate after a brief delay to ensure scroll happens first
    setTimeout(() => {
      router.push(href);
    }, 10);
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