const Application = require("../models/Application");
const Job = require("../models/Job");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { calculateMatch } = require("../utils/resumeMatcher");

// Candidate applies for a job
exports.applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Only candidates can apply
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        message: "Only candidates can apply for jobs",
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Prevent duplicate application
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
      });
    }

    // Resume path
    let resumePath = "";

    if (req.file) {
      resumePath = "uploads/" + req.file.filename;
    }

    const application = new Application({
      job: jobId,
      applicant: req.user.id,
      resume: resumePath,
    });

    await application.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Candidate views own applications
exports.getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        message: "Only candidates can view their applications",
      });
    }

    const applications = await Application.find({
      applicant: req.user.id,
    }).populate({
      path: "job",
      populate: { path: "postedBy", select: "name email phone" },
    });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Recruiter views applications for own job
exports.getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can view applications",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can view applications only for your own jobs",
      });
    }

    const applications = await Application.find({
      job: jobId,
    })
      .populate("applicant", "name email phone")
      .populate("job", "title company");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Recruiter updates application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can update application status",
      });
    }

    const allowedStatus = ["Pending", "Shortlisted", "Rejected"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const job = await Job.findById(application.job);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can update applications only for your own jobs",
      });
    }

    application.status = status;

    await application.save();

    res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Recruiter runs (free, no external API) resume-vs-job skill matching
exports.analyzeMatch = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId).populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!application.job) {
      return res.status(404).json({ message: "Job for this application no longer exists" });
    }

    // Only the recruiter who owns this job can run the analysis
    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only analyze applications for your own jobs",
      });
    }

    if (!application.resume) {
      return res.status(400).json({ message: "This application has no resume to analyze" });
    }

    // application.resume is normally stored like "uploads/filename.pdf"
    // (relative to the backend project root). Some older records may have
    // been saved with just the bare filename, so we normalize either case.
    const cleanResumePath = application.resume.startsWith("uploads/")
      ? application.resume
      : `uploads/${application.resume}`;

    const resumePath = path.join(__dirname, "..", cleanResumePath);

    if (!fs.existsSync(resumePath)) {
      return res.status(404).json({ message: "Resume file not found on server" });
    }

    const fileBuffer = fs.readFileSync(resumePath);
    const parsed = await pdfParse(fileBuffer);
    const resumeText = parsed.text || "";

    const jobText = `${application.job.title} ${application.job.description}`;

    const { matchScore, matchedSkills, missingSkills } = calculateMatch(jobText, resumeText);

    application.matchScore = matchScore;
    application.matchedSkills = matchedSkills;
    application.missingSkills = missingSkills;

    await application.save();

    res.status(200).json({
      message: "Resume analyzed successfully",
      matchScore,
      matchedSkills,
      missingSkills,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Candidate checks how well their resume fits a job — BEFORE applying.
// Nothing is saved (no Application record, no file on disk); this is a
// pure "preview" that reuses the same free matching engine.
exports.checkJobMatch = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        message: "Only candidates can check their resume match",
      });
    }

    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF resume to check" });
    }

    const parsed = await pdfParse(req.file.buffer);
    const resumeText = parsed.text || "";

    const jobText = `${job.title} ${job.description}`;

    const { matchScore, matchedSkills, missingSkills } = calculateMatch(jobText, resumeText);

    res.status(200).json({
      message: "Match calculated successfully",
      matchScore,
      matchedSkills,
      missingSkills,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};