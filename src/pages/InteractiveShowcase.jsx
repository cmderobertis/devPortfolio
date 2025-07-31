import React from 'react';
import { Link } from 'react-router-dom';

// Placeholder styles - you might want to use a library like Material UI for actual M3 components
const cardStyle = {
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  backgroundColor: '#fff',
  textAlign: 'center',
  width: '200px', // Give cards a fixed width
};

const containerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  padding: '20px',
  fontFamily: 'sans-serif', // Basic font
  minHeight: 'calc(100vh - 60px)', // Ensure it takes height minus navbar
  alignItems: 'flex-start', // Align cards to the top
};

const headingStyle = {
    width: '100%',
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
};

const linkStyle = {
    textDecoration: 'none',
    color: '#1976d2', // Material-like blue
    fontWeight: 'bold',
    display: 'block', // Make link take full width
    marginTop: '10px', // Add space above link
};

const InteractiveShowcase = () => {
  // List of pages to showcase
  const pages = [
    //{ path: '/', title: 'Home Page', description: 'The main landing page.' },
    //{ path: '/projects', title: 'Projects', description: 'Showcase of different projects.' },
    {
      path: "/sim-interactive/dvd",
      title: "DVD Bouncer",
      description: "Bouncing DVD logo",
    }, // Add the new DVD page
    {
      path: "/sim-interactive/breakout",
      title: "Breakout",
      description: "Breakout game",
    },
    { // New entry for Emergence Engine
      path: "/sim-interactive/emergence",
      title: "Emergence Engine",
      description: "Complex systems & cellular automata simulations."
    },
    { // Duck Konundrum puzzle
      path: "/sim-interactive/duck-konundrum",
      title: "Duck Konundrum",
      description: "MIT Mystery Hunt puzzle - Harold the duck and team members solve constraints to spell QUACK!"
    },
    { // Prism Simulation
      path: "/sim-interactive/prisms",
      title: "Prism Light Dispersion",
      description: "Real-time physics simulation of light refraction through a triangular prism, showing spectral dispersion."
    },
    { // 3D Prism Simulation
      path: "/sim-interactive/prisms3d",
      title: "3D Prism Light Dispersion",
      description: "Advanced 3D light simulation with interactive controls, multiple prism shapes, and realistic ray tracing in 3D space."
    },
    { // Game of Life
      path: "/sim-interactive/gameoflife",
      title: "Conway's Game of Life",
      description: "Classic cellular automaton simulation with Windows 98 styling, multiple themes, and interactive cell editing."
    }
    // Add more pages here as they are created
  ];

  return (
    <div style={containerStyle}>
      <h1 className="text-primary" style={headingStyle}>
        sim and interactive
      </h1>
      <div className="row">
        <div className="col-12 mb-4">
          {pages.map((page) => (
            <div key={page.path} className="card shadow-sm">
              <h2>{page.title}</h2>
              <p>{page.description}</p>
              <Link to={page.path} style={linkStyle}>
                Visit Page
              </Link>
            </div>
          ))}
        </div>
        </div>
      </div>
  );
};

export default InteractiveShowcase;
