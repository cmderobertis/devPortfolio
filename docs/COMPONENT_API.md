# Component API Documentation

## Overview

This document provides comprehensive API documentation for all major components in the React portfolio project. Each component includes detailed prop interfaces, usage examples, accessibility features, and performance considerations following the standards established in [BEST_PRACTICES.md](./BEST_PRACTICES.md).

## Table of Contents

1. [Core Components](#core-components)
2. [Design System Components](#design-system-components)
3. [Context Providers](#context-providers)
4. [Simulation Components](#simulation-components)
5. [Layout Components](#layout-components)
6. [Utility Components](#utility-components)

---

## Core Components

### Navbar (`src/components/Navbar.jsx`)

Main navigation component providing site-wide navigation and theme switching with responsive mobile support.

#### Props Interface

```typescript
interface NavbarProps {
  /** Additional CSS classes to apply to the navbar */
  className?: string;
  /** Whether the navbar should have a sticky position */
  sticky?: boolean;
  /** Custom brand element to display */
  brand?: React.ReactNode;
  /** Whether to show the theme toggle button */
  showThemeToggle?: boolean;
  /** Custom navigation items to render */
  customItems?: Array<{
    path: string;
    label: string;
    external?: boolean;
  }>;
}
```

#### Usage Examples

```jsx
// Basic usage with default configuration
import Navbar from './components/Navbar';

<Navbar />

// Advanced usage with custom configuration
<Navbar 
  className="custom-navbar"
  sticky={true}
  showThemeToggle={true}
  brand={<CustomLogo />}
  customItems={[
    { path: '/projects', label: 'Projects' },
    { path: 'https://github.com', label: 'GitHub', external: true }
  ]}
/>
```

#### Features

- **Responsive Design**: Automatically collapses to hamburger menu on mobile devices
- **Active Route Highlighting**: Uses React Router's `NavLink` for automatic active state
- **Theme Integration**: Fully integrated with ThemeContext for consistent styling
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Optimized re-renders using React.memo and stable references

#### Accessibility

- **ARIA Labels**: All interactive elements have appropriate labels
- **Keyboard Navigation**: Tab navigation works correctly through all links
- **Screen Reader Support**: Proper semantic markup with navigation landmarks
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: Meets WCAG 2.1 AA standards (4.5:1 ratio)

#### Performance Considerations

- Uses `React.memo` to prevent unnecessary re-renders
- Theme context updates are optimized to avoid cascading renders
- Mobile menu state is managed locally to prevent global state pollution
- CSS transitions are GPU-accelerated using `transform` properties

#### Implementation Notes

```javascript
// Key implementation patterns
const Navbar = React.memo(() => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Stable callback references
  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);
  
  const handleThemeToggle = useCallback(() => {
    toggleTheme();
    // Announce theme change for accessibility
    announceToScreenReader(`Theme switched to ${theme === 'light' ? 'dark' : 'light'} mode`);
  }, [theme, toggleTheme]);
  
  return (
    <nav 
      className="navbar navbar-expand-lg sticky-top"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Navigation implementation */}
    </nav>
  );
});
```

---

### GameCanvas (`src/components/GameCanvas.jsx`)

Reusable canvas component optimized for interactive simulations and games with high-DPI support and performance monitoring.

#### Props Interface

```typescript
interface GameCanvasProps {
  /** Canvas width in CSS pixels */
  width?: number;
  /** Canvas height in CSS pixels */
  height?: number;
  /** Additional CSS classes */
  className?: string;
  /** Callback fired when canvas is ready for rendering */
  onCanvasReady?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
  /** Whether to enable high-DPI optimization */
  enableHighDPI?: boolean;
  /** Canvas context attributes for optimization */
  contextAttributes?: CanvasRenderingContext2DSettings;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Whether the canvas is interactive */
  interactive?: boolean;
  /** Click handler for interactive canvases */
  onClick?: (event: MouseEvent, canvasCoordinates: { x: number, y: number }) => void;
  /** Keyboard handler for accessible interaction */
  onKeyDown?: (event: KeyboardEvent) => void;
}
```

#### Usage Examples

```jsx
import GameCanvas from './components/GameCanvas';

// Basic usage for simple rendering
<GameCanvas 
  width={800} 
  height={600} 
  onCanvasReady={(canvas, ctx) => {
    // Initialize your rendering
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }}
/>

// Advanced usage for interactive simulation
<GameCanvas
  width={800}
  height={600}
  className="simulation-canvas"
  enableHighDPI={true}
  interactive={true}
  ariaLabel="Game of Life simulation grid"
  onClick={(event, coords) => {
    console.log('Canvas clicked at:', coords);
    toggleCellAt(coords.x, coords.y);
  }}
  onKeyDown={(event) => {
    if (event.key === ' ') {
      toggleSimulation();
    }
  }}
  onCanvasReady={(canvas, ctx) => {
    initializeSimulation(canvas, ctx);
  }}
  contextAttributes={{
    alpha: false, // Disable alpha for better performance
    desynchronized: true // Allow async rendering
  }}
/>
```

#### Features

- **High-DPI Support**: Automatic device pixel ratio handling for sharp rendering
- **Performance Optimization**: Configurable context attributes for optimal rendering
- **Interactive Support**: Built-in click and keyboard event handling
- **Accessibility Integration**: ARIA labels and keyboard navigation
- **Coordinate Translation**: Automatic conversion from DOM coordinates to canvas coordinates
- **Responsive Sizing**: CSS-based sizing with canvas buffer optimization

#### Accessibility

- **Keyboard Navigation**: Supports focus and keyboard interaction
- **Screen Reader Support**: ARIA labels describe canvas content
- **Alternative Text**: Dynamic aria-label updates for state changes
- **Focus Indicators**: Clear visual focus outline
- **Semantic Markup**: Proper role and description attributes

#### Performance Optimizations

```javascript
// High-DPI optimization implementation
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d', contextAttributes);
  const dpr = window.devicePixelRatio || 1;
  
  // Set actual size in memory (scaled up for high DPI)
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  
  // Scale the drawing context back down
  ctx.scale(dpr, dpr);
  
  // Set display size via CSS
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  
  // Optimize rendering settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  if (onCanvasReady) {
    onCanvasReady(canvas, ctx);
  }
}, [width, height, enableHighDPI, contextAttributes, onCanvasReady]);
```

---

### ThemeToggle (`src/components/ThemeToggle.jsx`)

Interactive theme switching component with visual state indicators and accessibility support.

#### Props Interface

```typescript
interface ThemeToggleProps {
  /** Additional CSS classes */
  className?: string;
  /** Size variant of the toggle button */
  size?: 'small' | 'medium' | 'large';
  /** Visual style variant */
  variant?: 'button' | 'switch' | 'dropdown';
  /** Whether to show text labels alongside icons */
  showLabels?: boolean;
  /** Custom labels for each theme mode */
  labels?: {
    light: string;
    dark: string;
    auto: string;
  };
  /** Custom icons for each theme mode */
  icons?: {
    light: React.ReactNode;
    dark: React.ReactNode;
    auto: React.ReactNode;
  };
  /** Position for dropdown variant */
  dropdownPosition?: 'bottom' | 'top' | 'left' | 'right';
}
```

#### Usage Examples

```jsx
import ThemeToggle from './components/ThemeToggle';

// Basic usage with default icons
<ThemeToggle />

// Advanced usage with custom configuration
<ThemeToggle
  size="large"
  variant="dropdown"
  showLabels={true}
  dropdownPosition="bottom"
  labels={{
    light: 'Light Theme',
    dark: 'Dark Theme',
    auto: 'System Default'
  }}
  className="custom-theme-toggle"
/>

// Button variant for toolbar usage
<ThemeToggle
  variant="button"
  size="small"
  showLabels={false}
/>
```

#### Features

- **Multiple Variants**: Button, switch, and dropdown presentation modes
- **Theme Mode Support**: Handles light, dark, and auto (system preference) modes
- **Visual Feedback**: Clear indicators for current theme state
- **Smooth Transitions**: Animated state changes with CSS transitions
- **Keyboard Accessible**: Full keyboard navigation support
- **Customizable**: Flexible styling and labeling options

#### Theme Integration

```javascript
// Integration with ThemeContext
const ThemeToggle = ({ variant = 'button', size = 'medium', ...props }) => {
  const { mode, toggleTheme, resolvedTheme } = useTheme();
  
  const handleToggle = useCallback(() => {
    toggleTheme();
    
    // Announce change for screen readers
    const newTheme = getNextTheme(mode);
    announceToScreenReader(`Theme changed to ${newTheme}`);
  }, [mode, toggleTheme]);
  
  const getThemeIcon = useCallback((themeMode) => {
    const defaultIcons = {
      light: <Sun className="theme-icon" />,
      dark: <Moon className="theme-icon" />,
      auto: <Monitor className="theme-icon" />
    };
    
    return props.icons?.[themeMode] || defaultIcons[themeMode];
  }, [props.icons]);
  
  return (
    <button
      className={`theme-toggle theme-toggle--${variant} theme-toggle--${size}`}
      onClick={handleToggle}
      aria-label={`Switch theme (current: ${mode})`}
      aria-pressed={mode !== 'auto'}
    >
      {getThemeIcon(mode)}
      {props.showLabels && (
        <span className="theme-toggle__label">
          {props.labels?.[mode] || mode}
        </span>
      )}
    </button>
  );
};
```

---

### InteractivePageWrapper (`src/components/InteractivePageWrapper.jsx`)

Layout wrapper component for interactive simulation pages with consistent styling and responsive behavior.

#### Props Interface

```typescript
interface InteractivePageWrapperProps {
  /** Page content */
  children: React.ReactNode;
  /** Page title for SEO and accessibility */
  title?: string;
  /** Page description */
  description?: string;
  /** Whether to show the back navigation */
  showBackNavigation?: boolean;
  /** Custom back navigation URL */
  backNavigationUrl?: string;
  /** Whether to apply fullscreen styling */
  fullscreen?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom page header content */
  header?: React.ReactNode;
  /** Custom page footer content */
  footer?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode;
}
```

#### Usage Examples

```jsx
import InteractivePageWrapper from './components/InteractivePageWrapper';

// Basic usage for simulation page
<InteractivePageWrapper
  title="Game of Life Simulation"
  description="Conway's Game of Life cellular automata"
  showBackNavigation={true}
>
  <GameOfLifeSimulation />
</InteractivePageWrapper>

// Advanced usage with custom components
<InteractivePageWrapper
  title="Complex Systems Simulation"
  description="Multi-agent emergence patterns"
  fullscreen={true}
  loading={isInitializing}
  error={simulationError}
  header={<SimulationHeader />}
  footer={<SimulationControls />}
  loadingComponent={<CustomLoader message="Initializing simulation..." />}
  errorComponent={<SimulationErrorBoundary />}
  className="complex-simulation-page"
>
  <EmergenceEngineCanvas />
</InteractivePageWrapper>
```

#### Features

- **Responsive Layout**: Automatic adaptation to different screen sizes
- **Navigation Integration**: Built-in back navigation with breadcrumbs
- **Loading States**: Integrated loading and error state management
- **SEO Optimization**: Proper meta tags and semantic markup
- **Accessibility**: ARIA landmarks and screen reader support
- **Theme Integration**: Consistent styling with theme system
- **Performance**: Optimized rendering with minimal re-renders

#### Layout Structure

```javascript
const InteractivePageWrapper = ({ 
  children, 
  title, 
  description, 
  loading, 
  error,
  ...props 
}) => {
  // Update document title for SEO
  useEffect(() => {
    if (title) {
      document.title = `${title} | Cameron De Robertis Portfolio`;
    }
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);
  
  if (loading) {
    return (
      <div className="interactive-page-wrapper interactive-page-wrapper--loading">
        {props.loadingComponent || <DefaultLoadingSpinner />}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="interactive-page-wrapper interactive-page-wrapper--error">
        {props.errorComponent || <DefaultErrorDisplay error={error} />}
      </div>
    );
  }
  
  return (
    <div 
      className={`interactive-page-wrapper ${props.fullscreen ? 'fullscreen' : ''}`}
      role="main"
      aria-labelledby="page-title"
    >
      {props.showBackNavigation && (
        <nav className="back-navigation" aria-label="Page navigation">
          <Link to={props.backNavigationUrl || '/sim-interactive'}>
            ← Back to Simulations
          </Link>
        </nav>
      )}
      
      {props.header && (
        <header className="page-header">
          {props.header}
        </header>
      )}
      
      <main className="page-content">
        {title && <h1 id="page-title" className="sr-only">{title}</h1>}
        {children}
      </main>
      
      {props.footer && (
        <footer className="page-footer">
          {props.footer}
        </footer>
      )}
    </div>
  );
};
```

---

## Design System Components

### Button (`src/design-system/Button.jsx`)

Comprehensive button component with Material Design 3 styling, multiple variants, and accessibility features.

#### Props Interface

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant following Material Design 3 */
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Button color scheme */
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning';
  /** Loading state with spinner */
  loading?: boolean;
  /** Icon to display before text */
  startIcon?: React.ReactNode;
  /** Icon to display after text */
  endIcon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom loading spinner component */
  loadingComponent?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}
```

#### Usage Examples

```jsx
import { Button } from '../design-system';

// Basic usage with different variants
<Button variant="filled" color="primary">
  Primary Action
</Button>

<Button variant="outlined" color="secondary">
  Secondary Action
</Button>

<Button variant="text">
  Text Button
</Button>

// Advanced usage with icons and states
<Button
  variant="filled"
  color="primary"
  size="large"
  startIcon={<Play />}
  loading={isSimulationStarting}
  onClick={handleStartSimulation}
  fullWidth
>
  Start Simulation
</Button>

// Icon-only button
<Button
  variant="outlined"
  size="small"
  aria-label="Toggle debug mode"
  onClick={toggleDebugMode}
>
  <Settings />
</Button>
```

#### Material Design 3 Implementation

```javascript
const Button = React.forwardRef(({ 
  variant = 'filled',
  size = 'medium',
  color = 'primary',
  loading = false,
  startIcon,
  endIcon,
  children,
  className,
  disabled,
  ...props 
}, ref) => {
  const classes = [
    'md3-button',
    `md3-button--${variant}`,
    `md3-button--${size}`,
    `md3-button--${color}`,
    loading && 'md3-button--loading',
    props.fullWidth && 'md3-button--full-width',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          {props.loadingComponent || <Spinner size="small" />}
          <span className="sr-only">Loading...</span>
        </>
      ) : (
        <>
          {startIcon && <span className="md3-button__icon md3-button__icon--start">{startIcon}</span>}
          {children && <span className="md3-button__text">{children}</span>}
          {endIcon && <span className="md3-button__icon md3-button__icon--end">{endIcon}</span>}
        </>
      )}
    </button>
  );
});
```

---

### Card (`src/design-system/Card.jsx`)

Material Design 3 compliant card component with elevation, interactive states, and flexible content areas.

#### Props Interface

```typescript
interface CardProps {
  /** Card elevation level (0-5) */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Card variant */
  variant?: 'elevated' | 'filled' | 'outlined';
  /** Whether the card is interactive/clickable */
  interactive?: boolean;
  /** Click handler for interactive cards */
  onClick?: (event: React.MouseEvent) => void;
  /** Card header content */
  header?: React.ReactNode;
  /** Main card content */
  children: React.ReactNode;
  /** Card footer/actions content */
  footer?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** ARIA role for semantic meaning */
  role?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}
```

#### Usage Examples

```jsx
import { Card } from '../design-system';

// Basic content card
<Card elevation={1}>
  <h3>Simulation Statistics</h3>
  <p>Current generation: {generation}</p>
  <p>Live cells: {liveCells}</p>
</Card>

// Interactive card with actions
<Card
  elevation={2}
  interactive={true}
  onClick={() => navigate('/sim-interactive/gameoflife')}
  header={
    <div className="card-header">
      <h3>Game of Life</h3>
      <Badge>Popular</Badge>
    </div>
  }
  footer={
    <div className="card-actions">
      <Button variant="text">Learn More</Button>
      <Button variant="filled">Try It</Button>
    </div>
  }
>
  <p>Conway's cellular automata simulation demonstrating emergence patterns.</p>
</Card>

// Outlined card for secondary content
<Card variant="outlined" className="performance-card">
  <div className="performance-metrics">
    <div className="metric">
      <span className="metric-label">FPS</span>
      <span className="metric-value">{fps}</span>
    </div>
    <div className="metric">
      <span className="metric-label">Frame Time</span>
      <span className="metric-value">{frameTime}ms</span>
    </div>
  </div>
</Card>
```

---

## Context Providers

### ThemeProvider (`src/context/ThemeContext.jsx`)

Comprehensive theme management provider with Material Design 3 color system, automatic system preference detection, and accessibility features.

#### Context Interface

```typescript
interface ThemeContextValue {
  /** Current theme mode setting */
  mode: 'light' | 'dark' | 'auto';
  /** Resolved theme (computed from mode and system preference) */
  resolvedTheme: 'light' | 'dark';
  /** Whether system prefers dark mode */
  systemPrefersDark: boolean;
  /** Current light theme palette key */
  lightPalette: string;
  /** Current dark theme palette key */
  darkPalette: string;
  /** Active palette based on resolved theme */
  currentPalette: string;
  /** Available color palettes */
  availablePalettes: typeof COLOR_PALETTES;
  
  // Actions
  /** Set specific theme mode */
  setMode: (mode: 'light' | 'dark' | 'auto') => void;
  /** Toggle through available theme modes */
  toggleTheme: () => void;
  /** Set light mode palette */
  setLightPalette: (paletteKey: string) => void;
  /** Set dark mode palette */
  setDarkPalette: (paletteKey: string) => void;
  
  // Utilities
  /** Whether current resolved theme is dark */
  isDark: boolean;
  /** Whether current resolved theme is light */
  isLight: boolean;
  /** Whether theme mode is set to auto */
  isAuto: boolean;
  
  // Color scheme utilities
  getColorSchemesByCategory: (category: string) => string[];
  getAllCategories: () => string[];
  getCategoryDisplayName: (category: string) => string;
  getSchemeMetadata: (paletteKey: string) => object | null;
}
```

#### Usage Examples

```jsx
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// Wrap your app with ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Your routes */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

// Use theme in components
function MyComponent() {
  const { 
    resolvedTheme, 
    toggleTheme, 
    isDark, 
    currentPalette,
    setLightPalette,
    getColorSchemesByCategory 
  } = useTheme();
  
  const availableSchemes = getColorSchemesByCategory('nature');
  
  return (
    <div className={`component ${isDark ? 'dark' : 'light'}`}>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'} mode
      </button>
      
      <select 
        value={currentPalette}
        onChange={(e) => setLightPalette(e.target.value)}
      >
        {availableSchemes.map(scheme => (
          <option key={scheme} value={scheme}>
            {scheme}
          </option>
        ))}
      </select>
    </div>
  );
}
```

#### Features

- **Automatic System Detection**: Responds to OS theme preference changes
- **Palette Management**: Advanced color scheme selection with categorization
- **Persistence**: Settings saved to localStorage with error handling
- **Accessibility**: Screen reader announcements for theme changes
- **Performance**: Optimized context updates to prevent unnecessary re-renders
- **CSS Integration**: Automatic CSS custom property injection

#### Implementation Highlights

```javascript
// Advanced hue-based palette mapping
const setThemeModeWithMapping = useCallback((newMode, useMapping = true) => {
  if (Object.values(THEME_MODES).includes(newMode)) {
    const previousResolvedTheme = resolvedTheme;
    const newResolvedTheme = newMode === THEME_MODES.AUTO 
      ? (systemPrefersDark ? THEME_MODES.DARK : THEME_MODES.LIGHT)
      : newMode;
    
    setMode(newMode);
    
    // Apply hue-based mapping if switching themes
    if (useMapping && previousResolvedTheme !== newResolvedTheme) {
      const currentScheme = previousResolvedTheme === THEME_MODES.DARK ? darkPalette : lightPalette;
      const mappedScheme = getMappedScheme(previousResolvedTheme, currentScheme, newResolvedTheme);
      
      if (newResolvedTheme === THEME_MODES.DARK) {
        setDarkPalette(mappedScheme);
      } else {
        setLightPalette(mappedScheme);
      }
    }
  }
}, [resolvedTheme, darkPalette, lightPalette, systemPrefersDark]);

// Accessibility announcements
useEffect(() => {
  const paletteName = COLOR_PALETTES[resolvedTheme][currentPalette]?.name || currentPalette;
  const announcement = `Theme changed to ${resolvedTheme} mode with ${paletteName} palette`;
  
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = announcement;
  document.body.appendChild(announcer);
  
  setTimeout(() => {
    if (announcer.parentNode) {
      announcer.parentNode.removeChild(announcer);
    }
  }, 1000);
}, [resolvedTheme, currentPalette]);
```

---

## Simulation Components

### SimulationCanvas (`src/components/simulations/SimulationCanvas.jsx`)

Specialized canvas component optimized for interactive simulations with performance monitoring and accessibility features.

#### Props Interface

```typescript
interface SimulationCanvasProps {
  /** Simulation entities to render */
  entities: Array<Entity>;
  /** Current generation/iteration number */
  generation?: number;
  /** Whether simulation is currently running */
  isRunning?: boolean;
  /** Debug mode for development */
  debugMode?: boolean;
  /** Grid dimensions for cellular automata */
  gridSize?: { width: number; height: number };
  /** Cell click handler for interactive simulations */
  onCellClick?: (x: number, y: number) => void;
  /** Custom render function */
  customRenderer?: (ctx: CanvasRenderingContext2D, entities: Array<Entity>) => void;
  /** Performance monitoring callback */
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
  /** Canvas styling options */
  canvasStyle?: {
    backgroundColor?: string;
    gridColor?: string;
    entityColor?: string;
  };
  /** Additional CSS classes */
  className?: string;
}
```

#### Usage Examples

```jsx
import SimulationCanvas from './SimulationCanvas';

// Game of Life implementation
<SimulationCanvas
  entities={gameGrid}
  generation={generation}
  isRunning={isRunning}
  debugMode={showDebugInfo}
  gridSize={{ width: 50, height: 50 }}
  onCellClick={(x, y) => toggleCell(x, y)}
  onPerformanceUpdate={(metrics) => setPerformanceData(metrics)}
  canvasStyle={{
    backgroundColor: '#000000',
    gridColor: '#333333',
    entityColor: '#00ff00'
  }}
  className="game-of-life-canvas"
/>

// Particle system simulation
<SimulationCanvas
  entities={particles}
  isRunning={simulationActive}
  customRenderer={(ctx, particles) => {
    particles.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });
  }}
  onPerformanceUpdate={handlePerformanceMetrics}
/>
```

#### Performance Features

- **Dirty Rectangle Rendering**: Only redraws changed regions
- **Object Pooling**: Reuses entity objects to reduce garbage collection
- **Adaptive Quality**: Automatically reduces quality under performance pressure
- **Performance Monitoring**: Built-in FPS and frame time tracking
- **WebGL Fallback**: Option to use WebGL for complex simulations

#### Accessibility Implementation

```javascript
const SimulationCanvas = ({ 
  entities, 
  generation = 0, 
  isRunning = false, 
  onCellClick,
  ...props 
}) => {
  const canvasRef = useRef();
  const [focusedCell, setFocusedCell] = useState(null);
  const { recordFrame } = usePerformanceMonitoring();
  
  // Keyboard navigation for accessibility
  const handleKeyDown = useCallback((event) => {
    if (!focusedCell || !onCellClick) return;
    
    const { x, y } = focusedCell;
    let newFocus = { x, y };
    
    switch (event.key) {
      case 'ArrowUp':
        newFocus.y = Math.max(0, y - 1);
        break;
      case 'ArrowDown':
        newFocus.y = Math.min(props.gridSize.height - 1, y + 1);
        break;
      case 'ArrowLeft':
        newFocus.x = Math.max(0, x - 1);
        break;
      case 'ArrowRight':
        newFocus.x = Math.min(props.gridSize.width - 1, x + 1);
        break;
      case ' ':
      case 'Enter':
        onCellClick(x, y);
        event.preventDefault();
        return;
      default:
        return;
    }
    
    setFocusedCell(newFocus);
    announceToScreenReader(`Cell ${newFocus.x}, ${newFocus.y} focused`);
    event.preventDefault();
  }, [focusedCell, onCellClick, props.gridSize]);
  
  return (
    <div className="simulation-canvas-container">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Simulation canvas, generation ${generation}, ${entities.length} active entities`}
        tabIndex="0"
        onKeyDown={handleKeyDown}
        onClick={handleCanvasClick}
        className={`simulation-canvas ${props.className || ''}`}
      />
      
      {/* Screen reader updates */}
      <div aria-live="polite" aria-atomic="false" className="sr-only">
        {isRunning ? `Simulation running, generation ${generation}` : 'Simulation paused'}
      </div>
      
      {/* Performance info for screen readers */}
      {props.debugMode && (
        <div aria-live="polite" className="sr-only">
          Performance: {currentFPS} FPS, {activeEntities} entities
        </div>
      )}
    </div>
  );
};
```

---

## Testing Guidelines

### Component Testing Patterns

Each component should include comprehensive tests covering:

1. **Rendering Tests**: Verify component renders without errors
2. **Props Tests**: Ensure all props work correctly
3. **Interaction Tests**: Test user interactions and callbacks
4. **Accessibility Tests**: Verify ARIA attributes and keyboard navigation
5. **Performance Tests**: Check for memory leaks and performance regressions

#### Example Test Structure

```javascript
// Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button Component', () => {
  test('renders with text content', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
  
  test('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('shows loading state correctly', () => {
    render(<Button loading>Loading...</Button>);
    
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  test('supports keyboard navigation', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Press me</Button>);
    const button = screen.getByRole('button');
    
    await user.tab();
    expect(button).toHaveFocus();
    
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## Migration Guide

### From Raw HTML/CSS to Components

When migrating existing HTML/CSS code to use these components:

1. **Identify Semantic Elements**: Replace `<div>` with appropriate components
2. **Extract Props**: Convert inline styles and attributes to component props
3. **Update Event Handlers**: Use component callback props instead of direct event listeners
4. **Apply Accessibility**: Leverage built-in accessibility features
5. **Test Thoroughly**: Ensure functionality is preserved

#### Migration Example

```html
<!-- Before: Raw HTML -->
<div class="card elevation-2" onclick="handleCardClick()">
  <div class="card-header">
    <h3>Game of Life</h3>
  </div>
  <div class="card-content">
    <p>Cellular automata simulation</p>
  </div>
  <div class="card-actions">
    <button class="btn btn-primary">Try It</button>
  </div>
</div>
```

```jsx
// After: Component usage
<Card
  elevation={2}
  interactive={true}
  onClick={handleCardClick}
  header={<h3>Game of Life</h3>}
  footer={
    <Button variant="filled" color="primary">
      Try It
    </Button>
  }
>
  <p>Cellular automata simulation</p>
</Card>
```

This component API documentation provides a comprehensive reference for all major components in the portfolio project, ensuring consistent usage, accessibility, and maintainability across the codebase.