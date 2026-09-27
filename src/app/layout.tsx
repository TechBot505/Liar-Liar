import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVars } from "./fonts";
import { Providers } from "./providers";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { Toaster } from "@/components/ui";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { InstallHint } from "@/components/pwa/InstallHint";

export const metadata: Metadata = {
  title: "Liar Liar — fool your friends",
  description:
    "A real-time multiplayer bluffing party game. Everyone writes a convincing lie, then hunts for the truth. Fool your friends, spot the truth, win the crown.",
  applicationName: "Liar Liar",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Liar Liar",
  },
  openGraph: {
    title: "Liar Liar — fool your friends",
    description: "Write convincing lies, spot the truth, fool your friends.",
    type: "website",
    siteName: "Liar Liar",
  },
  twitter: { card: "summary_large_image", title: "Liar Liar" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No maximumScale — pinch-zoom stays available for accessibility.
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#0A0A0B",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVars}>
      <body className="stage antialiased">
        <Providers>
          <AnimatedBackground />
          {children}
          <Toaster />
          <InstallHint />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
