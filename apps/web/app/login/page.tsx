import AuthTabs from "@/components/auth/AuthTabs";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex flex-col relative overflow-hidden bg-background">
      <Navbar />

      {/* Ambient backgrounds */}
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-chart-1/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      <section className="flex-1 w-full flex flex-col items-center justify-center py-28 px-4 relative z-10">
        
        {/* El contenedor .neo-glass ahora existe únicamente a nivel de página para evitar el efecto caja sobre caja */}
        <div className="w-full max-w-md mx-auto neo-glass p-8 md:p-10 rounded-[calc(var(--radius)*1.5)] shadow-2xl animate-in zoom-in-95 duration-500">
          <AuthTabs />
        </div>

      </section>

      <Footer />
    </main>
  );
}
