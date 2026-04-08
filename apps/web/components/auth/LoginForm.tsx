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
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

// Esquema Zod para Login
const loginSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Asegúrate de colocar un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginValues) {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetchWithAuth("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();


        const token = result.access_token || result.token;

        if (token) {

            localStorage.setItem("token", token);
            document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
            
            // Redirigir al dashboard protegido
            router.push("/dashboard");
          } else {
            console.error("El backend no devolvió un token dándole un formato válido (esperado: result.access_token o result.token)");
            setErrorMsg("Error interno: No se recibió token de sesión.");
          }
        } else {
        const errorData = await response.json().catch(() => null);
        console.error("Login failed", errorData);
        if (errorData?.message) {
            setErrorMsg(errorData.message);
        } else if (response.status === 401 || response.status === 403) {
            setErrorMsg("Credenciales incorrectas.");
        } else {
            setErrorMsg("Ocurrió un error al iniciar sesión.");
        }
      }
    } catch (error) {
        console.error("Error during login", error);
        setErrorMsg("No se pudo conectar con el servidor.");
      } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Correo Electrónico</FormLabel>
              <FormControl>
                <Input 
                  placeholder="tucorreo@ejemplo.com" 
                  autoComplete="email" 
                  className="rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] px-4 focus-visible:ring-0 text-[#333333] transition-all" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="animate-in slide-in-from-top-1 ml-2 text-sm text-[#FF4545] font-medium" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-[#333333] ml-2">Contraseña</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  autoComplete="current-password"
                  className="rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] px-4 focus-visible:ring-0 text-[#333333] transition-all" 
                  {...field} 
                />
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
        
        <Button 
          type="submit" 
          className="w-full h-12 rounded-[1.5rem] bg-[#1F7AE0] hover:bg-[#1A6DD0] text-white shadow-lg shadow-[#1F7AE0]/30 transition-all text-md font-medium mt-6 active:scale-[0.98]" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Ingresando...
            </>
          ) : (
            "Ingresar"
          )}
        </Button>
      </form>
    </Form>
  );
}
