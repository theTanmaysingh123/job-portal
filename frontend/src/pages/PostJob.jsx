import { useState } from "react";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

function PostJob() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const { showToast } = useToast();

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Job title is required";
    if (!company.trim()) newErrors.company = "Company name is required";
    if (!location.trim()) newErrors.location = "Location is required";
    if (!salary) newErrors.salary = "Salary is required";
    if (!description.trim()) newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePostJob = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await API.post(
        "/jobs",
        {
          title,
          company,
          location,
          salary,
          jobType,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast(res.data.message, "success");

      // Clear form
      setTitle("");
      setCompany("");
      setLocation("");
      setSalary("");
      setJobType("Full-time");
      setDescription("");
      setErrors({});

    } catch (error) {
      showToast(error.response?.data?.message || "Failed to post job", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section-py">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="jp-form-card jp-animate-up">
            <div className="jp-form-header">
              <span className="icon-box">
                <i className="bi bi-send-plus-fill"></i>
              </span>
              <div>
                <h3 className="mb-0">Post a New Job</h3>
                <p className="text-muted mb-0">Fill in the details to publish your opening.</p>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? "is-invalid" : ""}`}
                  placeholder="e.g. Frontend Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && <div className="text-danger small mt-1">{errors.title}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Company</label>
                <input
                  type="text"
                  className={`form-control ${errors.company ? "is-invalid" : ""}`}
                  placeholder="e.g. Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                {errors.company && <div className="text-danger small mt-1">{errors.company}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className={`form-control ${errors.location ? "is-invalid" : ""}`}
                  placeholder="e.g. Bengaluru, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                {errors.location && <div className="text-danger small mt-1">{errors.location}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Salary (₹)</label>
                <input
                  type="number"
                  className={`form-control ${errors.salary ? "is-invalid" : ""}`}
                  placeholder="e.g. 600000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
                {errors.salary && <div className="text-danger small mt-1">{errors.salary}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Job Type</label>
                <select
                  className="form-select"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Job Description</label>
                <textarea
                  rows="5"
                  className={`form-control ${errors.description ? "is-invalid" : ""}`}
                  placeholder="Describe the role, responsibilities and requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                {errors.description && (
                  <div className="text-danger small mt-1">{errors.description}</div>
                )}
              </div>
            </div>

            <button
              className="btn-jp-submit btn-lift mt-4"
              onClick={handlePostJob}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Posting...
                </>
              ) : (
                <>
                  <i className="bi bi-send-fill"></i> Post Job
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostJob;
