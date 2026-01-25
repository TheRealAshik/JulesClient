# UX & Accessibility Palette

## Layout
- **Dashboard Container**: Use `max-w-3xl mx-auto` for consistent desktop width.
- **Vertical Rhythm**: Use `pt-6 sm:pt-16` for main content top padding.

## Components
- **Buttons**: Icon-only buttons must have `aria-label`. Minimum visual height `h-8`.
- **Inputs**: Avoid conditional font sizes to prevent layout shifts.
- **Lists/Tabs**: Use `gap` and `overflow-auto` instead of negative margin hacks.

## Colors
- **Background**: `#0c0c0c`
- **Surface**: `#161619` or `#121215`
- **Text**: `#E4E4E7` (zinc-200 equivalent)
