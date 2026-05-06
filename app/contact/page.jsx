export const metadata = { title: "Contact — Backpackervun Travel Planner" };

import Link from "next/link";

const WA_NUMBER = "6281298053826";

export default function ContactPage() {
  const contacts = [
    {
      icon: "💬",
      label: "WhatsApp",
      value: "+62 812 9805 3826",
      detail: "Fastest response",
      href: `https://wa.me/${WA_NUMBER}`,
    },
    {
      icon: "📧",
      label: "Email",
      value: "info@backpackervun.com",
      detail: "Reply within 24 hours",
      href: "mailto:info@backpackervun.com",
    },
    {
      icon: "📸",
      label: "Instagram",
      value: "@backpackervun",
      detail: "DMs open",
      href: "https://instagram.com/backpackervun",
    },
  ];

  return (
    <div className="min-h-screen paper-bg">
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:underline underline-offset-2">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
          Back to planner
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">Contact us</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Need help planning your trip? We'd love to help.
        </p>

        {/* Contact cards */}
        <div className="mt-8 space-y-3">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-paper-line bg-white p-4 transition hover:border-navy-200 hover:shadow-soft"
            >
              <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-navy-50 text-2xl">
                {c.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">{c.label}</p>
                <p className="text-sm font-semibold text-ink truncate">{c.value}</p>
                <p className="text-[11px] text-ink-muted">{c.detail}</p>
              </div>
              <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
              </svg>
            </a>
          ))}
        </div>

        {/* Business hours */}
        <div className="mt-8 rounded-2xl border border-paper-line bg-white p-5">
          <h2 className="text-sm font-semibold text-ink mb-3">Business Hours</h2>
          <div className="space-y-1.5 text-sm text-ink-soft">
            <div className="flex justify-between">
              <span>Monday – Friday</span>
              <span className="font-medium text-ink">09:00 – 18:00 WIB</span>
            </div>
            <div className="flex justify-between">
              <span>Saturday</span>
              <span className="font-medium text-ink">09:00 – 14:00 WIB</span>
            </div>
            <div className="flex justify-between">
              <span>Sunday</span>
              <span className="text-ink-muted">Closed</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            WhatsApp responses may arrive outside business hours for urgent trip inquiries.
          </p>
        </div>
      </div>
    </div>
  );
}
