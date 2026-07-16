import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PostJob from "./pages/PostJob";
import Jobs from "./pages/Jobs";
import MyJobs from "./pages/MyJobs";
import Applications from "./pages/Applications";
import ApplicationDetail from "./pages/ApplicationDetail";
import EditJob from "./pages/EditJob";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Navbar />

        <div className="app-main">
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/jobs" element={<Jobs />} />

        {/* Recruiter-only Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="recruiter">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute allowedRole="recruiter">
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute allowedRole="recruiter">
              <MyJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-job/:id"
          element={
            <ProtectedRoute allowedRole="recruiter">
              <EditJob />
            </ProtectedRoute>
          }
        />

        {/* Candidate-only Routes */}
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRole="candidate">
              <Applications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications/:id"
          element={
            <ProtectedRoute allowedRole="candidate">
              <ApplicationDetail />
            </ProtectedRoute>
          }
        />

        {/* Any logged-in user (recruiter or candidate) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
      </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
