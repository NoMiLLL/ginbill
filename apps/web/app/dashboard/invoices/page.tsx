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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historial de Facturas</h1>
          <p className="text-muted-foreground text-sm">Visualiza y filtra todas las facturas emitidas</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-[#F8FAFC] flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative max-w-[400px] w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input 
              placeholder="Buscar por cliente o identificación..." 
              className="pl-9 h-10 w-full border-border/50 rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <input 
                type="date"
                className="pl-9 h-10 w-full rounded-lg border border-border/50 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary text-[#1E293B]"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            { (search || dateFilter) && (
              <Button 
                variant="ghost" 
                onClick={() => { setSearch(""); setDateFilter(""); }}
                className="text-xs h-10 rounded-lg text-[#64748B] hover:text-[#1E293B]"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC] border-b border-border/50">
                <TableHead className="w-[100px] font-semibold text-[#64748B]">Factura</TableHead>
                <TableHead className="font-semibold text-[#64748B]">Fecha</TableHead>
                <TableHead className="font-semibold text-[#64748B]">Cliente</TableHead>
                <TableHead className="font-semibold text-[#64748B]">Descripción</TableHead>
                <TableHead className="text-right font-semibold text-[#64748B]">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/50">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Cargando facturas...
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No se encontraron facturas con los filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice, index) => {
                  return (
                  <TableRow 
                    key={invoice.id} 
                    className={`group transition-colors border-none ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-muted/50`}
                  >
                    <TableCell className="font-medium text-[#1E293B]">#INV-{invoice.id.toString().padStart(4, '0')}</TableCell>
                    <TableCell className="text-[#64748B] whitespace-nowrap">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-[#1E293B]">{invoice.customer.names}</span>
                        <span className="text-xs text-[#64748B]">{invoice.customer.identification}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-[#64748B]" title={invoice.description}>
                      {invoice.description}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-[#1E293B]">
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
