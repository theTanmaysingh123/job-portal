import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Per-job resume files: { [jobId]: File }
  const [resumes, setResumes] = useState({});

  // Track which jobs the logged-in candidate has already applied to
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  // Track per-job "applying..." state so only that card's button shows a spinner
  const [applyingJobId, setApplyingJobId] = useState(null);

  // Candidate's "Check My Match" results, keyed by jobId: { matchScore, matchedSkills, missingSkills }
  const [matchResults, setMatchResults] = useState({});
  const [checkingJobId, setCheckingJobId] = useState(null);

  // Search / filter fields
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [minSalary, setMinSalary] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const { showToast } = useToast();

  useEffect(() => {
    fetchJobs();
    if (token && role === "candidate") {
      fetchMyApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobs = async (e) => {
    if (e) e.preventDefault();

    setLoading(true);
    try {
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (location.trim()) params.location = location.trim();
      if (jobType) params.jobType = jobType;
      if (minSalary) params.minSalary = minSalary;

      const res = await API.get("/jobs", { params });
      setJobs(res.data);
    } catch (error) {
      console.log(error);
      showToast("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await API.get("/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ids = new Set(res.data.map((app) => app.job?._id).filter(Boolean));
      setAppliedJobIds(ids);
    } catch (error) {
      // Non-fatal — if this fails we just won't show "Applied" badges
      console.log(error);
    }
  };

  const handleResumeChange = (jobId, file) => {
    setResumes((prev) => ({ ...prev, [jobId]: file }));
    // A new resume invalidates any previous match check for this job
    setMatchResults((prev) => {
      const next = { ...prev };
      delete next[jobId];
      return next;
    });
  };

  const handleClearFilters = () => {
    setKeyword("");
    setLocation("");
    setJobType("");
    setMinSalary("");
    // fetch immediately with cleared filters
    setTimeout(() => fetchJobs(), 0);
  };

  const handleCheckMatch = async (jobId) => {
    const resume = resumes[jobId];
    if (!resume) {
      showToast("Please select a PDF resume first.", "info");
      return;
    }

    setCheckingJobId(jobId);
    try {
      const formData = new FormData();
      formData.append("resume", resume);

      const res = await API.post(`/applications/check-match/${jobId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { matchScore, matchedSkills, missingSkills } = res.data;
      setMatchResults((prev) => ({
        ...prev,
        [jobId]: { matchScore, matchedSkills, missingSkills },
      }));
    } catch (error) {
      console.log(error);
      showToast(error.response?.data?.message || "Failed to check match", "error");
    } finally {
      setCheckingJobId(null);
    }
  };

  const handleApply = async (jobId) => {
    if (!token) {
      showToast("Please login as a candidate to apply.", "info");
      return;
    }

    if (role !== "candidate") {
      showToast("Only candidates can apply for jobs.", "info");
      return;
    }

    const resume = resumes[jobId];
    if (!resume) {
      showToast("Please select a PDF resume first.", "info");
      return;
    }

    setApplyingJobId(jobId);
    try {
      const formData = new FormData();
      formData.append("resume", resume);

      const res = await API.post(`/applications/${jobId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showToast(res.data.message, "success");

      // Mark this job as applied and clear its resume file
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
      setResumes((prev) => {
        const next = { ...prev };
        delete next[jobId];
        return next;
      });
    } catch (error) {
      console.log(error);
      showToast(error.response?.data?.message || "Failed to apply", "error");
    } finally {
      setApplyingJobId(null);
    }
  };

  const initials = (name) =>
    (name || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const matchScoreClass = (score) => {
    if (score >= 70) return "jp-badge-success";
    if (score >= 40) return "jp-badge-warning";
    return "jp-badge-danger";
  };

  return (
    <div className="container">
      <div className="jp-page-header">
        <h2>
          <i className="bi bi-briefcase-fill text-brand"></i> Available Jobs
        </h2>
        <p className="text-muted mb-0">
          Explore live openings and apply directly with your resume.
        </p>
      </div>

      {/* Search / Filter Bar */}
      <div className="jp-card p-4 mb-4">
        <form onSubmit={fetchJobs}>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-semibold small">Keyword</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Job title or company"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold small">Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Noida"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold small">Job Type</label>
              <select
                className="form-select"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="">Any</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold small">Min Salary</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 300000"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
              />
            </div>

            <div className="col-md-1 d-flex gap-2">
              <button type="submit" className="btn btn-jp-primary btn-lift w-100" title="Search">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>

          {(keyword || location || jobType || minSalary) && (
            <button
              type="button"
              className="btn btn-link btn-sm mt-2 ps-0"
              onClick={handleClearFilters}
            >
              <i className="bi bi-x-circle"></i> Clear filters
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <span className="spinner-border text-primary"></span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="jp-empty-state mb-5">
          <i className="bi bi-inbox"></i>
          <h5>No jobs available</h5>
          <p className="text-muted mb-0">Try adjusting your search or check back soon.</p>
        </div>
      ) : (
        <div className="row g-4 pb-5">
          {jobs.map((job) => {
            const alreadyApplied = appliedJobIds.has(job._id);
            const isApplying = applyingJobId === job._id;

            return (
              <div className="col-12" key={job._id}>
                <div className="jp-job-card">
                  <div className="d-flex flex-wrap gap-3 justify-content-between">
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

                    {alreadyApplied && (
                      <span className="jp-badge jp-badge-success">
                        <i className="bi bi-check-circle-fill"></i> Applied
                      </span>
                    )}
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

                  {!token ? (
                    <div className="jp-badge jp-badge-slate">
                      <i className="bi bi-lock-fill"></i>{" "}
                      <Link to="/login">Login as a candidate</Link> to apply
                    </div>
                  ) : role !== "candidate" ? (
                    <div className="jp-badge jp-badge-slate">
                      <i className="bi bi-info-circle"></i> Only candidates can apply for jobs
                    </div>
                  ) : alreadyApplied ? (
                    <button className="btn-apply btn-lift" disabled>
                      <i className="bi bi-check-circle-fill me-1"></i> Already Applied
                    </button>
                  ) : (
                    <>
                      <div className="jp-resume-drop mb-3">
                        <label className="form-label fw-semibold small mb-2">
                          <i className="bi bi-file-earmark-arrow-up me-1"></i>
                          Upload Resume (PDF)
                        </label>

                        <input
                          type="file"
                          accept=".pdf"
                          className="form-control form-control-sm"
                          onChange={(e) => handleResumeChange(job._id, e.target.files[0])}
                        />
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-jp-outline btn-lift"
                          style={{ color: "var(--jp-blue)", borderColor: "var(--jp-blue-tint-2)" }}
                          onClick={() => handleCheckMatch(job._id)}
                          disabled={checkingJobId === job._id}
                        >
                          {checkingJobId === job._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Checking...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-magic"></i> Check My Match
                            </>
                          )}
                        </button>

                        <button
                          className="btn-apply btn-lift"
                          onClick={() => handleApply(job._id)}
                          disabled={isApplying}
                        >
                          {isApplying ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Applying...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send-fill me-1"></i> Apply Job
                            </>
                          )}
                        </button>
                      </div>

                      {matchResults[job._id] && (
                        <div className="jp-match-box mt-3">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span
                              className={`jp-badge ${matchScoreClass(
                                matchResults[job._id].matchScore
                              )}`}
                            >
                              <i className="bi bi-graph-up-arrow"></i>{" "}
                              {matchResults[job._id].matchScore}% Match
                            </span>
                          </div>

                          {matchResults[job._id].matchedSkills?.length > 0 && (
                            <div className="mb-1">
                              <span className="text-muted small me-1">You have:</span>
                              {matchResults[job._id].matchedSkills.map((s) => (
                                <span key={s} className="jp-skill-chip jp-skill-chip-good">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}

                          {matchResults[job._id].missingSkills?.length > 0 && (
                            <div>
                              <span className="text-muted small me-1">Consider adding:</span>
                              {matchResults[job._id].missingSkills.map((s) => (
                                <span key={s} className="jp-skill-chip jp-skill-chip-missing">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Jobs;
