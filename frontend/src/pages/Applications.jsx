import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

function Applications() {
  const [applications, setApplications] = useState([]);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplications(res.data);
      checkForNewShortlists(res.data);
    } catch (error) {
      console.log(error);
      showToast("Failed to load applications", "error");
    }
  };

  // Compares the freshly-fetched applications against what we've already
  // congratulated the candidate for (tracked in localStorage), and shows a
  // one-time celebratory toast for any application that just became
  // "Shortlisted" since the last visit to this page.
  const checkForNewShortlists = (data) => {
    const seen = JSON.parse(localStorage.getItem("seenShortlisted") || "[]");

    const newlyShortlisted = data.filter(
      (app) => app.status === "Shortlisted" && !seen.includes(app._id)
    );

    if (newlyShortlisted.length > 0) {
      newlyShortlisted.forEach((app) => {
        showToast(
          `🎉 Congratulations! You've been shortlisted for "${app.job?.title || "a job"}"!`,
          "success",
          6000
        );
      });

      const updatedSeen = [...seen, ...newlyShortlisted.map((a) => a._id)];
      localStorage.setItem("seenShortlisted", JSON.stringify(updatedSeen));
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "Shortlisted") return "jp-badge-success";
    if (status === "Rejected") return "jp-badge-danger";
    return "jp-badge-warning";
  };

  const statusDotClass = (status) => {
    if (status === "Shortlisted") return "success";
    if (status === "Rejected") return "danger";
    return "warning";
  };

  const statusIcon = (status) => {
    if (status === "Shortlisted") return "bi-check-circle-fill";
    if (status === "Rejected") return "bi-x-circle-fill";
    return "bi-hourglass-split";
  };

  return (
    <div className="container">
      <div className="jp-page-header">
        <h2>
          <i className="bi bi-file-earmark-text-fill text-brand"></i> My Applications
        </h2>
        <p className="text-muted mb-0">Track the status of every job you've applied to.</p>
      </div>

      {applications.length === 0 ? (
        <div className="jp-empty-state mb-5">
          <i className="bi bi-file-earmark-x"></i>
          <h5>No applications found</h5>
          <p className="text-muted mb-0">Browse jobs and apply to see them show up here.</p>
        </div>
      ) : (
        <div className="jp-timeline pb-5">
          {applications.map((app) => {
            const recruiter = app.job?.postedBy;
            const isShortlisted = app.status === "Shortlisted";

            return (
              <div className="jp-timeline-item" key={app._id}>
                <span className={`jp-timeline-dot ${statusDotClass(app.status)}`}></span>

                <div
                  className={`jp-timeline-card jp-timeline-card-clickable ${
                    isShortlisted ? "jp-timeline-card-celebrate" : ""
                  }`}
                  onClick={() =>
                    navigate(`/applications/${app._id}`, { state: { application: app } })
                  }
                  role="button"
                >
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                    <div>
                      <h5 className="fw-display mb-1">
                        {app.job?.title || "Job no longer available"}
                      </h5>
                      <span className="jp-badge jp-badge-blue">
                        <i className="bi bi-building"></i> {app.job?.company || "-"}
                      </span>
                    </div>

                    <span className={`jp-badge ${statusBadgeClass(app.status)}`}>
                      <i className={`bi ${statusIcon(app.status)}`}></i>
                      {app.status}
                    </span>
                  </div>

                  {isShortlisted && (
                    <div className="jp-celebrate-banner mt-3">
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

                  <div className="text-end mt-2">
                    <span className="small text-muted">
                      View details <i className="bi bi-arrow-right"></i>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Applications;
