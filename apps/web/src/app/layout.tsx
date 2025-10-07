import type { Metadata } from "next";
import {
  Inter,
  Roboto,
  Open_Sans,
  Montserrat,
  Playfair_Display,
  Lora,
  Merriweather,
  Fira_Sans,
  Poppins,
  Source_Sans_3,
  PT_Serif,
  Raleway,
} from "next/font/google";
import "./globals.css";

// Sans-serif fonts for presentations
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

// Serif fonts for presentations
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deck Sync - Synchronized Presentations",
  description: "Real-time synchronized slide deck presentations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${inter.variable}
          ${roboto.variable}
          ${openSans.variable}
          ${montserrat.variable}
          ${firaSans.variable}
          ${poppins.variable}
          ${sourceSans.variable}
          ${raleway.variable}
          ${playfair.variable}
          ${lora.variable}
          ${merriweather.variable}
          ${ptSerif.variable}
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}

