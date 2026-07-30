# PDFNest

## Project Overview

PDFNest is a modern, fast, browser-based PDF toolkit built with Next.js and TypeScript.

The goal is to provide users with a premium experience for editing and converting PDF files without uploading documents to a server whenever possible.

The long-term vision is to become a complete PDF platform similar to Smallpdf or iLovePDF while maintaining excellent performance, modern UI, and strong SEO.

---

# Tech Stack

Framework
- Next.js 16 (App Router)

Language
- TypeScript

Styling
- Tailwind CSS v4

Icons
- Lucide React

Notifications
- Sonner

PDF Processing
- pdf-lib

File Upload
- react-dropzone

Drag & Drop
- @dnd-kit

File Download
- file-saver

Version Control
- Git
- GitHub

---

# Current Features

✅ Homepage

✅ Responsive Header

✅ Hero Section

✅ PDF Upload

✅ Drag & Drop Upload

✅ Multiple PDF Selection

✅ Remove Individual Files

✅ Clear All Files

✅ Merge PDF

✅ Toast Notifications

---

# Planned Features

## PDF Tools

- Split PDF
- Compress PDF
- Rotate PDF
- Extract Pages
- Delete Pages
- Reorder Pages
- PDF to Word
- Word to PDF
- PDF to JPG
- JPG to PDF
- OCR
- Watermark PDF
- Protect PDF
- Unlock PDF

---

# Future Features

- User Authentication
- Dashboard
- Recent Files
- Premium Subscription
- Usage Analytics
- Admin Panel
- Blog
- SEO Pages

---

# Folder Structure

src/

app/
- Next.js App Router

components/
- home/
- layout/
- providers/
- ui/

lib/
- PDF utilities
- helper functions

public/
- static assets

---

# Coding Standards

- Use TypeScript everywhere.
- Avoid using "any".
- Keep components reusable.
- Keep components small and focused.
- Do not duplicate code.
- Create helper functions inside lib/.
- Prefer composition over large components.
- Keep business logic out of UI components.

---

# UI Guidelines

Design style:

- Premium
- Clean
- Minimal
- Fast
- Responsive
- Accessible

Theme:

- White
- Blue
- Soft Gray

Future:

- Dark Mode

---

# Naming Convention

Components

PascalCase

Example

UploadBox.tsx

Hero.tsx

Button.tsx

Functions

camelCase

Example

mergePdf()

removeFile()

handleUpload()

Variables

camelCase

Constants

UPPER_CASE

---

# Git Workflow

Create feature branches.

Example

feature/split-pdf

feature/compress-pdf

feature/pdf-preview

Commit frequently.

Use meaningful commit messages.

Merge into main only after testing.

---

# AI Development Rules

Before making any code changes:

1. Understand the existing code.

2. Reuse existing components.

3. Do not duplicate code.

4. Do not change unrelated files.

5. Keep TypeScript strict.

6. Preserve current UI unless requested.

7. Explain implementation before coding.

8. Only edit files required for the task.

9. Keep code readable.

10. Prefer reusable solutions.

---

# Performance Goals

- Fast initial load
- Lazy loading where appropriate
- Client-side PDF processing
- Minimal dependencies
- Small bundle size

---

# Roadmap

Phase 1
✔ Merge PDF

Phase 2
Split PDF

Phase 3
Compress PDF

Phase 4
Rotate PDF

Phase 5
Extract Pages

Phase 6
Delete Pages

Phase 7
Reorder Pages

Phase 8
PDF Conversion

Phase 9
Authentication

Phase 10
Dashboard

Phase 11
Premium Features

Phase 12
Production Launch