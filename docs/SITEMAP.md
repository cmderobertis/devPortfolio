# Portfolio Sitemap

## Site Structure

```
/ (Root - Default to Resume)
├── /resume                           # Professional Experience & Skills
├── /about                           # Biography & Personal Background  
└── /sim-interactive                 # Interactive Showcase Hub
    ├── /dvd                        # DVD Bouncer Physics Simulation
    ├── /breakout                   # Classic Breakout Game (TypeScript)
    ├── /emergence                  # Cellular Automata & Complex Systems
    ├── /duck-konundrum            # MIT Mystery Hunt Puzzle Recreation
    ├── /prisms                    # Prism Physics Simulation
    ├── /prisms3d                  # 3D Prism Visualization
    └── /gameoflife                # Conway's Game of Life Implementation
```

## Page Details

### `/` & `/resume` - Resume Page
- **Purpose**: Professional experience, education, and skills showcase
- **Component**: `Resume.jsx`
- **Key Features**:
  - Work experience timeline
  - Technical skills matrix
  - Education background
  - Professional achievements

### `/about` - Biography Page  
- **Purpose**: Personal background and interests
- **Component**: `Bio.jsx`
- **Key Features**:
  - Personal story and background
  - Interests and hobbies
  - Professional journey
  - Contact information

### `/sim-interactive` - Interactive Showcase Hub
- **Purpose**: Gateway to interactive demonstrations and simulations
- **Component**: `InteractiveShowcase.jsx`
- **Key Features**:
  - Grid layout of available simulations
  - Brief descriptions of each demo
  - Navigation to individual simulations
  - Responsive design for different screen sizes

## Interactive Simulations

### `/sim-interactive/dvd` - DVD Bouncer
- **Purpose**: Physics simulation demonstrating collision detection
- **Component**: `DvdBouncer.jsx`
- **Technical Features**:
  - Real-time physics calculations
  - Collision detection algorithms
  - Color-changing effects
  - Pause/resume functionality
  - Canvas-based rendering

### `/sim-interactive/breakout` - Breakout Game
- **Purpose**: Classic arcade game implementation
- **Component**: `Breakout.tsx` (TypeScript)
- **Technical Features**:
  - Game physics and collision detection
  - Scoring system
  - Paddle and ball mechanics
  - Brick destruction patterns
  - Game state management

### `/sim-interactive/emergence` - Emergence Engine
- **Purpose**: Cellular automata and complex systems visualization
- **Component**: `EmergenceEngine.jsx`
- **Technical Features**:
  - Multiple CA rule implementations
  - Real-time pattern evolution
  - Interactive rule modification
  - Pattern analysis and metrics
  - High-performance canvas rendering

### `/sim-interactive/duck-konundrum` - Duck Konundrum Puzzle
- **Purpose**: MIT Mystery Hunt puzzle recreation
- **Component**: `DuckKonundrum.jsx`
- **Technical Features**:
  - Step-by-step puzzle solving simulation
  - Constraint satisfaction algorithms
  - Interactive puzzle progression
  - Educational visualization
  - Logical reasoning demonstration

### `/sim-interactive/prisms` - Prism Simulation
- **Purpose**: Physics-based prism light refraction simulation
- **Component**: `Prisms.jsx`
- **Technical Features**:
  - Light ray physics simulation
  - Refraction calculations
  - Interactive prism positioning
  - Real-time rendering

### `/sim-interactive/prisms3d` - 3D Prism Visualization
- **Purpose**: Three-dimensional prism and light interaction
- **Component**: `Prisms3D.jsx`
- **Technical Features**:
  - 3D rendering and visualization
  - Interactive camera controls
  - Complex light physics
  - Performance-optimized rendering

### `/sim-interactive/gameoflife` - Game of Life
- **Purpose**: Conway's Game of Life cellular automaton
- **Component**: `GameOfLife.jsx`
- **Technical Features**:
  - Classic CA implementation
  - Pattern loading and saving
  - Generation stepping controls
  - Grid manipulation tools
  - Performance optimization for large grids

## Navigation Structure

### Primary Navigation
- **Resume** - Professional experience (default/home page)
- **About** - Personal biography
- **Interactive** - Simulations and demos hub

### Secondary Navigation (Interactive Showcase)
- **DVD Bouncer** - Physics simulation
- **Breakout** - Classic arcade game  
- **Emergence Engine** - Cellular automata
- **Duck Konundrum** - Logic puzzle
- **Prisms** - Light refraction physics
- **Prisms 3D** - 3D light visualization
- **Game of Life** - Conway's famous CA

## URL Patterns

### Base Routes
- `/` → Resume (default)
- `/resume` → Professional experience
- `/about` → Biography

### Interactive Routes
- `/sim-interactive` → Showcase hub
- `/sim-interactive/{simulation}` → Individual simulation

### Route Characteristics
- **SPA Routing**: Client-side navigation with React Router
- **Clean URLs**: No hash routing or query parameters
- **Responsive**: All routes work on mobile and desktop
- **Direct Access**: All routes accessible via direct URL
- **Fallback**: 404s redirect to home page

## Accessibility & SEO

### URL Structure
- Clear, semantic path names
- Hierarchical organization
- Descriptive route segments
- Consistent naming conventions

### Navigation
- Breadcrumb-style organization
- Clear parent-child relationships
- Intuitive categorization
- Mobile-friendly navigation

## Future Expansion

### Potential New Routes
- `/projects` - Project portfolio expansion
- `/blog` - Technical writing and tutorials  
- `/contact` - Contact form and information
- `/sim-interactive/[new-simulations]` - Additional demos

### Route Considerations
- Maintain consistent URL patterns
- Preserve hierarchical structure
- Consider SEO implications
- Plan for content scalability