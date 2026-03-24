"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Customer {
  id: number;
  identification: string;
  names: string;
  email: string;
  phone: string;
  address: string;
  municipalityId?: number;
}

const MUNICIPALITIES = [
  { id: 1, name: "Bogotá, D.C." },
  { id: 2, name: "Medellín" },
  { id: 3, name: "Cali" },
  { id: 4, name: "Barranquilla" },
  { id: 5, name: "Cartagena" },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editValues, setEditValues] = useState({
    identification: "",
    names: "",
    email: "",
    phone: "",
    address: "",
    municipalityId: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth("http://localhost:4000/customer");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (customer: Customer) => {
    setIsDeleting(true);
    setActionError("");
    setActionSuccess("");
    try {
      const response = await fetchWithAuth(`http://localhost:4000/customer/${customer.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
        setActionSuccess("Cliente eliminado exitosamente.");
        setDeleteTarget(null);
      } else {
        setActionError("Error al eliminar el cliente.");
      }
    } catch (error) {
      console.error(error);
      setActionError("Error de conexión.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setEditValues({
      identification: customer.identification ?? "",
      names: customer.names ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
      municipalityId: customer.municipalityId?.toString() ?? "",
    });
    setActionError("");
    setActionSuccess("");
  };

  const saveEdit = async () => {
    if (!editCustomer) return;
    setIsSaving(true);
    setActionError("");
    setActionSuccess("");

    const payload = {
      identification: editValues.identification.trim(),
      names: editValues.names.trim(),
      email: editValues.email.trim(),
      phone: editValues.phone.trim(),
      address: editValues.address.trim(),
      municipalityId: editValues.municipalityId ? Number(editValues.municipalityId) : undefined,
    };

    try {
      let response = await fetchWithAuth(`http://localhost:4000/customer/${editCustomer.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (response.status === 405) {
        response = await fetchWithAuth(`http://localhost:4000/customer/${editCustomer.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        let updated: Customer | null = null;
        try {
          updated = await response.json();
        } catch (_) {
          updated = null;
        }
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === editCustomer.id ? (updated ?? { ...customer, ...payload }) : customer
          )
        );
        setEditCustomer(null);
        setActionSuccess("Cliente actualizado exitosamente.");
      } else {
        setActionError("Error al actualizar el cliente.");
      }
    } catch (error) {
      console.error(error);
      setActionError("Error de conexión.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.names.toLowerCase().includes(search.toLowerCase()) ||
          c.identification.includes(search) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      ),
    [customers, search]
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Clientes</h1>
          <p className="text-muted-foreground text-sm">Gestiona tu base de datos de clientes para la facturación.</p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-lg">
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
        {(actionError || actionSuccess) && (
          <div className="border-b border-border/50 bg-[#F8FAFC] px-4 py-3 text-sm">
            {actionError && (
              <span className="font-medium text-destructive">{actionError}</span>
            )}
            {actionSuccess && (
              <span className="font-medium text-[#166534]">{actionSuccess}</span>
            )}
          </div>
        )}
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input 
              placeholder="Buscar cliente..." 
              className="pl-9 h-10 w-full max-w-[400px] border-border/50 rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC] border-b border-border/50">
                <TableHead className="font-semibold text-[#64748B]">Identificación</TableHead>
                <TableHead className="font-semibold text-[#64748B]">Nombre / Razón Social</TableHead>
                <TableHead className="font-semibold text-[#64748B]">Correo</TableHead>
                <TableHead className="font-semibold text-[#64748B]">Teléfono</TableHead>
                <TableHead className="text-right font-semibold text-[#64748B]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/50">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Cargando clientes...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <TableRow 
                    key={customer.id} 
                    className={`group transition-colors border-none ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-muted/50`}
                  >
                    <TableCell className="font-medium text-[#1E293B]">{customer.identification}</TableCell>
                    <TableCell className="text-[#64748B]">{customer.names}</TableCell>
                    <TableCell className="text-[#64748B]">{customer.email}</TableCell>
                    <TableCell className="text-[#64748B]">{customer.phone}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#64748B] hover:text-[#1F7AE0] hover:bg-[#1F7AE0]/10 rounded-md"
                          onClick={() => {}}
                        >
                          <Eye className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#1F7AE0] hover:bg-[#1F7AE0]/10 rounded-md"
                          onClick={() => openEdit(customer)}
                        >
                          <Edit2 className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#991B1B] hover:text-[#991B1B] hover:bg-[#FEE2E2] rounded-md"
                          onClick={() => setDeleteTarget(customer)}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl border border-border/50">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#1E293B]">Editar Cliente</h2>
              <p className="text-sm text-muted-foreground">
                Actualiza la información del cliente y guarda los cambios.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B]">Identificación</label>
                <Input
                  className="rounded-lg h-10 border-border/50"
                  value={editValues.identification}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, identification: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B]">Nombre / Razón Social</label>
                <Input
                  className="rounded-lg h-10 border-border/50"
                  value={editValues.names}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, names: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B]">Correo</label>
                <Input
                  type="email"
                  className="rounded-lg h-10 border-border/50"
                  value={editValues.email}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B]">Teléfono</label>
                <Input
                  className="rounded-lg h-10 border-border/50"
                  value={editValues.phone}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-[#1E293B]">Dirección</label>
                <Input
                  className="rounded-lg h-10 border-border/50"
                  value={editValues.address}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, address: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-[#1E293B]">Municipio</label>
                <Select
                  value={editValues.municipalityId}
                  onValueChange={(value) =>
                    setEditValues((prev) => ({ ...prev, municipalityId: value }))
                  }
                >
                  <SelectTrigger className="w-full rounded-lg h-10 border-border/50">
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
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={() => setEditCustomer(null)} className="rounded-lg text-[#64748B] hover:text-[#1E293B]">
                Cancelar
              </Button>
              <Button type="button" onClick={saveEdit} disabled={isSaving} className="rounded-lg bg-primary hover:bg-primary/90 text-white">
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl border border-border/50">
            <h2 className="text-lg font-bold text-[#1E293B]">Eliminar Cliente</h2>
            <p className="mt-2 text-sm text-[#64748B]">
              ¿Seguro que deseas eliminar <strong>{deleteTarget.names}</strong>? Esta acción no
              se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg text-[#64748B] hover:text-[#1E293B]">
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => handleDelete(deleteTarget)}
                disabled={isDeleting}
                className="rounded-lg bg-[#991B1B] hover:bg-[#7f1d1d] text-white"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
