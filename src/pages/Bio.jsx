import React from 'react';

const Bio = () => {
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          {/* Hero Section */}
          <div className="text-center mb-5">
            <div className="card shadow-lg border-0 position-relative overflow-hidden">
              <div className="card-body py-5">
                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                  <div className="bg-gradient-primary h-100" style={{background: 'linear-gradient(135deg, #1976d2, #0288d1)'}}></div>
                </div>
                <div className="position-relative">
                  <h1 className="display-4 fw-bold text-primary mb-3">Cameron De Robertis</h1>
                  <p className="lead fs-4 text-muted mb-4">
                    Where Critical Care Meets Clean Code
                  </p>
                  <div className="d-flex justify-content-center">
                    <div className="d-flex gap-3 flex-wrap">
                      <span className="badge bg-primary fs-6 px-3 py-2">App Developer</span>
                      <span className="badge bg-success fs-6 px-3 py-2">Retired ICU Nurse</span>
                      <span className="badge bg-info fs-6 px-3 py-2">Problem Solver</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Journey Introduction */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-2 text-center mb-3 mb-md-0">
                  <i className="fas fa-route fa-3x text-primary"></i>
                </div>
                <div className="col-md-10">
                  <h4 className="text-primary mb-3">An Unconventional Journey</h4>
                  <p className="lead">
                    My path into software development follows a unique trajectory—one that began in the 
                    high-stakes environment of a Cardiothoracic-Surgical ICU and evolved into the equally 
                    dynamic world of application development. This distinctive background has fundamentally 
                    shaped my approach to coding: methodical, user-focused, and deeply collaborative.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Building for Tomorrow */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h4 className="text-primary mb-4">
                <i className="fas fa-rocket me-2"></i>
                Building for Tomorrow
              </h4>
              <p>
                The transition from healthcare to technology wasn't just a career change—it was a natural evolution. 
                Both fields require systematic thinking, proactive problem-solving, and collaborative teamwork toward 
                solutions that genuinely matter.
              </p>
              
              <div className="row mt-4">
                <div className="col-md-4 mb-3">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body text-center">
                      <i className="fas fa-desktop fa-3x text-info mb-3"></i>
                      <h6 className="text-info">98ish</h6>
                      <p className="small">
                        Nostalgic desktop environments through modern React architecture
                      </p>
                      <div className="d-flex justify-content-center gap-2">
                        <a href="https://simul8-98ish.web.app" target="_blank" rel="noopener noreferrer" 
                           className="btn btn-sm btn-outline-info">
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                        <a href="https://github.com/Simul8-OS/98ish" target="_blank" rel="noopener noreferrer" 
                           className="btn btn-sm btn-outline-secondary">
                          <i className="fab fa-github"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body text-center">
                      <i className="fas fa-film fa-3x text-danger mb-3"></i>
                      <h6 className="text-danger">ReDirector</h6>
                      <p className="small">
                        Social platform where writers and film enthusiasts reimagine movie narratives
                      </p>
                      <div className="d-flex justify-content-center">
                        <a href="https://github.com/cmderobertis/ReDirector" target="_blank" rel="noopener noreferrer" 
                           className="btn btn-sm btn-outline-secondary">
                          <i className="fab fa-github"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body text-center">
                      <i className="fas fa-sitemap fa-3x text-success mb-3"></i>
                      <h6 className="text-success">VisualDOM</h6>
                      <p className="small">
                        Elegant recursive algorithm for intuitive DOM structure visualization
                      </p>
                      <div className="d-flex justify-content-center">
                        <a href="https://github.com/cmderobertis/VisualDOM" target="_blank" rel="noopener noreferrer" 
                           className="btn btn-sm btn-outline-secondary">
                          <i className="fab fa-github"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What Drives Me */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h4 className="text-primary mb-4">
                <i className="fas fa-fire me-2"></i>
                What Drives Me
              </h4>
              <div className="row">
                <div className="col-md-8">
                  <p>
                    I'm energized by the challenge of making complex systems simple and accessible. 
                    There's something deeply satisfying about taking a chaotic problem—whether it's 
                    a critical patient scenario or a tangled codebase—and creating order, clarity, 
                    and functionality.
                  </p>
                  <p>
                    Beyond the technical aspects, I'm drawn to collaborative environments where ideas 
                    can flourish and team members can grow. The same patience and teaching ability that 
                    served me well training nursing students now helps me guide junior developers toward 
                    becoming confident, capable professionals.
                  </p>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <div className="mb-3">
                      <i className="fas fa-lightbulb fa-3x text-warning"></i>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <span className="badge bg-warning text-dark">Proactive Problem-Solving</span>
                      <span className="badge bg-warning text-dark">Technical Debt Prevention</span>
                      <span className="badge bg-warning text-dark">Sustainable Solutions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Looking Forward */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h4 className="text-primary mb-4">
                <i className="fas fa-telescope me-2"></i>
                Looking Forward
              </h4>
              <p>
                Technology continues to evolve at an incredible pace, and that's precisely what makes 
                this field so compelling. Every project presents new challenges, new opportunities to 
                learn, and new ways to create meaningful impact.
              </p>
              
              <div className="row mt-4">
                <div className="col-md-6">
                  <h6 className="text-secondary">
                    <i className="fas fa-cogs me-2"></i>
                    Technical Excellence
                  </h6>
                  <ul className="list-unstyled ps-3">
                    <li><i className="fas fa-chevron-right text-primary me-2"></i>Advanced state management</li>
                    <li><i className="fas fa-chevron-right text-primary me-2"></i>Seamless API integration</li>
                    <li><i className="fas fa-chevron-right text-primary me-2"></i>Intuitive UI design</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-secondary">
                    <i className="fas fa-heart me-2"></i>
                    Core Values
                  </h6>
                  <ul className="list-unstyled ps-3">
                    <li><i className="fas fa-chevron-right text-success me-2"></i>Reliability under pressure</li>
                    <li><i className="fas fa-chevron-right text-success me-2"></i>Clear communication</li>
                    <li><i className="fas fa-chevron-right text-success me-2"></i>Consistent performance</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 border-start border-4 border-primary bg-light">
                <p className="mb-0 fst-italic">
                  <strong>My background in high-pressure healthcare environments has taught me that excellence 
                  isn't just about technical skill—it's about reliability, communication, and the ability to 
                  perform consistently when it matters most.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Personal Touch */}
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h6 className="text-secondary mb-2">
                    <i className="fas fa-user me-2"></i>
                    Beyond the Code
                  </h6>
                  <p className="mb-0 small text-muted">
                    When I'm not coding, you'll find me at the movies, working through logic puzzles, 
                    exploring new technologies, or diving into computer games that showcase innovative 
                    design and mechanics.
                  </p>
                </div>
                <div className="col-md-4 text-center">
                  <div className="d-flex justify-content-center gap-3">
                    <i className="fas fa-film fa-2x text-muted"></i>
                    <i className="fas fa-puzzle-piece fa-2x text-muted"></i>
                    <i className="fas fa-gamepad fa-2x text-muted"></i>
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

export default Bio;