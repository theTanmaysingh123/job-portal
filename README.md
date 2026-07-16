# Job Portal — MERN Stack Application

A full-featured job portal built with the MERN stack (MongoDB, Express, React, Node.js) where **recruiters** can post and manage job listings, and **candidates** can search for jobs, apply with a resume, and track their application status — with a free, AI-style resume-matching engine on both sides.

---

## ✨ Features

### Authentication & Accounts
- Email/password registration and login with JWT-based authentication
- **Google Sign-In** (OAuth 2.0) for one-click login/registration
- **Email verification via OTP** (sent through Gmail using Nodemailer) before an account can log in
- Role-based access control — every page and API route is restricted to the correct role (Recruiter / Candidate)

### For Recruiters
- Post, edit, and delete job listings
- View all applicants for a job, with contact details (email + phone, when provided)
- Shortlist or reject applicants
- **Analyze Resume Match** — instantly scores a candidate's resume against the job description and highlights matched vs. missing skills
- Dashboard with real, live statistics (jobs posted, total applications, shortlisted, rejected) — each stat card is clickable and drills into a filtered applicant view

### For Candidates
- Browse and search jobs (by keyword, location, job type, minimum salary)
- Apply directly with a PDF resume upload
- **Check My Match** — preview a resume-to-job compatibility score *before* applying, with a skills gap breakdown
- Track all applications and their status (Pending / Shortlisted / Rejected) in a timeline view
- Click into any application for full details, including a 🎉 congratulations banner and the recruiter's contact info once shortlisted
- "Already Applied" indicator to prevent duplicate applications

### Profile
- Editable profile (name, phone, location, bio)
- Profile photo upload with a circular avatar and click-to-preview

### Resume Matching Engine
A lightweight, dependency-free skill-matching engine (`backend/utils/resumeMatcher.js`) extracts a curated list of ~80 common tech/business skills from both the job description and the candidate's resume (parsed from PDF via `pdf-parse`), then computes a match percentage and a matched/missing skills breakdown — no external AI API or paid service required.

### UI/UX Polish
- Custom toast notification system (replacing native browser alerts)
- Custom confirmation modals (replacing native browser confirm dialogs)
- Fully responsive design, including a working mobile navigation menu
- Consistent design system (colors, spacing, components) across the app

---

## 🛠️ Tech Stack

**Frontend:** React (Vite), React Router, Bootstrap 5, Bootstrap Icons, Axios, `@react-oauth/google`

**Backend:** Node.js, Express, MongoDB with Mongoose, JWT, bcrypt.js, Multer (file uploads), `pdf-parse`, Nodemailer, `google-auth-library`

---

## 📁 Project Structure

```
job-portal/
├── backend/
│   ├── controllers/       # Route handler logic
│   ├── middleware/        # Auth guard + file upload middleware
│   ├── models/            # Mongoose schemas (User, Job, Application)
│   ├── routes/            # Express route definitions
│   ├── utils/             # Resume matcher + email sender
│   ├── uploads/           # Uploaded resumes/photos (gitignored, created on first upload)
│   ├── .env.example
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, ConfirmModal, etc.
    │   ├── context/        # Toast notification context
    │   ├── pages/          # All page-level components
    │   ├── services/       # Axios API instance
    │   ├── App.jsx
    │   └── main.jsx
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A MongoDB database (local, or a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- A Google Cloud project with an OAuth 2.0 Client ID (for Google Sign-In)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for sending verification emails)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd job-portal
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# now fill in your real values in .env
npm start
```
The backend runs on `http://localhost:5000` by default.

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
# now fill in your real VITE_GOOGLE_CLIENT_ID in .env
npm run dev
```
The frontend runs on `http://localhost:5173` by default.

---

## 🔑 Environment Variables

### `backend/.env`

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Port for the backend server (default `5000`) |
| `JWT_SECRET` | Random secret string used to sign JWT tokens |
| `GOOGLE_CLIENT_ID` | OAuth Client ID from Google Cloud Console |
| `EMAIL_USER` | Gmail address used to send verification emails |
| `EMAIL_PASS` | Gmail **App Password** (not your regular Gmail password) |

### `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Same Google OAuth Client ID as the backend |

> ⚠️ Never commit your real `.env` files. Only `.env.example` (with placeholder values) should be tracked in git.

---

## 🔒 Deploying to Production

When deploying:
1. Add your production frontend URL to **Authorized JavaScript origins** in your Google Cloud OAuth Client settings (in addition to `localhost`, not instead of it).
2. Set all environment variables in your hosting platform's dashboard (Vercel/Netlify for the frontend, Render/Railway for the backend) — `.env` files are not deployed automatically.

---

## 🔮 Future Enhancements

- Facebook login
- Real-time notifications (WebSockets) instead of on-visit toast/banner updates
- Pagination on the jobs listing page
- Forgot / reset password flow
- Optional paid-LLM-based resume analysis as an alternative to the built-in skill matcher

---

## 📄 License

This project was built for educational purposes as a final-year academic project.
