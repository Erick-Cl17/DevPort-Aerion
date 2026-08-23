# AERION

Gestión de revisiones, actividades y usuarios por organización, equipo,
cargo y rol. Cada equipo puede tener su propia zona horaria y sus propios
plazos, con trazabilidad completa de cada cambio.


## Stack tecnológico

- Next.js 14.2 (App Router)
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

- TypeScript 5
- Tailwind CSS 3.4
- Supabase (PostgreSQL + Auth + Storage)
- TimeZoneDB (API externa de zonas horarias)
- Vercel (deploy) — _pendiente_

## Roles de usuario

| Rol | Alcance | Qué puede hacer |
|---|---|---|
| **Superadmin** | Toda la organización | Control total: crea/edita cualquier equipo, usuario, cargo o rol |
| **Admin. organización** | Toda la organización | Igual que Superadmin salvo tareas reservadas al dueño de la cuenta |
| **Admin. equipo** | Un equipo específico | Administra usuarios y revisiones solo dentro de su equipo |
| **Supervisor** | Un equipo específico | Crea y gestiona revisiones de su equipo, no administra usuarios |
| **Revisor** | Un equipo específico | Es responsable de revisiones asignadas: puede iniciarlas y finalizarlas |
| **Consulta** | Un equipo específico | Solo lectura dentro de su equipo |

Un mismo usuario puede tener roles distintos en equipos distintos (ej.
Supervisor en un equipo y Consulta en otro) — cada asignación es
independiente.

## Modelo de datos

12 tablas relacionadas (ver `AERION_Script_SQL.sql` para el detalle completo):

- **organizaciones** → **equipos** → **asignaciones** (usuario + equipo + cargo + rol)
- **profiles** extiende `auth.users` (1:1)
- **roles** ↔ **permisos** (N:M vía `roles_permisos`)
- **revisiones** (recurso principal) → **revision_eventos** (trazabilidad) y **evidencias** (archivos en Storage, solo se guarda la ruta)
- **auditoria** y **notificaciones**, independientes

El estado de una revisión (No iniciada / En proceso / Finalizada en plazo /
Finalizada fuera de plazo / Vencida) se calcula en tiempo real con una
función SQL, no se guarda como columna fija.

## Instalación local

```bash
git clone <https://github.com/Erick-Cl17/DevPort-Aerion.git>
cd aerion
npm install
cp .env.local
npm run dev
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Variables de entorno

| Variable | Para qué sirve |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Llave pública (anon) de Supabase |
| `TIMEZONEDB_API_KEY` | Llave gratuita de timezonedb.com/register |

## Credenciales de prueba

Contraseña única para las 6 cuentas: **`AerionQ8#Zx`**
(se crean con `AERION_Cuentas_Prueba.sql`, todas dentro de "Organización de
Prueba" / "Equipo Alpha")

| Rol | Correo |
|---|---|
| Superadmin | superadmin@aerion-test.com |
| Admin. organización | adminorg@aerion-test.com |
| Admin. equipo | adminequipo@aerion-test.com |
| Supervisor | supervisor@aerion-test.com |
| Revisor | revisor@aerion-test.com |
| Consulta | consulta@aerion-test.com |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Funcionalidades — checklist

- [x] Registro, login, logout, confirmación de cuenta por correo
- [x] Protección de rutas privadas con `proxy.ts`
- [x] Roles y permisos por organización/equipo 
- [x] Ruta dinámica `/dashboard/revisiones/[id]`
- [x] CRUD completo del recurso principal (revisiones)
- [x] Base de datos relacional con RLS activado
- [x] Consumo de API externa (TimeZoneDB) con manejo de error si no responde
- [x] Subida de evidencias a Supabase Storage 

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Autor

_[Erick Clavijo](https://github.com/Erick-Cl17)_