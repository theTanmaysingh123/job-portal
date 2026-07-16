const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const uploadMemory = require("../middleware/uploadMemoryMiddleware");
const applicationController = require("../controllers/applicationController");

// Candidate views own applications
router.get("/", authMiddleware, applicationController.getMyApplications);

// Recruiter views applications for own job
router.get(
  "/job/:jobId",
  authMiddleware,
  applicationController.getApplicationsByJob
);

// Recruiter updates application status
router.put(
  "/:applicationId/status",
  authMiddleware,
  applicationController.updateApplicationStatus
);

// Candidate previews resume-vs-job match BEFORE applying (nothing is saved)
router.post(
  "/check-match/:jobId",
  authMiddleware,
  uploadMemory.single("resume"),
  applicationController.checkJobMatch
);

// Candidate applies for a job with resume upload
router.post(
  "/:jobId",
  authMiddleware,
  upload.single("resume"),
  applicationController.applyJob
);

// Recruiter runs free resume-vs-job skill match analysis
router.post(
  "/:applicationId/analyze",
  authMiddleware,
  applicationController.analyzeMatch
);

module.exports = router;