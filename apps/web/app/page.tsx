import AuthTabs from "@/components/auth/AuthTabs";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Elementos decorativos de fondo para dar un diseño Premium */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-chart-1/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-4xl flex flex-col items-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-center">
          Potencia tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-1">facturas</span> en la nube.
        </h1>
        <p className="text-muted-foreground text-center max-w-lg mb-12 text-lg">
          La forma más rápida, inteligente y hermosa de manejar tu contabilidad. Únete a miles de empresas que confían en Billgin.
        </p>

        <AuthTabs />
        
      </div>
    </main>
  );
}
