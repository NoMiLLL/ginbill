"use client";

import { useState } from "react";
import { Plus, X, Receipt } from "lucide-react";
import ProductCartCard from "@/components/shared/ProductCartCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  title: string;
};

export default function DashboardPage() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const createNewTab = () => {
    const newId = crypto.randomUUID();
    const newTab: Tab = {
      id: newId,
      title: `Cuenta ${tabs.length + 1}`,
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
          <Button onClick={createNewTab} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Cuenta
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
          <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed rounded-xl p-12">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Receipt className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No hay cuentas abiertas</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Haz clic en el botón de "Nueva Cuenta" para comenzar a generar una factura.
            </p>
            <Button onClick={createNewTab} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Crear primera cuenta
            </Button>
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
