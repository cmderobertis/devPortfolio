import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardActions,
  Typography, 
  Container, 
  Section, 
  Grid, 
  Button 
} from '../components/design-system';

const InteractiveShowcase = () => {
  // Interactive simulations and demos
  const simulations = [
    {
      path: "/sim-interactive/dvd",
      title: "DVD Bouncer",
      description: "Classic bouncing DVD logo simulation with collision detection and color-changing effects.",
      category: "Physics Simulation",
      icon: "fas fa-tv",
      color: "primary"
    },
    {
      path: "/sim-interactive/breakout",
      title: "Breakout Game",
      description: "Classic arcade game with paddle controls, brick destruction, and real-time collision detection.",
      category: "Game Development",
      icon: "fas fa-gamepad",
      color: "secondary"
    },
    {
      path: "/sim-interactive/emergence",
      title: "Emergence Engine",
      description: "Complex systems and cellular automata simulations with multiple rule sets and pattern analysis.",
      category: "Complex Systems",
      icon: "fas fa-sitemap",
      color: "tertiary"
    },
    {
      path: "/sim-interactive/duck-konundrum",
      title: "Duck Konundrum",
      description: "MIT Mystery Hunt puzzle recreation - Harold the duck and team members solve constraints to spell QUACK!",
      category: "Logic Puzzle",
      icon: "fas fa-puzzle-piece",
      color: "primary"
    },
    {
      path: "/sim-interactive/prisms",
      title: "Prism Light Dispersion",
      description: "Real-time physics simulation of light refraction through a triangular prism with spectral dispersion.",
      category: "Physics Simulation",
      icon: "fas fa-lightbulb",
      color: "secondary"
    },
    {
      path: "/sim-interactive/prisms3d",
      title: "3D Prism Light Simulation",
      description: "Advanced 3D light simulation with interactive controls, multiple prism shapes, and realistic ray tracing.",
      category: "3D Graphics",
      icon: "fas fa-cube",
      color: "tertiary"
    },
    {
      path: "/sim-interactive/gameoflife",
      title: "Conway's Game of Life",
      description: "Classic cellular automaton simulation with Windows 98 styling, multiple themes, and interactive cell editing.",
      category: "Cellular Automata",
      icon: "fas fa-th",
      color: "primary"
    },
    {
      path: "/sim-interactive/maze",
      title: "Maze Studio",
      description: "Interactive maze generator with 2D/3D rendering, multiple algorithms (DFS, Prim's), and pathfinding solvers (BFS, A*).",
      category: "Algorithm Visualization",
      icon: "fas fa-route",
      color: "secondary"
    },
    {
      path: "/sim-interactive/database-editor",
      title: "Database Editor",
      description: "Professional localStorage database management with visual schema editor, query builder, ERD generation, and comprehensive CRUD operations.",
      category: "Data Management",
      icon: "fas fa-database",
      color: "tertiary"
    }
  ];

  // Group simulations by category
  const groupedSimulations = simulations.reduce((acc, sim) => {
    if (!acc[sim.category]) {
      acc[sim.category] = [];
    }
    acc[sim.category].push(sim);
    return acc;
  }, {});

  const getCategoryIcon = (category) => {
    const iconMap = {
      "Physics Simulation": "fas fa-atom",
      "Game Development": "fas fa-gamepad",
      "Complex Systems": "fas fa-network-wired",
      "Logic Puzzle": "fas fa-brain",
      "3D Graphics": "fas fa-cube",
      "Cellular Automata": "fas fa-th-large",
      "Algorithm Visualization": "fas fa-project-diagram",
      "Data Management": "fas fa-database"
    };
    return iconMap[category] || "fas fa-cog";
  };

  return (
    <Section spacing="large">
      <Container maxWidth="xl">
        {/* Header Section */}
        <div className="text-center mb-5">
          <Typography variant="display-medium" color="primary" className="mb-3">
            Interactive pages Claude made under my direction
          </Typography>
          <Typography variant="headline-small" color="on-surface-variant" className="mb-4">
            Explore interactive demonstrations of physics, algorithms, games, and complex systems, all vibe coded using Claude Code.
          </Typography>
          <Typography variant="body-large" color="on-surface-variant" className="max-w-3xl mx-auto">
            Click on any card to experience interactive demonstrations
            of mathematical concepts and software engineering principles.
          </Typography>
        </div>

        
            <Grid container spacing={3}>
              {simulations.map((simulation) => (
                <Grid item xs={12} md={6} lg={4} key={simulation.path}>
                  <Link 
                    to={simulation.path} 
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
                  >
                    <Card variant="elevated" className="h-100" hover style={{ cursor: 'pointer' }}>
                      <CardContent>
                        <div className="d-flex align-items-center mb-3">
                          <div className={`p-3 rounded-circle bg-${simulation.color} bg-opacity-10 me-3`}>
                            <i className={`${simulation.icon} fa-2x text-${simulation.color}`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <Typography variant="title-large" className="mb-1">
                              {simulation.title}
                            </Typography>
                            <Typography variant="body-small" color="on-surface-variant">
                              {simulation.category}
                            </Typography>
                          </div>
                        </div>
                        
                        <Typography variant="body-medium" className="mb-4">
                          {simulation.description}
                        </Typography>
                      </CardContent>
                      
                      <CardActions align="end">
                        <Button 
                          variant="outlined" 
                          size="small"
                          icon={<i className="fas fa-play me-1"></i>}
                          onClick={(e) => e.preventDefault()} // Prevent double navigation
                        >
                          Launch
                        </Button>
                      </CardActions>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>

        {/* Footer Call-to-Action */}
        <Card variant="outlined" className="text-center mt-2 me-2">
          <CardContent className="py-5">
            <Typography variant="headline-small" color="primary" className="mb-3">
              Explore Interactive Learning
            </Typography>
            <Typography variant="body-large" color="on-surface-variant" className="mb-4">
              Unless otherwise noted, all of these were vibe coded using Claude Code and minor manual edits.
            </Typography>

          </CardContent>
        </Card>

      </Container>
    </Section>
  );
};

export default InteractiveShowcase;