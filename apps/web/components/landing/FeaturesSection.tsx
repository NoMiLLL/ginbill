import { CheckCircle2, Zap, ShieldCheck } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      title: "Integración DIAN Segura",
      description: "Tus facturas electrónicas se validan y envían automáticamente cumpliendo todos los estándares requeridos.",
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    },
    {
      title: "Extremadamente Rápido",
      description: "Dile adiós a los procesos lentos. Nuestro sistema optimizado te permite facturar en menos de 1 minuto.",
      icon: <Zap className="w-6 h-6 text-chart-1" />,
    },
    {
      title: "Libre de Errores",
      description: "Validación de datos en tiempo real antes de enviar a la DIAN para evitar rechazos y multas costosas.",
      icon: <CheckCircle2 className="w-6 h-6 text-chart-2" />,
    }
  ];

  return (
    <section id="features" className="py-24 px-4 relative z-10 w-full max-w-6xl mx-auto">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
          Control total de tu facturación
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg text-balance">
          Olvídate del papeleo contable. Nuestra interfaz te guía en cada paso del proceso con total facilidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="neo-glass p-8 rounded-[var(--radius-xl)] flex flex-col items-start gap-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="p-3 bg-background rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-foreground tracking-tight">
              {feature.title}
            </h3>
            <p className="text-muted-foreground/90 leading-relaxed text-[15px]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
