import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Gluten Freedom - Celijakija, Recepti i Savjeti",
    template: "%s | Gluten Freedom",
  },
  description: "Web aplikacija i informativna platforma vezana uz celijakiju, gluten free recepte, savjete, restorane i proizvode bez glutena.",
  keywords: ["celijakija", "gluten free", "recepti", "restorani", "Zagreb", "bez glutena", "gluten free recepti"],
  authors: [{ name: "Gluten Freedom" }],
  creator: "Gluten Freedom",
  publisher: "Gluten Freedom",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "hr_HR",
    url: "/",
    siteName: "Gluten Freedom",
    title: "Gluten Freedom - Celijakija, Recepti i Savjeti",
    description: "Web aplikacija i informativna platforma vezana uz celijakiju, gluten free recepte, savjete, restorane i proizvode bez glutena.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gluten Freedom - Celijakija, Recepti i Savjeti",
    description: "Web aplikacija i informativna platforma vezana uz celijakiju, gluten free recepte, savjete, restorane i proizvode bez glutena.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

