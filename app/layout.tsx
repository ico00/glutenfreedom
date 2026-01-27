import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { generateOrganizationSchema, generateWebSiteSchema, generateJsonLdScript } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Bezglutenska sila - Celijakija, Recepti i Savjeti",
    template: "%s | Bezglutenska sila",
  },
  description: "Web aplikacija i informativna platforma vezana uz celijakiju, gluten free recepte, savjete, restorane i proizvode bez glutena.",
  keywords: ["celijakija", "gluten free", "recepti", "restorani", "Zagreb", "bez glutena", "gluten free recepti"],
  authors: [{ name: "Bezglutenska sila" }],
  creator: "Bezglutenska sila",
  publisher: "Bezglutenska sila",
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
    siteName: "Bezglutenska sila",
    title: "Bezglutenska sila - Celijakija, Recepti i Savjeti",
    description: "Web aplikacija i informativna platforma vezana uz celijakiju, gluten free recepte, savjete, restorane i proizvode bez glutena.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bezglutenska sila - Celijakija, Recepti i Savjeti",
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
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="hr" suppressHydrationWarning>
      <body className={inter.className}>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateJsonLdScript(organizationSchema) }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateJsonLdScript(websiteSchema) }}
        />
        <ErrorBoundary>
          <SessionProviderWrapper>
            <ThemeProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </SessionProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}

