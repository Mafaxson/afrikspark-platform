# Blog System - Design & UI Reference

## Color Scheme

### Primary Colors
- **Primary Blue**: `#2563eb` (hover effects, highlights)
- **Dark Gray**: `#111827` (main text)
- **Medium Gray**: `#6b7280` (secondary text)
- **Light Gray**: `#e5e7eb` (borders, dividers)
- **White**: `#ffffff` (backgrounds)

### Semantic Colors
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Error**: `#ef4444`
- **Info**: `#3b82f6`

---

## Typography

### Headlines
- **Blog Title (H1)**: 48-56px, bold (600-700), tracking-tight
- **Post Header (H1)**: 48-64px, bold, leading-tight
- **Subsection (H3)**: 18-20px, semibold

### Body Text
- **Main Content**: 16px, regular (400), line-height 1.6
- **Secondary Text**: 14px, regular, gray-600
- **Metadata**: 12-14px, medium, gray-500

---

## Spacing System

```
Base unit: 4px (Tailwind default)

Common spacing:
- p-2: 8px (buttons, inputs)
- p-4: 16px (card padding)
- p-5: 20px (default card)
- p-6: 24px (large sections)
- p-8: 32px (header sections)

Margins:
- mb-2: 8px
- mb-4: 16px
- my-6: 24px vertical
- my-8: 32px vertical
- my-10: 40px vertical
- my-12: 48px vertical
```

---

## Component Sizes

### Blog Cards
```
Desktop (lg): 352px width (1/3 grid)
Tablet (md): 100% width (1/2 grid)
Mobile (sm): 100% width (1/1 grid)

Image height: 208px (h-52)
Card height: responsive, min-content
Gap: gap-8
```

### Blog Post Layout
```
Max width: 896px (max-w-4xl)
Padding: 16px (sm) to 32px (lg)
Feature image height: 288-512px
Video aspect ratio: 16:9 (aspect-video)
```

### Images
```
Blog card thumbnails: 352x208px
Feature image: full width, max 512px height
YouTube thumbnail: 320x180px (hqdefault)
Social share icons: 16-24px
```

---

## Card Design System

### Blog Card Structure
```
┌─────────────────────────┐
│   Image + Badge         │  h-52
├─────────────────────────┤
│ Tags (optional)         │  my-2
├─────────────────────────┤
│ Title (line-clamp-2)    │  font-bold
├─────────────────────────┤
│ Excerpt (line-clamp-2)  │  text-sm
├─────────────────────────┤
│ Meta: Date | Read Time  │  pt-3, border-t
└─────────────────────────┘

Total padding: p-5 (20px)
Border radius: rounded-xl
Box shadow: shadow-sm (hover: shadow-lg)
Transition: hover:-translate-y-2
```

### Blog Header Structure
```
┌────────────────────────────────┐
│ Back Link                       │
├────────────────────────────────┤
│ Title (H1)                      │
│ Metadata (Author, Date, Time)   │
├────────────────────────────────┤
│ Excerpt (styled blockquote)     │  border-l-4
└────────────────────────────────┘

Feature image: full width below
Video embed: 16:9 aspect ratio
```

---

## Interactive States

### Button States
```
Default:
  bg-white
  border-gray-300
  text-gray-900

Hover:
  bg-gray-50
  border-gray-400

Active:
  bg-gray-100

Disabled:
  opacity-50
  cursor-not-allowed
```

### Link States
```
Default:
  color: #6b7280
  hover:color: #111827

Title Link:
  Default: #111827
  Hover: #2563eb (blue)
  Transition: group-hover:text-blue-600
```

### Badge States
```
Tagline (secondary):
  bg-gray-100
  text-gray-800
  rounded-full

Focus Area:
  bg-blue-100
  text-blue-800
  hover:bg-blue-200

Tag (outline):
  border: 1px gray-200
  text-gray-700
  hover:bg-gray-100
```

---

## Animations & Transitions

### Card Hover Effects
```css
transition-all duration-300

Effects:
- Translation: -translate-y-2 (up 8px)
- Scale: group-hover:scale-110 (images only)
- Shadow: shadow-sm → shadow-lg
- Color: text-gray-900 → text-blue-600
```

### Skeleton Loading
```css
animate-pulse
bg-gray-200 (placeholder color)
rounded-xl (matches cards)

Layout:
- 6 cards (3x2 grid)
- Same dimensions as real cards
- Same spacing as grid
```

### Fade & Scroll Effects
```css
opacity transitions: 150-300ms
Scale transitions: 300-500ms
All transitions: ease-in-out
```

---

## Responsive Breakpoints

```
Mobile (default):
  grid cols: grid-cols-1
  padding: px-4
  gap: gap-6

Tablet (md: 768px):
  grid cols: grid-cols-2
  padding: px-6
  gap: gap-8

Desktop (lg: 1024px):
  grid cols: grid-cols-3
  padding: px-8
  gap: gap-8

Large (xl: 1280px):
  max-width: max-w-7xl
  container centering
```

---

## Focus & Accessibility

### Focus States
```
Input focus:
  outline: 2px solid #2563eb
  outline-offset: 2px

Button focus:
  ring: ring-2 ring-blue-500
  ring-offset: 2px
```

### Contrast Requirements
- Text on white: WCAG AA (4.5:1 minimum)
- Heading on white: WCAG AAA (7:1)
- Badge text: high contrast maintained

### Hover Targets
- Minimum 44x44px touch target (buttons, links)
- Clear focus indicators
- Color not sole indicator of state

---

## Icon Usage

### Icon Sizing
- Metadata icons: h-3 w-3 to h-4 w-4 (12-16px)
- Button icons: h-4 w-4 to h-5 w-5 (16-20px)
- Hero icons: h-6 w-6 (24px)

### Icon Placement
- Left of text: gap-2
- Standalone: centered
- Lists: left margin, h-3 w-3

---

## Typography Hierarchy

```
Page Title (H1):
  font-size: 3rem (48px)
  font-weight: bold (700)
  line-height: tight
  letter-spacing: tight

Blog Title (H1):
  font-size: 3.75rem (60px)
  font-weight: bold (700)
  line-height: tight

Card Title (H2):
  font-size: 1.125rem (18px)
  font-weight: bold (700)
  line-height: snug

Section Title (H3):
  font-size: 1.125rem (18px)
  font-weight: semibold (600)

Body (p):
  font-size: 1rem (16px)
  font-weight: regular (400)
  line-height: relaxed (1.6)

Metadata (small):
  font-size: 0.875rem (14px)
  font-weight: medium (500)
  color: gray-600
```

---

## Layout Patterns

### Blog List Page
```
Header Section (centered):
  Title + Subtitle

Search Box (centered):
  max-w-2xl width

Blog Grid:
  3 columns (lg)
  2 columns (md)
  1 column (sm)

Load More Button (centered):
  mt-12 spacing
```

### Blog Post Page
```
Back Navigation Link:
  mb-8 spacing

Header Content:
  <BlogDetailHeader />
  Includes title, meta, excerpt

Main Content:
  max-w-4xl container
  centered on page

Sections in order:
  1. Back link + header
  2. Video embed (if exists)
  3. Key focus areas (if exists)
  4. Content (formatted)
  5. Tags (if exists)
  6. Share section
  7. Back to blog button
```

---

## Visual Feedback

### Loading States
- Skeleton cards with pulse animation
- Spinner in center for page loads
- Smooth fade transitions

### Error States
- Card with border-red-200 and bg-red-50
- Clear error message text
- Retry button if applicable

### Empty States
- Centered message
- Icon or illustration
- Clear call-to-action

---

## Print Styles

Recommended print media queries:
```css
@media print {
  .print-hide { display: none; }
  
  h1 { page-break-after: avoid; }
  p { orphans: 3; widows: 3; }
  
  a::after { content: " (" attr(href) ")"; }
}
```

---

## Accessibility Checklist

- [x] Color contrast meets WCAG AA
- [x] Focus indicators visible
- [x] Button minimum size 44x44px
- [x] Alt text on images
- [x] Semantic HTML structure
- [x] ARIA labels where needed
- [x] Keyboard navigation support
- [x] Form labels associated
- [x] Skip navigation available
- [x] Time-based animations cancellable

