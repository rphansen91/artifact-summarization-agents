# Design System

## Overview

Artifact Engine's design system is built on Tailwind CSS with carefully selected colors and typography.

## Quick Reference

| Token | Value |
|-------|-------|
| Primary Color | `emerald` |
| Secondary Color | `amber` |
| Neutral Color | `zinc` |
| Heading Font | Space Grotesk |
| Body Font | Inter |
| Mono Font | JetBrains Mono |

## Files

- **tokens.css** - CSS custom properties and Google Fonts import
- **tailwind-colors.md** - Color usage guide with examples
- **fonts.md** - Typography setup and usage guide

## Getting Started

1. Import the fonts in your HTML or CSS (see `fonts.md`)
2. Use Tailwind's built-in color classes (`emerald-*`, `amber-*`, `zinc-*`)
3. Apply font families using custom properties or Tailwind classes

## Design Principles

- **Minimalist**: Clean interfaces with generous whitespace
- **Consistent**: Same patterns across all sections
- **Accessible**: High contrast, keyboard navigable, screen reader friendly
- **Responsive**: Mobile-first with proper breakpoints
- **Dark Mode**: Full support via Tailwind's `dark:` prefix
