import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InvoiceItemDetails {
  quantity: number;
  tax_rate: number;
  is_excluded: boolean;
  tax_name: string;
  discount_rate: number;
  unit_price: number;
}

export interface InvoiceDraft {
  id: string;
  title: string;
  selectedCustomerId: string;
  items: Record<number, InvoiceItemDetails>; 
  searchQuery: string;
  paymentForm: string;
  paymentMethodCode: string;
  numberingRangeId: string;
  referenceCode: string;
  observation: string;
  paymentDueDate: string;
  startDate: string;
  endDate: string;
}

interface InvoiceStore {
  tabs: InvoiceDraft[];
  activeTabId: string | null;
  
  // Actions
  addTab: (id: string, title: string) => void;
  removeTab: (id: string) => void;
  setActiveTabId: (id: string | null) => void;
  updateTab: (id: string, partial: Partial<InvoiceDraft>) => void;
  clearTab: (id: string) => void;
}

const defaultDraft: Omit<InvoiceDraft, 'id' | 'title'> = {
  selectedCustomerId: "",
  items: {},
  searchQuery: "",
  paymentForm: "1",
  paymentMethodCode: "10",
  numberingRangeId: "1",
  referenceCode: "",
  observation: "",
  paymentDueDate: "",
  startDate: "",
  endDate: "",
};

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set) => ({
      tabs: [],
      activeTabId: null,

      addTab: (id, title) => set((state) => ({
        tabs: [...state.tabs, { ...defaultDraft, id, title }],
        activeTabId: id,
      })),

      removeTab: (id) => set((state) => {
        const newTabs = state.tabs.filter((tab) => tab.id !== id);
        let newActiveId = state.activeTabId;
        if (state.activeTabId === id) {
          newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
        }
        return { tabs: newTabs, activeTabId: newActiveId };
      }),

      setActiveTabId: (id) => set({ activeTabId: id }),

      updateTab: (id, partial) => set((state) => ({
        tabs: state.tabs.map((tab) => 
          tab.id === id ? { ...tab, ...partial } : tab
        )
      })),

      clearTab: (id) => set((state) => ({
        tabs: state.tabs.map((tab) => 
          tab.id === id ? { ...tab, ...defaultDraft } : tab
        )
      })),
    }),
    {
      name: 'invoice-drafts-storage',
    }
  )
);
