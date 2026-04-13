export function Footer() {
  return (
    <footer className="w-full py-8 relative z-10 mt-auto border-t border-border bg-background pt-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="font-extrabold text-xl tracking-tight text-foreground opacity-30 grayscale pointer-events-none">
            Billgin.
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Todos los derechos reservados.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground font-medium">
          <a href="#" className="hover:text-primary transition-colors">Términos</a>
          <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
          <a href="#" className="hover:text-primary transition-colors">Soporte y Contacto</a>
        </div>
      </div>
    </footer>
  );
}
