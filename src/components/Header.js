'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header-content">
        <Link href="/" className="logo-container">
          <div className="logo-icon">N</div>
          <span className="logo-text">Narayan Pharmacy</span>
        </Link>
        <nav className="nav-links">
          <Link 
            href="/" 
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          >
            New Prescription
          </Link>
          <Link 
            href="/list" 
            className={`nav-link ${pathname.startsWith('/list') || pathname.startsWith('/prescriptions') ? 'active' : ''}`}
          >
            Prescriptions List
          </Link>
        </nav>
      </div>
    </header>
  );
}
