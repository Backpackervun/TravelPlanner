# 🌏 Backpackervun Travel Planner

A **professional, spreadsheet-style** travel planning workspace — designed to look great on screen *and* print as a clean, client-ready itinerary PDF. **No login. No API keys. No database. No fake data. No estimation.**

Pick a region → fill out the trip details → start planning → preview → export PDF. That's the whole flow.

---

## ✨ What's new in v2.2

This release sands the rough edges of v2.0/v2.1 and adds two things travel planners actually asked for: a clean Setup flow, and a built-in Help & Contact panel so clients can reach you.

- 🚪 **Setup flow.** First-run users land on a focused intake screen — fill the four trip-info fields, pick a region, then **Start Planning**. The setup is gated by a `setupComplete` flag in localStorage so the next visit jumps straight back into the planner.
- 💬 **Help modal** (top-right "Help" button). Two tabs:
  - **How to Use** — a beginner-friendly 10-step guide with the important rules and tips inline.
  - **Contact** — direct links to Email · Instagram · WhatsApp.
- 🌐 **11 regions, region-aware everything.** Core: Japan 🇯🇵, South Korea 🇰🇷, Thailand 🇹🇭, Singapore 🇸🇬, Malaysia 🇲🇾, Europe 🇪🇺. More: Australia 🇦🇺, Indonesia 🇮🇩, Vietnam 🇻🇳, **United Kingdom 🇬🇧**, **United States 🇺🇸**.
- 💱 **Local currency follows the region.** Pick Japan → "Budget · JPY" with ¥ prefix. Pick UK → "Budget · GBP" with £. Pick Indonesia → IDR everywhere, the redundant conversion column hides automatically. Currencies covered: JPY, KRW, SGD, THB, EUR, AUD, IDR, MYR, VND, GBP, USD.
- ⚠️ **Soft region warning.** If a destination text matches a different region than the one you picked (e.g. you typed "Tokyo" but selected Korea), a small ⚠️ icon appears next to the cell. Doesn't block, doesn't auto-correct — just nudges you to verify on Google Maps. UK ↔ Europe overlap is allowed without warning.
- 🚆 **Transport category** added to the existing four (Hotel · Food · Attraction · Activity · **Transport**). Auto-suggested when both From and To are filled and category is empty — overridable.
- 🏷️ **Category icons** in dropdowns + chips: 🏨 Hotel · 🍜 Food · 🎯 Attraction · 🎡 Activity · 🚆 Transport.
- ✈️🚄🚌 **Region-aware booking** still works: Flight → Google Flights, Shinkansen + Japan → Klook, KTX/Train + South Korea → Google search, FlixBus + Europe → flixbus.com.
- 🔄 **Insert anywhere** — every row has Insert Above / Insert Below / Delete.
- 📅 **Derived Day numbers** — computed from chronological date order. You only ever edit the date.
- 👁️ **Edit / Preview / Export flow** — toggle modes from the header.
- 🖨️ **Premium A4 PDF export** — dedicated print layout with logo, "Prepared for client" panel, day blocks, summary, and clickable booking links.
- 📱 **Mobile responsive** — header collapses, panels stack, table gets horizontal scroll. Setup screen is mobile-friendly out of the box.
- 💾 **Auto-save** on every change. Storage key `:v6` with backward-compat for v4/v5 saves (the old "Korea" region renames itself to "South Korea" on load).

---

## 🚀 Quick start

You need **Node.js 18 or newer**. Get it from [nodejs.org](https://nodejs.org).

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open in your browser
# → http://localhost:3000
```

That's it. **No `.env` file. No API keys. Nothing to configure.**

---

## 📦 Deploy to Vercel (free, ~2 minutes)

1. Push the project to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo.
3. Click **Deploy** — Vercel auto-detects Next.js. Done.

---

## 🗂️ How to use it

Same flow the in-app **Help → How to Use** tab walks through:

1. **Enter trip details** on the Setup screen — Client Name, Duration, Destination, Travel Dates.
2. **Select a region.** This updates the transport options and currency.
3. **Click "Start Planning"** to enter the workspace.
4. **Add itinerary rows** with the **+ Add row** button.
5. **Use Google Maps names** for destinations (avoids the soft region warning).
6. **Fill From → To** when the row involves moving between places.
7. **Pick the transport type** manually from the dropdown.
8. **Verify on Google Maps** using the 📍 Map / 🗺 Route buttons in the Links column.
9. **Enter the actual budget manually** — no estimation, no auto-calc.
10. **Switch to Preview** to see the PDF, then **Export PDF** for clients.

Use the small **↑ / ↓** buttons on any row to insert another row above or below it. The trash icon deletes.

---

## 🧠 Design notes

**Why the soft region warning?** Travel planners are detail-oriented but human. If you're working on five Korea itineraries in a row and accidentally type "Tokyo" into one of them, the ⚠️ catches it without nagging or interrupting. We don't auto-correct because some valid trips genuinely cross regions (e.g. a Japan + Korea combo). The user is in charge.

**Why no time/cost estimation?** Auto-filled "AI-style" ranges always lie a little — JR speeds vary, fares change daily, "Tokyo Metro" is nine companies. The user typing the facts is more honest and works across all 11 regions.

**Why a separate print layout?** A spreadsheet has 14 columns. A4 portrait has room for maybe 5. Trying to shrink the spreadsheet always looked like a screenshot, never a document. The dedicated print layout renders the same data as a real itinerary document.

**Why Indonesian Rupiah as the second currency?** Backpackervun's home audience is in Indonesia. The "local currency" column is whatever the trip currency is (JPY for Japan, GBP for UK, etc.). IDR is the constant reference for the planner. When the trip currency *is* IDR (Indonesia trips), the redundant column hides itself.

---

## 🔧 What's under the hood

- **Next.js 14** (App Router) + **React 18** — JavaScript, no TypeScript.
- **Tailwind CSS** with a custom navy brand palette.
- **Recharts** for the on-screen pie + bar charts (never rendered in print).
- **localStorage** for persistence. Single key: `backpackervun-travel-planner:v6`.

Total: 4 npm dependencies. No backend. No database. No tracking.

---

## 📞 Contact

- Email: **[info@backpackervun.com](mailto:info@backpackervun.com)**
- Instagram: **[@backpackervun](https://instagram.com/backpackervun)**
- WhatsApp: **[+62 812 9805 3826](https://wa.me/6281298053826)**

(All three are also accessible from the in-app **Help** button.)

---

## 📜 License

MIT — do whatever you want with it.
