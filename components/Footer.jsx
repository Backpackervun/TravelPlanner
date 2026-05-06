"use client";

import Link from "next/link";

export default function Footer({ className = "" }) {
  const WA = "6281298053826";

  return (
    <footer className={`no-print border-t border-paper-line bg-white/70 ${className}`}>
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Backpackervun" className="h-5 w-auto opacity-80" />
            <span className="text-[11px] text-ink-muted">Travel Planner</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <FooterLink href="/terms">Terms of Use</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href={`https://wa.me/${WA}`} external>WhatsApp</FooterLink>
            <FooterLink href="https://instagram.com/backpackervun" external>Instagram</FooterLink>
          </nav>

          {/* Copyright */}
          <p className="text-[11px] text-ink-muted whitespace-nowrap">
            © {new Date().getFullYear()} Backpackervun
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children, external }) {
  const cls = "text-[12px] text-ink-muted transition hover:text-navy-500";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
