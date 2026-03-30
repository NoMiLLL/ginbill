"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";
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

interface Product {
  id: number;
  name: string;
  price: number;
  referenceCode: string;
  unitsOfMeasurement?: number;
  codigoEstandar?: number;
}

export default function ProductsPage() {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 mt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#333333]">Productos</h1>
          <p className="text-[#666666] text-sm mt-1">Administra tu catálogo de productos y servicios.</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="gap-2 bg-[#1F7AE0] hover:bg-[#1A6DD0] text-white shadow-lg shadow-[#1F7AE0]/30 rounded-2xl h-12 px-6 transition-all">
            <Plus className="h-5 w-5" strokeWidth={2} />
            Nuevo Producto
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
          <div className="relative max-w-md w-full rounded-lg border border-border/50 bg-background flex items-center h-12 px-4 shadow-sm">
            <Search className="h-5 w-5 text-[#666666]" strokeWidth={2} />
            <Input 
              placeholder="Buscar por nombre o SKU..." 
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
                <TableHead className="px-8 py-5 font-semibold text-[#666666] uppercase text-xs tracking-wider">SKU (Referencia)</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[#666666] uppercase text-xs tracking-wider">Nombre del Producto</TableHead>
                <TableHead className="px-8 py-5 text-right font-semibold text-[#666666] uppercase text-xs tracking-wider">Precio</TableHead>
                <TableHead className="px-8 py-5 text-right font-semibold text-[#666666] uppercase text-xs tracking-wider">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/10">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-[#666666] font-medium">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-[#666666] font-medium">
                    No se encontraron productos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id} 
                    className="group transition-all duration-300 border-none hover:neo-surface hover:rounded-2xl hover:scale-[1.01]"
                  >
                    <TableCell className="px-8 py-5 font-medium text-[#333333] transition-transform group-hover:pl-10">{product.referenceCode}</TableCell>
                    <TableCell className="px-8 py-5 text-[#666666] group-hover:text-[#333333] transition-colors">{product.name}</TableCell>
                    <TableCell className="px-8 py-5 text-[#666666] text-right group-hover:text-[#333333] transition-colors">
                      ${new Intl.NumberFormat('es-CO').format(product.price)}
                    </TableCell>
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
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="h-5 w-5" strokeWidth={2} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-[#991B1B] hover:text-[#991B1B] hover:neo-pressed-sm rounded-xl transition-all"
                          onClick={() => setDeleteTarget(product)}
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

      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2rem] neo-glass p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#333333]">Editar Producto</h2>
              <p className="text-[#666666] mt-1">
                Actualiza la información del producto y guarda los cambios.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Nombre del Producto / Servicio</label>
                <Input
                  className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]"
                  value={editValues.name}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Precio Unitario</label>
                <Input
                  type="number"
                  step="0.01"
                  className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]"
                  value={editValues.price}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, price: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Código de Referencia (SKU)</label>
                <Input
                  className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]"
                  value={editValues.referenceCode}
                  onChange={(event) =>
                    setEditValues((prev) => ({ ...prev, referenceCode: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#333333] ml-2">Unidad de Medida</label>
                <Input
                  type="number"
                  className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]"
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
                <label className="text-sm font-semibold text-[#333333] ml-2">Código Estándar</label>
                <Input
                  type="number"
                  className="rounded-lg h-12 border border-border/50 bg-background px-4 focus-visible:ring-0 text-[#333333]"
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
            <div className="mt-8 flex justify-end gap-4">
              <Button variant="ghost" type="button" onClick={() => setEditProduct(null)} className="rounded-lg h-12 px-6 text-[#666666] hover:bg-gray-100 hover:text-[#333333]">
                Cancelar
              </Button>
              <Button type="button" onClick={saveEdit} disabled={isSaving} className="rounded-lg h-12 px-6 bg-[#1F7AE0] hover:bg-[#1A6DD0] text-white shadow-lg shadow-[#1F7AE0]/30 transition-all">
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl border border-border/50">
            <h2 className="text-lg font-bold text-[#1E293B]">Eliminar producto</h2>
            <p className="mt-2 text-sm text-[#64748B]">
              ¿Seguro que deseas eliminar <strong>{deleteTarget.name}</strong>? Esta acción no
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
