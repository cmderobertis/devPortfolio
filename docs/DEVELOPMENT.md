# Development Workflow Documentation

## Environment Setup

### Prerequisites
- **Node.js**: Version 16+ (LTS recommended)
- **npm**: Version 8+ (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/cmderobertis/devPortfolio.git
cd devPortfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

### Verification
```bash
# Check Node.js version
node --version  # Should be 16+

# Check npm version  
npm --version   # Should be 8+

# Verify Vite installation
npx vite --version
```

## Development Commands

### Core Scripts
```bash
# Development server with hot reload
npm run dev
# Starts on http://localhost:5173
# Automatically opens browser
# Hot module replacement enabled

# Production build
npm run build
# Creates optimized bundle in /dist
# Minifies and optimizes all assets
# Generates source maps for debugging

# Preview production build locally
npm run preview
# Serves production build on http://localhost:4173
# Use for final testing before deployment
```

### Development Server Features
- **Hot Module Replacement (HMR)**: Instant updates without page refresh
- **Source Maps**: Accurate debugging information
- **Error Overlay**: In-browser error reporting
- **Proxy Support**: API proxying if needed
- **HTTPS Support**: Add `--https` flag if required

## Project Structure & Organization

### File Organization Guidelines
```
src/
├── components/           # Reusable UI components
│   ├── Navbar.jsx       # One component per file
│   └── GameCanvas.jsx   # Clear, descriptive names
├── pages/               # Route-level components
│   ├── Resume.jsx       # Page components in PascalCase
│   └── Bio.jsx          # One page per file
├── engine/              # Simulation engines and logic
│   ├── CellularAutomata.js  # Core algorithms
│   └── Metrics.js       # Performance monitoring
├── context/             # React Context providers
│   └── ThemeContext.jsx # Global state management
├── styles/              # CSS files
│   ├── enhanced-material.css  # Global styles
│   └── ComponentName.css      # Component-specific styles
├── utils/               # Helper functions
│   └── dvdLogic.js      # Pure utility functions
├── config/              # Configuration files
│   └── emergenceRules.js    # Data and settings
└── assets/              # Static resources
    └── images/          # Organized by type
```

### Naming Conventions
- **Components**: PascalCase (`Navbar.jsx`, `GameCanvas.jsx`)
- **Pages**: PascalCase (`Resume.jsx`, `InteractiveShowcase.jsx`)
- **Utilities**: camelCase (`dvdLogic.js`, `mathHelpers.js`)
- **Styles**: kebab-case (`enhanced-material.css`, `dvd-bouncer.css`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PARTICLES`, `DEFAULT_CONFIG`)

## Code Standards & Best Practices

### React Component Guidelines

#### Functional Components Only
```javascript
// ✅ Preferred - Functional component with hooks
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  return <div>{/* component JSX */}</div>;
};

// ❌ Avoid - Class components
class MyComponent extends React.Component {
  // Class component code
}
```

#### Props and State Management
```javascript
// ✅ Destructure props immediately
const MyComponent = ({ title, isActive, onClick }) => {
  // Component logic
};

// ✅ Use meaningful state variable names
const [isModalOpen, setIsModalOpen] = useState(false);
const [userInput, setUserInput] = useState('');

// ❌ Avoid generic names
const [data, setData] = useState();
const [flag, setFlag] = useState(false);
```

#### Custom Hooks Pattern
```javascript
// ✅ Extract reusable logic into custom hooks
const useGameLoop = (isRunning) => {
  useEffect(() => {
    if (!isRunning) return;
    
    let animationId;
    const gameLoop = () => {
      // Game logic
      animationId = requestAnimationFrame(gameLoop);
    };
    gameLoop();
    
    return () => cancelAnimationFrame(animationId);
  }, [isRunning]);
};

// Usage in component
const GameComponent = () => {
  const [isRunning, setIsRunning] = useState(false);
  useGameLoop(isRunning);
  
  return <canvas />;
};
```

### JavaScript/ES6+ Standards

#### Import/Export Patterns
```javascript
// ✅ Named imports for utilities
import { calculateDistance, normalize } from '../utils/mathHelpers';

// ✅ Default imports for components
import Navbar from '../components/Navbar';

// ✅ Consistent export style
export const helperFunction = () => {};
export default MainComponent;
```

#### Modern JavaScript Features
```javascript
// ✅ Use const/let instead of var
const config = { width: 800, height: 600 };
let currentScore = 0;

// ✅ Template literals for strings
const message = `Score: ${currentScore}`;

// ✅ Destructuring assignment
const { width, height } = canvas.getBoundingClientRect();
const [first, second, ...rest] = array;

// ✅ Arrow functions for callbacks
const handleClick = (event) => {
  event.preventDefault();
};

// ✅ Async/await for promises
const loadData = async () => {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
  }
};
```

### CSS and Styling Guidelines

#### CSS Organization
```css
/* Component-specific CSS file */
/* ComponentName.css */

/* 1. Layout properties */
.component-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
}

/* 2. Visual properties */
.component-card {
  background-color: var(--surface-color);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

/* 3. Typography */
.component-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--on-surface-color);
}

/* 4. Responsive design */
@media (max-width: 768px) {
  .component-container {
    flex-direction: column;
  }
}
```

#### CSS Custom Properties Usage
```css
/* ✅ Use CSS custom properties for theming */
.my-component {
  background-color: var(--surface-color);
  color: var(--on-surface-color);
  border: 1px solid var(--primary-color);
}

/* ❌ Avoid hardcoded colors */
.my-component {
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #0d6efd;
}
```

## Build Process & Optimization

### Vite Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
```

### Build Optimization
```bash
# Analyze bundle size
npm run build
# Check dist/ folder size and structure

# Optimize images before adding to assets/
# Use appropriate formats: WebP, AVIF for modern browsers
# Provide fallbacks for older browsers

# Monitor build performance
npm run build -- --profile
# Generates detailed build statistics
```

### Performance Guidelines

#### Code Splitting
```javascript
// ✅ Lazy load heavy components
const EmergenceEngine = lazy(() => import('../pages/EmergenceEngine'));
const Breakout = lazy(() => import('../pages/Breakout'));

// Use in routing
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/emergence" element={<EmergenceEngine />} />
    <Route path="/breakout" element={<Breakout />} />
  </Routes>
</Suspense>
```

#### Canvas Optimization
```javascript
// ✅ Optimize canvas rendering
const optimizeCanvasRendering = (canvas, ctx) => {
  // Use device pixel ratio for sharp rendering
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);
  
  // Enable hardware acceleration
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
};
```

## Debugging & Development Tools

### Browser Developer Tools
```javascript
// ✅ Use meaningful console messages
console.log('Simulation started:', { width, height, rule });
console.warn('Performance degradation detected:', fps);
console.error('Canvas initialization failed:', error);

// ✅ Use console.time for performance measurement
console.time('grid-calculation');
const result = calculateNextGeneration(grid);
console.timeEnd('grid-calculation');
```

### React Developer Tools
- Install React Developer Tools browser extension
- Use Components tab to inspect component hierarchy
- Use Profiler tab to identify performance bottlenecks
- Enable highlighting updates to visualize re-renders

### Vite Development Features
```javascript
// Hot Module Replacement (HMR) API
if (import.meta.hot) {
  // Accept updates for this module
  import.meta.hot.accept();
  
  // Handle state preservation
  import.meta.hot.accept('./gameState.js', (newModule) => {
    // Update game state without losing progress
  });
}
```

## Testing Strategy

### Testing Setup (Future Implementation)
```bash
# Recommended testing dependencies
npm install --save-dev @testing-library/react
npm install --save-dev @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
npm install --save-dev vitest
```

### Component Testing Patterns
```javascript
// Example test structure
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

// Wrapper for context providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  test('renders navigation links', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('resume')).toBeInTheDocument();
    expect(screen.getByText('about')).toBeInTheDocument();
  });
});
```

### Performance Testing
```javascript
// Performance monitoring in development
const performanceMonitor = {
  measureRenderTime: (componentName, renderFn) => {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    console.log(`${componentName} render time: ${end - start}ms`);
    return result;
  },
  
  measureMemoryUsage: () => {
    if (performance.memory) {
      const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
      console.log(`Memory usage: ${(usedJSHeapSize / 1048576).toFixed(2)}MB`);
    }
  }
};
```

## Deployment Workflow

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (already done)
firebase init hosting

# Build and deploy
npm run build
firebase deploy

# Deploy to preview channel
firebase hosting:channel:deploy preview-branch
```

### Deployment Checklist
```bash
# Pre-deployment verification
npm run build        # Verify build succeeds
npm run preview      # Test production build locally

# Check for issues
- [ ] All routes work correctly
- [ ] Images and assets load properly
- [ ] Theme switching functions
- [ ] Simulations run smoothly
- [ ] Mobile responsive design
- [ ] Print styles for resume
- [ ] SEO meta tags present
```

### Environment Configuration
```javascript
// src/config/environment.js
export const config = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  baseUrl: import.meta.env.BASE_URL,
  
  // Feature flags
  enableDebugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  enablePerformanceMonitoring: import.meta.env.VITE_MONITOR_PERFORMANCE === 'true'
};
```

## Common Issues & Solutions

### Development Issues

#### Hot Reload Not Working
```bash
# Solution 1: Restart development server
npm run dev

# Solution 2: Clear Vite cache
rm -rf node_modules/.vite
npm run dev

# Solution 3: Check file naming and imports
# Ensure consistent case in file names and imports
```

#### Canvas Not Updating
```javascript
// ✅ Ensure proper cleanup
useEffect(() => {
  let animationId;
  
  const animate = () => {
    // Animation logic
    animationId = requestAnimationFrame(animate);
  };
  
  if (isRunning) animate();
  
  // Critical: cleanup function
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}, [isRunning]); // Don't forget dependencies
```

#### Theme Not Switching
```javascript
// ✅ Verify CSS custom property usage
// Check that components use var(--property-name)
// Ensure ThemeContext is properly provided

// Debug theme state
const { theme } = useContext(ThemeContext);
console.log('Current theme:', theme);
console.log('Data theme attribute:', document.documentElement.getAttribute('data-theme'));
```

### Build Issues

#### Build Size Too Large
```bash
# Analyze bundle
npm run build
cd dist
ls -la  # Check file sizes

# Solutions:
# 1. Implement code splitting
# 2. Remove unused dependencies
# 3. Optimize images and assets
# 4. Use dynamic imports for heavy libraries
```

#### Missing Dependencies
```bash
# Check for missing peer dependencies
npm install

# Update outdated dependencies
npm outdated
npm update

# Fix security vulnerabilities
npm audit
npm audit fix
```

## Performance Monitoring

### Development Monitoring
```javascript
// Performance utilities for development
export const DevTools = {
  logRenderCount: (() => {
    let count = 0;
    return (componentName) => {
      count++;
      console.log(`${componentName} rendered ${count} times`);
    };
  })(),
  
  measureFPS: (() => {
    let frames = 0;
    let startTime = Date.now();
    
    return () => {
      frames++;
      const currentTime = Date.now();
      if (currentTime - startTime >= 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - startTime));
        console.log(`FPS: ${fps}`);
        frames = 0;
        startTime = currentTime;
        return fps;
      }
    };
  })(),
  
  trackMemoryUsage: () => {
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        allocated: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576)
      };
    }
  }
};
```

### Production Monitoring
```javascript
// Basic error tracking for production
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to error tracking service in production
});

// Performance observer for Core Web Vitals
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'measure') {
      console.log(`${entry.name}: ${entry.duration}ms`);
    }
  }
});

observer.observe({ entryTypes: ['measure'] });
```

## Git Workflow

### Branch Strategy
```bash
# Main branch for production
git checkout main

# Feature branches for new development
git checkout -b feature/new-simulation
git checkout -b fix/canvas-performance
git checkout -b docs/component-api

# Commit message format
git commit -m "feat: add cellular automata 3D visualization"
git commit -m "fix: resolve theme switching bug"
git commit -m "docs: update component API documentation"
```

### Development Workflow
```bash
# Daily development cycle
git pull origin main              # Get latest changes
git checkout -b feature/my-work   # Create feature branch
# ... make changes ...
npm run build                     # Verify build works
git add .                         # Stage changes
git commit -m "descriptive message"
git push origin feature/my-work   # Push to remote
# Create pull request for review
```