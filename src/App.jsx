import React, { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Bio from "./pages/Bio"
import Resume from "./pages/Resume"
import InteractiveShowcase from "./pages/InteractiveShowcase";
import "./styles/enhanced-material.css" // Import enhanced Material 3 styling
//import "bootstrap/dist/css/bootstrap.min.css" // Import Bootstrap CSS
import { ThemeProvider } from "./context/ThemeContext"; // Import ThemeProvider

// Lazy load all simulation pages for better performance
const DvdBouncer = lazy(() => import("./pages/DvdBouncer"));
const Breakout = lazy(() => import("./pages/Breakout"));
const EmergenceEngine = lazy(() => import("./pages/EmergenceEngine"));
const DuckKonundrum = lazy(() => import("./pages/DuckKonundrum"));
const Prisms = lazy(() => import("./pages/Prisms"));
const Prisms3D = lazy(() => import("./pages/Prisms3D"));
const GameOfLife = lazy(() => import("./pages/GameOfLife"));
const MazeStudio = lazy(() => import("./pages/MazeStudio"));
const DatabaseEditor = lazy(() => import("./pages/DatabaseEditor"));

// Loading component for lazy loaded routes
const LoadingFallback = () => (
  <div className="surface-container" style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '400px' 
  }}>
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p className="on-surface-text">Loading simulation...</p>
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
                <Suspense fallback={<LoadingFallback />}>
                  <DvdBouncer />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/breakout" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Breakout />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/emergence" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <EmergenceEngine />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/duck-konundrum" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <DuckKonundrum />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/prisms" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Prisms />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/prisms3d" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Prisms3D />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/gameoflife" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <GameOfLife />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/maze" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <MazeStudio />
                </Suspense>
              } 
            />
            <Route 
              path="/sim-interactive/database-editor" 
              element={
                <Suspense fallback={<LoadingFallback />}>
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
