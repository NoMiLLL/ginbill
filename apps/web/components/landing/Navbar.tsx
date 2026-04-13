"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 px-4 py-4 animate-in slide-in-from-top-4 duration-500">
      <div className="max-w-6xl mx-auto flex items-center justify-between neo-glass rounded-[var(--radius)] px-6 py-3">
        <Link href="/" className="font-extrabold text-2xl tracking-tight text-primary hover:opacity-80 transition-opacity">
          Billgin<span className="text-foreground">.</span>
        </Link>
        <div className="space-x-4">
          <Button 
            asChild
            variant="ghost" 
            className="hidden sm:inline-flex transition-colors font-medium hover:bg-black/5 cursor-pointer" 
          >
            <Link href="/#features">Características</Link>
          </Button>
          <Button 
            asChild
            className="rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Link href="/login">Ingresar</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
