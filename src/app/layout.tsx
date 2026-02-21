import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/hooks/useTheme";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CV Generator Pro - Crea tu Curriculum Profesional",
  description: "Genera tu CV profesional de forma rápida y sencilla. Múltiplas plantillas, diseño moderno y descarga en PDF.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
