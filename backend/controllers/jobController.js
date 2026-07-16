const Job = require('../models/Job');

// CREATE JOB (Recruiter only)
exports.createJob = async (req, res) => {
  try {
    const { title, description, company, location, salary, jobType } = req.body;

    const newJob = new Job({
      title,
      description,
      company,
      location,
      salary,
      jobType,
      postedBy: req.user.id
    });

    await newJob.save();

    res.status(201).json({
      message: 'Job posted successfully',
      job: newJob
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// GET ALL JOBS + SEARCH + FILTER
exports.getAllJobs = async (req, res) => {
  try {

    const { keyword, location, jobType } = req.query;

    let filter = {};

    // Search by title or company
    if (keyword) {
      filter.$or = [
        {
          title: {
            $regex: keyword,
            $options: "i"
          }
        },
        {
          company: {
            $regex: keyword,
            $options: "i"
          }
        }
      ];
    }

    // Filter by location
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i"
      };
    }

    // Filter by job type
    if (jobType) {
      filter.jobType = jobType;
    }

    // Filter by minimum salary
    if (req.query.minSalary) {
      filter.salary = {
        $gte: Number(req.query.minSalary)
      };
    }

    const jobs = await Job.find(filter)
      .populate("postedBy", "name email");

    res.status(200).json(jobs);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET SINGLE JOB
exports.getJobById = async (req, res) => {
  try {

    console.log("========== GET JOB ==========");
    console.log("Requested ID:", req.params.id);

    const job = await Job.findById(req.params.id)
      .populate("postedBy", "name email");

    console.log("Job Found:", job);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    res.status(200).json(job);

  } catch (error) {

    console.log("GET JOB ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// UPDATE JOB
exports.updateJob = async (req, res) => {
  try {

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to edit this job"
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      message: "Job updated successfully",
      job: updatedJob
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// DELETE JOB
exports.deleteJob = async (req, res) => {
  try {

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete this job"
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Job deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET MY JOBS
exports.getMyJobs = async (req, res) => {
  try {

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can view their jobs"
      });
    }

    const jobs = await Job.find({
      postedBy: req.user.id
    });

    res.status(200).json(jobs);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};