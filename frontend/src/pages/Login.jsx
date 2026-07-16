import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Shared: takes the login API response and finishes logging the user in
  const completeLogin = (data) => {
    showToast(data.message, "success");

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.role === "recruiter") {
      navigate("/dashboard");
    } else {
      navigate("/jobs");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const res = await API.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      completeLogin(res.data);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Google login failed",
        "error"
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      completeLogin(res.data);
    } catch (error) {
      if (error.response?.data?.needsVerification) {
        showToast(error.response.data.message, "info");
        navigate("/verify-email", { state: { email: error.response.data.email } });
      } else {
        showToast(error.response?.data?.message || "Login Failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="jp-auth-wrapper">
      <div className="jp-auth-card jp-animate-up">
        <div className="jp-auth-icon">
          <i className="bi bi-box-arrow-in-right"></i>
        </div>

        <h2 className="text-center mb-1">Welcome back</h2>
        <p className="text-center text-muted mb-4">
          Log in to continue to Job Portal
        </p>

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
              onKeyDown={handleKeyDown}
            />
          </div>
          {errors.email && (
            <div className="text-danger small mt-1">{errors.email}</div>
          )}
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
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
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Logging in...
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-in-right"></i> Login
            </>
          )}
        </button>

        <div className="jp-divider my-4">
          <span>OR</span>
        </div>

        <div className="d-flex justify-content-center">
          {googleLoading ? (
            <span className="spinner-border spinner-border-sm text-primary"></span>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => showToast("Google login failed", "error")}
              text="signin_with"
              width="320"
            />
          )}
        </div>

        <p className="text-center text-muted mt-4 mb-0 small">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand fw-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
