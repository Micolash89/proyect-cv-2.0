import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  FileText, Settings, LogOut, Home, PlusCircle
} from "lucide-react";

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

          <nav className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <Link href="/admin/cv/new">
              <Button variant="ghost" size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Crear CV</span>
              </Button>
            </Link>
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
