import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    jobType: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    try {
      const res = await API.get(`/jobs/${id}`);
      setJob(res.data);
    } catch (error) {
      console.log(error);
      showToast("Failed to load job", "error");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setJob({
      ...job,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      await API.put(`/jobs/${id}`, job, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showToast("Job updated successfully", "success");
      navigate("/my-jobs");
    } catch (error) {
      console.log(error);
      showToast("Failed to update job", "error");
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
                <i className="bi bi-pencil-square"></i>
              </span>
              <div>
                <h3 className="mb-0">Edit Job</h3>
                <p className="text-muted mb-0">Update the details of your job listing.</p>
              </div>
            </div>

            {fetching ? (
              <div className="text-center py-5">
                <span className="spinner-border text-primary"></span>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      placeholder="Job Title"
                      value={job.title}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      name="company"
                      className="form-control"
                      placeholder="Company"
                      value={job.company}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      className="form-control"
                      placeholder="Location"
                      value={job.location}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Salary (₹)</label>
                    <input
                      type="number"
                      name="salary"
                      className="form-control"
                      placeholder="Salary"
                      value={job.salary}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Job Type</label>
                    <select
                      name="jobType"
                      className="form-select"
                      value={job.jobType}
                      onChange={handleChange}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      rows="5"
                      name="description"
                      className="form-control"
                      placeholder="Description"
                      value={job.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className="btn-jp-submit btn-lift mt-4" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle"></i> Update Job
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditJob;
