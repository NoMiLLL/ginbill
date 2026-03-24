"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Package, LayoutDashboard, LogOut, Settings, FileText } from "lucide-react";
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
      icon: <LayoutDashboard className="h-5 w-5" strokeWidth={2} />,
      isActive: (path: string) => path === "/dashboard",
    },
    {
      title: "Clientes",
      href: "/dashboard/customers",
      icon: <Users className="h-5 w-5" strokeWidth={2} />,
      isActive: (path: string) => path.startsWith("/dashboard/customers"),
    },
    {
      title: "Productos",
      href: "/dashboard/products",
      icon: <Package className="h-5 w-5" strokeWidth={2} />,
      isActive: (path: string) => path.startsWith("/dashboard/products"),
    },
    {
      title: "Facturas",
      href: "/dashboard/invoices",
      icon: <FileText className="h-5 w-5" strokeWidth={2} />,
      isActive: (path: string) => path.startsWith("/dashboard/invoices"),
    },
    {
      title: "Configuración",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" strokeWidth={2} />,
      isActive: (path: string) => path.startsWith("/dashboard/settings"),
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
    <div className="flex h-screen bg-[#E0E0E0]">
      {/* Sidebar / Navigation Drawer */}
      <aside className="w-64 flex-shrink-0 bg-transparent flex flex-col transition-all duration-300 relative z-20">
        <div className="h-20 flex items-center px-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#333333]">
            Bill<span className="text-[#1F7AE0]">gin</span>
          </h1>
        </div>
        
        <nav className="flex-1 py-6 px-6 space-y-4 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const active = item.isActive(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 ${
                  active 
                    ? "neo-pressed text-[#1F7AE0] font-semibold" 
                    : "text-[#666666] hover:neo-surface hover:text-[#333333] font-medium"
                }`}
              >
                <div className="flex items-center justify-center">
                  {item.icon}
                </div>
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-4 text-[#666666] hover:text-[#333333] hover:neo-surface rounded-[1.25rem] h-14 transition-all duration-300 font-medium"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
