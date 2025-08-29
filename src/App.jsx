import React, { Suspense, lazy, useEffect } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/Navbar"
import PerformanceMonitor, { usePerformanceMonitorToggle } from "./components/PerformanceMonitor";
// Import only critical styles synchronously
import "./styles/critical.css" // Essential styles for initial render
import "./styles/performance-optimization.css" // Performance optimization styles
import "./styles/accessibility.css" // WCAG 2.1 AA accessibility styles
import { ThemeProvider } from "./context/ThemeContext"; // Import ThemeProvider
import { initializeAccessibility, liveRegionManager } from "./utils/accessibility";

// PHASE 2: Route-level lazy loading for maximum bundle size reduction
// Main page components - lazy loaded for better performance
const Bio = lazy(() => import("./pages/Bio"));
const Resume = lazy(() => import("./pages/Resume"));
const InteractiveShowcase = lazy(() => import("./pages/InteractiveShowcase"));

// Lazy load heavy simulation components for better performance
const DvdBouncer = lazy(() => import("./pages/DvdBouncer"));
const Breakout = lazy(() => import("./pages/Breakout"));
const EmergenceEngine = lazy(() => import("./pages/EmergenceEngine"));
const DuckKonundrum = lazy(() => import("./pages/DuckKonundrum"));
const Prisms = lazy(() => import("./pages/Prisms"));
const Prisms3D = lazy(() => import("./pages/Prisms3D"));
const GameOfLife = lazy(() => import("./pages/GameOfLife"));
const GameOfLifeModern = lazy(() => import("./pages/GameOfLifeModern"));
const MazeStudio = lazy(() => import("./pages/MazeStudio"));
const DatabaseEditor = lazy(() => import("./pages/DatabaseEditor"));

// PHASE 2: Accessible loading components with screen reader announcements
// Loading fallback component for simulations
const SimulationLoader = () => {
  useEffect(() => {
    liveRegionManager.announceLoadingState('simulation', true);
    return () => liveRegionManager.announceLoadingState('simulation', false);
  }, []);

  return (
    <div 
      className="simulation-loader" 
      role="status" 
      aria-live="polite"
      aria-label="Loading simulation"
    >
      <div className="simulation-skeleton">
        <div className="skeleton-header"></div>
        <div className="skeleton-canvas"></div>
        <div className="skeleton-controls">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
      <span className="sr-only">Loading simulation, please wait...</span>
    </div>
  );
};

// Main content loader for page components
const PageLoader = ({ pageName }) => {
  useEffect(() => {
    liveRegionManager.announceLoadingState(pageName, true);
    return () => liveRegionManager.announceLoadingState(pageName, false);
  }, [pageName]);

  return (
    <div 
      className="page-loader" 
      role="status" 
      aria-live="polite"
      aria-label={`Loading ${pageName} page`}
      style={{
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div 
        className="loading-spinner"
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--md-sys-color-outline-variant)',
          borderTop: '3px solid var(--md-sys-color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}
      />
      <p style={{ 
        color: 'var(--md-sys-color-on-surface-variant)',
        fontSize: '0.875rem',
        margin: 0
      }}>
        Loading {pageName}...
      </p>
      <span className="sr-only">Loading {pageName} page, please wait...</span>
    </div>
  );
};

// Route change announcer component
const RouteAnnouncer = () => {
  const location = useLocation();

  useEffect(() => {
    const getPageName = (pathname) => {
      const routes = {
        '/': 'Resume',
        '/resume': 'Resume',
        '/about': 'About',
        '/sim-interactive': 'Interactive Projects'
      };
      
      // Handle dynamic routes
      if (pathname.startsWith('/sim-interactive/')) {
        const simulationName = pathname.split('/').pop();
        const names = {
          'dvd': 'DVD Bouncer',
          'breakout': 'Breakout Game',
          'emergence': 'Emergence Engine',
          'duck-konundrum': 'Duck Konundrum',
          'prisms': 'Prism Light Dispersion',
          'prisms3d': '3D Prism Simulation',
          'gameoflife': 'Conway\'s Game of Life',
          'gameoflife-modern': 'Modern Game of Life',
          'maze': 'Maze Studio',
          'database-editor': 'Database Editor'
        };
        return names[simulationName] || 'Interactive Project';
      }
      
      return routes[pathname] || 'Page';
    };

    const pageName = getPageName(location.pathname);
    liveRegionManager.announceRouteChange(pageName);
  }, [location]);

  return null;
};

function App() {
  // PHASE 2: Initialize accessibility and load heavy resources
  useEffect(() => {
    // Initialize accessibility features first
    initializeAccessibility();

    const loadHeavyStyles = async () => {
      // Load enhanced Material Design styles
      await import("./styles/enhanced-material.css");
      // Load theme transitions
      await import("./styles/theme-transitions.css");
      // Note: Bootstrap will be loaded dynamically by components that need it
    };
    
    // Delay loading of heavy styles to prioritize critical rendering path
    const timer = setTimeout(loadHeavyStyles, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <RouteAnnouncer />
        {/* PHASE 2: Add main landmark and skip-to-content target */}
        <div className="navbar-fixed">
          <Navbar />
        </div>
        <main 
          id="main-content" 
          className="main-content" 
          role="main"
          aria-label="Main content"
          tabIndex="-1"
        >
          <Routes>
            <Route 
              path="/" 
              element={
                <Suspense fallback={<PageLoader pageName="Resume" />}>
                  <Resume />
                </Suspense>
              } 
            />
            <Route 
              path="/resume" 
              element={
                <Suspense fallback={<PageLoader pageName="Resume" />}>
                  <Resume />
                </Suspense>
              } 
            />
            <Route 
              path="/about" 
              element={
                <Suspense fallback={<PageLoader pageName="About" />}>
                  <Bio />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive" 
              element={
                <Suspense fallback={<PageLoader pageName="Interactive Projects" />}>
                  <InteractiveShowcase />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/dvd" 
              element={
                <Suspense fallback={<SimulationLoader />}>
                  <DvdBouncer />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/breakout" 
              element={
                <Suspense fallback={<SimulationLoader />}>
                  <Breakout />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/emergence" 
              element={
                <Suspense fallback={<SimulationLoader />}>
                  <EmergenceEngine />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/duck-konundrum" 
              element={
                <Suspense fallback={<SimulationLoader />}>
                  <DuckKonundrum />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/prisms" 
              element={
                <Suspense fallback={<SimulationLoader />}>
                  <Prisms />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/prisms3d" 
              element={
                <Suspense fallback={<SimulationLoader />}>
                  <Prisms3D />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/gameoflife" 
              element={
                <Suspense fallback={<SimulationLoader />}>
                  <GameOfLife />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/gameoflife-modern" 
              element={
                <Suspense fallback={<SimulationLoader />}>
                  <GameOfLifeModern />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/maze" 
              element={
                <Suspense fallback={<SimulationLoader />}>
                  <MazeStudio />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/database-editor" 
              element={
                <Suspense fallback={<SimulationLoader />}>
                  <DatabaseEditor />
                </Suspense>
              } 
            />
            {/* Add other non-fullscreen routes here */}
          </Routes>
        </main>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
