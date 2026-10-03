const fs = require("fs");
const path = require("path");

/**
 * The one directory that uploaded property photos are written to (multer in
 * routes/ownerRoutes.js) and served from (the /uploads static middleware in
 * index.js).
 *
 * The default is `backend/uploads`, the folder that is committed to the repo.
 * A deployed filesystem is read-only apart from /tmp, so a Vercel deployment
 * has to set `UPLOAD_DIR=/tmp/uploads` to accept uploads at all. Files written
 * there disappear whenever the instance is recycled - see "Uploaded photos" in
 * README.md before relying on it.
 */
const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, "..", "uploads");

// multer does not create its destination, and /tmp/uploads does not exist on a
// fresh instance.
fs.mkdirSync(uploadsDir, { recursive: true });

module.exports = uploadsDir;
