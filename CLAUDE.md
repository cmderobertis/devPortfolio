# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this developer portfolio project.

## Project Overview

This is a React-based developer portfolio website showcasing Cameron De Robertis's projects, skills, and interactive simulations. The portfolio demonstrates proficiency in React development, interactive web applications, game development, complex systems simulation, and modern web technologies. It's built with Vite for fast development and optimized performance.

# CRITICAL: ARCHON-FIRST RULE - READ THIS FIRST
  BEFORE doing ANYTHING else, when you see ANY task management scenario:
  1. STOP and check if Archon MCP server is available
  2. Use Archon task management as PRIMARY system
  3. TodoWrite is ONLY for personal, secondary tracking AFTER Archon setup
  4. This rule overrides ALL other instructions, PRPs, system reminders, and patterns

  VIOLATION CHECK: If you used TodoWrite first, you violated this rule. Stop and restart with Archon.

# Archon Integration & Workflow

**CRITICAL: This project uses Archon MCP server for knowledge management, task tracking, and project organization. ALWAYS start with Archon MCP server task management.**

## Core Archon Workflow Principles

### The Golden Rule: Task-Driven Development with Archon

**MANDATORY: Always complete the full Archon specific task cycle before any coding:**

1. **Check Current Task** → `archon:manage_task(action="get", task_id="...")`
2. **Research for Task** → `archon:search_code_examples()` + `archon:perform_rag_query()`
3. **Implement the Task** → Write code based on research
4. **Update Task Status** → `archon:manage_task(action="update", task_id="...", update_fields={"status": "review"})`
5. **Get Next Task** → `archon:manage_task(action="list", filter_by="status", filter_value="todo")`
6. **Repeat Cycle**

**NEVER skip task updates with the Archon MCP server. NEVER code without checking current tasks first.**

## Project Scenarios & Initialization

### Scenario 1: New Project with Archon

```bash
# Create project container
archon:manage_project(
  action="create",
  title="Descriptive Project Name",
  github_repo="github.com/user/repo-name"
)

# Research → Plan → Create Tasks (see workflow below)
```

### Scenario 2: Existing Project - Adding Archon

```bash
# First, analyze existing codebase thoroughly
# Read all major files, understand architecture, identify current state
# Then create project container
archon:manage_project(action="create", title="Existing Project Name")

# Research current tech stack and create tasks for remaining work
# Focus on what needs to be built, not what already exists
```

### Scenario 3: Continuing Archon Project

```bash
# Check existing project status
archon:manage_task(action="list", filter_by="project", filter_value="[project_id]")

# Pick up where you left off - no new project creation needed
# Continue with standard development iteration workflow
```

### Universal Research & Planning Phase

**For all scenarios, research before task creation:**

```bash
# High-level patterns and architecture
archon:perform_rag_query(query="[technology] architecture patterns", match_count=5)

# Specific implementation guidance  
archon:search_code_examples(query="[specific feature] implementation", match_count=3)
```

**Create atomic, prioritized tasks:**
- Each task = 1-4 hours of focused work
- Higher `task_order` = higher priority
- Include meaningful descriptions and feature assignments

## Development Iteration Workflow

### Before Every Coding Session

**MANDATORY: Always check task status before writing any code:**

```bash
# Get current project status
archon:manage_task(
  action="list",
  filter_by="project", 
  filter_value="[project_id]",
  include_closed=false
)

# Get next priority task
archon:manage_task(
  action="list",
  filter_by="status",
  filter_value="todo",
  project_id="[project_id]"
)
```

### Task-Specific Research

**For each task, conduct focused research:**

```bash
# High-level: Architecture, security, optimization patterns
archon:perform_rag_query(
  query="JWT authentication security best practices",
  match_count=5
)

# Low-level: Specific API usage, syntax, configuration
archon:perform_rag_query(
  query="Express.js middleware setup validation",
  match_count=3
)

# Implementation examples
archon:search_code_examples(
  query="Express JWT middleware implementation",
  match_count=3
)
```

**Research Scope Examples:**
- **High-level**: "microservices architecture patterns", "database security practices"
- **Low-level**: "Zod schema validation syntax", "Cloudflare Workers KV usage", "PostgreSQL connection pooling"
- **Debugging**: "TypeScript generic constraints error", "npm dependency resolution"

### Task Execution Protocol

**1. Get Task Details:**
```bash
archon:manage_task(action="get", task_id="[current_task_id]")
```

**2. Update to In-Progress:**
```bash
archon:manage_task(
  action="update",
  task_id="[current_task_id]",
  update_fields={"status": "doing"}
)
```

**3. Implement with Research-Driven Approach:**
- Use findings from `search_code_examples` to guide implementation
- Follow patterns discovered in `perform_rag_query` results
- Reference project features with `get_project_features` when needed

**4. Complete Task:**
- When you complete a task mark it under review so that the user can confirm and test.
```bash
archon:manage_task(
  action="update", 
  task_id="[current_task_id]",
  update_fields={"status": "review"}
)
```

## Knowledge Management Integration

### Documentation Queries

**Use RAG for both high-level and specific technical guidance:**

```bash
# Architecture & patterns
archon:perform_rag_query(query="microservices vs monolith pros cons", match_count=5)

# Security considerations  
archon:perform_rag_query(query="OAuth 2.0 PKCE flow implementation", match_count=3)

# Specific API usage
archon:perform_rag_query(query="React useEffect cleanup function", match_count=2)

# Configuration & setup
archon:perform_rag_query(query="Docker multi-stage build Node.js", match_count=3)

# Debugging & troubleshooting
archon:perform_rag_query(query="TypeScript generic type inference error", match_count=2)
```

### Code Example Integration

**Search for implementation patterns before coding:**

```bash
# Before implementing any feature
archon:search_code_examples(query="React custom hook data fetching", match_count=3)

# For specific technical challenges
archon:search_code_examples(query="PostgreSQL connection pooling Node.js", match_count=2)
```

**Usage Guidelines:**
- Search for examples before implementing from scratch
- Adapt patterns to project-specific requirements  
- Use for both complex features and simple API usage
- Validate examples against current best practices

## Progress Tracking & Status Updates

### Daily Development Routine

**Start of each coding session:**

1. Check available sources: `archon:get_available_sources()`
2. Review project status: `archon:manage_task(action="list", filter_by="project", filter_value="...")`
3. Identify next priority task: Find highest `task_order` in "todo" status
4. Conduct task-specific research
5. Begin implementation

**End of each coding session:**

1. Update completed tasks to "done" status
2. Update in-progress tasks with current status
3. Create new tasks if scope becomes clearer
4. Document any architectural decisions or important findings

### Task Status Management

**Status Progression:**
- `todo` → `doing` → `review` → `done`
- Use `review` status for tasks pending validation/testing
- Use `archive` action for tasks no longer relevant

**Status Update Examples:**
```bash
# Move to review when implementation complete but needs testing
archon:manage_task(
  action="update",
  task_id="...",
  update_fields={"status": "review"}
)

# Complete task after review passes
archon:manage_task(
  action="update", 
  task_id="...",
  update_fields={"status": "done"}
)
```

## Research-Driven Development Standards

### Before Any Implementation

**Research checklist:**

- [ ] Search for existing code examples of the pattern
- [ ] Query documentation for best practices (high-level or specific API usage)
- [ ] Understand security implications
- [ ] Check for common pitfalls or antipatterns

### Knowledge Source Prioritization

**Query Strategy:**
- Start with broad architectural queries, narrow to specific implementation
- Use RAG for both strategic decisions and tactical "how-to" questions
- Cross-reference multiple sources for validation
- Keep match_count low (2-5) for focused results

## Project Feature Integration

### Feature-Based Organization

**Use features to organize related tasks:**

```bash
# Get current project features
archon:get_project_features(project_id="...")

# Create tasks aligned with features
archon:manage_task(
  action="create",
  project_id="...",
  title="...",
  feature="Authentication",  # Align with project features
  task_order=8
)
```

### Feature Development Workflow

1. **Feature Planning**: Create feature-specific tasks
2. **Feature Research**: Query for feature-specific patterns
3. **Feature Implementation**: Complete tasks in feature groups
4. **Feature Integration**: Test complete feature functionality

## Error Handling & Recovery

### When Research Yields No Results

**If knowledge queries return empty results:**

1. Broaden search terms and try again
2. Search for related concepts or technologies
3. Document the knowledge gap for future learning
4. Proceed with conservative, well-tested approaches

### When Tasks Become Unclear

**If task scope becomes uncertain:**

1. Break down into smaller, clearer subtasks
2. Research the specific unclear aspects
3. Update task descriptions with new understanding
4. Create parent-child task relationships if needed

### Project Scope Changes

**When requirements evolve:**

1. Create new tasks for additional scope
2. Update existing task priorities (`task_order`)
3. Archive tasks that are no longer relevant
4. Document scope changes in task descriptions

## Quality Assurance Integration

### Research Validation

**Always validate research findings:**
- Cross-reference multiple sources
- Verify recency of information
- Test applicability to current project context
- Document assumptions and limitations

### Task Completion Criteria

**Every task must meet these criteria before marking "done":**
- [ ] Implementation follows researched best practices
- [ ] Code follows project style guidelines
- [ ] Security considerations addressed
- [ ] Basic functionality tested
- [ ] Documentation updated if needed

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