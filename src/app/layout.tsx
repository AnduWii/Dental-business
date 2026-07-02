import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/lib/constants";
import { env } from "@/lib/env";

const description =
  "Catchline texts back dental patients the instant a call is missed, captures the lead, and pages your front desk.";

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl()),
  title: `${BRAND.name} · ${BRAND.tagline}`,
  description,
  openGraph: {
    title: `${BRAND.name} · ${BRAND.tagline}`,
    description,
    type: "website",
    siteName: BRAND.name,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Marks JS as available before first paint so scroll-reveal styles
            (which hide content until it enters the viewport) never apply for
            no-JS visitors. See globals.css. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
