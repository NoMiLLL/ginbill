"use client";

import ProductCartCard from "@/components/shared/ProductCartCard";

export default function DashboardPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center h-full">
      <div className="w-full max-w-5xl px-4 md:px-6 mt-10">
        <ProductCartCard />
      </div>
    </div>
  );
}
