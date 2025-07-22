# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this developer portfolio project.

## Project Overview

This is a React-based developer portfolio website showcasing Cameron DeRobertis's projects, skills, and interactive simulations. The portfolio demonstrates proficiency in React development, interactive web applications, game development, complex systems simulation, and modern web technologies. It's built with Vite for fast development and optimized performance.

## Core Commands

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Install dependencies
npm install
```

### Deployment
The portfolio is configured for Firebase hosting with automatic deployment.

## Architecture Overview

### React Application Structure
```
src/
├── App.jsx                    # Main application component with routing
├── main.jsx                   # Application entry point
├── components/
│   └── Navbar.jsx            # Navigation component
├── pages/
│   ├── Bio.jsx               # About/biography page
│   ├── Resume.jsx            # Resume and professional experience
│   ├── InteractiveShowcase.jsx # Hub for interactive demos
│   ├── DvdBouncer.jsx        # DVD screensaver simulation
│   ├── Breakout.tsx          # Breakout game implementation
│   ├── EmergenceEngine.jsx   # Cellular automata and complex systems
│   └── DuckKonundrum.jsx     # MIT Mystery Hunt puzzle simulation
├── context/
│   └── ThemeContext.jsx      # Theme management
├── engine/
│   ├── CellularAutomata.js   # CA simulation engine
│   ├── EmergenceEngineCore.js # Complex systems core
│   └── Metrics.js           # Performance and analytics
├── config/
│   ├── emergencePatterns.js  # Predefined CA patterns
│   └── emergenceRules.js     # CA rule definitions
├── styles/
│   ├── enhanced-material.css  # Material Design 3 styling
│   ├── EmergenceEngine.css   # Complex systems styling
│   ├── DvdBouncer.css        # DVD bouncer specific styles
│   └── DuckKonundrum.css     # Duck Konundrum puzzle styles
├── utils/
│   └── dvdLogic.js           # DVD bouncer physics
└── assets/                   # Static assets and resources
```

### Key Architectural Patterns

**Single Page Application (SPA)**: Built with React Router for client-side navigation and smooth user experience.

**Component-Based Architecture**: Modular React components for maintainability and reusability.

**Interactive Simulations**: Complex mathematical and physics simulations demonstrating computational thinking.

**Responsive Design**: Mobile-first design approach using Bootstrap 5 and custom CSS.

**Modern Build Tools**: Vite for fast development, hot module replacement, and optimized production builds.

## Core Features

### Portfolio Sections
- **Resume**: Professional experience, education, and skills
- **Bio**: Personal background and interests
- **Interactive Showcase**: Hub for interactive demonstrations and simulations

### Interactive Simulations
- **DVD Bouncer**: Physics simulation with collision detection and bouncing behavior
- **Breakout Game**: Classic arcade game implementation with TypeScript
- **Emergence Engine**: Cellular automata and complex systems visualization
- **Duck Konundrum**: MIT Mystery Hunt puzzle recreation with constraint solving

### Technical Demonstrations
- **React Hooks**: useState, useEffect, and custom hooks for state management
- **Game Physics**: Real-time collision detection, movement algorithms, and game loops
- **Complex Systems**: Cellular automata, emergence patterns, and system dynamics
- **Interactive UI**: Real-time controls, animations, and responsive design
- **TypeScript Integration**: Type-safe components and modern development practices

## Development Guidelines

### Dependencies and Stack
- **React 18**: Modern React with hooks and concurrent features
- **React Router DOM**: Client-side routing for SPA navigation
- **Bootstrap 5**: Responsive layout and component library
- **Lucide React**: Modern icon library
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety for select components

### Code Style and Conventions
- **Functional Components**: Use React hooks instead of class components
- **ES6+ JavaScript**: Modern JavaScript features and syntax
- **CSS Modules/Classes**: Scoped styling for component isolation
- **Semantic HTML**: Accessible and meaningful markup
- **Responsive Design**: Mobile-first approach with breakpoints
- **Performance**: Optimized rendering and efficient state management

### File Organization
- **Pages**: Top-level route components in `src/pages/`
- **Components**: Reusable UI components in `src/components/`
- **Styles**: Component-specific CSS in `src/styles/`
- **Utils**: Helper functions and utilities in `src/utils/`
- **Assets**: Images, fonts, and static resources in `src/assets/`

## Interactive Showcase Features

### DVD Bouncer
- Physics-based collision detection
- Smooth animation with requestAnimationFrame
- Color-changing effects on wall collisions
- Pause/resume functionality

### Breakout Game
- Classic paddle and ball mechanics
- Brick destruction with scoring
- Real-time collision detection
- Game state management

### Emergence Engine
- Multiple cellular automata patterns (Conway's Game of Life, Rule 30, etc.)
- Real-time visualization with canvas rendering
- Interactive controls for rule modification
- Pattern analysis and metrics

### Duck Konundrum Puzzle
- Recreation of MIT Mystery Hunt puzzle
- Step-by-step simulation of constraint solving
- Interactive puzzle progression
- Educational visualization of logical reasoning

## Portfolio Goals

### Professional Showcase
- Demonstrate React development expertise
- Show proficiency in modern web technologies
- Highlight problem-solving and algorithmic thinking
- Display interactive and engaging user experiences

### Technical Skills Demonstration
- **Frontend Development**: React, JavaScript, TypeScript, CSS
- **Game Development**: Physics simulation, real-time rendering, game loops
- **Complex Systems**: Mathematical modeling, cellular automata, emergence
- **UI/UX Design**: Responsive design, user interaction, visual design
- **Software Engineering**: Code organization, performance optimization, maintainability

### Educational Value
- Interactive learning experiences
- Mathematical and computational concepts visualization
- Game development techniques demonstration
- Complex systems and emergence pattern exploration

## Testing and Quality

### Development Workflow
- Hot module replacement for fast development
- Modern browser developer tools integration
- Responsive design testing across devices
- Performance monitoring and optimization

### Code Quality
- Consistent code formatting and style
- Semantic component naming and organization
- Efficient state management and rendering
- Accessibility considerations and best practices

## Deployment and Hosting

### Firebase Hosting
- Automated deployment pipeline
- CDN distribution for global performance
- HTTPS/SSL certificate management
- Custom domain configuration

### Build Optimization
- Vite production build optimization
- Code splitting and lazy loading
- Asset optimization and compression
- Performance metrics and monitoring

## Future Enhancements

### Potential Additions
- More interactive simulations and games
- 3D graphics with Three.js or WebGL
- Data visualization components
- Blog or project documentation
- Contact form and portfolio CMS
- Dark/light theme switching
- Animation library integration (Framer Motion)

### Technical Improvements
- Progressive Web App (PWA) features
- Service worker for offline capability
- Advanced state management (Redux/Zustand)
- Component testing with Jest and React Testing Library
- End-to-end testing with Cypress or Playwright
⏺ Cameron's Developer Portfolio - Codebase Map

  devPortfolio/
  ├── 📋 CLAUDE.md                    # AI assistant project
   guide
  ├── 🔧 Configuration Files
  │   ├── package.json               # Dependencies and
  scripts
  │   ├── vite.config.js            # Vite build
  configuration
  │   ├── firebase.json             # Firebase hosting
  config
  │   └── index.html                # Main HTML entry point
  │
  ├── 📁 public/
  │   └── cd_favicon.png            # Site favicon
  │
  └── 📁 src/                       # Main source code
      ├── 🚀 Core Application
      │   ├── main.jsx              # React app entry point
      │   └── App.jsx               # Main app component 
  with routing
      │
      ├── 🧩 Components
      │   └── Navbar.jsx            # Site navigation 
  component
      │
      ├── 📄 Pages
      │   ├── Bio.jsx               # About/biography page
      │   ├── Resume.jsx            # Professional 
  experience
      │   ├── Projects.jsx          # Project portfolio
      │   ├── InteractiveShowcase.jsx # Demo hub
      │   ├── DvdBouncer.jsx        # DVD screensaver 
  simulation
      │   ├── Breakout.tsx          # Breakout game 
  (TypeScript)
      │   ├── EmergenceEngine.jsx   # Cellular automata 
  simulator
      │   └── DuckKonundrum.jsx     # MIT Mystery Hunt 
  puzzle
      │
      ├── ⚙️ Engine & Logic
      │   ├── engine/
      │   │   ├── CellularAutomata.js    # CA simulation 
  core
      │   │   ├── EmergenceEngineCore.js # Complex systems 
  engine
      │   │   └── Metrics.js             # Performance 
  analytics
      │   ├── config/
      │   │   ├── emergencePatterns.js   # Predefined CA 
  patterns
      │   │   └── emergenceRules.js      # CA rule 
  definitions
      │   └── utils/
      │       └── dvdLogic.js            # DVD physics 
  calculations
      │
      ├── 🎨 Styling
      │   ├── enhanced-material.css      # Material Design 3
   theme
      │   ├── EmergenceEngine.css        # Complex systems 
  UI
      │   ├── DvdBouncer.css            # DVD bouncer styles
      │   └── DuckKonundrum.css         # Puzzle game styles
      │
      ├── 🎯 Context
      │   └── ThemeContext.jsx          # Theme management
      │
      └── 📦 assets/                    # Static resources

  🏗️ Architecture Overview

  Tech Stack: React 18 + Vite + Bootstrap 5 + Firebase
  Pattern: Single Page Application (SPA) with client-side
  routing
  Features: Interactive simulations, games, and portfolio
  showcase

  🎮 Interactive Demonstrations

  - DVD Bouncer: Physics simulation with collision detection
  - Breakout Game: Classic arcade game in TypeScript
  - Emergence Engine: Cellular automata visualization
  - Duck Konundrum: MIT Mystery Hunt puzzle recreation