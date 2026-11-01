import type { Metadata } from "next";
import { Alfa_Slab_One, Montserrat } from "next/font/google";
import Footer from "./_components/footer";
import Intro from "./_components/intro";
import Providers from "./_components/providers";
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
  title: "HOODS",
  description: "51 HOODS, drawn by David Horvath. One mint per wallet on Robinhood Chain.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${alfaSlab.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Filters that roughen edges: .ink-panel uses rough-edge, the intro cover uses rough-cover. */}
        <svg aria-hidden="true" className="absolute h-0 w-0">
          <filter id="rough-edge">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" />
            <feDisplacementMap in="SourceGraphic" scale="7" />
          </filter>
          <filter id="rough-cover">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="51" />
            <feDisplacementMap in="SourceGraphic" scale="28" />
          </filter>
        </svg>
        <Intro />
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  );
}
