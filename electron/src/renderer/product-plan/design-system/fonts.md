# Typography

## Font Families

Artifact Engine uses three Google Fonts:

| Role | Font | Usage |
|------|------|-------|
| **Heading** | Space Grotesk | Headings, titles, labels |
| **Body** | Inter | Body text, paragraphs, UI text |
| **Mono** | JetBrains Mono | Code, file paths, technical values |

## Installation

### Google Fonts CDN

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### CSS Import

Or import in your CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
```

## Tailwind Configuration

If using Tailwind CSS v4, add to your CSS file:

```css
@theme {
  --font-heading: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

Then use in your HTML:

```html
<h1 class="font-heading">Welcome to Artifact Engine</h1>
<p class="font-body">Browse and review your captured work.</p>
<code class="font-mono">/artifacts/2024/week-47/</code>
```

## Font Weights

### Space Grotesk (Headings)

| Weight | Class | Usage |
|--------|-------|-------|
| 400 | `font-normal` | Large display text |
| 500 | `font-medium` | Subheadings |
| 600 | `font-semibold` | Section headings |
| 700 | `font-bold` | Page titles |

### Inter (Body)

| Weight | Class | Usage |
|--------|-------|-------|
| 400 | `font-normal` | Body text |
| 500 | `font-medium` | Labels, buttons |
| 600 | `font-semibold` | Emphasis |

### JetBrains Mono (Code)

| Weight | Class | Usage |
|--------|-------|-------|
| 400 | `font-normal` | Code blocks |
| 500 | `font-medium` | Highlighted code |

## Typography Scale

Use Tailwind's built-in text size classes:

```html
<!-- Page Title -->
<h1 class="font-heading text-3xl font-bold tracking-tight">
  Week 47
</h1>

<!-- Section Heading -->
<h2 class="font-heading text-xl font-semibold">
  Highlights
</h2>

<!-- Subheading -->
<h3 class="font-heading text-lg font-medium">
  Recent Commits
</h3>

<!-- Body -->
<p class="font-body text-base text-zinc-600 dark:text-zinc-400">
  You worked on 23 artifacts this week.
</p>

<!-- Small/Caption -->
<span class="font-body text-sm text-zinc-500">
  Last updated 2 days ago
</span>

<!-- Code/Technical -->
<code class="font-mono text-sm">
  /2024/week-47/commits/
</code>
```

## Common Patterns

### Page Header

```html
<header class="mb-6">
  <h1 class="font-heading text-2xl font-bold text-zinc-900 dark:text-zinc-100">
    Browse Artifacts
  </h1>
  <p class="mt-1 font-body text-zinc-500 dark:text-zinc-400">
    Navigate your captured work by time period.
  </p>
</header>
```

### Card Header

```html
<div class="p-4">
  <h3 class="font-heading text-lg font-semibold text-zinc-900 dark:text-zinc-100">
    Week 47
  </h3>
  <p class="font-body text-sm text-zinc-500 dark:text-zinc-400">
    Nov 18 - Nov 24, 2024
  </p>
</div>
```

### Stats Display

```html
<div class="flex items-baseline gap-1">
  <span class="font-mono text-lg text-zinc-800 dark:text-zinc-200">23</span>
  <span class="font-body text-sm text-zinc-500">commits</span>
</div>
```
