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
import { fetchWithAuth } from "@/lib/api";


const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder 100 caracteres").trim(),
  address: z.string().min(1, "La dirección es requerida").max(150, "La dirección no puede exceder 150 caracteres").trim(),

  phone: z.string().regex(/^3\d{9}$/, "Debe ser un número de celular de Colombia válido (ej: 3001234567)"),
  email: z.string().min(1, "El correo electrónico es requerido").email("Asegúrate de colocar un correo válido").trim().toLowerCase(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72, "La contraseña no puede exceder 72 caracteres"),
  municipalityId: z.number().min(1, "Debes seleccionar un municipio")
});

type RegisterValues = z.infer<typeof registerSchema>;

import { MUNICIPALITIES } from "@/lib/constants";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
    setErrorMsg("");
    
    try {
      const response = await fetchWithAuth("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        setSuccessMsg("¡Registro exitoso! Ya puedes iniciar sesión.");
        form.reset();
        

        setTimeout(() => {
            window.location.reload();
        }, 2000);
      } else {
        const errorData = await response.json();
        
        if (errorData.message) {
            if (Array.isArray(errorData.message)) {
                
                console.error("Validation failed in backend:", errorData.message);
                setErrorMsg(errorData.message.join(", "));
            } else {
                
                setSuccessMsg("");
                setErrorMsg(errorData.message); 
            }
        } else {
            setErrorMsg("Ocurrió un error al intentar registrarte.");
        }
      }
    } catch (error) {
        console.error("Network error during register", error);
        setErrorMsg("Error de red al intentar registrarte.");
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
              <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Juan Pérez" className="rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] px-4 focus-visible:ring-0 text-[#333333] transition-all" {...field} />
              </FormControl>
              <FormMessage className="animate-in slide-in-from-top-1 ml-2 text-sm text-[#FF4545] font-medium" />
            </FormItem>
          )}
        />

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Correo Electrónico</FormLabel>
                <FormControl>
                    <Input placeholder="tucorreo@ejemplo.com" className="rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] px-4 focus-visible:ring-0 text-[#333333] transition-all" {...field} />
                </FormControl>
                <FormMessage className="animate-in slide-in-from-top-1 ml-2 text-sm text-[#FF4545] font-medium" />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Teléfono Celular</FormLabel>
                <FormControl>
                    <Input placeholder="Ej. 3001234567" className="rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] px-4 focus-visible:ring-0 text-[#333333] transition-all" {...field} />
                </FormControl>
                <FormMessage className="animate-in slide-in-from-top-1 ml-2 text-sm text-[#FF4545] font-medium" />
                </FormItem>
            )}
            />
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Dirección Física</FormLabel>
                <FormControl>
                    <Input placeholder="Ej. Calle 100 # 20 - 30" className="rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] px-4 focus-visible:ring-0 text-[#333333] transition-all" {...field} />
                </FormControl>
                <FormMessage className="animate-in slide-in-from-top-1 ml-2 text-sm text-[#FF4545] font-medium" />
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
                    <SelectTrigger className="rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] px-4 focus:ring-0 text-[#333333] transition-all">
                        <SelectValue placeholder="Selecciona una ciudad..." />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-none shadow-xl bg-white/95 backdrop-blur-md">
                        {MUNICIPALITIES.map((mun) => (
                            <SelectItem key={mun.id} value={mun.id.toString()} className="rounded-xl focus:bg-[#E2E4E9]/50 cursor-pointer">{mun.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage className="animate-in slide-in-from-top-1 ml-2 text-sm text-[#FF4545] font-medium" />
                </FormItem>
            )}
            />
        </div>

        {}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" className="rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] px-4 focus-visible:ring-0 text-[#333333] transition-all" {...field} />
              </FormControl>
              <FormMessage className="animate-in slide-in-from-top-1 ml-2 text-sm text-[#FF4545] font-medium" />
            </FormItem>
          )}
        />
        {errorMsg && (
            <div className="p-3 mt-4 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md animate-in zoom-in-95">
                {errorMsg}
            </div>
        )}

        {successMsg && (
            <div className="p-3 mt-4 text-sm font-medium text-emerald-800 bg-emerald-100 rounded-md animate-in zoom-in-95">
                {successMsg}
            </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 rounded-[1.5rem] bg-[#1F7AE0] hover:bg-[#1A6DD0] text-white shadow-lg shadow-[#1F7AE0]/30 transition-all text-md font-medium mt-6 active:scale-[0.98]" 
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
