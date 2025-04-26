import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Body from "./components/Body"
import Projects from "./components/Projects"
import InteractiveShowcase from "./components/InteractiveShowcase";
import DvdBouncer from "./components/DvdBouncer"; // Import the new DVD component

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
                 {/* <Route path="/projects" element={<Projects />} /> */}
                 <Route path="/sim-interactive" element={<InteractiveShowcase />} />
                 <Route path="/sim-interactive/dvd" element={<DvdBouncer />} />
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
