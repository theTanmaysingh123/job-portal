import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

function MyJobs() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  // Job pending delete confirmation (holds the job's _id, or null)
  const [jobToDelete, setJobToDelete] = useState(null);

  // Which application's resume is currently being analyzed (holds _id, or null)
  const [analyzingId, setAnalyzingId] = useState(null);

  // ?view=applications shows a flat, filtered applicants list across ALL jobs
  // ?status=Shortlisted / Rejected further narrows that list
  const viewParam = searchParams.get("view"); // "applications" | null
  const statusParam = searchParams.get("status"); // "Shortlisted" | "Rejected" | null
  const isGlobalView = viewParam === "applications";

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");

  // Flat, cross-job applicants list used only in "global view" mode
  const [allApplicants, setAllApplicants] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    (async () => {
      const loadedJobs = await fetchMyJobs();
      if (viewParam === "applications") {
        fetchAllApplicants(loadedJobs);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewParam, statusParam]);

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/jobs/my-jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
      showToast("Failed to load your jobs", "error");
      return [];
    }
  };

  // Pulls applicants for every job the recruiter owns, tags each with its
  // job title/company, flattens into one list, and applies the status filter.
  const fetchAllApplicants = async (jobsList) => {
    setLoadingAll(true);
    try {
      const token = localStorage.getItem("token");

      const results = await Promise.all(
        jobsList.map((job) =>
          API.get(`/applications/job/${job._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) =>
              res.data.map((app) => ({
                ...app,
                jobTitle: job.title,
                jobCompany: job.company,
                jobId: job._id,
              }))
            )
            .catch(() => [])
        )
      );

      let flat = results.flat();

      if (statusParam) {
        flat = flat.filter((app) => app.status === statusParam);
      }

      setAllApplicants(flat);
    } catch (error) {
      console.log(error);
      showToast("Failed to load applicants", "error");
    } finally {
      setLoadingAll(false);
    }
  };

  const clearGlobalView = () => {
    setSearchParams({});
  };

  const viewApplicants = async (jobId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get(`/applications/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplications(res.data);
      setSelectedJob(jobId);
    } catch (error) {
      console.log(error);
      showToast("Failed to load applicants", "error");
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem("token");

      await API.put(
        `/applications/${applicationId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("Status updated successfully", "success");

      if (isGlobalView) {
        fetchAllApplicants(jobs);
      } else {
        viewApplicants(selectedJob);
      }
    } catch (error) {
      console.log(error);
      showToast("Failed to update status", "error");
    }
  };

  // Runs the free resume-vs-job skill match, then updates just that one
  // applicant's entry in whichever list is currently on screen.
  const analyzeResume = async (applicationId) => {
    setAnalyzingId(applicationId);
    try {
      const token = localStorage.getItem("token");

      const res = await API.post(
        `/applications/${applicationId}/analyze`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { matchScore, matchedSkills, missingSkills } = res.data;

      const patch = (app) =>
        app._id === applicationId
          ? { ...app, matchScore, matchedSkills, missingSkills }
          : app;

      setApplications((prev) => prev.map(patch));
      setAllApplicants((prev) => prev.map(patch));

      showToast("Resume analyzed successfully", "success");
    } catch (error) {
      console.log(error);
      showToast(error.response?.data?.message || "Failed to analyze resume", "error");
    } finally {
      setAnalyzingId(null);
    }
  };

  // Called when the user clicks the trash icon — just opens the modal
  const requestDeleteJob = (jobId) => {
    setJobToDelete(jobId);
  };

  // Called when the user confirms inside the modal — does the actual delete
  const confirmDeleteJob = async () => {
    const jobId = jobToDelete;
    setJobToDelete(null);

    try {
      const token = localStorage.getItem("token");

      await API.delete(`/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showToast("Job deleted successfully", "success");

      fetchMyJobs();
    } catch (error) {
      console.log(error);
      showToast("Failed to delete job", "error");
    }
  };

  const initials = (name) =>
    (name || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // Some older application records may have been saved with just the
  // filename (no "uploads/" prefix). This normalizes either format so the
  // download link always works.
  const resumeUrl = (resume) => {
    if (!resume) return "";
    const cleanPath = resume.startsWith("uploads/") ? resume : `uploads/${resume}`;
    return `http://localhost:5000/${cleanPath}`;
  };

  const statusBadgeClass = (status) => {
    if (status === "Shortlisted") return "jp-badge-success";
    if (status === "Rejected") return "jp-badge-danger";
    return "jp-badge-warning";
  };

  const matchScoreClass = (score) => {
    if (score >= 70) return "jp-badge-success";
    if (score >= 40) return "jp-badge-warning";
    return "jp-badge-danger";
  };

  const globalViewTitle = () => {
    if (statusParam === "Shortlisted") return "Shortlisted Applicants";
    if (statusParam === "Rejected") return "Rejected Applicants";
    return "All Applications";
  };

  // Shared block: either an "Analyze Resume" button, or (once analyzed)
  // the match score + matched/missing skill chips. Used in both views.
  const renderMatchSection = (app) => {
    if (!app.resume) return null;

    const isAnalyzing = analyzingId === app._id;
    const hasScore = app.matchScore !== null && app.matchScore !== undefined;

    if (!hasScore) {
      return (
        <button
          className="btn btn-jp-outline btn-lift btn-sm"
          style={{ color: "var(--jp-blue)", borderColor: "var(--jp-blue-tint-2)" }}
          onClick={() => analyzeResume(app._id)}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <span className="spinner-border spinner-border-sm me-1"></span>
              Analyzing...
            </>
          ) : (
            <>
              <i className="bi bi-magic"></i> Analyze Resume Match
            </>
          )}
        </button>
      );
    }

    return (
      <div className="jp-match-box mt-2 w-100">
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className={`jp-badge ${matchScoreClass(app.matchScore)}`}>
            <i className="bi bi-graph-up-arrow"></i> {app.matchScore}% Match
          </span>
          <button
            className="btn btn-link btn-sm p-0 text-muted"
            onClick={() => analyzeResume(app._id)}
            disabled={isAnalyzing}
            title="Re-analyze"
          >
            {isAnalyzing ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <i className="bi bi-arrow-clockwise"></i>
            )}
          </button>
        </div>

        {app.matchedSkills?.length > 0 && (
          <div className="mb-1">
            <span className="text-muted small me-1">Matched:</span>
            {app.matchedSkills.map((s) => (
              <span key={s} className="jp-skill-chip jp-skill-chip-good">
                {s}
              </span>
            ))}
          </div>
        )}

        {app.missingSkills?.length > 0 && (
          <div>
            <span className="text-muted small me-1">Missing:</span>
            {app.missingSkills.map((s) => (
              <span key={s} className="jp-skill-chip jp-skill-chip-missing">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ---------- GLOBAL (cross-job) APPLICANTS VIEW ----------
  if (isGlobalView) {
    return (
      <div className="container">
        <div className="jp-page-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2>
              <i className="bi bi-people-fill text-brand"></i> {globalViewTitle()}
            </h2>
            <p className="text-muted mb-0">
              Across all of your posted jobs.
            </p>
          </div>

          <button className="btn btn-jp-outline btn-lift" onClick={clearGlobalView}>
            <i className="bi bi-arrow-left"></i> Back to My Jobs
          </button>
        </div>

        {loadingAll ? (
          <div className="text-center py-5">
            <span className="spinner-border text-primary"></span>
          </div>
        ) : allApplicants.length === 0 ? (
          <div className="jp-empty-state mb-5">
            <i className="bi bi-file-earmark-x"></i>
            <h5>No applicants found</h5>
            <p className="text-muted mb-0">
              {statusParam
                ? `No applicants with status "${statusParam}" yet.`
                : "No one has applied to your jobs yet."}
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3 pb-5">
            {allApplicants.map((app) => (
              <div className="jp-applicant-card" key={app._id}>
                <div className="d-flex flex-wrap gap-3 justify-content-between align-items-start">
                  <div className="d-flex gap-3">
                    <div className="jp-avatar">{initials(app.applicant?.name)}</div>
                    <div>
                      <div className="fw-semibold">{app.applicant?.name}</div>
                      <div className="text-muted small">{app.applicant?.email}</div>
                      {app.applicant?.phone && (
                        <div className="text-muted small">
                          <i className="bi bi-telephone-fill"></i> {app.applicant.phone}
                        </div>
                      )}
                      <span className="jp-badge jp-badge-blue mt-1">
                        <i className="bi bi-briefcase-fill"></i> {app.jobTitle} · {app.jobCompany}
                      </span>
                    </div>
                  </div>

                  <span className={`jp-badge ${statusBadgeClass(app.status)}`}>
                    <i className="bi bi-circle-fill" style={{ fontSize: "0.5rem" }}></i>
                    {app.status}
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-3 align-items-start">
                  {app.resume ? (
                    <a
                      href={resumeUrl(app.resume)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-resume-download"
                    >
                      <i className="bi bi-download"></i> Download Resume
                    </a>
                  ) : (
                    <span className="jp-badge jp-badge-slate">No Resume Uploaded</span>
                  )}

                  <button
                    className="btn-shortlist"
                    onClick={() => updateStatus(app._id, "Shortlisted")}
                  >
                    <i className="bi bi-check-circle"></i> Shortlist
                  </button>

                  <button
                    className="btn-reject"
                    onClick={() => updateStatus(app._id, "Rejected")}
                  >
                    <i className="bi bi-x-circle"></i> Reject
                  </button>
                </div>

                {renderMatchSection(app)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------- DEFAULT: PER-JOB VIEW ----------
  return (
    <div className="container">
      <div className="jp-page-header">
        <h2>
          <i className="bi bi-folder-fill text-brand"></i> My Posted Jobs
        </h2>
        <p className="text-muted mb-0">
          Manage your job listings and review applicants.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="jp-empty-state mb-5">
          <i className="bi bi-file-earmark-plus"></i>
          <h5>No jobs posted yet</h5>
          <p className="text-muted mb-3">Post your first job to start receiving applications.</p>
          <button className="btn btn-jp-primary btn-lift" onClick={() => navigate("/post-job")}>
            <i className="bi bi-plus-circle"></i> Post a Job
          </button>
        </div>
      ) : (
        <div className="row g-4 pb-5">
          {jobs.map((job) => (
            <div className="col-12" key={job._id}>
              <div className="jp-job-card">
                <div className="d-flex flex-wrap gap-3 justify-content-between align-items-start">
                  <div className="d-flex gap-3">
                    <div className="jp-company-logo">{initials(job.company)}</div>
                    <div>
                      <h5 className="jp-job-title fw-display">{job.title}</h5>
                      <div className="jp-job-company">
                        <i className="bi bi-building me-1"></i>
                        {job.company}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-jp-outline btn-lift"
                      style={{ color: "var(--jp-blue)", borderColor: "var(--jp-blue-tint-2)" }}
                      onClick={() => navigate(`/edit-job/${job._id}`)}
                    >
                      <i className="bi bi-pencil-square"></i> Edit
                    </button>

                    <button
                      className="btn btn-jp-danger btn-lift"
                      onClick={() => requestDeleteJob(job._id)}
                    >
                      <i className="bi bi-trash3-fill"></i> Delete
                    </button>
                  </div>
                </div>

                <div className="jp-job-meta">
                  <span className="jp-badge jp-badge-blue">
                    <i className="bi bi-geo-alt-fill"></i> {job.location}
                  </span>
                  <span className="jp-badge jp-badge-success">
                    <i className="bi bi-cash-stack"></i> ₹{job.salary}
                  </span>
                  <span className="jp-badge jp-badge-warning">
                    <i className="bi bi-clock-fill"></i> {job.jobType}
                  </span>
                </div>

                <p className="mb-3">{job.description}</p>

                <button
                  className="btn btn-jp-primary btn-lift"
                  onClick={() => viewApplicants(job._id)}
                >
                  <i className="bi bi-people-fill"></i>{" "}
                  {selectedJob === job._id ? "Applicants Loaded" : "View Applicants"}
                </button>

                {selectedJob === job._id && (
                  <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--jp-border)" }}>
                    <h6 className="fw-display mb-3">
                      <i className="bi bi-person-lines-fill text-brand"></i> Applicants
                    </h6>

                    {applications.length === 0 ? (
                      <p className="text-muted mb-0">No applications yet.</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {applications.map((app) => (
                          <div className="jp-applicant-card" key={app._id}>
                            <div className="d-flex flex-wrap gap-3 justify-content-between align-items-start">
                              <div className="d-flex gap-3">
                                <div className="jp-avatar">{initials(app.applicant.name)}</div>
                                <div>
                                  <div className="fw-semibold">{app.applicant.name}</div>
                                  <div className="text-muted small">{app.applicant.email}</div>
                                  {app.applicant.phone && (
                                    <div className="text-muted small">
                                      <i className="bi bi-telephone-fill"></i> {app.applicant.phone}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <span className={`jp-badge ${statusBadgeClass(app.status)}`}>
                                <i className="bi bi-circle-fill" style={{ fontSize: "0.5rem" }}></i>
                                {app.status}
                              </span>
                            </div>

                            <div className="d-flex flex-wrap gap-2 mt-3 align-items-start">
                              {app.resume ? (
                                <a
                                  href={resumeUrl(app.resume)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn-resume-download"
                                >
                                  <i className="bi bi-download"></i> Download Resume
                                </a>
                              ) : (
                                <span className="jp-badge jp-badge-slate">No Resume Uploaded</span>
                              )}

                              <button
                                className="btn-shortlist"
                                onClick={() => updateStatus(app._id, "Shortlisted")}
                              >
                                <i className="bi bi-check-circle"></i> Shortlist
                              </button>

                              <button
                                className="btn-reject"
                                onClick={() => updateStatus(app._id, "Rejected")}
                              >
                                <i className="bi bi-x-circle"></i> Reject
                              </button>
                            </div>

                            {renderMatchSection(app)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        show={!!jobToDelete}
        title="Delete this job?"
        message="This will permanently remove the job listing and cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={confirmDeleteJob}
        onCancel={() => setJobToDelete(null)}
      />
    </div>
  );
}

export default MyJobs;
