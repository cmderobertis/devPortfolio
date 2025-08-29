import { useState, useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import { Button, Typography } from "../design-system"
import { ThemeToggleWithColorSelector } from "./ThemeToggle"
import "./Navbar.css"

const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const location = useLocation();

  // Close side panel when route changes
  useEffect(() => {
    setIsSidePanelOpen(false);
  }, [location]);

  // Interactive modules data
  const modules = [
    {
      path: "/sim-interactive/dvd",
      title: "DVD Bouncer",
      description: "Classic bouncing DVD logo simulation with collision detection",
      category: "Simulations",
      type: "simulation",
      icon: "fas fa-tv"
    },
    {
      path: "/sim-interactive/breakout",
      title: "Breakout Game",
      description: "Classic arcade game with paddle controls and brick destruction",
      category: "Games",
      type: "game",
      icon: "fas fa-gamepad"
    },
    {
      path: "/sim-interactive/emergence",
      title: "Emergence Engine",
      description: "Complex systems and cellular automata simulations",
      category: "Simulations",
      type: "simulation",
      icon: "fas fa-sitemap"
    },
    {
      path: "/sim-interactive/duck-konundrum",
      title: "Duck Konundrum",
      description: "MIT Mystery Hunt puzzle recreation with constraint solving",
      category: "Games",
      type: "game",
      icon: "fas fa-puzzle-piece"
    },
    {
      path: "/sim-interactive/prisms",
      title: "Prism Light Dispersion",
      description: "Real-time physics simulation of light refraction",
      category: "Simulations",
      type: "simulation",
      icon: "fas fa-lightbulb"
    },
    {
      path: "/sim-interactive/prisms3d",
      title: "3D Prism Light Simulation",
      description: "Advanced 3D light simulation with ray tracing",
      category: "Simulations",
      type: "simulation",
      icon: "fas fa-cube"
    },
    {
      path: "/sim-interactive/gameoflife",
      title: "Conway's Game of Life",
      description: "Classic cellular automaton with Windows 98 styling",
      category: "Simulations",
      type: "simulation",
      icon: "fas fa-th"
    },
    {
      path: "/sim-interactive/maze",
      title: "Maze Studio",
      description: "Interactive maze generator with 2D/3D rendering",
      category: "Tools",
      type: "tool",
      icon: "fas fa-route"
    },
    {
      path: "/sim-interactive/database-editor",
      title: "Database Editor",
      description: "Professional localStorage database management tool",
      category: "Tools",
      type: "tool",
      icon: "fas fa-database"
    }
  ];

  // Filter modules based on search and type
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || module.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const stats = {
    total: modules.length,
    games: modules.filter(m => m.type === "game").length,
    simulations: modules.filter(m => m.type === "simulation").length,
    tools: modules.filter(m => m.type === "tool").length
  };

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const closeSidePanel = () => {
    setIsSidePanelOpen(false);
  };

  return (
    <>
      <div className="App">
        <div className="sticky-top">
          <nav className={`navbar navbar-expand-lg ${resolvedTheme === 'dark' ? 'navbar-dark' : 'navbar-light'}`}>
            <div className="container-lg">
              {/* Brand Icon */}
              <NavLink className="navbar-brand d-flex align-items-center" to={"/"}>
                <img 
                  src="/cd_favicon.png" 
                  alt="Cameron De Robertis" 
                  width="40" 
                  height="40"
                  className="brand-icon"
                />
              </NavLink>

              {/* Desktop Navigation */}
              <div className="d-none d-lg-flex align-items-center">
                <ul className="navbar-nav me-auto">
                  <li className="nav-item">
                    <NavLink className="nav-link" to={"/resume"}>
                      resume
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to={"/about"}>
                      about
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to={"/sim-interactive"}>
                      projects
                    </NavLink>
                  </li>
                </ul>
                
                <ThemeToggleWithColorSelector 
                  variant="default" 
                  size="medium" 
                  className="me-2" 
                />
                <Button
                  variant="filled"
                  size="medium"
                  href="mailto:cmderobertis@gmail.com"
                  className="me-3"
                >
                  contact me
                </Button>
              </div>

              {/* Mobile Controls - Theme Toggle Always Visible + Hamburger */}
              <div className="d-flex d-lg-none align-items-center">
                <ThemeToggleWithColorSelector 
                  variant="default" 
                  size="small" 
                  className="me-2" 
                />
                <button
                  className="navbar-toggler border-0"
                  type="button"
                  onClick={toggleSidePanel}
                  aria-label="Toggle navigation"
                  style={{ background: 'none', boxShadow: 'none' }}
                >
                  <div className={`hamburger-icon ${isSidePanelOpen ? 'open' : ''}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Side Panel Overlay */}
      {isSidePanelOpen && (
        <div className="side-panel-overlay" onClick={closeSidePanel}></div>
      )}

      {/* Animated Side Panel */}
      <div className={`side-panel ${isSidePanelOpen ? 'open' : ''}`}>
        <div className="side-panel-header">
          <Typography variant="headline-small" className="mb-3">
            Portfolio Navigation
          </Typography>
          
          {/* Stats */}
          <div className="stats-grid mb-4">
            <div className="stat-item">
              <Typography variant="title-large" color="primary">{stats.total}</Typography>
              <Typography variant="body-small" color="on-surface-variant">Total</Typography>
            </div>
            <div className="stat-item">
              <Typography variant="title-medium" color="secondary">{stats.games}</Typography>
              <Typography variant="body-small" color="on-surface-variant">Games</Typography>
            </div>
            <div className="stat-item">
              <Typography variant="title-medium" color="tertiary">{stats.simulations}</Typography>
              <Typography variant="body-small" color="on-surface-variant">Sims</Typography>
            </div>
            <div className="stat-item">
              <Typography variant="title-medium">{stats.tools}</Typography>
              <Typography variant="body-small" color="on-surface-variant">Tools</Typography>
            </div>
          </div>

          {/* Search */}
          <div className="search-container mb-3">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filter */}
          <div className="filter-container mb-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="game">Games</option>
              <option value="simulation">Simulations</option>
              <option value="tool">Tools</option>
            </select>
          </div>
        </div>

        <div className="side-panel-content">
          {/* Main Navigation */}
          <div className="nav-section mb-4">
            <Typography variant="title-small" className="section-title mb-2">Main Pages</Typography>
            <NavLink to="/resume" className="nav-item" onClick={closeSidePanel}>
              <i className="fas fa-file-alt me-2"></i>Resume
            </NavLink>
            <NavLink to="/about" className="nav-item" onClick={closeSidePanel}>
              <i className="fas fa-user me-2"></i>About
            </NavLink>
            <NavLink to="/sim-interactive" className="nav-item" onClick={closeSidePanel}>
              <i className="fas fa-rocket me-2"></i>Projects
            </NavLink>
          </div>

          {/* Module List */}
          <div className="modules-section">
            <Typography variant="title-small" className="section-title mb-2">
              Interactive Modules ({filteredModules.length})
            </Typography>
            <div className="modules-list">
              {filteredModules.map((module) => (
                <NavLink
                  key={module.path}
                  to={module.path}
                  className="module-item"
                  onClick={closeSidePanel}
                >
                  <div className="module-icon">
                    <i className={module.icon}></i>
                  </div>
                  <div className="module-info">
                    <Typography variant="label-large" className="module-title">
                      {module.title}
                    </Typography>
                    <Typography variant="body-small" color="on-surface-variant" className="module-description">
                      {module.description}
                    </Typography>
                    <span className={`module-type type-${module.type}`}>
                      {module.category}
                    </span>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="contact-section mt-4 pt-3" style={{borderTop: '1px solid var(--md-sys-color-outline-variant)'}}>
            <Button
              variant="filled"
              size="medium"
              href="mailto:cmderobertis@gmail.com"
              className="w-100"
            >
              <i className="fas fa-envelope me-2"></i>Contact Me
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar
