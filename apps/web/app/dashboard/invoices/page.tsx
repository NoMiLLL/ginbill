"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Search, Calendar as CalendarIcon, ArrowUpDown } from "lucide-react";
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

interface Invoice {
  id: number;
  total: number;
  description: string;
  createdAt: string;
  customer: {
    names: string;
    identification: string;
  };
}

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth("http://localhost:4000/invoice");
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesCustomer = invoice.customer.names
        .toLowerCase()
        .includes(search.toLowerCase()) || 
        invoice.customer.identification.includes(search);
      
      const matchesDate = !dateFilter || invoice.createdAt.startsWith(dateFilter);
      
      return matchesCustomer && matchesDate;
    });
  }, [invoices, search, dateFilter]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 mt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#333333]">Historial de Facturas</h1>
          <p className="text-[#666666] text-sm mt-1">Visualiza y filtra todas las facturas emitidas</p>
        </div>
      </div>

      <div className="neo-glass rounded-[2rem] overflow-hidden flex flex-col mt-4">
        <div className="p-8 border-b border-white/20 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="relative max-w-sm w-full neo-pressed rounded-2xl flex items-center h-12 px-4 shadow-sm">
            <Search className="h-5 w-5 text-[#666666]" strokeWidth={2} />
            <Input 
              placeholder="Buscar por cliente o ID..." 
              className="border-none bg-transparent h-full w-full focus-visible:ring-0 text-[#333333] placeholder:text-[#666666]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-56 neo-pressed rounded-2xl flex items-center h-12 px-4 shadow-sm">
              <CalendarIcon className="h-5 w-5 text-[#666666]" strokeWidth={2} />
              <input 
                type="date"
                className="bg-transparent border-none outline-none w-full pl-3 text-[#333333] cursor-pointer"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            { (search || dateFilter) && (
              <Button 
                variant="ghost" 
                onClick={() => { setSearch(""); setDateFilter(""); }}
                className="h-12 px-6 rounded-2xl text-[#666666] hover:text-[#333333] hover:neo-surface font-medium transition-all"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/20 hover:bg-transparent">
                <TableHead className="px-8 py-5 w-[120px] font-semibold text-[#666666] uppercase text-xs tracking-wider">Factura</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[#666666] uppercase text-xs tracking-wider">Fecha</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[#666666] uppercase text-xs tracking-wider">Cliente</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[#666666] uppercase text-xs tracking-wider">Descripción</TableHead>
                <TableHead className="px-8 py-5 text-right font-semibold text-[#666666] uppercase text-xs tracking-wider">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/10">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[#666666] font-medium">
                    Cargando facturas...
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[#666666] font-medium">
                    No se encontraron facturas con los filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice, index) => {
                  return (
                  <TableRow 
                    key={invoice.id} 
                    className="group transition-all duration-300 border-none hover:neo-surface hover:rounded-2xl hover:scale-[1.01]"
                  >
                    <TableCell className="px-8 py-5 font-medium text-[#333333] transition-transform group-hover:pl-10">#INV-{invoice.id.toString().padStart(4, '0')}</TableCell>
                    <TableCell className="px-8 py-5 text-[#666666] whitespace-nowrap">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#333333] transition-colors group-hover:text-[#1F7AE0]">{invoice.customer.names}</span>
                        <span className="text-xs text-[#666666] mt-1">{invoice.customer.identification}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5 max-w-[300px] truncate-3-lines text-[#666666]" title={invoice.description}>
                      {invoice.description}
                    </TableCell>
                    <TableCell className="px-8 py-5 text-right font-semibold text-[#1F7AE0] transition-transform group-hover:pr-10 text-lg">
                      {currency.format(invoice.total)}
                    </TableCell>
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
