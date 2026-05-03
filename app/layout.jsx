import { Montserrat } from "next/font/google";
import "./globals.css";

// Single typeface across the whole app — Montserrat in 6 weights covers
// our heading (600/700), subtitle (500), body (400), and muted (300) scale.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Backpackervun Travel Planner",
  description:
    "A premium, spreadsheet-style travel planning workspace — itinerary, maps, dual-currency budget, and a printable PDF for any destination. No login, no API keys.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
