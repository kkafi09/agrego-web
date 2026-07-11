# AGREGO — Grow Together. Deliver Bigger. Starts Here.

<div align="center">

![Agrego](https://img.shields.io/badge/Agrego%20Web-v0.1.0-0066FF?style=for-the-badge&labelColor=0a0a2e)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&labelColor=0a0a2e)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&labelColor=0a0a2e)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&labelColor=0a0a2e)](https://vitejs.dev)
[![Convex](https://img.shields.io/badge/Convex-Realtime-FF6F00?style=for-the-badge&labelColor=0a0a2e)](https://convex.dev)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&labelColor=0a0a2e)](https://web.dev/progressive-web-apps/)

<strong>B2B Fractional Supply Aggregator Berbasis Gotong Royong.</strong><br> 
Mengubah Ribuan Supply Kecil Menjadi Kapasitas Pasok Industri Melalui Koperasi Desa.

**[Live Demo](https://agrego-web.kafi-dev27.workers.dev/login)**

</div>

---

## 🎯 Why AGREGO?
<img src="public/brand/agrego-primary-logo.svg" alt="AGREGO Logo" width="480"><br> 
Koperasi Indonesia menghadapi tantangan serius: **lebih dari 83.000 koperasi aktif** dengan administrasi yang masih manual — pencatatan simpanan via buku tulis, kontrak disimpan di lemari, dan QC yang mengandalkan ingkatan. Pengurus kewalahan, anggota menunggu kepastian status simpanan dan pinjaman mereka, dan pelaporan ke Dinas terlambat berbulan-bulan.

**AGREGO menjawab ini dengan:**

| Problem | Impact | AGREGO Solution |
|---|---|---|
| Manual bookkeeping via Excel/WhatsApp | Data silos, prone to errors | **Real-time Convex database** with auto-generated TypeScript types |
| Slow QC review for deposits & contracts | Members wait days for status | **Dedicated QC module** with reactive approval flow |
| Role confusion (admin, QC, member) | Wrong permissions, security risk | **Role-based routing** with centralized config and guard |
| Web-only access for field officers | Can't check data offline/on mobile | **PWA** — installable, offline-capable, mobile-first |
| Vendor lock-in on cloud providers | High cost, limited flexibility | **Cloudflare Workers** deploy — edge-first, near-zero cost at scale |

---

## ✨ Key Features

### 🏛️ Cooperative Operations
- **Dashboard** — role-specific KPIs (admin, QC officer, member)
- **Simpanan (Deposits)** — create deposits, deposit history, deposit reports
- **QC Module** — QC form, history, deposit detail, result detail for quality control
- **Kontrak (Contracts)** — list, detail, and create new contracts with members
- **Anggota (Members)** — member directory and profile management
- **Komoditas (Commodities)** — commodity catalog for contract pricing
- **SHU (Profit Shares)** — profit share calculation and distribution
- **Profil Koperasi & User** — cooperative profile and personal account settings
- **Auth flow** — login, register, reset password pages

### 🔐 Role-Based Access Control
- **Centralized permission config** — `src/config/roles.ts` defines what each role can access
- **Route mapping** — declarative route → role mapping in `src/config/routes.ts`
- **Navigation config** — sidebar/menu items auto-filtered by role
- **Local storage auth** — lightweight client-side session for MVP (see Architecture note for production path)

### ⚡ Real-Time Data with Convex
- **Reactive queries** — UI updates instantly when backend data changes, no manual refetch
- **Type-safe schema** — `convex/schema.ts` generates TypeScript types end-to-end
- **Mutations + Queries** — clean separation, optimistic updates out of the box
- **Zero backend boilerplate** — no REST/GraphQL layer to maintain

### 📱 Progressive Web App
- **Installable** — add to home screen on iOS/Android/desktop
- **Service Worker** — offline caching via `vite-plugin-pwa`
- **Mobile-first** — responsive layouts optimized for field officers
- **Fast load** — Vite 8 + React 19 Compiler for minimal JS shipped

### 🎨 Modern UI Stack
- **Tailwind CSS v4** — utility-first styling via `@tailwindcss/vite`
- **Radix UI** — accessible headless primitives (label, radio-group, slot)
- **Lucide React** — consistent SVG icon set
- **React Hot Toast** — non-blocking notifications
- **React Hook Form + Zod** — type-safe form validation
- **class-variance-authority + tailwind-merge + clsx** — typed component variants

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                  AGREGO WEB WORKFLOW                        │
└─────────────────────────────────────────────────────────────┘

  [1] AUTH                [2] ROLE ROUTE            [3] DASHBOARD
  ┌──────────────┐        ┌──────────────┐          ┌──────────────────────┐
  │ Login /       │        │ Role Config  │          │  Role-specific KPIs  │
  │ Register      │───────▶│ Route Guard  │─────────▶│  Simpanan · QC       │
  └──────────────┘        └──────────────┘          │  Kontrak · SHU       │
                                                     └──────────────────────┘
                                                              │
                                                              ▼
  [6] EXPORT / SYNC    [5] QC REVIEW         [4] TRANSACTION
  ┌──────────────┐      ┌──────────────┐       ┌──────────────────────┐
  │ PDF / Print  │◀─────│ Approve /    │◀──────│ Deposits · Contracts │
  │ Cloud Sync   │      │ Reject / Edit│       │ Members · Commodities│
  └──────────────┘      └──────────────┘       └──────────────────────┘
```

---

## 🏗️ Architecture

```
                         ┌──────────────────────────────────┐
                         │         CLIENT LAYER             │
                         │  React 19 + TypeScript + Vite 8 │
                         │  React Compiler · Tailwind v4   │
                         │  Radix UI · Lucide · RHF + Zod  │
                         └──────────────┬───────────────────┘
                                        │
          ┌──────────────────────────────┼──────────────────────────────┐
          │                              │                              │
          ▼                              ▼                              ▼
┌──────────────────┐       ┌─────────────────────┐       ┌──────────────────┐
│  Auth & Routing  │       │  Role-Based Access  │       │  Forms & Validation│
│  React Router 7  │       │  src/config/roles   │       │  React Hook Form │
│  Local Storage   │       │  src/config/routes  │       │  Zod schemas     │
└────────┬─────────┘       └──────────┬──────────┘       └────────┬─────────┘
         │                              │                              │
         └──────────────────────────────┼──────────────────────────────┘
                                        │
                         ┌──────────────▼───────────────────┐
                         │       CONVEX BACKEND              │
                         │  Real-time Reactive Database     │
                         │  ├── Schema (convex/schema.ts)  │
                         │  ├── Queries (convex/*.ts)       │
                         │  ├── Mutations (convex/*.ts)     │
                         │  └── Auto-generated TS types     │
                         └───────��──────┬───────────────────┘
                                        │
                         ┌──────────────▼───────────────────┐
                         │       DEPLOYMENT LAYER            │
                         │  Cloudflare Workers (Edge)       │
                         │  ├── Workers Assets (dist/)       │
                         │  ├── SPA fallback → index.html  │
                         │  └── Global edge network         │
                         └──────────────────────────────────┘
```

### Data Flow
```
User Action → React Hook Form + Zod validation
    │
    ├── Convex mutation ──▶ Real-time DB ──▶ All subscribers update instantly
    ├── Convex query    ──▶ Reactive read ──▶ UI re-renders on data change
    └── Role guard      ──▶ Permission check ──▶ Allow / redirect / 403

PWA Service Worker caches:
    ├── App shell (HTML, CSS, JS)
    ├── Static assets (icons, fonts)
    └── Last-known data for offline read
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 + Vite 8 | Fast SPA with HMR, minimal JS via React Compiler |
| **Language** | TypeScript 6.0 | End-to-end type safety with Convex generated types |
| **Backend / Database** | Convex | Real-time reactive backend-as-a-service |
| **Styling** | Tailwind CSS v4 | Utility-first CSS via `@tailwindcss/vite` |
| **UI Primitives** | Radix UI | Accessible headless components |
| **Icons** | Lucide React | Consistent SVG iconography |
| **Routing** | React Router DOM v7 | Role-based client-side routing |
| **Forms** | React Hook Form + Zod | Performant, type-safe form validation |
| **Notifications** | React Hot Toast | Non-blocking user feedback |
| **Component Utils** | CVA + clsx + tailwind-merge | Typed variants, class composition |
| **PWA** | vite-plugin-pwa | Service worker, offline cache, install prompt |
| **Linter** | Oxlint | Rust-based, near-instant linting |
| **Runtime / PM** | Bun | Fast install + script runner |
| **Deployment** | Cloudflare Workers | Edge hosting via Wrangler |

---

## 🚀 Getting Started

### Prerequisites

- **Bun** 1.x — [Install here](https://bun.sh) (or Node.js 18+ as fallback)
- **Convex account** — [Sign up free](https://convex.dev)
- Modern browser (Chrome 110+, Edge 110+, Safari 16.4+)

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/kkafi09/agrego-web.git
cd agrego-web

# Install dependencies (using Bun — recommended)
bun install
```

### Environment Setup

Create a `.env.local` file in the project root:

```bash
# .env.local
CONVEX_DEPLOYMENT=your_convex_deployment_name
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
```

> ⚠️ **Security Note:** Never commit your `.env.local` file. The `VITE_CONVEX_*` vars are exposed to the client by design (Vite prefix) — this is acceptable for Convex because access is governed by Convex's built-in auth functions, not by hiding the URL. Restrict data access in `convex/auth.config.ts` and per-function `ctx.auth` checks. For production, replace the local-storage auth helper in `src/lib/` with a proper Convex auth provider.

### Run Development Server

```bash
# Terminal 1 — Convex backend sync (watch mode)
bun run dev:convex

# Terminal 2 — Vite dev server
bun run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Type-check + build to dist/
bun run build

# Preview production build locally
bun run preview

# Lint
bun run lint

# Build + deploy to Cloudflare Workers
bun run deploy
```

### Cloudflare Workers Deploy (Optional)

```bash
# First-time setup
npx wrangler login

# Deploy
bun run deploy
```

`wrangler.toml` is preconfigured with:
- `directory = "./dist"`
- `not_found_handling = "single-page-application"` (routes unmatched paths to `index.html` with 200 OK — required for React Router)

Set `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` in the Cloudflare dashboard (Settings → Variables) before deploying.

---
