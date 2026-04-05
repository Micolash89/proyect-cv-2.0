"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X, Home, PlusCircle, LogIn } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">CV Generator</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
          </Link>
          <Link href="/registro">
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Crear CV</span>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Button>
          </Link>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t md:hidden">
          <nav className="container mx-auto flex flex-col gap-2 p-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/registro"
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              <PlusCircle className="h-4 w-4" />
              Crear CV
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}