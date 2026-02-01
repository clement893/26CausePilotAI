# Changelog

All notable changes to this template will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added / Changed

- **Alignement design system dark (2026-02-01)** : Remplacement des classes Tailwind génériques (`text-foreground`, `bg-background`, `border-border`, `bg-muted`, `text-muted-foreground`) par des valeurs explicites (`text-white`, `bg-[#13131A]`, `border-gray-800`, `bg-[#1C1C26]`, `text-gray-400`) dans tout `apps/web/src`. Phases 1-3 (composants UI, layout, features) complétées. Détails dans `PROGRESSION_BATCHES.md` et `PLAN_SUITE.md`.

### Template Features

This is a production-ready full-stack template with the following features:

- **Next.js 16** with App Router and React Server Components
- **React 19** - Latest React features
- **TypeScript** - Full type safety
- **FastAPI** - Modern Python backend
- **PostgreSQL** - Robust database
- **Redis** - Caching and queues
- **270+ Components** - Complete UI library
- **Advanced Theme System** - Comprehensive theming
- **Dark Mode** - Built-in theme support
- **Performance Optimized** - Core Web Vitals optimized
- **Accessible** - WCAG AA compliant
- **Mobile Responsive** - Optimized for all devices

### Getting Started

See [GETTING_STARTED.md](./GETTING_STARTED.md) for setup instructions.

### Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Quick Start Guide](./docs/QUICK_START.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- And much more...

---

## Template Customization

When using this template, customize the following:

1. **Project Name**: Update `package.json`, `README.md`, and all references
2. **Repository URLs**: Update GitHub links in `README.md` and `package.json`
3. **Environment Variables**: Configure `.env` files (see `docs/ENV_VARIABLES.md`)
4. **Branding**: Customize theme, colors, and logo
5. **Features**: Enable/disable features as needed

See [TEMPLATE_CUSTOMIZATION.md](./TEMPLATE_CUSTOMIZATION.md) for detailed customization guide.
