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
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#333333]">Facturación</h2>
            <p className="text-[#666666] mt-1">
              Gestiona múltiples cuentas de forma simultánea.
            </p>
          </div>
          <Button onClick={createNewTab} className="gap-2 bg-[#1F7AE0] hover:bg-[#1A6DD0] text-white shadow-lg shadow-[#1F7AE0]/30 rounded-2xl h-12 px-6 transition-all">
            <Plus className="h-5 w-5" strokeWidth={2} />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="neo-surface rounded-[2rem] p-8 flex flex-col gap-3 transition-all hover:neo-surface-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#666666]">Total Facturado Mes</span>
                  <div className="p-3 bg-[#1F7AE0]/10 rounded-2xl">
                    <TrendingUp className="h-5 w-5 text-[#1F7AE0]" strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-3xl font-bold tracking-tight text-[#333333]">
                    {isLoading ? "..." : currency.format(metrics.totalCurrentMonth)}
                  </div>
                  <p className={`text-xs mt-2 font-medium ${metrics.growthPercentage >= 0 ? 'text-[#1F7AE0]' : 'text-[#991B1B]'}`}>
                    {!isLoading && `${metrics.growthPercentage >= 0 ? '+' : ''}${metrics.growthPercentage.toFixed(1)}% respecto al mes anterior`}
                  </p>
                </div>
              </div>
              
              <div className="neo-surface rounded-[2rem] p-8 flex flex-col gap-3 transition-all hover:neo-surface-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#666666]">Facturas Emitidas</span>
                  <div className="p-3 bg-[#E0E0E0]/50 neo-pressed rounded-2xl">
                    <Receipt className="h-5 w-5 text-[#333333]" strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-3xl font-bold tracking-tight text-[#333333]">
                    {isLoading ? "..." : metrics.invoicesCurrentMonth}
                  </div>
                  <p className="text-xs text-[#666666] mt-2 font-medium">Facturas generadas este mes</p>
                </div>
              </div>
              
              <div className="neo-surface rounded-[2rem] p-8 flex flex-col gap-3 transition-all hover:neo-surface-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#666666]">Ticket Promedio</span>
                  <div className="p-3 bg-[#1F7AE0]/10 rounded-2xl">
                    <Activity className="h-5 w-5 text-[#1F7AE0]" strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-3xl font-bold tracking-tight text-[#333333]">
                    {isLoading ? "..." : currency.format(metrics.averageTicket)}
                  </div>
                  <p className="text-xs text-[#666666] mt-2 font-medium">Valor promedio por factura</p>
                </div>
              </div>
              
              <div className="neo-surface rounded-[2rem] p-8 flex flex-col gap-3 transition-all hover:neo-surface-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#666666]">Total Clientes</span>
                  <div className="p-3 bg-[#E0E0E0]/50 neo-pressed rounded-2xl">
                    <Users className="h-5 w-5 text-[#333333]" strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-3xl font-bold tracking-tight text-[#333333]">
                    {isLoading ? "..." : metrics.totalCustomers}
                  </div>
                  <p className="text-xs text-[#666666] mt-2 font-medium">Clientes registrados en la base</p>
                </div>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="neo-glass rounded-[2rem] overflow-hidden flex flex-col mt-8">
              <div className="p-8 flex items-center justify-between border-b border-white/20">
                <h3 className="font-semibold text-xl text-[#333333]">Facturas Recientes</h3>
                <Button variant="ghost" size="sm" className="text-[#1F7AE0] font-medium hover:neo-surface-sm rounded-xl gap-2 h-10 px-4">
                  Ver todas <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[#666666] uppercase border-b border-white/20">
                    <tr>
                      <th className="px-8 py-5 font-semibold tracking-wider">Factura</th>
                      <th className="px-8 py-5 font-semibold tracking-wider">Cliente</th>
                      <th className="px-8 py-5 font-semibold tracking-wider">Fecha</th>
                      <th className="px-8 py-5 font-semibold tracking-wider text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-10 text-center text-[#666666] font-medium">Cargando facturas...</td>
                      </tr>
                    ) : recentInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-10 text-center text-[#666666] font-medium">No hay facturas emitidas aún.</td>
                      </tr>
                    ) : (
                      recentInvoices.map((invoice, index) => (
                        <tr key={invoice.id} className="hover:neo-surface-sm transition-all duration-300 group">
                          <td className="px-8 py-5 font-medium text-[#333333]">#INV-{invoice.id.toString().padStart(4, '0')}</td>
                          <td className="px-8 py-5 text-[#666666] group-hover:text-[#333333] transition-colors">{invoice.customer.names}</td>
                          <td className="px-8 py-5 text-[#666666]">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                          <td className="px-8 py-5 text-right font-semibold text-[#1F7AE0]">{currency.format(invoice.total)}</td>
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
