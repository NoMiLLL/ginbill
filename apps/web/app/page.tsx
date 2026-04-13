import AuthTabs from "@/components/auth/AuthTabs";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col relative overflow-hidden bg-background">
      <Navbar />
      
      <HeroSection />
      
      <FeaturesSection />

      {/* Login Section CTA */}
      <section id="login" className="py-32 px-4 relative z-10 w-full flex flex-col items-center">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground">
            Comienza ahora mismo
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl text-balance mb-10">
            Únete a las empresas que ya están ordenando sus finanzas y facturando con la normativa vigente en minutos.
          </p>
          <a href="/login" className="inline-flex items-center justify-center h-14 px-8 text-lg rounded-[var(--radius)] bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl transition-all shadow-primary/25 hover:scale-105 active:scale-95 font-semibold">
            Crear cuenta o ingresar
          </a>
        </div>

        {/* Ambient light for CTA section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-80 bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      </section>

      <Footer />
    </main>
  );
}

