# Project Design & Architecture Guidelines

## 1. UI Component Standard: Shadcn UI
- **Mandatory Usage**: All UI elements (buttons, inputs, cards, dialogs/modals, badges, tabs, accordions, dropdowns, forms) MUST use Shadcn UI components located in `src/components/ui/`.
- **New Components**: If a required Shadcn component is not yet in `src/components/ui/`, install it via `npx shadcn add <component-name>` or create it adhering to the Radix / Base UI + Tailwind CSS structure in `src/components/ui/`.
- **Custom Styling**: Extend Shadcn UI components using `cn()` utility from `@/lib/utils` or `src/lib/utils.ts`.

## 2. Modular Architecture (E-Commerce Scalable)
To support scaling into a full E-Commerce & Gaming platform, code must be strictly organized by domain modules:
- `src/components/ui/`: Primitive Shadcn UI atomic components.
- `src/features/matches/`: Match selection, tournament tickets, slot booking components & state.
- `src/features/store/`: Future e-commerce gaming products, UC top-up, merchandise, cart & checkout.
- `src/features/checkout/`: Payment gateway handlers (bKash, Nagad, Rocket) & order verification.
- `src/lib/`: Common utilities (`utils.ts`), formatters, and API clients.
- `src/types/`: Shared TypeScript data models (`match.ts`, `order.ts`, `user.ts`).

## 3. Code Cleanliness Standards
- **Strict Typing**: No `any` types. All domain models must be typed in `src/types/`.
- **Reusable Hooks & Services**: Decouple UI presentation from business logic and payment state.
