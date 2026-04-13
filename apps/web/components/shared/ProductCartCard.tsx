"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchWithAuth } from "@/lib/api";
import { Search, Percent, Tag } from "lucide-react";
import { useInvoiceStore, InvoiceItemDetails } from "@/store/useInvoiceStore";

type Product = {
  id: number;
  name: string;
  price: number;
  referenceCode: string;
  taxRate: number;
  isExcluded: boolean;
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

export default function ProductCartCard({ tabId, onSuccess }: { tabId: string; onSuccess?: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [customersError, setCustomersError] = useState(false);

  const tabState = useInvoiceStore(state => state.tabs.find(t => t.id === tabId));
  const updateTab = useInvoiceStore(state => state.updateTab);

  if (!tabState) return null;

  const {
    selectedCustomerId,
    items = {}, 
    searchQuery,
    paymentForm,
    paymentMethodCode,
    numberingRangeId,
    referenceCode,
    observation,
    paymentDueDate,
    startDate,
    endDate
  } = tabState;

  const setSelectedCustomerId = (val: string) => updateTab(tabId, { selectedCustomerId: val });
  const setSearchQuery = (val: string) => updateTab(tabId, { searchQuery: val });
  const setPaymentForm = (val: string) => updateTab(tabId, { paymentForm: val });
  const setPaymentMethodCode = (val: string) => updateTab(tabId, { paymentMethodCode: val });
  const setNumberingRangeId = (val: string) => updateTab(tabId, { numberingRangeId: val });
  const setReferenceCode = (val: string) => updateTab(tabId, { referenceCode: val });
  const setObservation = (val: string) => updateTab(tabId, { observation: val });
  const setPaymentDueDate = (val: string) => updateTab(tabId, { paymentDueDate: val });
  const setStartDate = (val: string) => updateTab(tabId, { startDate: val });
  const setEndDate = (val: string) => updateTab(tabId, { endDate: val });

  useEffect(() => {
    let isActive = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const response = await fetchWithAuth("/product");
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
        const response = await fetchWithAuth("/customer");
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

  const selectedProducts = useMemo(
    () => products.filter((product) => (items[product.id]?.quantity ?? 0) > 0),
    [products, items]
  );

  const displayedProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return products.filter((p) => (items[p.id]?.quantity ?? 0) > 0);
    }
    
    return products.filter((p) => {
      const nameMatch = p.name ? p.name.toLowerCase().includes(query) : false;
      const refMatch = p.referenceCode ? p.referenceCode.toLowerCase().includes(query) : false;
      const isSelected = (items[p.id]?.quantity ?? 0) > 0;
      return nameMatch || refMatch || isSelected;
    });
  }, [products, searchQuery, items]);

  const total = useMemo(
    () =>
      selectedProducts.reduce(
        (sum, product) => {
            const detail = items[product.id];
            const priceBase = Number(product.price);
            const quantity = detail.quantity;
            const taxRate = Number(detail.tax_rate);
            
            const subtotal = priceBase * quantity;
            const taxAmount = subtotal * (taxRate / 100);
            
            return sum + subtotal + taxAmount;
        },
        0
      ),
    [selectedProducts, items]
  );

  const updateItemDetail = (productId: number, partial: Partial<InvoiceItemDetails>, productInfo?: Product) => {
    const prevItems = items || {};
    const current = prevItems[productId] || { 
      quantity: 0, 
      tax_rate: productInfo?.taxRate ?? 19, 
      is_excluded: productInfo?.isExcluded ?? false,
      tax_name: "IVA", 
      discount_rate: 0,
      unit_price: productInfo?.price ?? 0
    };
    
    const nextValue = { ...current, ...partial };
    
    if (nextValue.quantity === 0) {
      const { [productId]: _, ...rest } = prevItems;
      updateTab(tabId, { items: rest });
    } else {
      updateTab(tabId, { items: { ...prevItems, [productId]: nextValue } });
    }
  };

  const adjustQuantity = (product: Product, delta: number) => {
    const currentQty = items[product.id]?.quantity ?? 0;
    updateItemDetail(product.id, { quantity: Math.max(0, currentQty + delta) }, product);
  };

  const handleEmitInvoice = async () => {
    if (!selectedCustomerId || total === 0) return;

    setIsEmitting(true);
    setEmissionError("");
    setEmissionSuccess("");

    const formattedItems = selectedProducts.map(p => {
        const detail = items[p.id];
        return {
            productId: p.id.toString(),
            quantity: detail.quantity,
            unit_price: p.price,
            tax_rate: detail.tax_rate,
            tax_name: detail.tax_name,
            discount_rate: detail.discount_rate
        };
    });

    const description = selectedProducts
      .map((p) => `${items[p.id].quantity}x ${p.name}`)
      .join(", ");

    try {
      const response = await fetchWithAuth("/invoice", {
        method: "POST",
        body: JSON.stringify({
          total,
          customerId: Number(selectedCustomerId),
          description,
          paymentForm,
          paymentMethodCode,
          numberingRangeId: Number(numberingRangeId),
          referenceCode,
          observation,
          paymentDueDate: paymentDueDate || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          items: formattedItems
        }),
      });

      if (response.ok) {
        setEmissionSuccess("Factura emitida exitosamente.");
        useInvoiceStore.getState().clearTab(tabId);
        if (onSuccess) onSuccess();
      } else {
        const errData = await response.json();
        setEmissionError(errData.message || "Error al emitir la factura. Intenta nuevamente.");
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
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
              Cliente
            </Label>
            <Select
              value={selectedCustomerId}
              onValueChange={(value) => {
                setSelectedCustomerId(value);
                setEmissionSuccess("");
                setEmissionError("");
              }}
              disabled={isLoadingCustomers || customersError || isEmitting}
            >
              <SelectTrigger className="w-full rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] px-4 focus:ring-0 text-[#333333] transition-all">
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
              <SelectContent className="rounded-2xl border-none shadow-xl bg-white/95 backdrop-blur-md">
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()} className="rounded-xl focus:bg-[#E2E4E9]/50 cursor-pointer">
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

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                Forma de Pago
              </Label>
              <Select value={paymentForm} onValueChange={setPaymentForm}>
                <SelectTrigger className="h-12 rounded-[1.5rem] border-none bg-[#E2E4E9] px-4 focus:ring-0 text-[#333333] transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-xl bg-white/95 backdrop-blur-md">
                  <SelectItem value="1" className="rounded-xl focus:bg-[#E2E4E9]/50 cursor-pointer">Contado</SelectItem>
                  <SelectItem value="2" className="rounded-xl focus:bg-[#E2E4E9]/50 cursor-pointer">Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                Método de Pago
              </Label>
              <Select value={paymentMethodCode} onValueChange={setPaymentMethodCode}>
                <SelectTrigger className="h-12 rounded-[1.5rem] border-none bg-[#E2E4E9] px-4 focus:ring-0 text-[#333333] transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-xl bg-white/95 backdrop-blur-md">
                  <SelectItem value="10" className="rounded-xl focus:bg-[#E2E4E9]/50 cursor-pointer">Efectivo</SelectItem>
                  <SelectItem value="20" className="rounded-xl focus:bg-[#E2E4E9]/50 cursor-pointer">Cheque</SelectItem>
                  <SelectItem value="42" className="rounded-xl focus:bg-[#E2E4E9]/50 cursor-pointer">Consignación</SelectItem>
                  <SelectItem value="47" className="rounded-xl focus:bg-[#E2E4E9]/50 cursor-pointer">Transferencia</SelectItem>
                  <SelectItem value="48" className="rounded-xl focus:bg-[#E2E4E9]/50 cursor-pointer">Tarjeta de Crédito</SelectItem>
                  <SelectItem value="49" className="rounded-xl focus:bg-[#E2E4E9]/50 cursor-pointer">Tarjeta de Débito</SelectItem>
                  <SelectItem value="ZZ" className="rounded-xl focus:bg-[#E2E4E9]/50 cursor-pointer">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                Rango de Numeración (ID)
              </Label>
              <Input 
                type="number"
                placeholder="Ej: 1"
                value={numberingRangeId}
                onChange={(e) => setNumberingRangeId(e.target.value)}
                className="rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] px-4 focus-visible:ring-0 text-[#333333] transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                Código de Referencia
              </Label>
              <Input 
                placeholder="Opcional"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                className="rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] px-4 focus-visible:ring-0 text-[#333333] transition-all"
              />
            </div>
          </div>

          {paymentForm === "2" && (
            <div className="mt-6 flex flex-col gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                Fecha de Vencimiento
              </Label>
              <Input 
                type="date"
                value={paymentDueDate}
                onChange={(e) => setPaymentDueDate(e.target.value)}
                className="rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] px-4 focus-visible:ring-0 text-[#333333] transition-all"
              />
            </div>
          )}

          <div className="mt-8">
            <div className="flex flex-col gap-4 mb-6">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                Búsqueda de Productos
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search className="h-5 w-5 text-[#666666]" />
                </div>
                <Input
                  placeholder="Buscar por nombre o SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 rounded-[1.5rem] h-12 border-none bg-[#E2E4E9] focus-visible:ring-0 text-[#333333] transition-all w-full"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="rounded-lg border border-dashed border-border/50 p-6 text-center text-sm text-[#666666]">
                  Cargando productos...
                </div>
              ) : hasError ? (
                <div className="rounded-lg border border-dashed border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
                  No fue posible cargar el catálogo. Intenta nuevamente.
                </div>
              ) : displayedProducts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/50 p-6 text-center text-sm text-[#666666]">
                  {searchQuery.trim() 
                    ? "No se encontraron productos que coincidan con la búsqueda." 
                    : products.length === 0 
                      ? "Aún no tienes productos registrados." 
                      : "Busca productos para agregarlos al carrito."}
                </div>
              ) : (
                displayedProducts.map((product) => {
                  const itemDetail = items[product.id] || { quantity: 0, tax_rate: 19, tax_name: "IVA", discount_rate: 0 };
                  const quantity = itemDetail.quantity;
                  const isSelected = quantity > 0;

                  return (
                    <div
                      key={product.id}
                      className={`flex flex-col gap-4 rounded-[1.5rem] border p-5 transition-all shadow-sm ${
                        isSelected ? "border-[#1F7AE0] bg-[#1F7AE0]/5" : "border-border/50 bg-background hover:border-[#1F7AE0]/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-[#333333]">{product.name}</p>
                          <p className="text-xs text-[#666666] mt-0.5 font-medium">
                            REF: {product.referenceCode}
                          </p>
                        </div>
                        <p className="text-sm font-black text-[#333333]">
                          {currency.format(product.price)}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-[10px] font-bold uppercase text-[#666666] flex items-center gap-1">
                               <Tag className="h-3 w-3" /> Descuento (%)
                            </Label>
                            <Input 
                              type="number"
                              value={itemDetail.discount_rate}
                              onChange={(e) => updateItemDetail(product.id, { discount_rate: Number(e.target.value) })}
                              className="h-9 rounded-xl border-none bg-white px-3 focus-visible:ring-1 focus-visible:ring-[#1F7AE0] text-xs font-bold"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-9 rounded-xl border-none bg-[#E2E4E9] text-[#333333] hover:bg-[#D4D6DC] p-0 font-bold text-lg active:scale-90 transition-all"
                            onClick={() => adjustQuantity(product, -1)}
                            disabled={quantity === 0 || !selectedCustomerId || isEmitting}
                          >
                            -
                          </Button>
                          <span className="min-w-6 text-center text-sm font-black text-[#333333]">
                            {quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-9 rounded-xl border-none bg-[#1F7AE0] text-white hover:bg-[#1A6DD0] p-0 font-bold text-lg active:scale-90 transition-all"
                            onClick={() => adjustQuantity(product, 1)}
                            disabled={!selectedCustomerId || isEmitting}
                          >
                            +
                          </Button>
                        </div>
                        {isSelected && (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-[#666666] font-medium">Subtotal: {currency.format(product.price * quantity)}</span>
                              <span className="text-sm font-black text-[#1F7AE0]">
                                {currency.format((product.price * quantity) * (1 + itemDetail.tax_rate / 100))}
                              </span>
                            </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="flex h-full flex-col rounded-2xl border border-border/50 bg-[#F8FAFC] p-6 shadow-sm">
          <Label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
            Resumen de Factura
          </Label>
          <div className="mt-4 flex flex-1 flex-col gap-3">
            {selectedProducts.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/50 p-6 text-center text-sm text-[#666666]">
                {isLoading
                  ? "Cargando resumen..."
                  : "Agrega productos para ver el resumen y el total."}
              </div>
            ) : (
              selectedProducts.map((product) => {
                const detail = items[product.id];
                const subtotal = product.price * detail.quantity;
                const tax = subtotal * (detail.tax_rate / 100);
                const totalItem = subtotal + tax;
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl bg-white border border-border/50 px-4 py-3 shadow-sm"
                  >
                    <div className="flex-1 mr-4">
                      <p className="text-sm font-bold text-[#333333] truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] bg-[#E2E4E9] px-2 py-0.5 rounded-full font-bold text-[#666666]">
                            {detail.quantity} Unidades
                        </span>
                        <span className="text-[10px] bg-blue-100 px-2 py-0.5 rounded-full font-bold text-blue-700">
                            +{detail.tax_rate}% IVA
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-black text-[#1F7AE0]">
                      {currency.format(totalItem)}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
              Observaciones
            </Label>
            <textarea 
              className="w-full rounded-[1.5rem] border-none bg-white p-4 text-sm focus:ring-2 focus:ring-[#1F7AE0]/30 outline-none min-h-[100px] shadow-sm transition-all"
              placeholder="Notas adicionales para la factura (opcional)..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                Inicio Periodo
              </Label>
              <Input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-[1.5rem] h-12 border-none bg-white px-4 focus-visible:ring-2 focus-visible:ring-[#1F7AE0]/30 text-[#333333] transition-all text-sm shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                Fin Periodo
              </Label>
              <Input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-[1.5rem] h-12 border-none bg-white px-4 focus-visible:ring-2 focus-visible:ring-[#1F7AE0]/30 text-[#333333] transition-all text-sm shadow-sm"
              />
            </div>
          </div>

          {(emissionSuccess || emissionError) && (
            <div className={`mt-4 rounded-xl p-4 text-sm font-bold animate-in zoom-in-95 ${
              emissionSuccess ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}>
              {emissionSuccess || emissionError}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-6 border-t border-border/50 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#666666]">Total a Pagar</span>
              <span className="text-3xl font-black text-[#1F7AE0]">
                {currency.format(total)}
              </span>
            </div>
            <Button 
              className="w-full rounded-[1.5rem] h-16 text-lg font-black bg-[#1F7AE0] hover:bg-[#1A6DD0] text-white shadow-xl shadow-[#1F7AE0]/30 transition-all active:scale-95 disabled:opacity-50" 
              disabled={!selectedCustomerId || total === 0 || isEmitting}
              onClick={handleEmitInvoice}
            >
              {isEmitting ? "Procesando..." : "Emitir Factura Electrónica"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
