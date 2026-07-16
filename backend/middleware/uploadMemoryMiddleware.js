const multer = require("multer");

// Used only for the candidate's "Check My Match" feature — the resume is
// read into memory just long enough to extract its text, then discarded.
// (Unlike uploadMiddleware.js, nothing is saved to the /uploads folder,
// since this isn't a real job application.)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const uploadMemory = multer({ storage, fileFilter });

module.exports = uploadMemory;
