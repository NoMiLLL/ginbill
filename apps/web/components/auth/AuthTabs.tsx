"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthTabs() {
  return (
    <div className="w-full max-w-md mx-auto rounded-[2rem] neo-glass p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[#333333]">Bienvenido a Billgin</h2>
        <p className="text-[#666666] mt-1 text-sm">
          Ingresa a tu cuenta o regístrate para comenzar a facturar.
        </p>
      </div>
      
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-gray-100 rounded-[1.5rem] p-1">
          <TabsTrigger value="login" className="h-full text-base rounded-full font-medium data-[state=active]:bg-white data-[state=active]:text-[#333333] data-[state=active]:shadow-sm transition-all">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="register" className="h-full text-base rounded-full font-medium data-[state=active]:bg-white data-[state=active]:text-[#333333] data-[state=active]:shadow-sm transition-all">Registrarse</TabsTrigger>
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

