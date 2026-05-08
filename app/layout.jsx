import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/context/AuthProvider";
import { TranslationProvider } from "@/context/TranslationContext";

// ✅ FIX: Import react-datepicker base CSS here so it's available globally
// Without this the calendar renders as a vertical list on all platforms
import "react-datepicker/dist/react-datepicker.css";

import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Backpackervun Travel Planner",
  description:
    "Premium travel planning workspace — itinerary, dual-currency budget, and printable PDF for any destination.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans bg-paper text-ink antialiased">
        {/*
          TranslationProvider wraps AuthProvider so auth pages
          (login/signup) also have access to translations.
        */}
        <TranslationProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
