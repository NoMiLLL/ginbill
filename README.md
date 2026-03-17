

# 3am - Monorepo con Turborepo

Este repositorio contiene una API (NestJS) y un Frontend (Next.js) organizados en un monorepo gestionado con [Turborepo](https://turbo.build/).

## Estructura
- `apps/api`: Backend desarrollado con NestJS.
- `apps/web`: Frontend desarrollado con Next.js (App Router).
- `packages/`: Espacio para paquetes compartidos (configuraciones, componentes comunes, etc.).
- `ginebrafrontend/`: Carpeta con artefactos generados de Next (`.next`). No contiene código fuente.

## Arquitectura
- **Frontend (`apps/web`)**: Next.js (App Router), rutas en `app/`, componentes en `components/`, utilidades en `lib/`.
- **Backend (`apps/api`)**: NestJS modular por dominio, módulos en `src/modules` (como `product`, `customer`) con `controller`, `service`, `dto` y `entities`.

## Configuración y stack
- Monorepo administrado con Turborepo (`turbo.json` en la raíz).
- Workspaces: `apps/*` y `packages/*` (ver `package.json` de la raíz).
- Frontend: `next@16`, `react@19`, `tailwindcss@4` (ver `apps/web/package.json`).
- Backend: NestJS + TypeORM + Postgres (ver `apps/api/package.json`).

## Requisitos
- Node.js (se recomienda la versión indicada en `package.json`).
- npm (o pnpm/yarn, pero configurado con npm por defecto).

## Instalación
Instala todas las dependencias desde la raíz del proyecto:
```bash
npm install
```

## Ejecución (Desarrollo)
Para ejecutar ambas aplicaciones simultáneamente en modo desarrollo:
```bash
npm run dev
```
O para ejecutar una aplicación específica:
```bash
npx turbo run dev --filter=api
npx turbo run dev --filter=web
```

## Construcción (Build)
Para compilar todas las aplicaciones:
```bash
npm run build
```

## Otros Comandos
- `npm run lint`: Ejecuta el linter en todos los paquetes.
- `npm run test`: Ejecuta las pruebas en todos los paquetes.

## Variables de Entorno
- La API utiliza un archivo `.env` en `apps/api/.env`.
- El repositorio tiene un `.env.local` en la raíz (usado para desarrollo local).
- La API lee la cadena de conexión desde `database_url`.

## Puertos por defecto
- API: `4000` (o `PORT` si está definido).
