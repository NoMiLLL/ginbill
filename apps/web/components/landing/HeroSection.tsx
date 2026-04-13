"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center min-h-[85vh] text-center px-4 overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-chart-1/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full neo-glass text-sm font-semibold text-primary/80 dark:text-primary">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          100% Cumplimiento DIAN
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-foreground text-balance">
          Facturación Electrónica <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-1">Sin Complicaciones</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl text-balance">
          Diseñado para PYMES. Mantén tus necesidades tributarias ordenadas sin ser un experto contable. Genera facturas en segundos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button 
            asChild
            size="lg" 
            className="h-14 px-8 text-lg rounded-2xl group shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <Link href="/login">
              Probar Demo
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="h-14 px-8 text-lg rounded-2xl neo-glass font-medium border-transparent hover:bg-black/5 hover:text-foreground transition-all duration-300 cursor-pointer"
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
          >
            Saber más
          </Button>
        </div>
      </div>
    </section>
  );
}
