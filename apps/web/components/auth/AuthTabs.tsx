"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthTabs() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full h-[400px] animate-pulse rounded-[var(--radius)] bg-secondary/30" />;
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Bienvenido a Billgin</h2>
        <p className="text-muted-foreground mt-2 text-[15px]">
          Ingresa a tu cuenta o regístrate para comenzar a facturar con la DIAN de inmediato.
        </p>
      </div>
      
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="w-full flex items-center mb-8 bg-black/5 dark:bg-white/10 p-1.5 rounded-[var(--radius)] shadow-inner border-0">
          <TabsTrigger value="login" className="flex-1 flex items-center justify-center px-4 py-3.5 text-[17px] leading-none !rounded-[calc(var(--radius)-6px)] font-bold data-[state=active]:!bg-white dark:data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!shadow-md hover:!text-foreground transition-all !border-0 focus-visible:!ring-0">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="register" className="flex-1 flex items-center justify-center px-4 py-3.5 text-[17px] leading-none !rounded-[calc(var(--radius)-6px)] font-bold data-[state=active]:!bg-white dark:data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!shadow-md hover:!text-foreground transition-all !border-0 focus-visible:!ring-0">Registrarse</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login" className="animate-in fade-in-50 zoom-in-95 duration-300">
          <LoginForm />
        </TabsContent>
        
        <TabsContent value="register" className="animate-in fade-in-50 zoom-in-95 duration-300">
          <RegisterForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

