const multer = require("multer");
const path = require("path");

// Memory storage is used for Vercel compatibility (read-only file system)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;

