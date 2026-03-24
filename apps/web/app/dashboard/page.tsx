"use client";

import { useState, useEffect } from "react";
import { Plus, X, Receipt, TrendingUp, Activity, Users, ChevronRight, LayoutDashboard } from "lucide-react";
import ProductCartCard from "@/components/shared/ProductCartCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";

type Tab = {
  id: string;
  title: string;
};

interface Invoice {
  id: number;
  total: number;
  createdAt: string;
  customer: {
    names: string;
  };
}

export default function DashboardPage() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const [metrics, setMetrics] = useState({
    totalCurrentMonth: 0,
    growthPercentage: 0,
    invoicesCurrentMonth: 0,
    averageTicket: 0,
    totalCustomers: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [invRes, custRes] = await Promise.all([
          fetchWithAuth("http://localhost:4000/invoice"),
          fetchWithAuth("http://localhost:4000/customer"),
        ]);
        
        const invoices: Invoice[] = invRes.ok ? await invRes.json() : [];
        const customers: any[] = custRes.ok ? await custRes.json() : [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let previousMonth = currentMonth - 1;
        let previousYear = currentYear;
        if (previousMonth < 0) {
          previousMonth = 11;
          previousYear -= 1;
        }

        let totalCurrent = 0;
        let totalPrevious = 0;
        let countCurrent = 0;

        // Sort invoices by date desc
        const sortedInvoices = [...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentInvoices(sortedInvoices.slice(0, 5));

        invoices.forEach(inv => {
          const d = new Date(inv.createdAt);
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            totalCurrent += Number(inv.total);
            countCurrent++;
          } else if (d.getMonth() === previousMonth && d.getFullYear() === previousYear) {
            totalPrevious += Number(inv.total);
          }
        });

        let growth = 0;
        if (totalPrevious > 0) {
          growth = ((totalCurrent - totalPrevious) / totalPrevious) * 100;
        } else if (totalCurrent > 0 && totalPrevious === 0) {
          growth = 100;
        }

        setMetrics({
          totalCurrentMonth: totalCurrent,
          growthPercentage: growth,
          invoicesCurrentMonth: countCurrent,
          averageTicket: countCurrent > 0 ? totalCurrent / countCurrent : 0,
          totalCustomers: customers.length,
        });

      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const currency = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const createNewTab = () => {
    const newId = crypto.randomUUID();
    const newTab: Tab = {
      id: newId,
      title: `Factura ${tabs.length + 1}`,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header with "New Tab" button and Tab Bar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Facturación</h2>
            <p className="text-muted-foreground">
              Gestiona múltiples cuentas de forma simultánea.
            </p>
          </div>
          <Button onClick={createNewTab} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-lg">
            <Plus className="h-4 w-4" />
            Nueva Factura
          </Button>
        </div>

        {/* Tab Bar */}
        {tabs.length > 0 && (
          <div className="flex items-center gap-1 border-b overflow-x-auto no-scrollbar pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "group flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-b-2 min-w-[140px] max-w-[200px] truncate",
                  activeTabId === tab.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Receipt className="h-4 w-4 flex-shrink-0" />
                <span className="truncate flex-1 text-left">{tab.title}</span>
                <X
                  className="h-3 w-3 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  onClick={(e) => closeTab(tab.id, e)}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {tabs.length === 0 ? (
          <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm p-6 flex flex-col gap-2 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Facturado Mes</span>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-[#1E293B]">
                    {isLoading ? "..." : currency.format(metrics.totalCurrentMonth)}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${metrics.growthPercentage >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'}`}>
                    {!isLoading && `${metrics.growthPercentage >= 0 ? '+' : ''}${metrics.growthPercentage.toFixed(1)}% respecto al mes anterior`}
                  </p>
                </div>
              </div>
              <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm p-6 flex flex-col gap-2 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Facturas Emitidas</span>
                  <div className="p-2 bg-[#FEF3C7] rounded-lg">
                    <Receipt className="h-4 w-4 text-[#92400E]" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-[#1E293B]">
                    {isLoading ? "..." : metrics.invoicesCurrentMonth}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Facturas generadas este mes</p>
                </div>
              </div>
              <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm p-6 flex flex-col gap-2 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Ticket Promedio</span>
                  <div className="p-2 bg-[#DCFCE7] rounded-lg">
                    <Activity className="h-4 w-4 text-[#166534]" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-[#1E293B]">
                    {isLoading ? "..." : currency.format(metrics.averageTicket)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Valor promedio por factura</p>
                </div>
              </div>
              <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm p-6 flex flex-col gap-2 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Clientes</span>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-[#1E293B]">
                    {isLoading ? "..." : metrics.totalCustomers}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Clientes registrados en la base</p>
                </div>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 flex items-center justify-between border-b border-border/50">
                <h3 className="font-semibold text-lg text-[#1E293B]">Facturas Recientes</h3>
                <Button variant="ghost" size="sm" className="text-primary font-medium hover:bg-primary/10 rounded-lg gap-1">
                  Ver todas <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[#64748B] uppercase bg-[#F8FAFC] border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold tracking-wider">Factura</th>
                      <th className="px-6 py-4 font-semibold tracking-wider">Cliente</th>
                      <th className="px-6 py-4 font-semibold tracking-wider">Fecha</th>
                      <th className="px-6 py-4 font-semibold tracking-wider text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Cargando facturas...</td>
                      </tr>
                    ) : recentInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No hay facturas emitidas aún.</td>
                      </tr>
                    ) : (
                      recentInvoices.map((invoice, index) => (
                        <tr key={invoice.id} className={`${index % 2 !== 0 ? 'bg-[#F8FAFC]' : ''} hover:bg-muted/50 transition-colors`}>
                          <td className="px-6 py-4 font-medium text-[#1E293B]">#INV-{invoice.id.toString().padStart(4, '0')}</td>
                          <td className="px-6 py-4 text-[#64748B]">{invoice.customer.names}</td>
                          <td className="px-6 py-4 text-[#64748B]">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right font-medium text-[#1E293B]">{currency.format(invoice.total)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "w-full max-w-5xl mx-auto mt-4 transition-all duration-300",
                activeTabId === tab.id ? "block opacity-100 scale-100" : "hidden opacity-0 scale-95"
              )}
            >
              <ProductCartCard 
                onSuccess={() => {
                  // Optional: close tab or update title after successful emission
                  // For now, let's just keep it open but maybe we could mark it as "Saved"
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
