"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Package, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jwtDecode } from "jwt-decode";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      
      // Token 'exp' property is usually in seconds, so we multiply by 1000 to get milliseconds
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.warn("Sesión expirada");
        localStorage.removeItem("token");
        router.push("/"); // Idealmente a una ruta /login con query param ?expired=true
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Si el token es inválido o no se puede decodificar
      console.error("Token inválido", error);
      localStorage.removeItem("token");
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    // 1. Limpiar localStorage
    localStorage.removeItem("token");
    
    // 2. Limpiar Cookie de autenticación para el Middleware
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    
    // 3. Redirigir al inicio
    router.push("/");
  };

  const navItems = [
    {
      title: "Inicio",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      // Consider exact match for dashboard home to avoid highlighting it when on subpages
      isActive: (path: string) => path === "/dashboard",
    },
    {
      title: "Administrar Clientes",
      href: "/dashboard/customers",
      icon: <Users className="h-5 w-5" />,
      isActive: (path: string) => path.startsWith("/dashboard/customers"),
    },
    {
      title: "Administrar Productos",
      href: "/dashboard/products",
      icon: <Package className="h-5 w-5" />,
      isActive: (path: string) => path.startsWith("/dashboard/products"),
    },
  ];

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar / Navigation Drawer */}
      <aside className="w-64 flex-shrink-0 bg-background border-r flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold tracking-tight">
            Bill<span className="text-primary">gin</span>
          </h1>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.isActive(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  active 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
