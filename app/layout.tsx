import type { Metadata } from "next";
import "./globals.css";
import "./cinema.css";
import "./studio-refinements.css";
import "./cast-production.css";
import "./contact-cta.css";

export const metadata: Metadata = {
  title: { default: "RTV AI Studios — Stories without limits", template: "%s | RTV AI Studios" },
  description: "AI-powered commercials, brand avatars, and original branded series. Explore the RTV studio and find the right production for your business.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
