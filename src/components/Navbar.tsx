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

  // Returns empty string instead of undefined so SSR and client renders
  // produce the same className attribute value, preventing hydration mismatches.
  const classNames = (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(' ').trim();

  const isActive = (path: string) => mounted && pathname === path;

  return (
    <nav className={classNames(styles.navbar, scrolled && styles.scrolled)}>
      <div className={styles.logo}>
        {/* suppressHydrationWarning: browser extensions (e.g. rewrite/translate) may substitute this text */}
        <Link href="/" suppressHydrationWarning>VaultPrompt</Link>
      </div>

      <div className={styles.links}>
        <Link href="/" className={classNames(isActive('/') && styles.activeLink)}>Why VaultPrompt</Link>
        <Link href="/features" className={classNames(isActive('/features') && styles.activeLink)}>Features</Link>
        <Link href="/demo" className={classNames(isActive('/demo') && styles.activeLink)}>Live Demo</Link>
      </div>
    </nav>
  );
}
