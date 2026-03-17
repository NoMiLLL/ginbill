"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function ProductCartCard() {
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

  return (
    <Card className="w-full border-foreground/10 bg-card/80 shadow-lg backdrop-blur">
      <CardHeader className="gap-2">
        <CardTitle>Arma tu carrito de productos</CardTitle>
        <CardDescription>
          Elige los modulos que necesitas y visualiza el total al instante.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <section className="rounded-xl border border-foreground/10 bg-background/60 p-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Cliente
            </p>
            <Select
              value={selectedCustomerId}
              onValueChange={(value) => setSelectedCustomerId(value)}
              disabled={isLoadingCustomers || customersError}
            >
              <SelectTrigger className="w-full">
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
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.names}
                    {customer.identification ? ` · ${customer.identification}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedCustomerId && (
              <p className="text-xs text-muted-foreground">
                Debes seleccionar un cliente para poder agregar productos.
              </p>
            )}
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Catalogo
          </p>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              <div className="rounded-lg border border-dashed border-foreground/10 p-4 text-center text-sm text-muted-foreground">
                Cargando productos...
              </div>
            ) : hasError ? (
              <div className="rounded-lg border border-dashed border-destructive/30 bg-destructive/5 p-4 text-center text-sm text-destructive">
                No fue posible cargar el catalogo. Intenta nuevamente.
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-lg border border-dashed border-foreground/10 p-4 text-center text-sm text-muted-foreground">
                Aun no tienes productos registrados.
              </div>
            ) : (
              products.map((product) => {
                const quantity = quantities[product.id] ?? 0;
                return (
                  <div
                    key={product.id}
                    className="flex flex-col gap-3 rounded-lg border border-transparent bg-muted/40 px-3 py-3 transition hover:border-foreground/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          SKU {product.referenceCode}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {currency.format(product.price)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          onClick={() => adjustQuantity(product.id, -1)}
                          disabled={quantity === 0 || !selectedCustomerId}
                          aria-label={`Quitar ${product.name}`}
                        >
                          -
                        </Button>
                        <span className="min-w-6 text-center text-sm font-semibold">
                          {quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          onClick={() => adjustQuantity(product.id, 1)}
                          disabled={!selectedCustomerId}
                          aria-label={`Agregar ${product.name}`}
                        >
                          +
                        </Button>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Subtotal: {currency.format(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="flex h-full flex-col rounded-xl border border-foreground/10 bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Seleccionados
          </p>
          <div className="mt-4 flex flex-1 flex-col gap-3">
            {selectedProducts.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-foreground/10 p-4 text-center text-sm text-muted-foreground">
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
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {quantity} x {currency.format(product.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {currency.format(product.price * quantity)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-foreground/10 pt-4">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">
              {currency.format(total)}
            </span>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
