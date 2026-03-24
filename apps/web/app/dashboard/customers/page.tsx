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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 mt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#333333]">Clientes</h1>
          <p className="text-[#666666] text-sm mt-1">Gestiona tu base de datos de clientes para la facturación.</p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button className="gap-2 bg-[#1F7AE0] hover:bg-[#1A6DD0] text-white shadow-lg shadow-[#1F7AE0]/30 rounded-2xl h-12 px-6 transition-all">
            <Plus className="h-5 w-5" strokeWidth={2} />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      <div className="neo-glass rounded-[2rem] overflow-hidden flex flex-col mt-4">
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
        <div className="p-8 border-b border-white/20 flex items-center justify-between">
          <div className="relative max-w-md w-full neo-pressed rounded-2xl flex items-center h-12 px-4 shadow-sm">
            <Search className="h-5 w-5 text-[#666666]" strokeWidth={2} />
            <Input 
              placeholder="Buscar cliente..." 
              className="border-none bg-transparent h-full w-full focus-visible:ring-0 text-[#333333] placeholder:text-[#666666]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/20 hover:bg-transparent">
                <TableHead className="px-8 py-5 font-semibold text-[#666666] uppercase text-xs tracking-wider">Identificación</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[#666666] uppercase text-xs tracking-wider">Nombre / Razón Social</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[#666666] uppercase text-xs tracking-wider">Correo</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[#666666] uppercase text-xs tracking-wider">Teléfono</TableHead>
                <TableHead className="px-8 py-5 text-right font-semibold text-[#666666] uppercase text-xs tracking-wider">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/10">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[#666666] font-medium">
                    Cargando clientes...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[#666666] font-medium">
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <TableRow 
                    key={customer.id} 
                    className="group transition-all duration-300 border-none hover:neo-surface hover:rounded-2xl hover:scale-[1.01]"
                  >
                    <TableCell className="px-8 py-5 font-medium text-[#333333] transition-transform group-hover:pl-10">{customer.identification}</TableCell>
                    <TableCell className="px-8 py-5 text-[#666666] group-hover:text-[#333333] transition-colors">{customer.names}</TableCell>
                    <TableCell className="px-8 py-5 text-[#666666]">{customer.email}</TableCell>
                    <TableCell className="px-8 py-5 text-[#666666]">{customer.phone}</TableCell>
                    <TableCell className="px-8 py-5 text-right transition-transform group-hover:pr-10">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-[#666666] hover:text-[#1F7AE0] hover:neo-pressed-sm rounded-xl transition-all"
                          onClick={() => {}}
                        >
                          <Eye className="h-5 w-5" strokeWidth={2} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-[#1F7AE0] hover:neo-pressed-sm rounded-xl transition-all"
                          onClick={() => openEdit(customer)}
                        >
                          <Edit2 className="h-5 w-5" strokeWidth={2} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-[#991B1B] hover:text-[#991B1B] hover:neo-pressed-sm rounded-xl transition-all"
                          onClick={() => setDeleteTarget(customer)}
                        >
                          <Trash2 className="h-5 w-5" strokeWidth={2} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2rem] neo-glass p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#333333]">Editar Cliente</h2>
              <p className="text-[#666666] mt-1">
                Actualiza la información del cliente y guarda los cambios.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Identificación</label>
                <Input
                  className="rounded-2xl h-12 border-none neo-pressed bg-transparent px-4 focus-visible:ring-0 text-[#333333]"
                  value={editValues.identification}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, identification: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Nombre / Razón Social</label>
                <Input
                  className="rounded-2xl h-12 border-none neo-pressed bg-transparent px-4 focus-visible:ring-0 text-[#333333]"
                  value={editValues.names}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, names: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Correo</label>
                <Input
                  type="email"
                  className="rounded-2xl h-12 border-none neo-pressed bg-transparent px-4 focus-visible:ring-0 text-[#333333]"
                  value={editValues.email}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Teléfono</label>
                <Input
                  className="rounded-2xl h-12 border-none neo-pressed bg-transparent px-4 focus-visible:ring-0 text-[#333333]"
                  value={editValues.phone}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Dirección</label>
                <Input
                  className="rounded-2xl h-12 border-none neo-pressed bg-transparent px-4 focus-visible:ring-0 text-[#333333]"
                  value={editValues.address}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, address: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Municipio</label>
                <Select
                  value={editValues.municipalityId}
                  onValueChange={(value) =>
                    setEditValues((prev) => ({ ...prev, municipalityId: value }))
                  }
                >
                  <SelectTrigger className="w-full rounded-2xl h-12 border-none neo-pressed bg-transparent px-4 focus:ring-0 text-[#333333]">
                    <SelectValue placeholder="Selecciona una ciudad..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none neo-glass">
                    {MUNICIPALITIES.map((mun) => (
                      <SelectItem key={mun.id} value={mun.id.toString()} className="focus:bg-[#E0E0E0]/50 rounded-xl cursor-pointer">
                        {mun.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <Button variant="ghost" type="button" onClick={() => setEditCustomer(null)} className="rounded-2xl h-12 px-6 neo-surface text-[#666666] hover:text-[#333333]">
                Cancelar
              </Button>
              <Button type="button" onClick={saveEdit} disabled={isSaving} className="rounded-2xl h-12 px-6 bg-[#1F7AE0] hover:bg-[#1A6DD0] text-white shadow-lg shadow-[#1F7AE0]/30 transition-all">
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
