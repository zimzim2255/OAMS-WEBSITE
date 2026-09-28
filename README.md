# OAMS - Streetwear Brand

Custom streetwear brand creating unique looks since 2018. Hand-operated by our artisans.

## 🚀 Live Demo

The website is deployed on GitHub Pages with a custom domain: [https://www.oams.shop](https://www.oams.shop)

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** GSAP
- **Deployment:** GitHub Pages (static export, current) → **VPS + Docker (v2)**

## 🧱 The full platform (v2)

This repo is growing from a static store into a **full SaaS e-commerce +
marketplace platform** (PostgreSQL‑backed, hosted on a VPS). It adds:

- **Admin panel** — add / edit / remove products, manage & process orders, manage users & sellers
- **Marketplace** — registered sellers list products and see per‑product **click / view / sale** analytics (the "SaaS click system")
- **Fast images** — a server‑side `sharp` pipeline stores small WebP thumbnails for instant rendering & downloads
- **Accounts & orders** — JWT auth (`USER / SELLER / ADMIN`), database‑backed checkout, SMTP order emails

See **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** for the complete design:
data model, API surface, analytics engine, image pipeline and the phased rollout.
The current storefront (Phase 1) still builds and deploys unchanged.

## 📦 Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/zimzim2255/OAMS-WEBSITE.git
cd OAMS-WEBSITE

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

```bash
npm run build
```

This generates a static export in the `out/` directory suitable for GitHub Pages.

## 📄 Pages

- **Home** - Hero, brand story, bestsellers
- **Products** - Full product catalog with filtering
- **Product Detail** - Size/color selection, add to cart
- **Cart** - Shopping cart with shipping options
- **Checkout** - Order form with Formspree integration
- **Contact** - Contact form with Formspree integration
- **Terms of Service** - Legal terms

## ⚙️ Deployment

Deployment to GitHub Pages is automated via GitHub Actions. Any push to the `main` branch triggers the workflow which:

1. Installs dependencies
2. Builds the static export
3. Deploys to GitHub Pages

### Manual Deploy

```bash
npm run build
npx gh-pages -d out
```

## 🗄️ Database & VPS deployment (v2)

The platform is built on **PostgreSQL + Prisma** and runs in **Docker on a VPS**
(see [`docker-compose.yml`](docker-compose.yml) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)).

```bash
# 1) Setup: copy env template, edit the values, install
cp .env.example .env
npm install                 # also runs prisma generate (postinstall)

# 2) Local dev against PostgreSQL (must have a running postgres)
cp .env.example .env        # set DATABASE_URL, JWT_SECRET, ADMIN_*
npm run db:migrate          # create tables
npm run db:seed             # create the admin user
npm run dev

# 3) Deploy to a VPS
docker compose up -d --build   # runs postgres + the app; applies migrations, seeds
```

Key npm scripts:

| Command | Purpose |
|---------|---------|
| `dev` / `build` / `start` | Next.js dev / build / serve |
| `db:generate` | regenerate the Prisma client |
| `db:migrate` | create/apply dev migrations |
| `db:deploy` | apply migrations in production |
| `db:seed` | seed the admin account |

> **Going live:** the current GitHub Pages *static export* (`output: "export"`)
> is only for the Phase‑1 storefront. To activate the full backend on the VPS,
> remove `output: "export"` from [`next.config.ts`](next.config.ts) so Next.js
> runs as a Node server (required for API routes, auth and the database).

## 📧 Contact

- **Email:** oasm.contact.me@gmail.com
- **Phone:** +212679122507
- **Instagram:** [@oams.01](https://www.instagram.com/oams.01)

## 📄 License

This website and its source code are the property of OAMS. Use is granted exclusively to the owner of OAMS. OAMS bears no responsibility for the code once it is obtained by others. See the [LICENSE](LICENSE) file for details.
