import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Body from "./components/Body"
import Bio from "./pages/Bio"
import Resume from "./pages/Resume"
import InteractiveShowcase from "./pages/InteractiveShowcase";
import DvdBouncer from "./pages/DvdBouncer"; // Import the new DVD component
import Breakout from "./pages/Breakout"; // Import the Breakout game component
import EmergenceEngine from "./pages/EmergenceEngine"; // Added import
import "./styles/enhanced-material.css" // Import enhanced Material 3 styling
import "bootstrap/dist/css/bootstrap.min.css" // Import Bootstrap CSS
import "./context/ThemeContext"; // Import ThemeContext for theme management

function App() {
  return (
    <>
      <BrowserRouter>
        {/* Conditionally render Navbar unless it's the DVD route */}
        <Routes>
          <Route path="/*" element={ // Wrap other routes
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Resume />} />
                <Route path="/projects" element={<Body />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/about" element={<Bio />} />
                <Route path="/sim-interactive" element={<InteractiveShowcase />} />
                <Route path="/sim-interactive/dvd" element={<DvdBouncer />} />
                <Route path="/sim-interactive/breakout" element={<Breakout />} />
                <Route path="/sim-interactive/emergence" element={<EmergenceEngine />} /> {/* Added route */}
                {/* Add other non-fullscreen routes here */}
              </Routes>
            </>
          }/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
