"use client";

import { useState } from "react";

/**
 * LoginHelpCard — collapsible "How to create account" section.
 * Shown on both /login and /signup pages.
 */
export default function LoginHelpCard() {
  const [open, setOpen] = useState(false);

  const steps = [
    {
      n: 1,
      title: "Create your account",
      body: "Go to the Sign Up page. Enter your full name, email address, phone number, and a password of at least 6 characters.",
    },
    {
      n: 2,
      title: "Log in",
      body: "Use your email and password on the Sign In page. If you forget your password, contact us via WhatsApp.",
    },
    {
      n: 3,
      title: "Access your planner",
      body: "After login you can save trips, load previous trips, export PDF itineraries, and use the realtime currency planner.",
    },
    {
      n: 4,
      title: "Save your work",
      body: "Click the Save button in the top bar to securely store your itinerary to the cloud. Changes are NOT saved automatically.",
    },
  ];

  return (
    <div className="w-full max-w-sm rounded-2xl border border-accent-100 bg-accent-50/50 overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">❓</span>
          <span className="text-sm font-semibold text-navy-500">How to create an account?</span>
        </div>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 text-navy-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Content */}
      {open && (
        <div className="border-t border-accent-100 px-5 pb-5 pt-4">
          <ol className="space-y-4">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-navy-500 text-[10px] font-bold text-white">
                  {s.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{s.title}</p>
                  <p className="mt-0.5 text-xs text-ink-soft leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 rounded-lg border border-accent-200 bg-white px-3.5 py-3">
            <p className="text-xs text-ink-soft">
              Need help?{" "}
              <a
                href="https://wa.me/6281298053826"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-navy-500 hover:underline underline-offset-2"
              >
                Chat us on WhatsApp
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
