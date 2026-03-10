# EasyRent Color System Guide

## Overview
All colors for the EasyRent platform are now centralized in `/src/styles/theme.css` as CSS custom properties (variables). This ensures consistency and makes it easy to update the brand colors globally.

## Color Palette

### Brand Colors (Teal Theme)
- **Primary Teal**: `#0891B2` - Main brand color for buttons, links, primary actions
- **Dark Teal**: `#0E7490` - Hover states for teal elements  
- **Light Teal**: `#CFFAFE` - Subtle backgrounds and highlights

### Accent Colors (Blue Theme)
- **Accent Blue**: `#2563EB` - Badges, success states, availability indicators
- **Dark Blue**: `#1D4ED8` - Hover states for blue elements
- **Light Blue**: `#DBEAFE` - Subtle blue backgrounds

### Neutral Colors
- **Black**: `#1A1A1A` - Primary text and headings
- **Gray**: `#6B6B6B` - Secondary text and labels
- **Light Gray**: `#F7F7F9` - Backgrounds and cards
- **White**: `#FFFFFF` - Pure white backgrounds
- **Border**: `rgba(0, 0, 0, 0.08)` - Default borders
- **Border Hover**: `rgba(0, 0, 0, 0.16)` - Hover state borders

### Functional Colors
- **Success**: `#2563EB` - Success states
- **Error**: `#DC2626` - Error states
- **Warning**: `#F59E0B` - Warning states

## Usage Methods

### Method 1: Using Custom Tailwind Classes (Recommended)
The easiest way to use our color system with custom Tailwind utilities defined in `/src/styles/tailwind.css`:

```tsx
// Teal brand colors
<button className="bg-brand-primary hover:bg-brand-primary-dark text-white">
  Click Me
</button>

// Blue accent colors
<div className="bg-accent-blue text-white">
  Verified Badge
</div>

// Neutral colors
<div className="bg-neutral-light-gray text-neutral-black border-neutral">
  Card Content
</div>

// Text colors
<h1 className="text-brand-primary">Heading</h1>
<p className="text-neutral-gray">Description</p>

// Gradient backgrounds
<section className="bg-gradient-to-br from-brand-primary to-brand-primary-dark">
  Hero Section
</section>
```

### Method 2: Using CSS Variables Directly
For more complex styling or when you need precise control:

```tsx
// Inline styles with CSS variables
<div style={{ backgroundColor: 'var(--brand-primary)' }}>
  Custom Element
</div>

// In Tailwind arbitrary values
<button className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)]">
  Button
</button>
```

### Method 3: Using Hardcoded Hex Values (Not Recommended)
While this works, it's not recommended because changes won't propagate automatically:

```tsx
// ❌ Avoid this - hardcoded colors
<button className="bg-[#0891B2] hover:bg-[#0E7490]">
  Button
</button>

// ✅ Use this instead
<button className="bg-brand-primary hover:bg-brand-primary-dark">
  Button
</button>
```

## Available Tailwind Utility Classes

### Background Colors
- `bg-brand-primary` - Teal background
- `bg-brand-primary-dark` - Dark teal background
- `bg-brand-primary-light` - Light teal background
- `bg-accent-blue` - Blue background
- `bg-accent-blue-dark` - Dark blue background
- `bg-accent-blue-light` - Light blue background
- `bg-neutral-black` - Black background
- `bg-neutral-gray` - Gray background
- `bg-neutral-light-gray` - Light gray background
- `bg-neutral-white` - White background

### Text Colors
- `text-brand-primary` - Teal text
- `text-brand-primary-dark` - Dark teal text
- `text-accent-blue` - Blue text
- `text-neutral-black` - Black text
- `text-neutral-gray` - Gray text

### Border Colors
- `border-brand-primary` - Teal border
- `border-accent-blue` - Blue border
- `border-neutral` - Default neutral border

### Hover States
- `hover:bg-brand-primary` - Hover to teal
- `hover:bg-brand-primary-dark` - Hover to dark teal
- `hover:text-brand-primary` - Hover text to teal
- `hover:border-neutral-hover` - Hover border color

## Common Patterns

### Primary Button
```tsx
<button className="bg-brand-primary hover:bg-brand-primary-dark text-white px-[32px] py-[16px] font-bold transition-colors">
  Primary Action
</button>
```

### Link
```tsx
<Link to="/" className="text-brand-primary hover:underline font-semibold">
  EasyRent
</Link>
```

### Success Badge
```tsx
<div className="bg-accent-blue text-white px-[12px] py-[4px]">
  <span className="text-[12px] font-bold uppercase">Verified</span>
</div>
```

### Card with Border
```tsx
<div className="bg-neutral-white border border-neutral p-[24px]">
  Card Content
</div>
```

### Availability Indicator
```tsx
<div className="flex items-center gap-[6px]">
  <div className="w-[6px] h-[6px] rounded-full bg-accent-blue" />
  <span className="text-neutral-black">Available now</span>
</div>
```

## CSS Variable Reference

All variables are defined in `/src/styles/theme.css`:

```css
:root {
  /* Brand Colors */
  --brand-primary: #0891B2;
  --brand-primary-dark: #0E7490;
  --brand-primary-light: #CFFAFE;
  
  /* Accent Colors */
  --accent-blue: #2563EB;
  --accent-blue-dark: #1D4ED8;
  --accent-blue-light: #DBEAFE;
  
  /* Neutral Colors */
  --neutral-black: #1A1A1A;
  --neutral-gray: #6B6B6B;
  --neutral-light-gray: #F7F7F9;
  --neutral-border: rgba(0, 0, 0, 0.08);
  --neutral-border-hover: rgba(0, 0, 0, 0.16);
  --neutral-white: #FFFFFF;
}
```

## Migration Guide

To migrate existing hardcoded colors to the centralized system:

1. **Find all orange colors** (`#FF4B27`, `#E63E1C`, `#FFBBAE`)
   - Replace with teal: `bg-brand-primary`, `hover:bg-brand-primary-dark`, `bg-brand-primary-light`

2. **Find all green colors** (`#008A52`, `#00D084`, etc.)
   - Replace with blue: `bg-accent-blue`, `text-accent-blue`

3. **Find hardcoded teal/blue**
   - `#0891B2` → `bg-brand-primary` or `text-brand-primary`
   - `#0E7490` → `hover:bg-brand-primary-dark`
   - `#CFFAFE` → `bg-brand-primary-light`
   - `#2563EB` → `bg-accent-blue` or `text-accent-blue`

4. **Update hover states**
   - `hover:bg-[#0E7490]` → `hover:bg-brand-primary-dark`
   - `hover:bg-[#0891B2]` → `hover:bg-brand-primary`

## Benefits

✅ **Single source of truth** - All colors defined in one place
✅ **Easy updates** - Change one variable to update the entire site
✅ **Consistency** - No color variations or typos
✅ **Better maintainability** - Semantic naming makes code self-documenting
✅ **Theme support** - Easy to add dark mode or alternative themes
✅ **Better DX** - Use descriptive class names instead of hex codes

## Next Steps

To fully migrate the codebase:
1. Search for all hardcoded hex values: `#0891B2`, `#2563EB`, `#FF4B27`, etc.
2. Replace with appropriate utility classes or CSS variables
3. Test all pages to ensure colors are consistent
4. Remove any remaining hardcoded colors