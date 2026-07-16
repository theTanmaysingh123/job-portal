import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

function ApplicationDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Fast path: the Applications list page already has this data and hands
  // it over via navigate() state, so we can render instantly without an
  // extra request. If the person refreshes the page directly (no state),
  // we fall back to re-fetching the full list and finding this one.
  const [application, setApplication] = useState(location.state?.application || null);
  const [loading, setLoading] = useState(!location.state?.application);

  useEffect(() => {
    if (!application) {
      fetchApplication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const found = res.data.find((app) => app._id === id);
      if (!found) {
        showToast("Application not found", "error");
        navigate("/applications");
        return;
      }
      setApplication(found);
    } catch (error) {
      console.log(error);
      showToast("Failed to load application", "error");
      navigate("/applications");
    } finally {
      setLoading(false);
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "Shortlisted") return "jp-badge-success";
    if (status === "Rejected") return "jp-badge-danger";
    return "jp-badge-warning";
  };

  const statusIcon = (status) => {
    if (status === "Shortlisted") return "bi-check-circle-fill";
    if (status === "Rejected") return "bi-x-circle-fill";
    return "bi-hourglass-split";
  };

  const matchScoreClass = (score) => {
    if (score >= 70) return "jp-badge-success";
    if (score >= 40) return "jp-badge-warning";
    return "jp-badge-danger";
  };

  if (loading) {
    return (
      <div className="container section-py text-center">
        <span className="spinner-border text-primary"></span>
      </div>
    );
  }

  if (!application) return null;

  const job = application.job;
  const recruiter = job?.postedBy;
  const hasMatchData =
    application.matchScore !== null && application.matchScore !== undefined;

  return (
    <div className="container section-py">
      <button
        className="btn btn-jp-outline btn-lift mb-4"
        style={{ color: "var(--jp-blue)", borderColor: "var(--jp-blue-tint-2)" }}
        onClick={() => navigate("/applications")}
      >
        <i className="bi bi-arrow-left"></i> Back to My Applications
      </button>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="jp-form-card jp-animate-up">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
              <div>
                <h3 className="mb-1">{job?.title || "Job no longer available"}</h3>
                {job?.company && (
                  <span className="jp-badge jp-badge-blue">
                    <i className="bi bi-building"></i> {job.company}
                  </span>
                )}
              </div>

              <span className={`jp-badge ${statusBadgeClass(application.status)} fs-6`}>
                <i className={`bi ${statusIcon(application.status)}`}></i>
                {application.status}
              </span>
            </div>

            {job && (
              <>
                <div className="jp-job-meta mb-3">
                  {job.location && (
                    <span className="jp-badge jp-badge-blue">
                      <i className="bi bi-geo-alt-fill"></i> {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className="jp-badge jp-badge-success">
                      <i className="bi bi-cash-stack"></i> ₹{job.salary}
                    </span>
                  )}
                  {job.jobType && (
                    <span className="jp-badge jp-badge-warning">
                      <i className="bi bi-clock-fill"></i> {job.jobType}
                    </span>
                  )}
                </div>

                {job.description && (
                  <div className="mb-4">
                    <h6 className="fw-display mb-2">
                      <i className="bi bi-file-text text-brand"></i> Job Description
                    </h6>
                    <p className="text-muted mb-0">{job.description}</p>
                  </div>
                )}
              </>
            )}

            {/* Resume-match results, if the recruiter has run "Analyze Resume Match" */}
            {hasMatchData && (
              <div className="jp-match-box mb-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className={`jp-badge ${matchScoreClass(application.matchScore)}`}>
                    <i className="bi bi-graph-up-arrow"></i> {application.matchScore}% Match
                  </span>
                </div>

                {application.matchedSkills?.length > 0 && (
                  <div className="mb-1">
                    <span className="text-muted small me-1">You have:</span>
                    {application.matchedSkills.map((s) => (
                      <span key={s} className="jp-skill-chip jp-skill-chip-good">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {application.missingSkills?.length > 0 && (
                  <div>
                    <span className="text-muted small me-1">Consider adding:</span>
                    {application.missingSkills.map((s) => (
                      <span key={s} className="jp-skill-chip jp-skill-chip-missing">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Shortlisted celebration + recruiter contact */}
            {application.status === "Shortlisted" && (
              <div className="jp-celebrate-banner mb-4">
                <div className="fw-semibold mb-1">
                  🎉 Congratulations! You've been shortlisted.
                </div>
                {recruiter ? (
                  <div className="small">
                    Reach out to the recruiter to take the next step:
                    <div className="mt-1">
                      <i className="bi bi-person-fill"></i> {recruiter.name}
                    </div>
                    <div>
                      <i className="bi bi-envelope-fill"></i> {recruiter.email}
                    </div>
                    {recruiter.phone && (
                      <div>
                        <i className="bi bi-telephone-fill"></i> {recruiter.phone}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="small">
                    Recruiter contact details aren't available for this job.
                  </div>
                )}
              </div>
            )}

            {application.status === "Pending" && (
              <div className="jp-badge jp-badge-slate">
                <i className="bi bi-hourglass-split"></i> Still awaiting a decision from the recruiter.
              </div>
            )}

            {application.status === "Rejected" && (
              <div className="jp-badge jp-badge-slate">
                <i className="bi bi-info-circle"></i> This application wasn't selected this time — keep applying!
              </div>
            )}

            {application.resume && (
              <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--jp-border)" }}>
                <a
                  href={`http://localhost:5000/${
                    application.resume.startsWith("uploads/")
                      ? application.resume
                      : `uploads/${application.resume}`
                  }`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-resume-download"
                >
                  <i className="bi bi-download"></i> View Submitted Resume
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail;
