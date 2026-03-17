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
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api";

const customerSchema = z.object({
  identification: z.string().min(2, "La identificación es requerida").max(50),
  names: z.string().min(2, "El nombre es requerido").max(150),
  address: z.string().min(2, "La dirección es requerida").max(200),
  email: z.string().email("Debe ser un correo válido").max(120),
  phone: z.string().min(6, "El teléfono es requerido").max(20),
  municipalityId: z.number().min(1, "Debes seleccionar un municipio"),
});

type CustomerValues = z.infer<typeof customerSchema>;

// Ejemplo de municipios (Ideally fetch this from backend if available)
const MUNICIPALITIES = [
  { id: 1, name: "Bogotá, D.C." },
  { id: 2, name: "Medellín" },
  { id: 3, name: "Cali" },
  { id: 4, name: "Barranquilla" },
  { id: 5, name: "Cartagena" },
];

export default function NewCustomerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      identification: "",
      names: "",
      address: "",
      email: "",
      phone: "",
      municipalityId: undefined,
    },
  });

  async function onSubmit(data: CustomerValues) {
    setIsLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    
    try {
      const response = await fetchWithAuth("http://localhost:4000/customer", {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setSuccessMsg("Cliente creado exitosamente.");
        setTimeout(() => {
          router.push("/dashboard/customers/manage");
        }, 1500);
      } else {
        const err = await response.json();
        setErrorMsg(err.message || "Error al crear el cliente");
      }
    } catch (error) {
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/customers">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Cliente</h1>
          <p className="text-muted-foreground text-sm">Registra un nuevo cliente en el sistema</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="identification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identificación / NIT</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 900123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="names"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres o Razón Social</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Empresa SA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="contacto@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 3001234567" {...field} />
                    </FormControl>
                    <FormMessage />
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
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una ciudad..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MUNICIPALITIES.map((mun) => (
                          <SelectItem key={mun.id} value={mun.id.toString()}>{mun.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección Física</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Calle 100 # 20 - 30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMsg && (
                <div className="p-3 mt-4 text-sm font-medium text-destructive bg-destructive/10 rounded-md">
                    {Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg}
                </div>
            )}

            {successMsg && (
                <div className="p-3 mt-4 text-sm font-medium text-emerald-800 bg-emerald-100 rounded-md">
                    {successMsg}
                </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
              <Link href="/dashboard/customers">
                <Button variant="outline" type="button" disabled={isLoading}>Cancelar</Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cliente
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
