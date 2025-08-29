import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Container, 
  Section, 
  Grid, 
  Button 
} from '../design-system';

const Resume = () => {
  const contactLinks = [
    { 
      href: "mailto:cmderobertis@gmail.com", 
      icon: "fas fa-envelope", 
      text: "cmderobertis@gmail.com" 
    },
    { 
      href: "https://www.linkedin.com/in/cmderobertis/", 
      icon: "fab fa-linkedin", 
      text: "LinkedIn" 
    },
    { 
      href: "http://www.github.com/cmderobertis", 
      icon: "fab fa-github", 
      text: "GitHub" 
    },
  ];

  return (
    <Section spacing="medium">
      <Container maxWidth="lg">
        <Grid container spacing={4} className="justify-content-center">
          <Grid item xs={12} lg={10} xl={8}>
            
            {/* Header Section */}
            <Card variant="elevated" className="mb-4 text-center">
              <CardContent className="py-4">
                <Typography variant="display-small" color="primary" className="mb-2">
                  Cameron De Robertis
                </Typography>
                <Typography variant="headline-small" color="on-surface-variant" className="mb-3">
                  App Developer ✦ Retired ICU Nurse ✦ Problem Solver
                </Typography>
                
                <Grid container spacing={1} className="justify-content-center">
                  <Grid item xs={12} md={10}>
                    <div className="d-flex flex-wrap justify-content-center align-items-center gap-3">
                      {contactLinks.map((link, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <span className="text-muted d-none d-md-inline">|</span>}
                          {link.isPhone ? (
                            <Typography variant="body-small" component="span" className="d-flex align-items-center">
                              <i className={`${link.icon} me-1`}></i>
                              {link.text}
                            </Typography>
                          ) : (
                            <Typography 
                              variant="body-small" 
                              component="a" 
                              href={link.href}
                              target={link.href.startsWith('http') ? '_blank' : undefined}
                              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className="text-decoration-none d-flex align-items-center"
                            >
                              <i className={`${link.icon} me-1`}></i>
                              {link.text}
                            </Typography>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* About Section */}
            <Grid container spacing={3} className="mb-4">
              <Grid item xs={12} md={6}>
                <Card variant="outlined" className="h-100">
                  <CardContent>
                    <Typography variant="title-large" color="primary" className="mb-3">
                      <i className="fas fa-user-circle me-2"></i>
                      Strengths
                    </Typography>
                    <Typography variant="body-large" className="mb-3">
                      Writes clean code, considerate of end user, highly collaborative, 
                      thorough, communicates precisely
                    </Typography>
                    <Typography variant="title-medium" color="on-surface-variant" className="mt-3 mb-2">
                      Hobbies/Interests
                    </Typography>
                    <Typography variant="body-medium" color="on-surface-variant">
                      Going to the movies, logic puzzles, learning new things, computer games
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" className="h-100">
                  <CardContent>
                    <Typography variant="title-large" color="primary" className="mb-3">
                      <i className="fas fa-tools me-2"></i>
                      Technical Skills
                    </Typography>
                    <div className="mb-3">
                      <Typography variant="title-medium" color="on-surface-variant" className="mb-2">
                        Databases
                      </Typography>
                      <Typography variant="body-medium">
                        SQL Server, MySQL, MongoDB, Mongoose
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="title-medium" color="on-surface-variant" className="mb-2">
                        Tools
                      </Typography>
                      <Typography variant="body-medium">
                        AWS(EC2), AJAX, REST API, PostMan, MySQL Workbench, Git, Github
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Projects Section */}
            <Card variant="filled" className="mb-4">
              <CardContent>
                <Typography variant="headline-medium" color="primary" className="mb-4">
                  <i className="fas fa-code me-2"></i>
                  Projects
                </Typography>
                
                {/* Project 1 - 98ish */}
                <div className="mb-4 pb-4 border-bottom">
                  <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                    <Typography variant="title-large" className="mb-1">98ish</Typography>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => window.open('https://simul8-98ish.web.app', '_blank')}
                        icon={<i className="fas fa-external-link-alt me-1"></i>}
                      >
                        Live Demo
                      </Button>
                      <Button 
                        variant="text" 
                        size="small"
                        onClick={() => window.open('https://github.com/Simul8-OS/98ish', '_blank')}
                        icon={<i className="fab fa-github me-1"></i>}
                      >
                        GitHub
                      </Button>
                    </div>
                  </div>
                  <Typography variant="body-small" color="on-surface-variant" className="mb-2">
                    JavaScript/React/Express/Socket.io/Bootstrap
                  </Typography>
                  <Typography variant="body-medium" className="mb-2 fst-italic">
                    An interactive simulation of a desktop environment in a nostalgic style
                  </Typography>
                  <ul className="list-unstyled">
                    <li>
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <Typography variant="body-medium" component="span">
                        Deployed an efficient, cloud-hosted application, employing advanced state management techniques with React Hooks to reduce code reuse, resulting in an effectively modularized product
                      </Typography>
                    </li>
                  </ul>
                </div>

                {/* Project 2 - ReDirector */}
                <div className="mb-4 pb-4 border-bottom">
                  <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                    <Typography variant="title-large" className="mb-1">ReDirector</Typography>
                    <Button 
                      variant="text" 
                      size="small"
                      onClick={() => window.open('https://github.com/cmderobertis/ReDirector', '_blank')}
                      icon={<i className="fab fa-github me-1"></i>}
                    >
                      GitHub
                    </Button>
                  </div>
                  <Typography variant="body-small" color="on-surface-variant" className="mb-2">
                    Python/Flask/MySQL/SQLAlchemy/Bootstrap
                  </Typography>
                  <Typography variant="body-medium" className="mb-2 fst-italic">
                    A Reddit-inspired Social platform for writers and cinephiles
                  </Typography>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <Typography variant="body-medium" component="span">
                        Created a MySQL database and connected TMDB API to easily load targeted movie data and provide users a Reddit-like experience for re-writing movie plots
                      </Typography>
                    </li>
                    <li>
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <Typography variant="body-medium" component="span">
                        Implemented a secure login/registration protocol, leveraging bcrypt hashing to protect user data
                      </Typography>
                    </li>
                  </ul>
                </div>

                {/* Project 3 - VisualDOM */}
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                    <Typography variant="title-large" className="mb-1">VisualDOM</Typography>
                    <Button 
                      variant="text" 
                      size="small"
                      onClick={() => window.open('https://github.com/cmderobertis/VisualDOM', '_blank')}
                      icon={<i className="fab fa-github me-1"></i>}
                    >
                      GitHub
                    </Button>
                  </div>
                  <Typography variant="body-small" color="on-surface-variant" className="mb-2">
                    JavaScript/CSS
                  </Typography>
                  <Typography variant="body-medium" className="mb-2 fst-italic">
                    A developer-friendly visualization tool of DOM elements on a rendered HTML document
                  </Typography>
                  <ul className="list-unstyled">
                    <li>
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <Typography variant="body-medium" component="span">
                        Applied an original recursive algorithm to programmatically generate an intuitive, color-coded diagram with ID, class, and element names nested elements
                      </Typography>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card variant="elevated">
              <CardContent>
                <Typography variant="headline-medium" color="primary" className="mb-4">
                  <i className="fas fa-graduation-cap me-2"></i>
                  Education
                </Typography>
                
                {/* Coding Dojo */}
                <div className="mb-4 pb-4 border-bottom">
                  <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                    <div>
                      <Typography variant="title-large" className="mb-1">
                        Coding Dojo Software Engineering Bootcamp
                      </Typography>
                      <Typography variant="title-medium" color="secondary" className="mb-0">
                        Highest Honors
                      </Typography>
                    </div>
                    <div className="text-end">
                      <Typography variant="body-large" className="fw-bold">Burbank, CA</Typography>
                      <Typography variant="body-medium" color="on-surface-variant">2022</Typography>
                    </div>
                  </div>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="fas fa-trophy text-warning me-2"></i>
                      <Typography variant="body-medium" component="span">
                        Awarded "Best Overall Project" twice, for projects each built in a one-week sprint during Project Week
                      </Typography>
                    </li>
                    <li>
                      <i className="fas fa-users text-info me-2"></i>
                      <Typography variant="body-medium" component="span">
                        Led additional algorithm practice sessions, tutored and mentored students
                      </Typography>
                    </li>
                  </ul>
                </div>

                {/* University */}
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                    <div>
                      <Typography variant="title-large" className="mb-1">
                        California State University - BS Nursing
                      </Typography>
                      <Typography variant="title-medium" color="primary" className="mb-0">
                        GPA: 3.6
                      </Typography>
                    </div>
                    <div className="text-end">
                      <Typography variant="body-large" className="fw-bold">Long Beach, CA</Typography>
                      <Typography variant="body-medium" color="on-surface-variant">2012-2016</Typography>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Typography variant="title-medium" color="on-surface-variant" className="mb-2">
                      Honors Received:
                    </Typography>
                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge bg-warning text-dark">Outstanding Student Citation</span>
                      <span className="badge bg-warning text-dark">President's Honor List</span>
                      <span className="badge bg-warning text-dark">Dean's List</span>
                      <span className="badge bg-warning text-dark">Joan M. Strathdee Weenig Nursing Scholarship</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </Grid>
        </Grid>
      </Container>
    </Section>
  );
};

export default Resume;