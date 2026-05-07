import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/context/AuthProvider";
import { TranslationProvider } from "@/context/TranslationContext";
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
    "A premium travel planning workspace — itinerary, maps, dual-currency budget, and a printable PDF for any destination.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans bg-paper text-ink antialiased">
        {/*
          TranslationProvider must wrap AuthProvider because some auth
          components (login/signup) also need translations.
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
