import { redirect } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSession, logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  FileText, Settings, LogOut, Search, Filter,
  Eye, CheckCircle, Clock, XCircle
} from "lucide-react";
import { formatDate } from "@/lib/utils/cn";
import type { UserCV, CVStatus } from "@/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getSession();

  if (!admin) {
    redirect("/login");
  }

  const handleLogout = async () => {
    "use server";
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CV Admin</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/admin/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <ThemeToggle />
            <form action={handleLogout}>
              <Button variant="ghost" size="icon" type="submit">
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
