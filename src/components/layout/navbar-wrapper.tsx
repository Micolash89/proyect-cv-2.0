"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

export function NavbarWrapper() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/login");
  
  if (isAdminRoute) {
    return null;
  }
  
  return <Navbar />;
}