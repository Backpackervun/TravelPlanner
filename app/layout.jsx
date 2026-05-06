import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/context/AuthProvider";
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
        {/* AuthProvider keeps Firebase auth state available to all pages */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
