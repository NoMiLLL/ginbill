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
      console.log("Login data:", data);
      
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Logged in successfully", result);

        // Intenta obtener el token del resultado (NestJS típicamente usa `access_token` o `token`)
        const token = result.access_token || result.token;

        if (token) {
           console.log("--------- TOKEN RECIBIDO ---------");
           console.log(token);
           console.log("----------------------------------");
           
           // Guardar el token en localStorage y en Cookies para el Middleware
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
        if (response.status === 401 || response.status === 403) {
            setErrorMsg("Credenciales incorrectas.");
        } else {
            setErrorMsg(errorData?.message || "Ocurrió un error al iniciar sesión.");
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
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input 
                  placeholder="tucorreo@ejemplo.com" 
                  autoComplete="email" 
                  className="h-12 px-4 transition-all focus:ring-2 focus:ring-primary/50" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="animate-in slide-in-from-top-1" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  autoComplete="current-password"
                  className="h-12 px-4 transition-all focus:ring-2 focus:ring-primary/50" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="animate-in slide-in-from-top-1" />
                </FormItem>
          )}
        />

        {errorMsg && (
            <div className="p-3 mt-4 text-sm font-medium text-destructive bg-destructive/10 rounded-md animate-in zoom-in-95">
                {errorMsg}
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
