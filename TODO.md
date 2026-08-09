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

## Verification (homepage)
- [x] Run `npx tsc --noEmit` (no TypeScript errors)
- [x] Run eslint (no lint errors)
- [x] `npx next build` succeeded

---

# Merge PDF Tool — Production-Hardening Audit

## Tasks
- [x] 1. Remove temporary console.log debugging from `RelatedTools.tsx`
- [x] 2. Clean up formatting/indentation in `UploadBox.tsx` (no behavior change)
- [x] 3. Replace fragile `file.name + index` dnd-kit IDs with stable client-side IDs; preserve File objects & merge order
- [x] 4. Add `onDropRejected` for clear non-PDF validation error; preserve react-dropzone behavior
- [x] 5. Keep minimum two-PDF requirement + existing error toast
- [x] 6. Safe merge error handling (no stack traces; no production debug logging)
- [x] 7. Generic message for unreadable/password-protected/corrupted PDFs
- [x] 8. Keep disabled/loading state; prevent duplicate merge submissions
- [x] 9. Preserve download: `merged.pdf`, `application/pdf`, browser-side `saveAs`
- [x] 10. Accessibility: keyboard upload, meaningful remove labels, non-drag reorder (up/down buttons), visible focus
- [x] 11. Mobile responsiveness review (no concrete layout issues requiring changes)
- [x] 12. Memory safety: graceful handling of large/problematic PDFs (no arbitrary size limits)
- [x] 13. No backend/database/API/analytics/external service added

## Verification (merge tool)
- [x] Run `npx tsc --noEmit`
- [x] Run `npm run lint`
- [x] Run `npm run build`
