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
import { Loader2, ArrowLeft, Building, Users as UsersIcon } from "lucide-react";
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

import { MUNICIPALITIES } from "@/lib/constants";

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
      const response = await fetchWithAuth("/customer", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccessMsg("Cliente creado exitosamente.");
        setTimeout(() => {
          router.push("/dashboard/customers");
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/customers">
          <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Crear Cliente</h1>
          <p className="text-muted-foreground text-sm">Registra la información de un nuevo prospecto o empresa</p>
        </div>
      </div>

      <div className="rounded-[2rem] neo-glass p-8 shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {/* Sección: Información Fiscal */}
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-2">
                <Building className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <h2 className="text-lg font-semibold text-[#1E293B]">Información Fiscal</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="identification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Identificación / NIT</FormLabel>
                      <FormControl>
                        <Input placeholder="NIT: 900.123.456-1" className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]" {...field} />
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
                      <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Nombres o Razón Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Acme Corporation S.A.S." className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sección: Datos de Contacto */}
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-2 mt-4">
                <UsersIcon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <h2 className="text-lg font-semibold text-[#1E293B]">Datos de Contacto</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="facturacion@acme.com" className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. +57 300 123 4567" className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]" {...field} />
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
                      <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Municipio / Ciudad</FormLabel>
                      <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value ? field.value.toString() : undefined}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg h-12 border border-border/50 bg-background px-4 focus:ring-0 text-[#333333]">
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

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Dirección Física</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Calle 100 # 15-20, Piso 3" className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {errorMsg && (
                <div className="p-3 mt-4 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md animate-in zoom-in-95">
                    {Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg}
                </div>
            )}

            {successMsg && (
              <div className="p-3 mt-4 text-sm font-medium text-[#166534] bg-[#DCFCE7] rounded-lg border border-[#166534]/10">
                {successMsg}
              </div>
            )}

            <div className="pt-6 flex justify-end gap-3 border-t border-border/50 mt-8">
              <Link href="/dashboard/customers">
                <Button variant="ghost" type="button" disabled={isLoading} className="rounded-lg h-12 px-6 text-[#666666] hover:bg-gray-100 hover:text-[#333333]">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading} className="rounded-lg h-12 px-6 bg-[#1F7AE0] hover:bg-[#1A6DD0] text-white shadow-lg shadow-[#1F7AE0]/30 transition-all">
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
