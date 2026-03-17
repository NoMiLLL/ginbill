"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, MoreHorizontal, Pencil, Trash2, Search } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function ManageCustomersPage() {
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
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestionar Clientes</h1>
            <p className="text-muted-foreground text-sm">Administra tu lista de clientes registrados</p>
          </div>
        </div>
        <Link href="/dashboard/customers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {(actionError || actionSuccess) && (
          <div className="border-b bg-muted/30 px-4 py-3 text-sm">
            {actionError && (
              <span className="font-medium text-destructive">{actionError}</span>
            )}
            {actionSuccess && (
              <span className="font-medium text-emerald-700">{actionSuccess}</span>
            )}
          </div>
        )}
        <div className="p-4 border-b bg-muted/40 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre, correo o identificación..." 
            className="max-w-sm h-9 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead>Identificación</TableHead>
              <TableHead>Nombre / Razón Social</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="group">
                  <TableCell className="font-medium">{customer.identification}</TableCell>
                  <TableCell>{customer.names}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEdit(customer)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(customer)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Editar cliente</h2>
              <p className="text-sm text-muted-foreground">
                Actualiza la información del cliente y guarda los cambios.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Identificación</label>
                <Input
                  value={editValues.identification}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, identification: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nombre / Razón Social</label>
                <Input
                  value={editValues.names}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, names: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Correo</label>
                <Input
                  type="email"
                  value={editValues.email}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Teléfono</label>
                <Input
                  value={editValues.phone}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Dirección</label>
                <Input
                  value={editValues.address}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, address: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Municipio</label>
                <Select
                  value={editValues.municipalityId}
                  onValueChange={(value) =>
                    setEditValues((prev) => ({ ...prev, municipalityId: value }))
                  }
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
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setEditCustomer(null)}>
                Cancelar
              </Button>
              <Button type="button" onClick={saveEdit} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Eliminar cliente</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              ¿Seguro que deseas eliminar <strong>{deleteTarget.names}</strong>? Esta acción no
              se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                type="button"
                onClick={() => handleDelete(deleteTarget)}
                disabled={isDeleting}
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
