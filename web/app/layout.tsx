import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "TransitLens — Exoplanet Detection",
  description: "Automated exoplanet transit detection and classification platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-dark text-text-primary">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-64 flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
