import Link from "next/link";

export const metadata = { title: "Privacy Policy — Backpackervun Travel Planner" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen paper-bg">
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <BackLink />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="mt-8 space-y-8 text-sm text-ink-soft leading-relaxed">
          <Section title="What data we collect">
            <p>When you create an account, we collect:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong className="font-medium text-ink">Full name</strong> — used to personalise your dashboard experience</li>
              <li><strong className="font-medium text-ink">Email address</strong> — used for authentication via Firebase Auth</li>
              <li><strong className="font-medium text-ink">Phone number</strong> — collected for contact purposes</li>
              <li><strong className="font-medium text-ink">Trip data</strong> — itinerary rows, destinations, budgets, and travel dates you enter into the planner</li>
            </ul>
          </Section>

          <Section title="How we store your data">
            <p>Your account credentials are stored securely using <strong className="font-medium text-ink">Firebase Authentication</strong>, a service by Google. Your trip data and profile information are stored in <strong className="font-medium text-ink">Cloud Firestore</strong>, also provided by Google, with industry-standard encryption at rest and in transit.</p>
            <p className="mt-2">A copy of your active trip is also stored in your browser's <strong className="font-medium text-ink">localStorage</strong> for fast offline access. This data stays on your device and is not transmitted to any server unless you click Save.</p>
          </Section>

          <Section title="How we use your data">
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and personalise the travel planner experience</li>
              <li>To allow you to save and reload your trip itineraries</li>
              <li>To display your name in the app dashboard</li>
              <li>To contact you if you request support via WhatsApp or email</li>
            </ul>
          </Section>

          <Section title="We do not sell your data">
            <p>We do not sell, rent, trade, or share your personal information with any third party for marketing purposes. Your data is yours.</p>
          </Section>

          <Section title="Third-party services">
            <p>This app uses the following third-party services, each with their own privacy policies:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Google Firebase (Authentication + Firestore) — <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-navy-500 hover:underline">firebase.google.com/support/privacy</a></li>
              <li>open.er-api.com — for live currency exchange rates (no user data is sent)</li>
            </ul>
          </Section>

          <Section title="Data retention">
            <p>Your account and trip data remain stored until you delete your account or request deletion. To request data deletion, contact us at <a href="mailto:info@backpackervun.com" className="text-navy-500 hover:underline">info@backpackervun.com</a>.</p>
          </Section>

          <Section title="Your rights">
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us. We will respond within 30 days.</p>
          </Section>
        </div>

        <div className="mt-12 border-t border-paper-line pt-6 text-center">
          <p className="text-xs text-ink-muted">Questions? <a href="mailto:info@backpackervun.com" className="text-navy-500 hover:underline">info@backpackervun.com</a></p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-ink mb-3">{title}</h2>
      {children}
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:underline underline-offset-2">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
      Back to planner
    </Link>
  );
}
