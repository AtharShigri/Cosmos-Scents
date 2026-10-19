import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

// Fraunces: a soft, characterful serif for headings. Deliberately not
// Playfair Display -- Playfair is the single most common "elegant brand"
// default in AI site generators, and the goal here is to avoid that tell.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// Inter: a neutral, highly legible sans for body copy. Body text should
// not carry personality -- the serif heading already does that job.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Cosmos Scents",
  description:
    "Cosmos Scents -- Gilgit-Baltistan's first local fragrance brand.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <ToastProvider>
          <CartProvider>
            <Header />
            {children}
            <Footer />
            <ChatWidget />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
