# Tailwind Color Usage

## Color Palette

Artifact Engine uses three Tailwind color palettes:

| Role | Tailwind Color | Usage |
|------|----------------|-------|
| **Primary** | `emerald` | Primary actions, active states, success indicators |
| **Secondary** | `amber` | Warnings, highlights, secondary actions |
| **Neutral** | `zinc` | Text, backgrounds, borders, inactive states |

## Primary Colors (Emerald)

Use for primary interactive elements and brand accents.

```html
<!-- Buttons -->
<button class="bg-emerald-500 hover:bg-emerald-600 text-white">
  Primary Action
</button>

<!-- Active/Selected States -->
<div class="border-emerald-500 bg-emerald-50 dark:bg-emerald-950">
  Selected item
</div>

<!-- Success States -->
<span class="text-emerald-600 dark:text-emerald-400">
  Completed
</span>

<!-- Links -->
<a class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
  Link text
</a>
```

## Secondary Colors (Amber)

Use for warnings, generating states, and secondary highlights.

```html
<!-- Warnings -->
<div class="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
  Warning message
</div>

<!-- Generating/Processing States -->
<span class="text-amber-600 dark:text-amber-400">
  <span class="animate-pulse">Generating...</span>
</span>

<!-- Secondary Badges -->
<span class="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
  In Progress
</span>
```

## Neutral Colors (Zinc)

Use for text, backgrounds, borders, and structural elements.

```html
<!-- Text Hierarchy -->
<h1 class="text-zinc-900 dark:text-zinc-100">Heading</h1>
<p class="text-zinc-600 dark:text-zinc-400">Body text</p>
<span class="text-zinc-400 dark:text-zinc-500">Secondary text</span>

<!-- Backgrounds -->
<div class="bg-white dark:bg-zinc-950">Page background</div>
<div class="bg-zinc-50 dark:bg-zinc-900">Card background</div>
<div class="bg-zinc-100 dark:bg-zinc-800">Sidebar background</div>

<!-- Borders -->
<div class="border border-zinc-200 dark:border-zinc-800">
  Bordered element
</div>

<!-- Hover States -->
<button class="hover:bg-zinc-100 dark:hover:bg-zinc-800">
  Subtle hover
</button>
```

## Dark Mode

Always include dark mode variants using Tailwind's `dark:` prefix:

```html
<!-- Good: Includes dark mode -->
<div class="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
  Content
</div>

<!-- Bad: Missing dark mode -->
<div class="bg-white text-zinc-900">
  Content (won't work in dark mode)
</div>
```

## Common Patterns

### Cards

```html
<div class="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
  Card content
</div>
```

### Status Badges

```html
<!-- Success/Complete -->
<span class="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-medium">
  Summarized
</span>

<!-- Warning/In Progress -->
<span class="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-medium">
  Generating
</span>

<!-- Neutral/Pending -->
<span class="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full text-xs font-medium">
  Pending
</span>
```

### Interactive Elements

```html
<!-- Primary Button -->
<button class="bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors">
  Submit
</button>

<!-- Secondary Button -->
<button class="border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors">
  Cancel
</button>
```
