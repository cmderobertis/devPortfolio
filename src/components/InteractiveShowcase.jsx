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
    // Add more pages here as they are created
  ];

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>sim and interactive</h1>
      {pages.map((page) => (
        <div key={page.path} style={cardStyle}>
          <h2>{page.title}</h2>
          <p>{page.description}</p>
          <Link to={page.path} style={linkStyle}>
            Visit Page
          </Link>
        </div>
      ))}
    </div>
  );
};

export default InteractiveShowcase;
