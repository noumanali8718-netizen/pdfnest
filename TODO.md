# Phase 5F — PDF to Images Tool

- [x] Create `src/components/pdfToImages/PdfToImagesTool.tsx` (main PDF to Images tool UI + logic)
- [x] Create `src/app/pdf-to-images/page.tsx` (route + metadata)
- [x] Update `src/lib/toolReferences.ts` (add pdfToImages to central registry)
- [x] Update `src/components/home/ToolsGrid.tsx` (PDF to Images → available + Link to `/pdf-to-images`)
- [x] Update `PROJECT.md` (document the new feature)
- [x] Run `npx tsc --noEmit` and fix every TypeScript error until it succeeds
- [x] Run `npm run build` and fix every build error until it succeeds
- [x] Run `npm run lint` and fix every ESLint error until it succeeds
- [x] Verify homepage, Merge PDF, and existing tools still work

# Phase 5H — Protect PDF Tool

- [x] Migrate pdf-lib to @cantoo/pdf-lib (encryption support)
- [x] Create `src/lib/pdf/protectPdf.ts` (AES-128 encryption + permission presets)
- [x] Create `src/components/protectPdf/ProtectPdfTool.tsx` (upload, passwords, permission presets, encryption, download)
- [x] Create `src/app/protect-pdf/page.tsx` (route + metadata)
- [x] Update `src/lib/toolReferences.ts` (add protectPdf to central registry)
- [x] Update `src/components/home/ToolsGrid.tsx` (Protect PDF → available + Link to `/protect-pdf`)
- [x] Update `PROJECT.md` (document the new feature)
- [x] Run `npx tsc --noEmit` and fix every TypeScript error until it succeeds
- [x] Run `npm run build` and fix every build error until it succeeds
- [x] Run `npm run lint` and fix every ESLint error until it succeeds
- [x] Verify homepage, Merge PDF, and existing tools still work

# Phase 5G — Images to PDF Tool

- [x] Create `src/lib/pdf/imagesToPdf.ts` (image loading, page sizing, fit modes, margins, embedding, PDF generation)
- [x] Create `src/components/imagesToPdf/ImagesToPdfTool.tsx` (upload, preview, drag & drop, settings, conversion, download)
- [x] Create `src/app/images-to-pdf/page.tsx` (route + metadata)
- [x] Update `src/lib/toolReferences.ts` (add imagesToPdf to central registry)
- [x] Update `src/components/home/ToolsGrid.tsx` (Images to PDF → available + Link to `/images-to-pdf`)
- [x] Update `PROJECT.md` (document the new feature)
- [x] Run `npx tsc --noEmit` and fix every TypeScript error until it succeeds
- [x] Run `npm run build` and fix every build error until it succeeds
- [x] Run `npm run lint` and fix every ESLint error until it succeeds
- [x] Verify homepage, Merge PDF, and existing tools still work
- [x] Runtime test: single image, 5 images, 20 images, portrait/landscape/mixed, large PNG/JPG, drag reorder, rotation, margins, page sizes, orientation, contain/cover/stretch, download & open PDF

