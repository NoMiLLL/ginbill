import Link from "next/link";
import { PlusCircle, Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ManagementLandingProps {
  title: string;
  description: string;
  createHref: string;
  createLabel: string;
  manageHref: string;
  manageLabel: string;
}

export default function ManagementLanding({
  title,
  description,
  createHref,
  createLabel,
  manageHref,
  manageLabel,
}: ManagementLandingProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Box: Crear Nuevo */}
        <Link href={createHref} className="group block focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
          <Card className="h-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center h-full">
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                <PlusCircle className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold">{createLabel}</h3>
              <p className="text-sm text-muted-foreground mt-2">Agrega un nuevo registro al sistema</p>
            </CardContent>
          </Card>
        </Link>

        {/* Box: Gestionar */}
        <Link href={manageHref} className="group block focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
          <Card className="h-full border hover:border-border/80 hover:shadow-md transition-all duration-300 bg-card">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center h-full">
              <div className="p-4 rounded-full bg-secondary text-secondary-foreground mb-4 group-hover:rotate-12 transition-transform duration-300">
                <Settings2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold">{manageLabel}</h3>
              <p className="text-sm text-muted-foreground mt-2">Visualiza, edita o elimina registros existentes</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
