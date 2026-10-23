// middleware/upload.js
// Handles image uploads (news and gallery).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Allowed file types and the extension we save them with
const allowedTypes = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Random name; we never use the name the user gave the file
    const name = crypto.randomBytes(12).toString('hex') + allowedTypes[file.mimetype];
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },   // 5 MB, one file
  fileFilter: (req, file, cb) => {
    if (!allowedTypes[file.mimetype]) {
      const error = new Error('Only JPG, PNG or WEBP images are allowed.');
      error.isUserError = true;
      return cb(error);
    }
    cb(null, true);
  }
});

// Checks the first bytes of the file to make sure it really is JPG, PNG or WEBP
function looksLikeImage(filePath) {
  const buffer = Buffer.alloc(12);
  const fd = fs.openSync(filePath, 'r');
  try {
    fs.readSync(fd, buffer, 0, 12, 0);
  } finally {
    fs.closeSync(fd);
  }
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.toString('hex', 0, 8) === '89504e470d0a1a0a';
  const isWebp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return isJpeg || isPng || isWebp;
}

// Deletes a file from /uploads/ (does nothing for other paths, like /images/...)
function deleteUploadedImage(imagePath) {
  if (typeof imagePath !== 'string' || !imagePath.startsWith('/uploads/')) {
    return;
  }
  const fileName = path.basename(imagePath);   // basename blocks "../" tricks
  fs.unlink(path.join(uploadDir, fileName), (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Could not delete file:', err.message);
    }
  });
}

// Deletes the file that was just uploaded in this request (used when validation fails)
function discardUpload(req) {
  if (req.file) {
    deleteUploadedImage('/uploads/' + req.file.filename);
  }
}

// Middleware: reads one file from the form field named "image" into req.file
function uploadImage(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        const message = err.code === 'LIMIT_FILE_SIZE'
          ? 'Image is too large (maximum 5 MB).'
          : 'Upload error: ' + err.message;
        return res.status(400).json({ error: message });
      }
      if (err.isUserError) {
        return res.status(400).json({ error: err.message });
      }
      return next(err);
    }

    if (req.file && !looksLikeImage(req.file.path)) {
      discardUpload(req);
      return res.status(400).json({ error: 'The uploaded file is not a valid JPG, PNG or WEBP image.' });
    }
    next();
  });
}

module.exports = { uploadImage, discardUpload, deleteUploadedImage };