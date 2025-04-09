"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll events to apply styling when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 w-full py-4 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/80 backdrop-blur-lg shadow-md' : 'bg-transparent'
    }`}>
      <div className="container-custom flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center gap-3 relative z-10">
          <div className={`text-2xl font-bold transition-all duration-300 ${
            isScrolled ? 'text-gradient-pink' : 'text-gradient'
          }`}>LM</div>
          <div className="h-6 w-px bg-gray mx-2"></div>
          <span className="text-gray-dark font-medium">DevOps Engineer</span>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="sm:hidden absolute right-4 top-4 z-20 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <div className="relative w-6 h-5">
            <span className={`absolute block w-6 h-0.5 bg-foreground transition-all duration-300 ${
              isMobileMenuOpen ? 'top-2 -rotate-45' : 'top-0'
            }`}></span>
            <span className={`absolute block w-6 h-0.5 bg-foreground transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-0' : 'top-2'
            }`}></span>
            <span className={`absolute block w-6 h-0.5 bg-foreground transition-all duration-300 ${
              isMobileMenuOpen ? 'top-2 rotate-45' : 'top-4'
            }`}></span>
          </div>
        </button>
        
        {/* Mobile Menu */}
        <div className={`fixed inset-0 bg-background/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8 text-xl transition-all duration-500 sm:hidden ${
          isMobileMenuOpen ? 'opacity-100 z-10' : 'opacity-0 -z-10'
        }`}>
          <a href="#about" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About</a>
          <a href="#experience" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Experience</a>
          <a href="#skills" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Skills</a>
          <a href="#education" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Education</a>
          <a href="#projects" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Projects</a>
          <Link href="/infinite" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Infinite</Link>
          <Link href="/share" className="text-foreground hover:text-primary transition-colors flex items-center gap-1" onClick={() => setIsMobileMenuOpen(false)}>
            <span>CodeShare</span>
            <span className="text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">New</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center space-x-1">
          <nav className="flex items-center space-x-1">
            {['About', 'Experience', 'Skills', 'Education', 'Projects'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="px-4 py-2 rounded-full text-foreground hover:text-primary hover:bg-gray-light/50 transition-all focus-ring"
              >
                {item}
              </a>
            ))}
            <Link 
              href="/infinite" 
              className="px-4 py-2 rounded-full text-foreground hover:text-primary hover:bg-gray-light/50 transition-all focus-ring"
            >
              Infinite
            </Link>
            <Link 
              href="/share" 
              className="px-4 py-2 rounded-full text-foreground hover:text-primary hover:bg-gray-light/50 transition-all focus-ring flex items-center gap-1"
            >
              <span>CodeShare</span>
              <span className="text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">New</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 