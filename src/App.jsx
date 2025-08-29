import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Bio from "./pages/Bio"
import Resume from "./pages/Resume"
import InteractiveShowcase from "./pages/InteractiveShowcase";
import DvdBouncer from "./pages/DvdBouncer"; // Import the new DVD component
import Breakout from "./pages/Breakout"; // Import the Breakout game component
import EmergenceEngine from "./pages/EmergenceEngine"; // Added import
import DuckKonundrum from "./pages/DuckKonundrum"; // Import Duck Konundrum puzzle
import Prisms from "./pages/Prisms"; // Import Prism Simulation
import Prisms3D from "./pages/Prisms3D"; // Import 3D Prism Simulation
import GameOfLife from "./pages/GameOfLife"; // Import Game of Life
import MazeStudio from "./pages/MazeStudio"; // Import Maze Studio
import DatabaseEditor from "./pages/DatabaseEditor"; // Import Database Editor
import "./styles/enhanced-material.css" // Import enhanced Material 3 styling
//import "bootstrap/dist/css/bootstrap.min.css" // Import Bootstrap CSS
import { ThemeProvider } from "./context/ThemeContext"; // Import ThemeProvider

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
            <Route path="/sim-interactive/dvd" element={<DvdBouncer />} />
            <Route path="/sim-interactive/breakout" element={<Breakout />} />
            <Route path="/sim-interactive/emergence" element={<EmergenceEngine />} /> {/* Added route */}
            <Route path="/sim-interactive/duck-konundrum" element={<DuckKonundrum />} /> {/* Duck Konundrum puzzle */}
            <Route path="/sim-interactive/prisms" element={<Prisms />} /> {/* Prism Simulation */}
            <Route path="/sim-interactive/prisms3d" element={<Prisms3D />} /> {/* 3D Prism Simulation */}
            <Route path="/sim-interactive/gameoflife" element={<GameOfLife />} /> {/* Game of Life */}
            <Route path="/sim-interactive/maze" element={<MazeStudio />} /> {/* Maze Studio */}
            <Route path="/sim-interactive/database-editor" element={<DatabaseEditor />} /> {/* Database Editor */}
            {/* Add other non-fullscreen routes here */}
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
