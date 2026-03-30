"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  price: number;
  referenceCode: string;
};

type Customer = {
  id: number;
  names: string;
  identification?: string;
  email?: string;
};

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function ProductCartCard({ onSuccess }: { onSuccess?: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [customersError, setCustomersError] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    let isActive = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const response = await fetchWithAuth("http://localhost:4000/product");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = (await response.json()) as Product[];
        if (isActive) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
        if (isActive) {
          setHasError(true);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadCustomers = async () => {
      setIsLoadingCustomers(true);
      setCustomersError(false);
      try {
        const response = await fetchWithAuth("http://localhost:4000/customer");
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = (await response.json()) as Customer[];
        if (isActive) {
          setCustomers(data);
        }
      } catch (error) {
        console.error("Failed to fetch customers", error);
        if (isActive) {
          setCustomersError(true);
        }
      } finally {
        if (isActive) {
          setIsLoadingCustomers(false);
        }
      }
    };

    loadCustomers();

    return () => {
      isActive = false;
    };
  }, []);

  const [isEmitting, setIsEmitting] = useState(false);
  const [emissionSuccess, setEmissionSuccess] = useState("");
  const [emissionError, setEmissionError] = useState("");

  // Definimos primero las variables calculadas y funciones de ajuste
  const selectedProducts = useMemo(
    () => products.filter((product) => (quantities[product.id] ?? 0) > 0),
    [products, quantities]
  );

  const total = useMemo(
    () =>
      selectedProducts.reduce(
        (sum, product) => sum + product.price * (quantities[product.id] ?? 0),
        0
      ),
    [selectedProducts, quantities]
  );

  const adjustQuantity = (productId: number, delta: number) => {
    setQuantities((prev) => {
      const nextValue = Math.max(0, (prev[productId] ?? 0) + delta);
      if (nextValue === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: nextValue };
    });
  };

  const handleEmitInvoice = async () => {
    if (!selectedCustomerId || total === 0) return;

    setIsEmitting(true);
    setEmissionError("");
    setEmissionSuccess("");

    const description = selectedProducts
      .map((p) => `${quantities[p.id]}x ${p.name}`)
      .join(", ");

    try {
      const response = await fetchWithAuth("http://localhost:4000/invoice", {
        method: "POST",
        body: JSON.stringify({
          total,
          customerId: Number(selectedCustomerId),
          description,
        }),
      });

      if (response.ok) {
        setEmissionSuccess("Factura emitida exitosamente.");
        setQuantities({});
        setSelectedCustomerId("");
        if (onSuccess) onSuccess();
      } else {
        setEmissionError("Error al emitir la factura. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Failed to emit invoice", error);
      setEmissionError("Error de conexión al emitir la factura.");
    } finally {
      setIsEmitting(false);
    }
  };

  return (
    <div className="w-full neo-glass rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-[#333333]">Arma tu carrito de productos</h2>
        <p className="text-[#666666] mt-1">
          Elige los productos o servicios que necesitas y visualiza el total al instante.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#666666]">
              Cliente
            </p>
            <Select
              value={selectedCustomerId}
              onValueChange={(value) => {
                setSelectedCustomerId(value);
                setEmissionSuccess("");
                setEmissionError("");
              }}
              disabled={isLoadingCustomers || customersError || isEmitting}
            >
              <SelectTrigger className="w-full rounded-lg h-12 border border-border/50 bg-background px-4 focus:ring-0 text-[#333333]">
                <SelectValue
                  placeholder={
                    isLoadingCustomers
                      ? "Cargando clientes..."
                      : customersError
                      ? "Error al cargar clientes"
                      : "Selecciona un cliente..."
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-border/50 bg-background">
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.names}
                    {customer.identification ? ` · ${customer.identification}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedCustomerId && (
              <p className="text-xs text-[#666666] mt-1">
                Debes seleccionar un cliente para poder agregar productos.
              </p>
            )}
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-wider text-[#666666]">
            Catálogo
          </p>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              <div className="rounded-lg border border-dashed border-border/50 p-6 text-center text-sm text-[#666666]">
                Cargando productos...
              </div>
            ) : hasError ? (
              <div className="rounded-lg border border-dashed border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
                No fue posible cargar el catálogo. Intenta nuevamente.
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/50 p-6 text-center text-sm text-[#666666]">
                Aún no tienes productos registrados.
              </div>
            ) : (
              products.map((product) => {
                const quantity = quantities[product.id] ?? 0;
                return (
                  <div
                    key={product.id}
                    className="flex flex-col gap-4 rounded-xl border border-border/50 bg-background px-5 py-4 transition-all hover:border-[#1F7AE0]/30 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#333333]">{product.name}</p>
                        <p className="text-xs text-[#666666] mt-0.5">
                          SKU {product.referenceCode}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-[#333333]">
                        {currency.format(product.price)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 w-8 rounded-lg border-border/50 text-[#666666] hover:text-[#333333] hover:bg-gray-100 p-0"
                          onClick={() => adjustQuantity(product.id, -1)}
                          disabled={quantity === 0 || !selectedCustomerId || isEmitting}
                          aria-label={`Quitar ${product.name}`}
                        >
                          -
                        </Button>
                        <span className="min-w-6 text-center text-sm font-bold text-[#333333]">
                          {quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 w-8 rounded-lg border-border/50 text-[#666666] hover:text-[#333333] hover:bg-gray-100 p-0"
                          onClick={() => adjustQuantity(product.id, 1)}
                          disabled={!selectedCustomerId || isEmitting}
                          aria-label={`Agregar ${product.name}`}
                        >
                          +
                        </Button>
                      </div>
                      <span className="text-xs font-semibold text-[#1F7AE0]">
                        Subtotal: {currency.format(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="flex h-full flex-col rounded-2xl border border-border/50 bg-[#F8FAFC] p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#666666]">
            Resumen de Factura
          </p>
          <div className="mt-4 flex flex-1 flex-col gap-3">
            {selectedProducts.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/50 p-6 text-center text-sm text-[#666666]">
                {isLoading
                  ? "Cargando resumen..."
                  : "Agrega productos para ver el resumen y el total."}
              </div>
            ) : (
              selectedProducts.map((product) => {
                const quantity = quantities[product.id] ?? 0;
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl bg-white border border-border/50 px-4 py-3 shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#333333]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#666666] mt-0.5">
                        {quantity} x {currency.format(product.price)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#1F7AE0]">
                      {currency.format(product.price * quantity)}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {(emissionSuccess || emissionError) && (
            <div className={`mt-4 rounded-lg p-3 text-sm font-medium ${
              emissionSuccess ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
            }`}>
              {emissionSuccess || emissionError}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-6 border-t border-border/50 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#333333]">Total a Pagar</span>
              <span className="text-2xl font-black text-[#1F7AE0]">
                {currency.format(total)}
              </span>
            </div>
            <Button 
              className="w-full rounded-2xl h-14 text-base font-bold bg-[#1F7AE0] hover:bg-[#1A6DD0] text-white shadow-lg shadow-[#1F7AE0]/30 transition-all" 
              disabled={!selectedCustomerId || total === 0 || isEmitting}
              onClick={handleEmitInvoice}
            >
              {isEmitting ? "Procesando..." : "Emitir Factura"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
