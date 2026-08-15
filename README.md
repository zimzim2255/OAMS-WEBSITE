# OAMS - Streetwear Brand

Custom streetwear brand creating unique looks since 2018. Hand-operated by our artisans.

## 🚀 Live Demo

The website is deployed on GitHub Pages: [https://zimzim2255.github.io/OAMS-WEBSITE/](https://zimzim2255.github.io/OAMS-WEBSITE/)

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** GSAP
- **Deployment:** GitHub Pages (static export)

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

## 📧 Contact

- **Email:** oasm.contact.me@gmail.com
- **Phone:** +212679122507
- **Instagram:** [@oams.01](https://www.instagram.com/oams.01)

## 📄 License

This website and its source code are the property of OAMS. Use is granted exclusively to the owner of OAMS. OAMS bears no responsibility for the code once it is obtained by others. See the [LICENSE](LICENSE) file for details.
