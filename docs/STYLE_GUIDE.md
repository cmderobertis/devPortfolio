# Style Guide

## Design System

### Material Design 3 Foundation
The portfolio follows Material Design 3 principles with custom enhancements for a modern, accessible experience.

## Color System

### CSS Custom Properties
```css
:root {
  --surface-color: #ffffff;
  --on-surface-color: #1c1b1f;
  --primary-color: #0d6efd;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --background-color: #fafafa;
}

[data-theme="dark"] {
  --surface-color: #1c1b1f;
  --on-surface-color: #e6e1e5;
  --primary-color: #bb86fc;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --background-color: #121212;
}
```

### Color Usage
- **Primary**: `var(--primary-color)` - Used for primary actions, links, and accents
- **Surface**: `var(--surface-color)` - Card backgrounds and elevated surfaces
- **On-Surface**: `var(--on-surface-color)` - Text on surface colors
- **Background**: `var(--background-color)` - Page background
- **Shadow**: `var(--shadow-color)` - Drop shadows and elevation

### Bootstrap Color Integration
- `.bg-primary` - Uses CSS custom property for theme consistency
- `.text-primary` - Themed primary text color
- `.border-primary` - Themed primary border color

## Typography

### Responsive Scale
```css
/* Desktop */
.display-4 { font-size: 3.5rem; font-weight: 600; }
.display-5 { font-size: 3rem; font-weight: 600; }
.lead { font-size: 1.25rem; line-height: 1.6; }

/* Mobile (< 768px) */
.display-4 { font-size: 2.5rem; }
.display-5 { font-size: 2rem; }
.lead { font-size: 1.1rem; }
```

### Font Weights
- **400**: Regular body text
- **500**: Navigation links, badges, buttons
- **600**: Headings, navbar brand

### Letter Spacing
- Large headings: `-0.02em` for better readability

## Component System

### Cards
```css
.card {
  border-radius: 16px;
  border: none;
  background-color: var(--surface-color);
  color: var(--on-surface-color);
  box-shadow: 0 1px 3px var(--shadow-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.6s ease-out;
}

.card:hover {
  box-shadow: 0 4px 8px var(--shadow-color);
  transform: translateY(-2px);
}
```

**Usage Guidelines:**
- Use for content grouping and information hierarchy
- Consistent 1.5rem padding (`card-body`)
- Hover effects for interactive cards
- Avoid nested cards

### Buttons
```css
.btn {
  border-radius: 20px;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px var(--shadow-color);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px var(--shadow-color);
}
```

**Button Sizes:**
- **Regular**: `0.5rem 1.5rem` padding
- **Small**: `0.25rem 1rem` padding (`.btn-sm`)

### Badges
```css
.badge {
  border-radius: 16px;
  font-weight: 500;
  padding: 0.5rem 1rem;
}

.badge.fs-6 {
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
}
```

**Badge Usage:**
- Skills and technologies
- Status indicators
- Categories and tags
- Responsive sizing with `.fs-6`

### Navigation
```css
.navbar-brand {
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-link {
  font-weight: 500;
  border-radius: 8px;
  margin: 0 0.25rem;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(25, 118, 210, 0.1);
  transform: translateY(-1px);
}

.nav-link.active {
  background-color: var(--primary-color);
  color: white;
}
```

## Elevation System

### Shadow Levels
```css
.shadow-sm { box-shadow: 0 1px 3px var(--shadow-color); }
.shadow { box-shadow: 0 4px 6px var(--shadow-color); }
.shadow-lg { box-shadow: 0 10px 25px var(--shadow-color); }
```

**Usage:**
- **sm**: Default cards, buttons at rest
- **Default**: Cards on hover, elevated components
- **lg**: Modals, dropdowns, important overlays

## Spacing System

### Custom Gap Utilities
```css
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 1rem; }
```

### Bootstrap Integration
- Uses Bootstrap 5 spacing scale (0-5)
- Custom gap utilities for flexbox/grid layouts
- Consistent margin/padding patterns

## Border System

### Border Radius
```css
.rounded { border-radius: 12px; }
.card { border-radius: 16px; }
.btn { border-radius: 20px; }
.badge { border-radius: 16px; }
.nav-link { border-radius: 8px; }
```

### Custom Border Utilities
```css
.border-start { border-left: 4px solid; }
.border-4 { border-width: 4px; }
```

## Animation System

### Transitions
```css
* {
  transition: background-color 0.3s ease, 
              color 0.3s ease, 
              border-color 0.3s ease;
}
```

### Custom Animations
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card { animation: slideUp 0.6s ease-out; }
```

### Easing Functions
- **Default**: `ease` for most transitions
- **Material**: `cubic-bezier(0.4, 0, 0.2, 1)` for material-like motion
- **Duration**: 0.3s for most interactions

## Accessibility

### Focus States
```css
.btn:focus,
.nav-link:focus,
a:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
```

### Color Contrast
- Light theme: High contrast ratios (4.5:1 minimum)
- Dark theme: Adjusted colors for readability
- Primary colors tested for accessibility

### Responsive Design
- Mobile-first approach
- Breakpoints: 768px (tablet), 992px (desktop)
- Flexible typography and component sizing

## Theme System

### Dark Mode Support
```css
[data-theme="dark"] {
  /* Dark theme color overrides */
}
```

**Implementation:**
- CSS custom properties for seamless switching
- Automatic transitions between themes
- Consistent component appearance across themes

### Theme Context
- React Context for theme state management
- Persistent theme selection
- System preference detection

## Utility Classes

### Custom Utilities
```css
.text-decoration-none:hover { text-decoration: none; }
.position-relative { position: relative; }
.position-absolute { position: absolute; }
.opacity-10 { opacity: 0.1; }
.overflow-hidden { overflow: hidden; }
```

### Bootstrap Extensions
- Enhanced existing Bootstrap classes
- Consistent with Bootstrap naming conventions
- Additive approach (no Bootstrap overrides)

## Print Styles

### Resume Optimization
```css
@media print {
  .navbar, .btn, footer { display: none; }
  .card { box-shadow: none; border: 1px solid #ddd; }
  body { font-size: 12pt; }
}
```

**Print Features:**
- Hidden navigation and interactive elements
- Optimized typography sizing
- Page break handling
- Printer-friendly colors and borders

## File Organization

### Style Structure
```
src/styles/
├── enhanced-material.css       # Main design system
├── EmergenceEngine.css        # Simulation-specific
├── DvdBouncer.css            # Component-specific
└── DuckKonundrum.css         # Game-specific
```

### Import Order
1. Bootstrap CSS (external)
2. Enhanced Material (design system)
3. Component-specific styles
4. Page-specific styles

## Development Guidelines

### CSS Best Practices
- Use CSS custom properties for theming
- Follow BEM-like naming for custom classes
- Prefer utility classes over custom CSS
- Maintain consistent spacing and sizing

### Performance Considerations
- Minimize custom CSS where possible
- Use efficient selectors
- Optimize animations for 60fps
- Leverage Bootstrap's optimizations

### Browser Support
- Modern browsers (ES6+ support)
- CSS Grid and Flexbox
- CSS Custom Properties
- CSS Transitions and Animations

## Component-Specific Guidelines

### Interactive Simulations
- Full-screen layouts when appropriate
- High-performance canvas rendering
- Responsive controls and interfaces
- Consistent pause/play patterns

### Navigation
- Clear active states
- Responsive collapse behavior
- Keyboard navigation support
- Smooth transitions between pages

### Cards and Content
- Consistent information hierarchy
- Appropriate white space
- Readable typography scales
- Clear call-to-action patterns