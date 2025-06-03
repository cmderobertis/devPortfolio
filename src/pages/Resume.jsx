import React from 'react';

const Resume = () => {

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          {/* Header Section */}
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center py-4">
              <h1 className="display-5 fw-bold text-primary mb-2">Cameron De Robertis</h1>
              <p className="lead text-muted mb-3">
                App Developer ✦ Retired ICU Nurse ✦ Problem Solver
              </p>
              <div className="row justify-content-center">
                <div className="col-md-8">
                  <div className="d-flex flex-wrap justify-content-center gap-3 small">
                    <a href="mailto:cmderobertis@gmail.com" className="text-decoration-none">
                      <i className="fas fa-envelope me-1"></i>
                      cmderobertis@gmail.com
                    </a>
                    <span className="text-muted">|</span>
                    <span>
                      <i className="fas fa-phone me-1"></i>
                      (661) 904-3866
                    </span>
                    <span className="text-muted">|</span>
                    <a href="https://www.linkedin.com/in/cmderobertis/" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                      <i className="fab fa-linkedin me-1"></i>
                      LinkedIn
                    </a>
                    <span className="text-muted">|</span>
                    <a href="http://www.github.com/cmderobertis" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                      <i className="fab fa-github me-1"></i>
                      GitHub
                    </a>
                    <span className="text-muted">|</span>
                    <a href="https://cmderobertis.net" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                      <i className="fas fa-globe me-1"></i>
                      Portfolio
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-primary">
                    <i className="fas fa-user-circle me-2"></i>
                    Strengths
                  </h5>
                  <p className="card-text">
                    Writes clean code, considerate of end user, highly collaborative, 
                    thorough, communicates precisely
                  </p>
                  <h6 className="text-secondary mt-3">Hobbies/Interests</h6>
                  <p className="card-text small">
                    Going to the movies, logic puzzles, learning new things, computer games
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-primary">
                    <i className="fas fa-tools me-2"></i>
                    Technical Skills
                  </h5>
                  <div className="mb-3">
                    <h6 className="text-secondary">Databases</h6>
                    <p className="card-text small">SQL Server, MySQL, MongoDB, Mongoose</p>
                  </div>
                  <div>
                    <h6 className="text-secondary">Tools</h6>
                    <p className="card-text small">
                      AWS(EC2), AJAX, REST API, PostMan, MySQL Workbench, Git, Github
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Projects Section */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h3 className="card-title text-primary mb-4">
                <i className="fas fa-code me-2"></i>
                Projects
              </h3>
              
              {/* Project 1 */}
              <div className="mb-4 pb-4 border-bottom">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-1">98ish</h5>
                  <div>
                    <a href="https://simul8-98ish.web.app" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary me-2">
                      <i className="fas fa-external-link-alt me-1"></i>
                      Live Demo
                    </a>
                    <a href="https://github.com/Simul8-OS/98ish" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                      <i className="fab fa-github me-1"></i>
                      GitHub
                    </a>
                  </div>
                </div>
                <p className="text-muted small mb-2">JavaScript/React/Express/Socket.io/Bootstrap</p>
                <p className="mb-2"><em>An interactive simulation of a desktop environment in a nostalgic style</em></p>
                <ul className="list-unstyled">
                  <li>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Deployed an efficient, cloud-hosted application, employing advanced state management techniques with React Hooks to reduce code reuse, resulting in an effectively modularized product
                  </li>
                </ul>
              </div>

              {/* Project 2 */}
              <div className="mb-4 pb-4 border-bottom">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-1">ReDirector</h5>
                  <a href="https://github.com/cmderobertis/ReDirector" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                    <i className="fab fa-github me-1"></i>
                    GitHub
                  </a>
                </div>
                <p className="text-muted small mb-2">Python/Flask/MySQL/SQLAlchemy/Bootstrap</p>
                <p className="mb-2"><em>A Reddit-inspired Social platform for writers and cinephiles</em></p>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Created a MySQL database and connected TMDB API to easily load targeted movie data and provide users a Reddit-like experience for re-writing movie plots
                  </li>
                  <li>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Implemented a secure login/registration protocol, leveraging bcrypt hashing to protect user data
                  </li>
                </ul>
              </div>

              {/* Project 3 */}
              <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-1">VisualDOM</h5>
                  <a href="https://github.com/cmderobertis/VisualDOM" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                    <i className="fab fa-github me-1"></i>
                    GitHub
                  </a>
                </div>
                <p className="text-muted small mb-2">JavaScript/CSS</p>
                <p className="mb-2"><em>A developer-friendly visualization tool of DOM elements on a rendered HTML document</em></p>
                <ul className="list-unstyled">
                  <li>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Applied an original recursive algorithm to programmatically generate an intuitive, color-coded diagram with ID, class, and element names nested elements
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-primary mb-4">
                <i className="fas fa-graduation-cap me-2"></i>
                Education
              </h3>
              
              {/* Coding Dojo */}
              <div className="mb-4 pb-4 border-bottom">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="mb-1">Coding Dojo Software Engineering Bootcamp</h5>
                    <h6 className="text-success mb-0">Highest Honors</h6>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold">Burbank, CA</div>
                    <div className="text-muted">2022</div>
                  </div>
                </div>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="fas fa-trophy text-warning me-2"></i>
                    Awarded "Best Overall Project" twice, for projects each built in a one-week sprint during Project Week
                  </li>
                  <li>
                    <i className="fas fa-users text-info me-2"></i>
                    Led additional algorithm practice sessions, tutored and mentored students
                  </li>
                </ul>
              </div>

              {/* University */}
              <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="mb-1">California State University - BS Nursing</h5>
                    <h6 className="text-primary mb-0">GPA: 3.6</h6>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold">Long Beach, CA</div>
                    <div className="text-muted">2012-2016</div>
                  </div>
                </div>
                <div className="mt-3">
                  <h6 className="text-secondary">Honors Received:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-warning text-dark">Outstanding Student Citation</span>
                    <span className="badge bg-warning text-dark">President's Honor List</span>
                    <span className="badge bg-warning text-dark">Dean's List</span>
                    <span className="badge bg-warning text-dark">Joan M. Strathdee Weenig Nursing Scholarship</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;