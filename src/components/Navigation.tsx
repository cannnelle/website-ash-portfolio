'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook to get current path
import { useState, useEffect } from 'react'; // Added useState, useEffect

// Define the props type
interface NavigationProps {
  navLinks: {
    title: string;
    href: string;
  }[];
}

export default function Navigation({ navLinks }: NavigationProps) {
  const pathname = usePathname(); // Get the current path
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu

  // Close menu when path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Toggle menu function
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Hamburger Button - Visible only on small screens (hidden md and up) */}
      <button 
        onClick={toggleMenu}
        className="md:hidden p-2 transition-opacity duration-200 hover:opacity-60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {/* Simple Hamburger/Close Icon Logic */}
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Navigation Links - Full Menu (hidden below md) */}
      <nav className="hidden md:flex text-sm space-x-4 md:space-x-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              href={link.href} 
              key={link.href}
              className={`transition-opacity duration-200 hover:opacity-60 ${isActive ? 'underline' : ''}`}
            >
              {link.title}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Menu Dropdown - Conditionally rendered */}
      {isOpen && (
        <nav 
          className="md:hidden absolute top-16 inset-x-0 border-b border-gray-700 z-50 p-4 space-y-2"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                href={link.href} 
                key={link.href}
                onClick={toggleMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium text-[color:var(--color-text)] hover:bg-gray-800 hover:opacity-60 transition-all duration-200 ${isActive ? 'underline' : ''}`}
              >
                {link.title}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
} 