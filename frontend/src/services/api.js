import axios from "axios";

// In production (deployed), set VITE_API_URL in your hosting platform's
// environment variables to your live backend URL, e.g.:
//   VITE_API_URL=https://your-backend.onrender.com/api
// Locally, it falls back to localhost so nothing changes for development.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_URL,
});

// Used wherever we build a direct link to an uploaded file (resumes,
// profile photos) — same host as the API, just without the "/api" suffix.
export const FILE_BASE_URL = API_URL.replace(/\/api\/?$/, "");

export default API;