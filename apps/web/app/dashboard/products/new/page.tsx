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
import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api";

const productSchema = z.object({
  name: z.string().min(2, "El nombre es requerido").max(150),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  unitsOfMeasurement: z.coerce.number().min(1, "Unidad de medida requerida"),
  codigoEstandar: z.coerce.number().min(1, "Código estándar requerido"),
  referenceCode: z.string().min(1, "Código de referencia requerido").max(50),
});

type ProductValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // We define a flexible type for the initial form state because HTML inputs work with empty strings
  const form = useForm<z.input<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: "" as unknown as number,
      unitsOfMeasurement: "" as unknown as number,
      codigoEstandar: "" as unknown as number,
      referenceCode: "",
    },
  });

  async function onSubmit(data: ProductValues) {
    setIsLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    
    try {
      const response = await fetchWithAuth("http://localhost:4000/product", {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setSuccessMsg("Producto creado exitosamente.");
        setTimeout(() => {
          router.push("/dashboard/products");
        }, 1500);
      } else {
        const err = await response.json();
        setErrorMsg(err.message || "Error al crear el producto");
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
        <Link href="/dashboard/products">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Producto</h1>
          <p className="text-muted-foreground text-sm">Agrega un nuevo producto o servicio a tu catálogo</p>
        </div>
      </div>

      <div className="rounded-[2rem] neo-glass p-8 shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Nombre del Producto / Servicio</FormLabel>
                  <FormControl>
                    <Input className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]" placeholder="Ej. Consultoría Informática" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Precio Unitario</FormLabel>
                    <FormControl>
                      <Input className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]" type="number" step="0.01" placeholder="Ej. 150000.00" {...field} value={field.value as number | string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Código de Referencia (SKU)</FormLabel>
                    <FormControl>
                      <Input className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]" placeholder="Ej. CON-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="unitsOfMeasurement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Unidad de Medida</FormLabel>
                    <FormControl>
                      <Input className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]" type="number" placeholder="Ej. 1 (Unidades)" {...field} value={field.value as number | string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="codigoEstandar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Código Estándar</FormLabel>
                    <FormControl>
                      <Input className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]" type="number" placeholder="Ej. 99" {...field} value={field.value as number | string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="pt-6 flex justify-end gap-4 mt-8">
              <Link href="/dashboard/products">
                <Button variant="ghost" type="button" disabled={isLoading} className="rounded-lg h-12 px-6 text-[#666666] hover:bg-gray-100 hover:text-[#333333]">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={isLoading} className="rounded-lg h-12 px-6 bg-[#1F7AE0] hover:bg-[#1A6DD0] text-white shadow-lg shadow-[#1F7AE0]/30 transition-all">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Producto
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
