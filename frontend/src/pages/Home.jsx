import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="jp-hero">
        <div className="container position-relative">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="jp-hero-badge jp-animate-up">
                <i className="bi bi-stars"></i> India's Trusted Hiring Platform
              </span>

              <h1 className="mt-3 jp-animate-up jp-delay-1">
                Find your dream job or the perfect candidate — faster.
              </h1>

              <p className="lead jp-animate-up jp-delay-2">
                Job Portal connects ambitious candidates with recruiters who
                are hiring right now. Search thousands of live openings or
                post a role and start shortlisting today.
              </p>

              <div className="d-flex flex-wrap gap-3 mt-4 jp-animate-up jp-delay-3">
                <Link to="/jobs" className="btn btn-jp-primary btn-lg btn-lift">
                  <i className="bi bi-search"></i> Browse Jobs
                </Link>

                <Link to="/register" className="btn btn-jp-outline btn-lg btn-lift">
                  <i className="bi bi-person-plus"></i> Get Started
                </Link>
              </div>

              <div className="jp-hero-chips jp-animate-up jp-delay-4">
                <span className="chip"><i className="bi bi-briefcase"></i> 1,000+ live roles</span>
                <span className="chip"><i className="bi bi-building"></i> 500+ hiring companies</span>
                <span className="chip"><i className="bi bi-lightning-charge"></i> Apply in one click</span>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div className="jp-hero-visual" style={{ minHeight: 360 }}>
                <div
                  className="jp-floating-card jp-float"
                  style={{ top: 10, left: 10 }}
                >
                  <span className="icon-box bg-blue-tint text-brand">
                    <i className="bi bi-check2-circle"></i>
                  </span>
                  <div>
                    <div>Application Shortlisted</div>
                    <small className="text-muted">Product Designer @ Nova</small>
                  </div>
                </div>

                <div
                  className="jp-floating-card jp-float"
                  style={{ top: 150, left: 90, animationDelay: "1.2s" }}
                >
                  <span
                    className="icon-box"
                    style={{ background: "var(--jp-success-bg)", color: "var(--jp-success)" }}
                  >
                    <i className="bi bi-graph-up-arrow"></i>
                  </span>
                  <div>
                    <div>92% Match Score</div>
                    <small className="text-muted">Frontend Engineer</small>
                  </div>
                </div>

                <div
                  className="jp-floating-card jp-float"
                  style={{ top: 280, left: 30, animationDelay: "0.6s" }}
                >
                  <span
                    className="icon-box"
                    style={{ background: "var(--jp-warning-bg)", color: "var(--jp-warning)" }}
                  >
                    <i className="bi bi-envelope-paper-fill"></i>
                  </span>
                  <div>
                    <div>New Applicant</div>
                    <small className="text-muted">Resume received</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="container section-py">
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <div className="jp-card jp-stat-card h-100">
              <span className="jp-stat-icon bg-blue-tint text-brand">
                <i className="bi bi-briefcase-fill"></i>
              </span>
              <div className="jp-stat-number">1,000+</div>
              <p className="mb-0">Active Jobs</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="jp-card jp-stat-card h-100">
              <span
                className="jp-stat-icon"
                style={{ background: "var(--jp-success-bg)", color: "var(--jp-success)" }}
              >
                <i className="bi bi-building"></i>
              </span>
              <div className="jp-stat-number">500+</div>
              <p className="mb-0">Companies</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="jp-card jp-stat-card h-100">
              <span
                className="jp-stat-icon"
                style={{ background: "var(--jp-warning-bg)", color: "var(--jp-warning)" }}
              >
                <i className="bi bi-people-fill"></i>
              </span>
              <div className="jp-stat-number">10K+</div>
              <p className="mb-0">Candidates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-blue-tint section-py">
        <div className="container">
          <div className="text-center mb-5">
            <span className="eyebrow">Why Job Portal</span>
            <h2 className="section-title mt-3">Built for serious job seekers and recruiters</h2>
            <p className="section-subtitle mx-auto mt-2">
              Everything you need to hire or get hired, without the noise.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="jp-card jp-feature">
                <span className="jp-feature-icon bg-blue-tint text-brand">
                  <i className="bi bi-lightning-charge-fill"></i>
                </span>
                <h4>Fast Hiring</h4>
                <p>Apply to jobs in one click and hear back faster from recruiters.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="jp-card jp-feature">
                <span
                  className="jp-feature-icon"
                  style={{ background: "var(--jp-success-bg)", color: "var(--jp-success)" }}
                >
                  <i className="bi bi-shield-check"></i>
                </span>
                <h4>Secure Platform</h4>
                <p>JWT-secured authentication and encrypted resume uploads, always.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="jp-card jp-feature">
                <span
                  className="jp-feature-icon"
                  style={{ background: "var(--jp-warning-bg)", color: "var(--jp-warning)" }}
                >
                  <i className="bi bi-globe2"></i>
                </span>
                <h4>Anywhere Access</h4>
                <p>Use Job Portal from your phone, tablet, or desktop — anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="container section-py">
        <div className="text-center mb-5">
          <span className="eyebrow">Trusted by</span>
          <h2 className="section-title mt-3">Companies hiring on Job Portal</h2>
        </div>

        <div className="row g-3 text-center">
          {["Google", "Amazon", "Microsoft", "Infosys", "TCS", "Wipro"].map((c) => (
            <div className="col-6 col-md-2" key={c}>
              <div className="jp-company-pill">{c}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="jp-footer pt-5 pb-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5>
                <i className="bi bi-briefcase-fill text-brand"></i> Job Portal
              </h5>
              <p className="mb-3">
                India's smart job portal connecting candidates and recruiters.
              </p>
              <div className="d-flex gap-2">
                <a href="#" className="social-icon"><i className="bi bi-facebook"></i></a>
                <a href="#" className="social-icon"><i className="bi bi-twitter-x"></i></a>
                <a href="#" className="social-icon"><i className="bi bi-linkedin"></i></a>
                <a href="#" className="social-icon"><i className="bi bi-instagram"></i></a>
              </div>
            </div>

            <div className="col-6 col-md-2">
              <h6>For Candidates</h6>
              <ul className="list-unstyled">
                <li><Link to="/jobs">Browse Jobs</Link></li>
                <li><Link to="/register">Create Account</Link></li>
              </ul>
            </div>

            <div className="col-6 col-md-2">
              <h6>For Recruiters</h6>
              <ul className="list-unstyled">
                <li><Link to="/post-job">Post a Job</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>

            <div className="col-md-4">
              <h6>Contact</h6>
              <p className="mb-1"><i className="bi bi-envelope-fill me-2"></i>support@jobportal.com</p>
              <p className="mb-0"><i className="bi bi-telephone-fill me-2"></i>+91 98765 43210</p>
            </div>
          </div>

          <hr className="border-secondary my-4" />

          <p className="text-center mb-0 small">
            © 2026 Job Portal. All rights reserved | Built with MERN Stack
          </p>
        </div>
      </footer>
    </>
  );
}

export default Home;
