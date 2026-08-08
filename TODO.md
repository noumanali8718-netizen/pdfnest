# PDFNest Homepage Premium Redesign — Task List

## Setup
- [x] Install `framer-motion`
- [x] Update design tokens / shared UI classes in `src/lib/uiClasses.ts`

## Reusable UI Components
- [x] Upgrade `src/components/ui/Button.tsx` (primary/secondary hover lift, shadow, ripple)
- [x] Upgrade `src/components/ui/SectionHeading.tsx` (40px titles, eyebrow support)
- [x] Create `src/components/ui/Reveal.tsx` (scroll-reveal animation wrapper)

## Homepage Sections
- [x] Redesign `src/components/home/Hero.tsx` (headline, big UploadBox, trust badges, floating mockup)
- [x] Create `src/components/home/SocialProof.tsx` (4 animated stat cards)
- [x] Redesign `src/components/home/ToolsGrid.tsx` (premium cards + Open Tool button)
- [x] Refactor `src/components/home/WhyChoose.tsx` (4 premium cards)
- [x] Refactor `src/components/home/HowToMerge.tsx` → generic "How It Works" (Upload → Process → Download + arrows)
- [x] Polish `src/components/home/FAQ.tsx` (accordion spacing/animation)

## Layout
- [x] Upgrade `src/components/layout/Header.tsx` (sticky, centered nav, Start Free CTA)
- [x] Upgrade `src/components/layout/Footer.tsx` (professional SaaS footer)

## Page Assembly
- [x] Reassemble `src/app/page.tsx` with new section order

## Verification
- [x] Run `npx tsc --noEmit` (no TypeScript errors)
- [x] Run eslint (no lint errors)
- [x] Report any issues
