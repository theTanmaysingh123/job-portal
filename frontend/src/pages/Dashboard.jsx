import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const jobsRes = await API.get("/jobs/my-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const jobs = jobsRes.data;

      let totalApplications = 0;
      let shortlisted = 0;
      let rejected = 0;

      // Fetch applicants for every posted job in parallel.
      // If one job's applicant fetch fails, don't let it break the whole dashboard.
      const applicantResults = await Promise.all(
        jobs.map((job) =>
          API.get(`/applications/job/${job._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: [] }))
        )
      );

      applicantResults.forEach((res) => {
        const apps = res.data || [];
        totalApplications += apps.length;
        shortlisted += apps.filter((a) => a.status === "Shortlisted").length;
        rejected += apps.filter((a) => a.status === "Rejected").length;
      });

      setStats({
        totalJobs: jobs.length,
        totalApplications,
        shortlisted,
        rejected,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const statValue = (value) => (loadingStats ? "--" : value);

  return (
    <div className="container section-py">
      {/* Welcome Banner */}
      <div className="jp-welcome-banner mb-4 jp-animate-up">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 position-relative">
          <div>
            <h2 className="text-white mb-1">
              <i className="bi bi-hand-thumbs-up-fill me-2"></i>
              Welcome, {user?.name || "User"}
            </h2>
            <span className="jp-role-badge">
              <i className="bi bi-person-badge"></i> {user?.role || "member"}
            </span>
          </div>

          <button className="btn btn-jp-outline btn-lift" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>

      {/* Dashboard Stat Cards — click any card to go view it on My Jobs */}
      <div className="row g-4">
        <div className="col-6 col-md-3">
          <div
            className="jp-dash-stat jp-animate-up jp-delay-1 jp-stat-clickable"
            style={{ background: "linear-gradient(135deg,#1656d9,#4f8cff)" }}
            onClick={() => navigate("/my-jobs")}
            role="button"
            title="View your posted jobs"
          >
            <i className="bi bi-briefcase-fill stat-icon"></i>
            <h5 className="mt-3 mb-0">Jobs Posted</h5>
            <div className="stat-value">{statValue(stats.totalJobs)}</div>
            <i className="bi bi-arrow-right-circle jp-stat-arrow"></i>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="jp-dash-stat jp-animate-up jp-delay-2 jp-stat-clickable"
            style={{ background: "linear-gradient(135deg,#0e8a5c,#17a06d)" }}
            onClick={() => navigate("/my-jobs?view=applications")}
            role="button"
            title="View all applicants"
          >
            <i className="bi bi-people-fill stat-icon"></i>
            <h5 className="mt-3 mb-0">Applications</h5>
            <div className="stat-value">{statValue(stats.totalApplications)}</div>
            <i className="bi bi-arrow-right-circle jp-stat-arrow"></i>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="jp-dash-stat jp-animate-up jp-delay-3 jp-stat-clickable"
            style={{ background: "linear-gradient(135deg,#b56d0c,#d98a10)" }}
            onClick={() => navigate("/my-jobs?view=applications&status=Shortlisted")}
            role="button"
            title="View shortlisted applicants"
          >
            <i className="bi bi-check-circle-fill stat-icon"></i>
            <h5 className="mt-3 mb-0">Shortlisted</h5>
            <div className="stat-value">{statValue(stats.shortlisted)}</div>
            <i className="bi bi-arrow-right-circle jp-stat-arrow"></i>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="jp-dash-stat jp-animate-up jp-delay-4 jp-stat-clickable"
            style={{ background: "linear-gradient(135deg,#b3282d,#e0393e)" }}
            onClick={() => navigate("/my-jobs?view=applications&status=Rejected")}
            role="button"
            title="View rejected applicants"
          >
            <i className="bi bi-x-circle-fill stat-icon"></i>
            <h5 className="mt-3 mb-0">Rejected</h5>
            <div className="stat-value">{statValue(stats.rejected)}</div>
            <i className="bi bi-arrow-right-circle jp-stat-arrow"></i>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="jp-card mt-4 p-4">
        <h4 className="mb-3">
          <i className="bi bi-lightning-charge-fill text-brand"></i> Quick Actions
        </h4>

        <div className="d-flex flex-wrap gap-3">
          <button className="jp-quick-action" onClick={() => navigate("/post-job")}>
            <i className="bi bi-plus-circle"></i> Post Job
          </button>

          <button className="jp-quick-action" onClick={() => navigate("/my-jobs")}>
            <i className="bi bi-folder-fill"></i> My Jobs
          </button>

          <button className="jp-quick-action" onClick={() => navigate("/jobs")}>
            <i className="bi bi-search"></i> Browse Jobs
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
