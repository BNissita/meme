const multer = require('multer');

// Configure memory storage
const storage = multer.memoryStorage();

// Check if file is PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limit to 10MB
  }
});

module.exports = upload;
