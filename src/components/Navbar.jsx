import React from "react"
import { NavLink } from "react-router-dom"

const Navbar = () => {
  return (
    <div className="App">
      <div className="sticky-top">
        <nav className="navbar navbar-expand-sm navbar-dark bg-primary">
          <div className="container-lg">
            <NavLink className="navbar-brand text-center" to={"/"}>
              <h2 className="fw-bold mb-0">Cameron De Robertis</h2>
            </NavLink>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className="justify-content-end collapse navbar-collapse"
              id="navbarNav"
            >
              <ul className="navbar-nav">
                <li className="nav-item text-end">
                  <a className="nav-link" href="#">
                    resume
                  </a>
                </li>
                <li className="nav-item text-end">
                  <a className="nav-link" href="#">
                    experience
                  </a>
                </li>
                <NavLink className="nav-item text-end" to={"/projects"}>
                  <a className="nav-link">projects</a>
                </NavLink>
                <li className="nav-item text-end">
                  <button className="btn btn-info">contact</button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Navbar
