'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const classNames = (...classes: (string | boolean | undefined)[]) => {
    const result = classes.filter(Boolean).join(' ').trim();
    return result || undefined;
  };

  const isActive = (path: string) => mounted && pathname === path;

  return (
    <nav className={classNames(styles.navbar, scrolled && styles.scrolled)} suppressHydrationWarning>
      {/* suppressHydrationWarning is added to overcome Turbopack cache or browser extension DOM manipulations */}
      <div className={styles.logo} suppressHydrationWarning>
        <Link href="/" suppressHydrationWarning>VaultPrompt</Link>
      </div>
      
      <div className={styles.links} suppressHydrationWarning>
        <Link href="/" className={classNames(isActive('/') && styles.activeLink)} suppressHydrationWarning>Why VaultPrompt</Link>
        <Link href="/features" className={classNames(isActive('/features') && styles.activeLink)} suppressHydrationWarning>Features</Link>
        <Link href="/demo" className={classNames(isActive('/demo') && styles.activeLink)} suppressHydrationWarning>Live Demo</Link>
      </div>
    </nav>
  );
}
