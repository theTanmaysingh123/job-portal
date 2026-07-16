import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Google button uses whichever role card is currently selected above
  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const res = await API.post("/auth/google", {
        credential: credentialResponse.credential,
        role,
      });

      showToast(res.data.message, "success");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.role === "recruiter") {
        navigate("/dashboard");
      } else {
        navigate("/jobs");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Google sign-up failed",
        "error"
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Full name is required";

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await API.post("/auth/signup", {
        name,
        email,
        password,
        role,
      });

      showToast(res.data.message, "success");

      const registeredEmail = email;

      setName("");
      setEmail("");
      setPassword("");
      setRole("candidate");
      setErrors({});

      navigate("/verify-email", { state: { email: registeredEmail } });
    } catch (error) {
      showToast(error.response?.data?.message || "Registration Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jp-auth-wrapper">
      <div className="jp-auth-card jp-animate-up" style={{ maxWidth: 520 }}>
        <div className="jp-auth-icon">
          <i className="bi bi-person-plus-fill"></i>
        </div>

        <h2 className="text-center mb-1">Create your account</h2>
        <p className="text-center text-muted mb-4">
          Join Job Portal as a candidate or a recruiter
        </p>

        <label className="form-label fw-semibold small">I am a</label>
        <div className="row g-2 mb-3">
          <div className="col-6">
            <div
              className={`jp-role-card ${role === "candidate" ? "active" : ""}`}
              onClick={() => setRole("candidate")}
            >
              <div className="role-icon">
                <i className="bi bi-person-badge"></i>
              </div>
              <div className="fw-semibold">Candidate</div>
              <small className="text-muted">Looking for a job</small>
            </div>
          </div>

          <div className="col-6">
            <div
              className={`jp-role-card ${role === "recruiter" ? "active" : ""}`}
              onClick={() => setRole("recruiter")}
            >
              <div className="role-icon">
                <i className="bi bi-building"></i>
              </div>
              <div className="fw-semibold">Recruiter</div>
              <small className="text-muted">Hiring talent</small>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center mb-3">
          {googleLoading ? (
            <span className="spinner-border spinner-border-sm text-primary"></span>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => showToast("Google sign-up failed", "error")}
              text="signup_with"
              width="320"
            />
          )}
        </div>

        <div className="jp-divider mb-3">
          <span>OR REGISTER WITH EMAIL</span>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold small">Full name</label>
          <div className="jp-input-group input-group">
            <span className="input-group-text">
              <i className="bi bi-person"></i>
            </span>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold small">Email address</label>
          <div className="jp-input-group input-group">
            <span className="input-group-text">
              <i className="bi bi-envelope"></i>
            </span>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold small">Password</label>
          <div className="jp-input-group input-group">
            <span className="input-group-text">
              <i className="bi bi-lock"></i>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="input-group-text"
              role="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </span>
          </div>
          {errors.password && (
            <div className="text-danger small mt-1">{errors.password}</div>
          )}
        </div>

        <button
          className="btn btn-jp-primary btn-lift w-100 mt-2"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Creating account...
            </>
          ) : (
            <>
              <i className="bi bi-person-plus-fill"></i> Register
            </>
          )}
        </button>

        <p className="text-center text-muted mt-4 mb-0 small">
          Already have an account?{" "}
          <Link to="/login" className="text-brand fw-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
