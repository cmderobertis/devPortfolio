import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Container } from './design-system';

const InteractivePageWrapper = ({ children }) => {
  const location = useLocation();
  const headerRef = useRef(null);

  // Set CSS custom property for header height
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--interactive-header-height', `${height}px`);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

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
      <div ref={headerRef} className="bg-surface border-bottom shadow-sm">
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
                      className="p-3 rounded-circle d-flex align-items-center justify-content-center transition-all duration-200 cursor-pointer"
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: isActive 
                          ? 'var(--md-sys-color-primary)' 
                          : 'var(--md-sys-color-surface-variant)',
                        color: isActive 
                          ? 'var(--md-sys-color-on-primary)' 
                          : 'var(--md-sys-color-on-surface-variant)',
                        border: isActive 
                          ? '2px solid var(--md-sys-color-primary)' 
                          : '1px solid var(--md-sys-color-outline-variant)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.target.style.backgroundColor = 'var(--md-sys-color-primary)';
                          e.target.style.color = 'var(--md-sys-color-on-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.target.style.backgroundColor = 'var(--md-sys-color-surface-variant)';
                          e.target.style.color = 'var(--md-sys-color-on-surface-variant)';
                        }
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