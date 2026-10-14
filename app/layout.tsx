import type { Metadata } from "next";
import { Alfa_Slab_One, Montserrat } from "next/font/google";
import Footer from "./_components/footer";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const alfaSlab = Alfa_Slab_One({
  variable: "--font-alfa-slab",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hoods",
  description: "51 Hoods, drawn by David Horvath. One mint per transaction on Robinhood Chain.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${alfaSlab.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Filter used by .ink-panel to roughen panel edges. */}
        <svg aria-hidden="true" className="absolute h-0 w-0">
          <filter id="rough-edge">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" />
            <feDisplacementMap in="SourceGraphic" scale="7" />
          </filter>
        </svg>
        {children}
        <Footer />
      </body>
    </html>
  );
}
