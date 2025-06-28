"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import './styles.css';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation links
  const navigationLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/casinos', label: 'Casinos' },
    { href: '/admin/reviews', label: 'Reviews' },
    { href: '/admin/reports', label: 'Reports' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/pages', label: 'Pages' },
    { href: '/admin/enquiries', label: 'Enquiries' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  // Check for admin authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (isLoginPage) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin-auth', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setAdminUser(data.user);
          } else {
            throw new Error('Invalid response format');
          }
        } else {
          // Clear any invalid token and redirect to login
          document.cookie = 'admin-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          setAdminUser(null);
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear any invalid token and redirect to login
        document.cookie = 'admin-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setAdminUser(null);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isLoginPage, router, pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Logout function
  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch('/api/admin-logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast.success('Logged out successfully');
        setAdminUser(null); // Clear the admin user state
        router.push('/admin/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
      // Fallback: clear cookie manually and redirect anyway
      document.cookie = 'admin-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      setAdminUser(null);
      router.push('/admin/login');
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#343541]">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  // For login page, just show the children without admin UI
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#343541] text-white">
        {children}
      </div>
    );
  }

  // Full admin layout for authenticated admin users
  return (
    <div className="min-h-screen bg-[#343541] text-white">
      <nav className="bg-[#292932] shadow-md border-b border-[#404055]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
                  <Image
                    src="https://cdn.prod.website-files.com/67dd29ae7952086f714105e7/67e11433aaedad5402a3d9c5_CryptoBonuses%20Logo%20Main.webp"
                    alt="CryptoBonuses"
                    width={140}
                    height={30}
                    priority
                    className="h-6 sm:h-8 w-auto"
                  />
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:ml-6 lg:flex lg:space-x-4 lg:items-center">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      pathname === link.href
                        ? 'text-[#68D08B] bg-[#343541]'
                        : 'text-[#a7a9b4] hover:text-[#68D08B] hover:bg-[#343541]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop User Info and Actions */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <span className="text-[#a7a9b4] text-sm truncate max-w-32 lg:max-w-none">
                {adminUser?.email || session?.user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-[#a7a9b4] hover:text-[#68D08B] hover:bg-[#343541] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#68D08B]"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!mobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#343541] border-t border-[#404055]">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? 'text-[#68D08B] bg-[#292932]'
                    : 'text-[#a7a9b4] hover:text-[#68D08B] hover:bg-[#292932]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile User Info and Logout */}
            <div className="border-t border-[#404055] pt-4 pb-3">
              <div className="flex items-center px-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-[#68D08B] flex items-center justify-center">
                    <span className="text-sm font-medium text-[#343541]">
                      {(adminUser?.email || session?.user?.email || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-white">Admin</div>
                  <div className="text-xs text-[#a7a9b4] truncate">
                    {adminUser?.email || session?.user?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 