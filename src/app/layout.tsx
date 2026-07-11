import { DM_Sans } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Aoscompo from "@/utils/aos";
import NextTopLoader from "nextjs-toploader";
import ConditionalChrome from "@/components/Layout/ConditionalChrome";

const dmsans = DM_Sans({ subsets: ["latin"] });

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Big-Sam Vocal Auditions";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bigsamproduction.co.ke";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} 2026 — Sing. Win. Join the Team.`,
    template: `%s · ${siteName}`,
  },
  description:
    "Big-Sam Production Vocal Auditions 2026. Apply online, pay via M-Pesa, and compete for cash prizes and a place on the Big-Sam team. Auditions 15 August 2026.",
  keywords: ["Big-Sam", "vocal auditions", "Kenya", "singing competition", "M-Pesa", "talent", "audition 2026"],
  openGraph: {
    title: `${siteName} 2026`,
    description:
      "Sing your heart out. Win cash prizes and join the Big-Sam team. Auditions 15 August 2026.",
    type: "website",
    locale: "en_KE",
    images: [
      {
        url: "/images/logo/channels4_banner.jpg",
        width: 1707,
        height: 282,
        alt: "Big-Sam Production",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/images/logo/channels4_banner.jpg"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmsans.className}>
        <ThemeProvider attribute="class" enableSystem={true} defaultTheme="light">
          <Aoscompo>
            <NextTopLoader color="#2F73F2" showSpinner={false} />
            <ConditionalChrome>{children}</ConditionalChrome>
          </Aoscompo>
        </ThemeProvider>
      </body>
    </html>
  );
}
