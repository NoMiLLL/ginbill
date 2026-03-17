"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthTabs() {
  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-white/10 bg-card/80 backdrop-blur-xl">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold tracking-tight">Bienvenido a Billgin</CardTitle>
        <CardDescription className="text-base">
          Ingresa a tu cuenta o regístrate para comenzar a facturar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
            <TabsTrigger value="login" className="text-base rounded-md font-medium">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register" className="text-base rounded-md font-medium">Registrarse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="animate-in fade-in-50 zoom-in-95 duration-300">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="register" className="animate-in fade-in-50 zoom-in-95 duration-300">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
