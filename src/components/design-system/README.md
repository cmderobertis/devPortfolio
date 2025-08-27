# Material Design 3 Component System

A comprehensive, highly configurable component library built on Material Design 3 principles with theme variant support.

## 🎯 Goals

- **Eliminate raw JSX**: Provide reusable components for all common UI patterns
- **Maximum consistency**: Unified styling across all portfolio modules  
- **Theme variants**: Support specialized theming (retro-98, minimal, neon, etc.)
- **Highly configurable**: Opinionated defaults with extensive customization

## 🚀 Quick Start

```jsx
import { 
  ThemeProvider, 
  ThemeVariantProvider, 
  Page, 
  Stack, 
  Button,
  Card
} from '../components/design-system';

// Basic usage with default Material Design 3
function MyPage() {
  return (
    <ThemeProvider defaultTheme="auto">
      <Page>
        <Stack spacing="md">
          <Card>
            <Button variant="filled">Click me</Button>
          </Card>
        </Stack>
      </Page>
    </ThemeProvider>
  );
}

// With theme variant (e.g., Windows 98 style)
function RetroPage() {
  return (
    <ThemeProvider>
      <ThemeVariantProvider variant="retro-98">
        <Page>
          <Button>Windows 98 styled button</Button>
        </Page>
      </ThemeVariantProvider>
    </ThemeProvider>
  );
}
```

## 🎨 Theme System

### Base Theme Provider
Controls light/dark mode switching:
- `light`: Light theme
- `dark`: Dark theme  
- `auto`: Follow system preference

### Theme Variants
Specialized styling overlays:
- `default`: Standard Material Design 3
- `retro-98`: Windows 98 themed (for GameOfLife, etc.)
- `minimal`: Ultra-clean reduced visual weight
- `neon`: Cyberpunk/neon themed

## 📦 Component Categories

### Layout Components
- **Page**: Main page container with responsive sizing
- **Section**: Content sections with consistent spacing
- **Stack**: Vertical layout with configurable gaps
- **Grid/GridItem**: Responsive grid system (1-12 columns)

```jsx
<Page maxWidth="lg" padding>
  <Section spacing="lg" background>
    <Stack spacing="md" align="center">
      <Grid columns={12} spacing="md">
        <GridItem span={6} spanMd={4}>Content</GridItem>
      </Grid>
    </Stack>
  </Section>
</Page>
```

### Navigation Components
- **Navbar**: Responsive navigation bar with mobile toggle
- **NavList/NavItem/NavLink**: Navigation list components
- **Breadcrumbs**: Breadcrumb navigation
- **Tabs/Tab**: Tab navigation system

```jsx
<Navbar 
  brand={<Typography variant="title-large">Brand</Typography>}
  sticky
>
  <NavList direction="horizontal">
    <NavItem>
      <NavLink to="/home">Home</NavLink>
    </NavItem>
  </NavList>
</Navbar>
```

### Core Components
- **Button**: Enhanced button with variants, loading states, icons
- **Card**: Content container with header, content, actions
- **Typography**: Text component with Material Design 3 type scale
- **TextField**: Form input with validation and states
- **Checkbox**: Enhanced checkbox with indeterminate state

### Theme Components  
- **ThemeProvider**: Base theme management (light/dark)
- **ThemeVariantProvider**: Specialized theme variants
- **ThemeToggle**: Theme switching button

## 🔧 Configuration

### Design Tokens
All components use CSS custom properties from Material Design 3:

```css
/* Colors */
var(--md-sys-color-primary)
var(--md-sys-color-surface)

/* Typography */
var(--md-sys-typescale-display-large-font-size)

/* Spacing */
var(--md-sys-spacing-4) /* 16px */

/* Shape */  
var(--md-sys-shape-corner-medium) /* 12px radius */

/* Motion */
var(--md-sys-motion-duration-medium2) /* 300ms */
```

### Responsive Breakpoints
- `xs`: 0px
- `sm`: 600px  
- `md`: 905px
- `lg`: 1240px
- `xl`: 1440px

### Component Props Pattern
All components follow this prop structure:

```jsx
<Component
  variant="primary"     // Style variant
  size="medium"        // Size variant  
  className=""         // Additional CSS classes
  disabled={false}     // State props
  onClick={handler}    // Event handlers
  // ...other specific props
>
  Content
</Component>
```

## 🎯 Migration Guide

### From Raw JSX
```jsx
// Before: Raw JSX
<div className="container">
  <div className="section">
    <button className="btn btn-primary">Click</button>
  </div>
</div>

// After: Design System
<Page>
  <Section>
    <Button variant="filled">Click</Button>
  </Section>
</Page>
```

### From Bootstrap Classes
```jsx
// Before: Bootstrap
<div className="container-lg">
  <div className="row">
    <div className="col-md-6">
      <div className="card">Content</div>
    </div>
  </div>
</div>

// After: Design System
<Page maxWidth="lg">
  <Grid columns={12}>
    <GridItem spanMd={6}>
      <Card>Content</Card>
    </GridItem>
  </Grid>
</Page>
```

### Database Editor Migration
The database-editor primitives have been consolidated:
- `/database-editor/primitives/Button` → Use design-system `Button`
- `/database-editor/primitives/Card` → Use design-system `Card`
- All database components should import from `../design-system`

## 🧪 Theme Variant Usage

### GameOfLife with Retro-98 Theme
```jsx
import { ThemeVariantProvider } from '../components/design-system';

function GameOfLife() {
  return (
    <ThemeVariantProvider variant="retro-98">
      <Page>
        {/* All components automatically get Windows 98 styling */}
        <Button>98-style button</Button>
        <Card>98-style card</Card>
      </Page>
    </ThemeVariantProvider>
  );
}
```

### Per-Component Variants
```jsx
// Theme variant can be applied to individual components via CSS classes
<Button className="md3-button--retro-98">
  Individual variant
</Button>
```

## 🔄 Updates & Versioning

Current version: `1.0.0`

The component system is designed to be:
- **Backwards compatible**: Existing components continue to work
- **Incrementally adoptable**: Migrate components one at a time
- **Extensible**: Easy to add new variants and components

## 🎨 Customization

### Adding New Theme Variants
1. Add variant styles to `ThemeVariants.css`
2. Update `ThemeVariantProvider` with new variant option
3. Add variant-specific component overrides

### Custom Components
Follow the existing pattern:
```jsx
export const CustomComponent = ({ variant, className, ...props }) => {
  const { getVariantClass } = useThemeVariant();
  
  const classes = [
    getVariantClass('md3-custom'),
    `md3-custom--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return <div className={classes} {...props} />;
};
```

This design system eliminates the need for raw JSX while maintaining the flexibility to support specialized theming like your GameOfLife's 98.css requirements.