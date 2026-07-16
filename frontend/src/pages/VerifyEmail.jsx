import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Email is passed in via navigate() state from Register.jsx or Login.jsx
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const completeLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.role === "recruiter") {
      navigate("/dashboard");
    } else {
      navigate("/jobs");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.trim().length !== 6) {
      showToast("Please enter the 6-digit code", "info");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/verify-email", { email, otp: otp.trim() });
      showToast(res.data.message, "success");
      completeLogin(res.data);
    } catch (error) {
      showToast(error.response?.data?.message || "Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await API.post("/auth/resend-otp", { email });
      showToast(res.data.message, "success");
      setCooldown(60);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to resend code", "error");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="jp-auth-wrapper">
        <div className="jp-auth-card jp-animate-up text-center">
          <div className="jp-auth-icon">
            <i className="bi bi-envelope-exclamation"></i>
          </div>
          <h2 className="mb-2">No email to verify</h2>
          <p className="text-muted mb-4">
            Please register or log in again to receive a verification code.
          </p>
          <Link to="/register" className="btn btn-jp-primary btn-lift">
            Go to Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="jp-auth-wrapper">
      <div className="jp-auth-card jp-animate-up">
        <div className="jp-auth-icon">
          <i className="bi bi-envelope-check"></i>
        </div>

        <h2 className="text-center mb-1">Verify your email</h2>
        <p className="text-center text-muted mb-4">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerify}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="form-control text-center"
              style={{ fontSize: "1.4rem", letterSpacing: "0.5rem" }}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <button
            type="submit"
            className="btn btn-jp-primary btn-lift w-100 mt-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Verifying...
              </>
            ) : (
              <>
                <i className="bi bi-check2-circle"></i> Verify Email
              </>
            )}
          </button>
        </form>

        <p className="text-center text-muted mt-4 mb-0 small">
          Didn't get the code?{" "}
          {cooldown > 0 ? (
            <span>Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              className="btn btn-link p-0 fw-semibold"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;
