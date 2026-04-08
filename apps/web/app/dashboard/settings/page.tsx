"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { fetchWithAuth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon } from "lucide-react";

import { MUNICIPALITIES } from "@/lib/constants";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [bsId, setBsId] = useState<number | null>(null);

  const [formValues, setFormValues] = useState({
    email: "",
    phone: "",
    municipalityId: "",
    password: "",
  });

  useEffect(() => {
    const initFetch = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded: any = jwtDecode(token);
        if (decoded.sub) {
          setBsId(decoded.sub);
          const response = await fetchWithAuth(`/building-spot/${decoded.sub}`);
          if (response.ok) {
            const data = await response.json();
            setFormValues({
              email: data.email || "",
              phone: data.phone || "",
              municipalityId: data.municipalityId?.toString() || "",
              password: "", // Se deja vacío por seguridad
            });
          } else {
            setActionError("No se pudieron cargar los datos actuales.");
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setActionError("Error de conexión al cargar la configuración.");
      } finally {
        setIsLoading(false);
      }
    };

    initFetch();
  }, []);

  const handleSave = async () => {
    if (!bsId) return;
    setIsSaving(true);
    setActionError("");
    setActionSuccess("");

    const payload: any = {
      email: formValues.email.trim(),
      phone: formValues.phone.trim(),
      municipalityId: formValues.municipalityId ? Number(formValues.municipalityId) : undefined,
    };

    if (formValues.password.trim() !== "") {
      payload.password = formValues.password;
    }

    try {
      const response = await fetchWithAuth(`/building-spot/${bsId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setActionSuccess("Configuración actualizada exitosamente.");
        setFormValues((prev) => ({ ...prev, password: "" })); // Limpiamos la contraseña
      } else {
        setActionError("Error al actualizar la configuración.");
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      setActionError("Error de conexión al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#333333]">Configuración de la Cuenta</h1>
          <p className="text-[#666666] text-sm mt-1">Actualiza la información principal de tu sucursal o negocio.</p>
        </div>
      </div>

      <div className="rounded-[2rem] neo-glass p-8 shadow-2xl">
        {(actionError || actionSuccess) && (
          <div className="mb-6 border-l-4 px-4 py-3 text-sm bg-muted/30 rounded-r-md">
            {actionError && <span className="font-medium text-destructive border-l-destructive">{actionError}</span>}
            {actionSuccess && <span className="font-medium text-emerald-700 border-l-emerald-500">{actionSuccess}</span>}
          </div>
        )}

        {isLoading ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Cargando configuración...
          </div>
        ) : (
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Correo Electrónico</label>
                <Input
                  type="email"
                  placeholder="tu@correo.com"
                  className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]"
                  value={formValues.email}
                  onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Teléfono</label>
                <Input
                  type="text"
                  placeholder="Tu número"
                  className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]"
                  value={formValues.phone}
                  onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Municipio</label>
                <Select
                  value={formValues.municipalityId}
                  onValueChange={(val) => setFormValues({ ...formValues, municipalityId: val })}
                >
                  <SelectTrigger className="rounded-lg h-12 w-full border border-border/50 bg-background px-4 focus:ring-0 text-[#333333]">
                    <SelectValue placeholder="Selecciona una ciudad..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border border-border/50 bg-background">
                    {MUNICIPALITIES.map((mun) => (
                      <SelectItem key={mun.id} value={mun.id.toString()}>
                        {mun.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">
                  Nueva Contraseña <span className="text-[#666666] font-normal">(Opcional)</span>
                </label>
                <Input
                  type="password"
                  placeholder="Dejar en blanco para no cambiar"
                  className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]"
                  value={formValues.password}
                  onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end mt-4">
              <Button type="submit" disabled={isSaving} className="rounded-lg h-12 px-6 bg-[#1F7AE0] hover:bg-[#1A6DD0] text-white shadow-lg shadow-[#1F7AE0]/30 transition-all">
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
