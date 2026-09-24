# Project Rules & Architecture

1. **Framework**: TanStack Start + React + Vite + Tailwind CSS v4.
2. **UI Library**: Always use **Shadcn UI** components (`src/components/ui/*`).
3. **Folder Architecture**:
   - `src/components/ui/` -> Shadcn UI primitives
   - `src/features/matches/` -> Tournament matches & slot booking
   - `src/features/store/` -> E-commerce products (UC, skins, pass, items)
   - `src/features/checkout/` -> bKash/Nagad/Rocket payment processing
   - `src/types/` -> Data interfaces & domain models
   - `src/lib/` -> Utilities & helpers
4. **Cloudflare Deployment**: Configured for Cloudflare Pages / Workers deployment using `@tanstack/start` nitro/cloudflare adapter.
