<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# AI Agent Instructions

This repository is developed with AI assistance.

Every AI assistant working on this project must follow these rules.

---

# Primary Goal

Help build a production-quality PDF toolkit.

Never sacrifice code quality for speed.

---

# General Rules

Before making any changes:

- Read PROJECT.md.
- Understand the existing architecture.
- Reuse existing code whenever possible.
- Never duplicate components.
- Never create unnecessary files.
- Keep changes focused on the requested task.

---

# Coding Standards

Use:

- TypeScript
- Strict typing
- Functional React components
- Next.js App Router
- Tailwind CSS

Avoid:

- any
- duplicated logic
- inline styles
- dead code
- unnecessary dependencies

---

# Component Rules

Components should:

- Have a single responsibility.
- Stay small and reusable.
- Receive typed props.
- Avoid large amounts of business logic.

Business logic belongs inside:

src/lib/

or reusable hooks.

---

# UI Rules

Maintain a consistent design.

Current style:

- modern
- premium
- minimal
- responsive

Do not redesign the interface unless explicitly requested.

---

# Existing Components

Reuse these whenever possible:

- Button
- UploadBox
- SortableFileItem
- Header
- Hero

Never recreate them under different names.

---

# PDF Processing

Use:

- pdf-lib

Do not introduce another PDF library unless there is a clear technical reason.

---

# File Upload

Use:

- react-dropzone

Maintain drag-and-drop behavior.

---

# Drag and Drop

Use:

- @dnd-kit

Keep drag-and-drop accessible and stable.

Use stable IDs instead of array indexes.

---

# Notifications

Use:

- sonner

Do not replace the notification system.

---

# Styling

Use Tailwind CSS.

Avoid custom CSS files unless absolutely necessary.

---

# Performance

Prefer:

- reusable utilities
- memoization where beneficial
- minimal re-renders
- small components

Avoid unnecessary complexity.

---

# Git

Do not modify unrelated files.

Keep changes small.

One feature per commit.

---

# When implementing a feature

Always:

1. Explain the implementation plan.
2. Identify affected files.
3. Reuse existing components.
4. Preserve existing functionality.
5. Test mentally for TypeScript issues.
6. Keep imports organized.

---

# When fixing bugs

Do not rewrite large files unless necessary.

Fix the root cause.

Explain why the bug occurred.

---

# When creating new files

Only create a file if:

- responsibility is clearly separated
- reuse is expected
- architecture benefits

---

# Documentation

Update PROJECT.md if:

- a major feature is completed
- architecture changes
- a new dependency is introduced

---

# Goal

Build software that is:

- scalable
- maintainable
- readable
- production-ready