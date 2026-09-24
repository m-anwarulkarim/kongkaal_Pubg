---
trigger: always_on
---

# Project Design & Architecture Guidelines

## 1. UI Component Standard: Shadcn UI

- **Mandatory Usage**: All UI elements (buttons, inputs, cards, dialogs/modals, badges, tabs, accordions, dropdowns, forms) MUST use Shadcn UI components located in `src/components/ui/`.
- **New Components**: If a required Shadcn component is not yet in `src/components/ui/`, install it via `npx shadcn add <component-name>` or create it adhering to the Radix / Base UI + Tailwind CSS structure in `src/components/ui/`.
- **Custom Styling**: Extend Shadcn UI components using `cn()` utility from `@/lib/utils` or `src/lib/utils.ts`.
