import React from 'react';
import { 
  Typography, 
  Container, 
  Section, 
  Grid, 
  Button 
} from '../design-system';
// Using Material Design 3 global styles from enhanced-material.css

const Bio = () => {
  return (
    <Section spacing="large">
      <Container maxWidth="md">
        
        {/* Hero Section - Clean and Minimal */}
        <div className="hero-section">
          <Typography variant="display-large" className="hero-title" align="center">
            Cameron De Robertis
          </Typography>
          
          
          {/* Role Tags - Material Design Pills */}
          <div className="tag-container">
            <span className="content-tag">App Developer III - Technical Supervisor</span>
            <span className="content-tag">Retired ICU Nurse</span>
            <span className="content-tag">Problem Solver</span>
          </div>
        </div>

        {/* Journey Section */}
        <div className="content-section">
          <Typography variant="headline-small" color="primary" className="section-title">
            An Unconventional Journey
          </Typography>
          <Typography variant="body-large" className="section-content">
            My path into software development follows a unique trajectory—one that began in the 
            high-stakes environment of a Cardiothoracic-Surgical ICU and evolved into the equally 
            dynamic world of application development. This distinctive background has fundamentally 
            shaped my approach to coding: methodical, user-focused, and deeply collaborative.
          </Typography>
        </div>

        {/* Projects Section */}
        <div className="content-section">
          <Typography variant="headline-small" color="primary" className="content-section-title">
            Building for Tomorrow
          </Typography>
          <Typography variant="body-large" className="content-section-content">
            The transition from healthcare to technology wasn't just a career change—it was a natural evolution. 
            Both fields require systematic thinking, proactive problem-solving, and collaborative teamwork toward 
            solutions that genuinely matter.
          </Typography>
          
          {/* Projects Grid - Clean Material Cards */}
          <Grid container spacing={3} className="project-grid">
            <Grid item xs={12} md={4}>
              <div className="project-card">
                <div className="project-icon">
                  <i className="fas fa-desktop"></i>
                </div>
                <Typography variant="title-medium" className="project-title">
                  98ish
                </Typography>
                <Typography variant="body-medium" color="on-surface-variant" className="project-description">
                  Nostalgic desktop environments through modern React architecture
                </Typography>
                <div className="project-actions">
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => window.open('https://simul8-98ish.web.app', '_blank')}
                    icon={<i className="fas fa-external-link-alt"></i>}
                  >
                    View Live
                  </Button>
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => window.open('https://github.com/Simul8-OS/98ish', '_blank')}
                    icon={<i className="fab fa-github"></i>}
                  >
                    GitHub
                  </Button>
                </div>
              </div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <div className="project-card">
                <div className="project-icon">
                  <i className="fas fa-film"></i>
                </div>
                <Typography variant="title-medium" className="project-title">
                  ReDirector
                </Typography>
                <Typography variant="body-medium" color="on-surface-variant" className="project-description">
                  Social platform where writers and film enthusiasts reimagine movie narratives
                </Typography>
                <div className="project-actions">
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => window.open('https://github.com/cmderobertis/ReDirector', '_blank')}
                    icon={<i className="fab fa-github"></i>}
                  >
                    GitHub
                  </Button>
                </div>
              </div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <div className="project-card">
                <div className="project-icon">
                  <i className="fas fa-sitemap"></i>
                </div>
                <Typography variant="title-medium" className="project-title">
                  VisualDOM
                </Typography>
                <Typography variant="body-medium" color="on-surface-variant" className="project-description">
                  Elegant recursive algorithm for intuitive DOM structure visualization
                </Typography>
                <div className="project-actions">
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => window.open('https://github.com/cmderobertis/VisualDOM', '_blank')}
                    icon={<i className="fab fa-github"></i>}
                  >
                    GitHub
                  </Button>
                </div>
              </div>
            </Grid>
          </Grid>
        </div>

        {/* What Drives Me Section */}
        <div className="content-section">
          <Typography variant="headline-small" color="primary" className="content-section-title">
            What Drives Me
          </Typography>
          <Typography variant="body-large" className="content-section-content">
            I'm energized by the challenge of making complex systems simple and accessible. 
            There's something deeply satisfying about taking a chaotic problem—whether it's 
            a critical patient scenario or a tangled codebase—and creating order, clarity, 
            and functionality.
          </Typography>
          <Typography variant="body-large" className="content-section-content">
            Beyond the technical aspects, I'm drawn to collaborative environments where ideas 
            can flourish and team members can grow. The same patience and teaching ability that 
            served me well training nursing students now helps me guide junior developers toward 
            becoming confident, capable professionals.
          </Typography>
        </div>

        {/* Skills Grid */}
        <Grid container spacing={4} className="bio-skills">
          <Grid item xs={12} md={6}>
            <div className="skills-section">
              <Typography variant="title-large" color="primary" className="skill-title">
                Technical Excellence
              </Typography>
              <div className="skill-list">
                <div className="skill-item">
                  <i className="fas fa-check-circle"></i>
                  <Typography variant="body-medium">Advanced state management</Typography>
                </div>
                <div className="skill-item">
                  <i className="fas fa-check-circle"></i>
                  <Typography variant="body-medium">Seamless API integration</Typography>
                </div>
                <div className="skill-item">
                  <i className="fas fa-check-circle"></i>
                  <Typography variant="body-medium">Intuitive UI design</Typography>
                </div>
              </div>
            </div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <div className="skills-section">
              <Typography variant="title-large" color="primary" className="skill-title">
                Core Values
              </Typography>
              <div className="skill-list">
                <div className="skill-item">
                  <i className="fas fa-heart"></i>
                  <Typography variant="body-medium">Reliability under pressure</Typography>
                </div>
                <div className="skill-item">
                  <i className="fas fa-heart"></i>
                  <Typography variant="body-medium">Clear communication</Typography>
                </div>
                <div className="skill-item">
                  <i className="fas fa-heart"></i>
                  <Typography variant="body-medium">Consistent performance</Typography>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>

        {/* Quote Section */}
        <div className="content-quote">
          <Typography variant="title-large" className="content-quote-text">
            "My background in high-pressure healthcare environments has taught me that excellence 
            isn't just about technical skill—it's about reliability, communication, and the ability to 
            perform consistently when it matters most."
          </Typography>
        </div>

        {/* Personal Interests */}
        <div className="content-section interests-section">
          <Typography variant="title-large" color="primary" className="content-section-title">
            Beyond the Code
          </Typography>
          <Typography variant="body-large" className="content-section-content">
            When I'm not coding, you'll find me at the movies, working through logic puzzles, 
            exploring new technologies, or diving into computer games that showcase innovative 
            design and mechanics.
          </Typography>
          <div className="interest-icons">
            <i className="fas fa-film"></i>
            <i className="fas fa-puzzle-piece"></i>
            <i className="fas fa-gamepad"></i>
          </div>
        </div>

      </Container>
    </Section>
  );
};

export default Bio;