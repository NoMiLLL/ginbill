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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[15px] font-semibold text-foreground ml-1">Correo Electrónico</FormLabel>
              <FormControl>
                <Input
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  className="rounded-[var(--radius)] h-12 border-none bg-secondary/80 px-4 focus-visible:ring-2 focus-visible:ring-primary text-foreground transition-all shadow-inner"
                  {...field}
                />
              </FormControl>
              <FormMessage className="animate-in slide-in-from-top-1 ml-1 text-sm text-destructive font-medium" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[15px] font-semibold text-foreground ml-1">Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="rounded-[var(--radius)] h-12 border-none bg-secondary/80 px-4 focus-visible:ring-2 focus-visible:ring-primary text-foreground transition-all shadow-inner"
                  {...field}
                />
              </FormControl>
              <FormMessage className="animate-in slide-in-from-top-1 ml-1 text-sm text-destructive font-medium" />
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
          className="w-full h-12 rounded-[var(--radius)] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all text-base font-semibold mt-4 active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Ingresando...
            </>
          ) : (
            "Ingresar a mi cuenta"
          )}
        </Button>
      </form>
    </Form>
  );
}
