import { Metadata }   from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jokko - Plateforme Multi-Tenant",
  description: "Gérez vos organisations et projets avec Jokko",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
