import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Body from "./components/Body"
import InteractiveShowcase from "./components/InteractiveShowcase";
import DvdBouncer from "./components/DvdBouncer"; // Import the new DVD component
import Breakout from "./components/Breakout"; // Import the Breakout game component
import EmergenceEngine from "./components/EmergenceEngine"; // Added import

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
                <Route path="/" element={<Body />} />
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
