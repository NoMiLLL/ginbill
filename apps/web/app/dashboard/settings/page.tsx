"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { fetchWithAuth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon } from "lucide-react";

const MUNICIPALITIES = [
  { id: 1, name: "Bogotá, D.C." },
  { id: 2, name: "Medellín" },
  { id: 3, name: "Cali" },
  { id: 4, name: "Barranquilla" },
  { id: 5, name: "Cartagena" },
];

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
          const response = await fetchWithAuth(`http://localhost:4000/building-spot/${decoded.sub}`);
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
      const response = await fetchWithAuth(`http://localhost:4000/building-spot/${bsId}`, {
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
          <h1 className="text-2xl font-bold tracking-tight">Configuración de la Cuenta</h1>
          <p className="text-muted-foreground text-sm">Actualiza la información principal de tu sucursal o negocio.</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-6 md:p-8">
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
                <label className="text-sm font-medium text-foreground">Correo Electrónico</label>
                <Input
                  type="email"
                  placeholder="tu@correo.com"
                  value={formValues.email}
                  onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Teléfono</label>
                <Input
                  type="text"
                  placeholder="Tu número"
                  value={formValues.phone}
                  onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Municipio</label>
                <Select
                  value={formValues.municipalityId}
                  onValueChange={(val) => setFormValues({ ...formValues, municipalityId: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una ciudad..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MUNICIPALITIES.map((mun) => (
                      <SelectItem key={mun.id} value={mun.id.toString()}>
                        {mun.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Nueva Contraseña <span className="text-muted-foreground font-normal">(Opcional)</span>
                </label>
                <Input
                  type="password"
                  placeholder="Dejar en blanco para no cambiar"
                  value={formValues.password}
                  onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
