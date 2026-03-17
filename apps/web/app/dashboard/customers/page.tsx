"use client";

import ManagementLanding from "@/components/shared/ManagementLanding";

export default function CustomersLandingPage() {
  return (
    <ManagementLanding
      title="Administrar Clientes"
      description="Gestiona tu base de datos de clientes para la facturación."
      createHref="/dashboard/customers/new"
      createLabel="Crear Nuevo Cliente"
      manageHref="/dashboard/customers/manage"
      manageLabel="Gestionar Clientes"
    />
  );
}
