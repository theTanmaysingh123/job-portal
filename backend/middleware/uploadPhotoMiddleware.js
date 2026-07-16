const multer = require("multer");
const path = require("path");

// Storage configuration — profile photos go into the same /uploads folder
// as resumes, but keep their own recognizable prefix.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName = "photo-" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Allow only common image formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or WEBP images are allowed"), false);
  }
};

const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

module.exports = uploadPhoto;
