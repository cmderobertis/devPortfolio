# Cameron DeRobertis - Developer Portfolio

A modern React-based portfolio website showcasing interactive simulations, games, and web development projects. Built with Vite for optimal performance and developer experience.

## 🚀 Live Demo

[Visit Portfolio](https://your-firebase-url.web.app)

## ✨ Features

- **Interactive Simulations**: Cellular automata, complex systems, and physics simulations
- **Classic Games**: Breakout, DVD Bouncer, and puzzle recreations
- **Professional Portfolio**: Resume, bio, and project showcase
- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Modern React**: Hooks, context, and functional components
- **Fast Development**: Vite build system with hot module replacement

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router DOM
- **Build Tool**: Vite
- **Styling**: Bootstrap 5, Custom CSS, Material Design 3
- **Icons**: Lucide React, FontAwesome
- **Hosting**: Firebase Hosting
- **Languages**: JavaScript, TypeScript (select components)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/cmderobertis/devPortfolio.git
cd devPortfolio

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── App.jsx                    # Main application component
├── main.jsx                   # Application entry point
├── components/
│   └── Navbar.jsx            # Navigation component
├── pages/
│   ├── Bio.jsx               # Biography page
│   ├── Resume.jsx            # Professional experience
│   ├── InteractiveShowcase.jsx # Interactive demos hub
│   ├── DvdBouncer.jsx        # DVD screensaver simulation
│   ├── Breakout.tsx          # Breakout game
│   ├── EmergenceEngine.jsx   # Cellular automata engine
│   └── DuckKonundrum.jsx     # MIT Mystery Hunt puzzle
├── engine/
│   ├── CellularAutomata.js   # CA simulation core
│   ├── EmergenceEngineCore.js # Complex systems engine
│   └── Metrics.js           # Performance analytics
├── config/
│   ├── emergencePatterns.js  # Predefined CA patterns
│   └── emergenceRules.js     # CA rule definitions
├── context/
│   └── ThemeContext.jsx      # Theme management
├── styles/
│   ├── enhanced-material.css  # Main styling
│   ├── EmergenceEngine.css   # Simulation styles
│   ├── DvdBouncer.css        # DVD bouncer styles
│   └── DuckKonundrum.css     # Puzzle styles
├── utils/
│   └── dvdLogic.js           # Physics calculations
└── assets/                   # Static resources
```

## 🎮 Interactive Demos

### DVD Bouncer
Physics-based simulation with collision detection and color-changing effects.

### Breakout Game
Classic arcade game implementation with TypeScript, featuring:
- Paddle and ball mechanics
- Brick destruction with scoring
- Real-time collision detection

### Emergence Engine
Cellular automata visualization supporting:
- Conway's Game of Life
- Rule 30 and other elementary CAs
- Custom pattern loading
- Real-time rule modification

### Duck Konundrum
Recreation of an MIT Mystery Hunt puzzle demonstrating:
- Constraint solving algorithms
- Step-by-step puzzle progression
- Interactive logical reasoning

## 🚀 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally

### Development Guidelines

- Use functional components with React hooks
- Follow existing code style and conventions
- Implement responsive design patterns
- Optimize performance with efficient rendering
- Write semantic, accessible HTML

## 📱 Responsive Design

The portfolio is built mobile-first with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 992px
- Desktop: > 992px

## 🎨 Design System

Based on Material Design 3 principles with custom enhancements:
- Consistent spacing and typography
- Accessible color contrast
- Smooth animations and transitions
- Modern UI components

## 🔧 Configuration

### Firebase Hosting

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  }
}
```

### Vite Configuration

Optimized for React development with fast refresh and efficient bundling.

## 📈 Performance

- Vite for fast development and optimized builds
- Code splitting and lazy loading
- Efficient state management
- Canvas-based animations for smooth performance

## 🧪 Testing

Currently using manual testing. Future enhancements may include:
- Jest and React Testing Library for unit tests
- Cypress or Playwright for E2E testing
- Performance monitoring and analytics

## 🤝 Contributing

This is a personal portfolio project. For suggestions or feedback, please open an issue.

## 📄 License

Private project - All rights reserved.

## 🔗 Links

- **Portfolio**: [Live Site](https://your-firebase-url.web.app)
- **GitHub**: [Repository](https://github.com/cmderobertis/devPortfolio)
- **LinkedIn**: [Cameron DeRobertis](https://linkedin.com/in/cameronderobertis)

---

*Built with ❤️ using React and modern web technologies*