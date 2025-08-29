import React, { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Bio from "./pages/Bio"
import Resume from "./pages/Resume"
import InteractiveShowcase from "./pages/InteractiveShowcase";
import PerformanceMonitor, { usePerformanceMonitorToggle } from "./components/PerformanceMonitor";
import "./styles/enhanced-material.css" // Import enhanced Material 3 styling
import "./styles/performance-optimization.css" // Import performance optimization styles
//import "bootstrap/dist/css/bootstrap.min.css" // Import Bootstrap CSS
import { ThemeProvider } from "./context/ThemeContext"; // Import ThemeProvider

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

// Loading fallback component for simulations
const SimulationLoader = () => (
  <div className="simulation-loader">
    <div className="simulation-skeleton">
      <div className="skeleton-header"></div>
      <div className="skeleton-canvas"></div>
      <div className="skeleton-controls">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* Conditionally render Navbar unless it's the DVD route */}
        <div className="navbar-fixed">
          <Navbar />
        </div>
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Resume />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/about" element={<Bio />} />
            <Route path="/sim-interactive" element={<InteractiveShowcase />} />
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
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
