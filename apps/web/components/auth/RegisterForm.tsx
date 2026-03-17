"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Esquema Zod para Registro (Basado en el DTO de NestJS)
const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder 100 caracteres").trim(),
  address: z.string().min(1, "La dirección es requerida").max(150, "La dirección no puede exceder 150 caracteres").trim(),
  // Validación básica para celular de Colombia (empieza por 3 y tiene 10 dígitos)
  phone: z.string().regex(/^3\d{9}$/, "Debe ser un número de celular de Colombia válido (ej: 3001234567)"),
  email: z.string().min(1, "El correo electrónico es requerido").email("Asegúrate de colocar un correo válido").trim().toLowerCase(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72, "La contraseña no puede exceder 72 caracteres"),
  municipalityId: z.number().min(1, "Debes seleccionar un municipio")
});

type RegisterValues = z.infer<typeof registerSchema>;

// Municipios quemados para el Frontend a forma de ejempo
const MUNICIPALITIES = [
  { id: 1, name: "Bogotá, D.C." },
  { id: 2, name: "Medellín" },
  { id: 3, name: "Cali" },
  { id: 4, name: "Barranquilla" },
  { id: 5, name: "Cartagena" },
];

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      password: "",
      municipalityId: undefined, 
    },
  });

  async function onSubmit(data: RegisterValues) {
    setIsLoading(true);
    setSuccessMsg("");
    
    try {
      // Connect to the actual backend register endpoint
      console.log("Sending Register data:", data);
      
      const response = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Registered successfully", result);
        setSuccessMsg("¡Registro exitoso! Ya puedes iniciar sesión.");
        form.reset();
        
        // Opcional: Redirigir o recargar después de un momento para que vean el éxito
        setTimeout(() => {
            window.location.reload(); // De base esto reiniciará las pestañas y dejará al usuario en Login (que es el tab por defecto)
        }, 2000);
      } else {
        const errorData = await response.json();
        
        if (errorData.message) {
            if (Array.isArray(errorData.message)) {
                // Errores de validación de los DTO de NestJS
                console.error("Validation failed in backend:", errorData.message);
            } else {
                // Errores string como el de BadRequestException que acabamos de agregar
                setSuccessMsg("");
                alert(errorData.message); // O usa un toast/alert mejor de tu UI
            }
        }
      }
    } catch (error) {
       console.error("Network error during register", error);
    } finally {
       setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Nombre */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Juan Pérez" className="transition-all focus:ring-2 focus:ring-primary/50" {...field} />
              </FormControl>
              <FormMessage className="animate-in slide-in-from-top-1" />
            </FormItem>
          )}
        />

        {/* Dos Columnas para Correo y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                    <Input placeholder="tucorreo@ejemplo.com" className="transition-all focus:ring-2 focus:ring-primary/50" {...field} />
                </FormControl>
                <FormMessage className="animate-in slide-in-from-top-1" />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Teléfono Celular</FormLabel>
                <FormControl>
                    <Input placeholder="Ej. 3001234567" className="transition-all focus:ring-2 focus:ring-primary/50" {...field} />
                </FormControl>
                <FormMessage className="animate-in slide-in-from-top-1" />
                </FormItem>
            )}
            />
        </div>

        {/* Dos Columnas para Dirección y Ciudad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Dirección Física</FormLabel>
                <FormControl>
                    <Input placeholder="Ej. Calle 100 # 20 - 30" className="transition-all focus:ring-2 focus:ring-primary/50" {...field} />
                </FormControl>
                <FormMessage className="animate-in slide-in-from-top-1" />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="municipalityId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Municipio / Ciudad</FormLabel>
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value ? field.value.toString() : undefined}>
                    <FormControl>
                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/50">
                        <SelectValue placeholder="Selecciona una ciudad..." />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {MUNICIPALITIES.map((mun) => (
                            <SelectItem key={mun.id} value={mun.id.toString()}>{mun.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage className="animate-in slide-in-from-top-1" />
                </FormItem>
            )}
            />
        </div>

        {/* Contraseña */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" className="transition-all focus:ring-2 focus:ring-primary/50" {...field} />
              </FormControl>
              <FormMessage className="animate-in slide-in-from-top-1" />
            </FormItem>
          )}
        />
        
        {successMsg && (
            <div className="p-3 mt-4 text-sm font-medium text-emerald-800 bg-emerald-100 rounded-md animate-in zoom-in-95">
                {successMsg}
            </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 text-md font-medium mt-6 transition-all active:scale-[0.98]" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            "Registrarme"
          )}
        </Button>
      </form>
    </Form>
  );
}
