import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/hooks/useTheme";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://proyect-cv-2-0.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "CV Generator Pro - Crea tu Curriculum Profesional",
    template: "%s | CV Generator Pro",
  },
  description: "Crea tu currículum vitae profesional en PDF con 8 plantillas diseñadas para destacar tu perfil laboral. Integración con IA y Google.",
  keywords: [
    "CV",
    "Curriculum",
    "Currículum vitae",
    "Crear CV",
    "CV profesional",
    "Generador de CV",
    "PDF CV",
    "Plantillas CV",
    "CV Argentina",
    "Curriculum sin experiencia",
    "Cómo hacer un CV",
    "Diseñador de CV",
    "Currículum moderno",
  ],
  authors: [{ name: "Javier Espindola", url: "https://www.linkedin.com/in/javier-espindola/" }],
  creator: "Javier Espindola",
  publisher: "CV Generator Pro",
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
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: APP_URL,
    siteName: "CV Generator Pro",
    title: "CV Generator Pro - Crea tu Curriculum Profesional",
    description: "Crea tu currículum vitae profesional en PDF con 8 plantillas diseñadas para destacar tu perfil laboral. Integración con IA y Google.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CV Generator Pro - Crea tu CV profesional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CV Generator Pro - Crea tu Curriculum Profesional",
    description: "Crea tu currículum vitae profesional en PDF con 8 plantillas diseñadas para destacar tu perfil laboral.",
    images: ["/og-image.jpg"],
  },
  facebook: {
    appId: "YOUR_FACEBOOK_APP_ID",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CV Generator Pro",
  },
  alternates: {
    canonical: APP_URL,
    languages: {
      es: APP_URL,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
   icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "CV Generator Pro",
              description: "Crea tu currículum vitae profesional en PDF con 8 plantillas diseñadas para destacar tu perfil laboral.",
              url: APP_URL,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              author: {
                "@type": "Person",
                name: "Javier Espindola",
                url: "https://www.linkedin.com/in/javier-espindola/",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
              },
            }),
          }}
        />
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
