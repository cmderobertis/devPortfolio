import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Container } from './design-system';

const InteractivePageWrapper = ({ children }) => {
  const location = useLocation();

  // Define all interactive pages with their icons
  const pages = [
    {
      path: "/sim-interactive/dvd",
      title: "DVD Bouncer",
      icon: "fas fa-tv"
    },
    {
      path: "/sim-interactive/breakout",
      title: "Breakout Game",
      icon: "fas fa-gamepad"
    },
    {
      path: "/sim-interactive/emergence",
      title: "Emergence Engine",
      icon: "fas fa-sitemap"
    },
    {
      path: "/sim-interactive/duck-konundrum",
      title: "Duck Konundrum",
      icon: "fas fa-puzzle-piece"
    },
    {
      path: "/sim-interactive/prisms",
      title: "Prism Light Dispersion",
      icon: "fas fa-lightbulb"
    },
    {
      path: "/sim-interactive/prisms3d",
      title: "3D Prism Light Simulation",
      icon: "fas fa-cube"
    },
    {
      path: "/sim-interactive/gameoflife",
      title: "Conway's Game of Life",
      icon: "fas fa-th"
    },
    {
      path: "/sim-interactive/maze",
      title: "Maze Studio",
      icon: "fas fa-route"
    },
    {
      path: "/sim-interactive/database-editor",
      title: "Database Editor",
      icon: "fas fa-database"
    }
  ];

  const currentPath = location.pathname;

  return (
    <div className="interactive-page-wrapper">
      {/* Navigation Header */}
      <div className="bg-surface border-bottom shadow-sm">
        <Container maxWidth="xl">
          <div className="d-flex align-items-center justify-content-between py-3">
            {/* Back Button */}
            <Link to="/sim-interactive">
              <Button 
                variant="outlined" 
                size="medium"
                icon={<i className="fas fa-arrow-left me-2"></i>}
              >
                Back to Showcase
              </Button>
            </Link>

            {/* Page Icons Navigation */}
            <div className="d-flex align-items-center gap-2">
              {pages.map((page) => {
                const isActive = currentPath === page.path;
                return (
                  <Link
                    key={page.path}
                    to={page.path}
                    className="text-decoration-none"
                    title={page.title}
                  >
                    <div
                      className={`
                        p-3 rounded-circle d-flex align-items-center justify-content-center
                        transition-all duration-200 cursor-pointer
                        ${isActive 
                          ? 'bg-primary text-on-primary shadow-md border-2 border-primary' 
                          : 'bg-surface-variant text-on-surface-variant hover:bg-primary hover:text-on-primary hover:shadow-sm'
                        }
                      `}
                      style={{
                        width: '48px',
                        height: '48px',
                        border: isActive ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline-variant)'
                      }}
                    >
                      <i className={`${page.icon} fa-lg`}></i>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Container>
      </div>

      {/* Page Content */}
      <div className="interactive-page-content">
        {children}
      </div>
    </div>
  );
};

export default InteractivePageWrapper;