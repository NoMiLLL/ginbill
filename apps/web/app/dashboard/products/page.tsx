"use client";

import ManagementLanding from "@/components/shared/ManagementLanding";

export default function ProductsLandingPage() {
  return (
    <ManagementLanding
      title="Administrar Productos"
      description="Gestiona el catálogo de productos o servicios que ofreces."
      createHref="/dashboard/products/new"
      createLabel="Crear Nuevo Producto"
      manageHref="/dashboard/products/manage"
      manageLabel="Gestionar Productos"
    />
  );
}
