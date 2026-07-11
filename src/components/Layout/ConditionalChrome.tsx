"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppButton from "@/components/BigSam/WhatsAppButton";
import FaviconUpdater from "@/components/BigSam/FaviconUpdater";

/**
 * Renders the public site chrome (header, footer, floating WhatsApp, scroll-to-top)
 * on every page EXCEPT the admin area, which has its own shell.
 */
export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        <FaviconUpdater />
        {children}
      </>
    );
  }

  return (
    <>
      <FaviconUpdater />
      <Header />
      {children}
      <Footer />
      <ScrollToTop />
      <WhatsAppButton />
    </>
  );
}
