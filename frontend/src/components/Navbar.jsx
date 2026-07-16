import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg jp-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span className="brand-icon">
            <i className="bi bi-briefcase-fill"></i>
          </span>
          Job Portal
        </Link>

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

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto ms-lg-3">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/") ? "active" : ""}`}
                to="/"
              >
                <i className="bi bi-house-door-fill"></i> Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/jobs") ? "active" : ""}`}
                to="/jobs"
              >
                <i className="bi bi-search"></i> Jobs
              </Link>
            </li>

            {token && role === "recruiter" && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                    to="/dashboard"
                  >
                    <i className="bi bi-speedometer2"></i> Dashboard
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/post-job") ? "active" : ""}`}
                    to="/post-job"
                  >
                    <i className="bi bi-plus-circle-fill"></i> Post Job
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/my-jobs") ? "active" : ""}`}
                    to="/my-jobs"
                  >
                    <i className="bi bi-folder-fill"></i> My Jobs
                  </Link>
                </li>
              </>
            )}

            {token && role === "candidate" && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/applications") ? "active" : ""}`}
                  to="/applications"
                >
                  <i className="bi bi-file-earmark-text-fill"></i> My Applications
                </Link>
              </li>
            )}

            {token && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/profile") ? "active" : ""}`}
                  to="/profile"
                >
                  <i className="bi bi-person-circle"></i> Profile
                </Link>
              </li>
            )}
          </ul>

          {!token ? (
            <div className="d-flex gap-2 mt-3 mt-lg-0">
              <Link className="btn btn-jp-outline btn-lift" to="/login">
                <i className="bi bi-box-arrow-in-right"></i> Login
              </Link>

              <Link className="btn btn-jp-primary btn-lift" to="/register">
                <i className="bi bi-person-plus-fill"></i> Register
              </Link>
            </div>
          ) : (
            <button
              className="btn btn-jp-danger btn-lift mt-3 mt-lg-0"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
