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

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/40 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2 bg-background rounded-md px-3 border focus-within:ring-1 focus-within:ring-primary">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por cliente o identificación..." 
              className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64 flex items-center gap-2 bg-background rounded-md px-3 border focus-within:ring-1 focus-within:ring-primary">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <input 
              type="date"
              className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-9 text-sm w-full outline-none"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          { (search || dateFilter) && (
            <Button 
              variant="ghost" 
              onClick={() => { setSearch(""); setDateFilter(""); }}
              className="text-xs h-9"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">#{invoice.id}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{invoice.customer.names}</span>
                      <span className="text-xs text-muted-foreground">{invoice.customer.identification}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate" title={invoice.description}>
                    {invoice.description}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {currency.format(invoice.total)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
