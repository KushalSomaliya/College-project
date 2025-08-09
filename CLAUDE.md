# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.4.6 application using TypeScript and Tailwind CSS v4. The project uses the App Router pattern and is currently in early development stage.

## Common Development Commands

```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture and Structure

### Tech Stack
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript 5 with strict mode
- **Styling**: Tailwind CSS v4 (using @tailwindcss/postcss)
- **UI**: React 19.1.0

### Directory Structure
- `/app/` - Next.js App Router pages and layouts
  - `/(auth)/` - Authentication pages (sign-in, sign-up) with auth layout
  - `/(main)/` - Main app pages (dashboard, gigs, etc.) with navigation layout
- `/public/` - Static assets
- `@/*` - Path alias configured for imports from root

### Styling Approach
The project uses Tailwind CSS v4 with CSS custom properties for theming:
- `--background` and `--foreground` CSS variables define the color scheme
- Dark mode support via `prefers-color-scheme` media query
- Global styles are defined in `app/globals.css`

### Important Development Notes
1. When creating new components or pages, follow the Next.js App Router conventions
2. TypeScript strict mode is enabled - ensure proper type safety
3. Use the `@/` import alias for absolute imports
4. Tailwind classes should be used for styling; the theme is configured inline in globals.css