"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, MoreHorizontal, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Product {
  id: number;
  name: string;
  price: number;
  referenceCode: string;
  unitsOfMeasurement?: number;
  codigoEstandar?: number;
}

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editValues, setEditValues] = useState({
    name: "",
    price: "",
    referenceCode: "",
    unitsOfMeasurement: "",
    codigoEstandar: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth("http://localhost:4000/product");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (product: Product) => {
    setIsDeleting(true);
    setActionError("");
    setActionSuccess("");
    try {
      const response = await fetchWithAuth(`http://localhost:4000/product/${product.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        setActionSuccess("Producto eliminado exitosamente.");
        setDeleteTarget(null);
      } else {
        setActionError("Error al eliminar el producto.");
      }
    } catch (error) {
      console.error(error);
      setActionError("Error de conexión.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setEditValues({
      name: product.name ?? "",
      price: product.price?.toString() ?? "",
      referenceCode: product.referenceCode ?? "",
      unitsOfMeasurement: product.unitsOfMeasurement?.toString() ?? "",
      codigoEstandar: product.codigoEstandar?.toString() ?? "",
    });
    setActionError("");
    setActionSuccess("");
  };

  const saveEdit = async () => {
    if (!editProduct) return;
    setIsSaving(true);
    setActionError("");
    setActionSuccess("");

    const payload = {
      name: editValues.name.trim(),
      price: Number(editValues.price),
      referenceCode: editValues.referenceCode.trim(),
      unitsOfMeasurement: Number(editValues.unitsOfMeasurement),
      codigoEstandar: Number(editValues.codigoEstandar),
    };

    try {
      let response = await fetchWithAuth(`http://localhost:4000/product/${editProduct.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (response.status === 405) {
        response = await fetchWithAuth(`http://localhost:4000/product/${editProduct.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        let updated: Product | null = null;
        try {
          updated = await response.json();
        } catch (_) {
          updated = null;
        }
        setProducts((prev) =>
          prev.map((product) =>
            product.id === editProduct.id ? (updated ?? { ...product, ...payload }) : product
          )
        );
        setEditProduct(null);
        setActionSuccess("Producto actualizado exitosamente.");
      } else {
        setActionError("Error al actualizar el producto.");
      }
    } catch (error) {
      console.error(error);
      setActionError("Error de conexión.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.referenceCode.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestionar Productos</h1>
            <p className="text-muted-foreground text-sm">Administra tu catálogo de productos y servicios</p>
          </div>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Producto
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
            placeholder="Buscar por nombre o SKU..." 
            className="max-w-sm h-9 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead>SKU (Referencia)</TableHead>
              <TableHead>Nombre del Producto</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No se encontraron productos.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="group">
                  <TableCell className="font-medium text-muted-foreground">{product.referenceCode}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">
                    ${new Intl.NumberFormat('es-CO').format(product.price)}
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => openEdit(product)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(product)}
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

      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Editar producto</h2>
              <p className="text-sm text-muted-foreground">
                Actualiza la información del producto y guarda los cambios.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nombre</label>
                <Input
                  value={editValues.name}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Precio</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editValues.price}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, price: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">SKU</label>
                <Input
                  value={editValues.referenceCode}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, referenceCode: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Unidad de medida</label>
                <Input
                  type="number"
                  value={editValues.unitsOfMeasurement}
                  onChange={(event) =>
                    setEditValues((prev) => ({
                      ...prev,
                      unitsOfMeasurement: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Código estándar</label>
                <Input
                  type="number"
                  value={editValues.codigoEstandar}
                  onChange={(event) =>
                    setEditValues((prev) => ({
                      ...prev,
                      codigoEstandar: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setEditProduct(null)}>
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
            <h2 className="text-lg font-semibold">Eliminar producto</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              ¿Seguro que deseas eliminar <strong>{deleteTarget.name}</strong>? Esta acción no
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
