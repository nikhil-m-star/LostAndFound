const multer = require('multer');

// Use memory storage so files are available as buffers for upload streams
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // accept images only
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB per file
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
