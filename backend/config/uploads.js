const fs = require("fs");
const path = require("path");

const { onVercel } = require("./databaseMode");

/**
 * The one directory that uploaded property photos are written to (multer in
 * routes/ownerRoutes.js) and served from (the /uploads static middleware in
 * index.js).
 *
 * The default is `backend/uploads`, the folder that is committed to the repo.
 * A deployed filesystem is read-only apart from /tmp, so on Vercel the default
 * is `/tmp/uploads` instead: without that every "Submit form" on the owner's
 * Add Property page failed inside multer, and the browser was only told about
 * it in the console. Files written there disappear whenever the instance is
 * recycled - see "Uploaded photos" in README.md before relying on it.
 * `UPLOAD_DIR` overrides both defaults.
 */
const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : onVercel()
  ? "/tmp/uploads"
  : path.join(__dirname, "..", "uploads");

// multer does not create its destination, and /tmp/uploads does not exist on a
// fresh instance. A folder that cannot be created (a read-only checkout, a
// mistyped UPLOAD_DIR) must not take the whole server down at boot: log it and
// let the upload fail with a message the Add Property page now shows.
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (error) {
  console.warn(
    `Could not create the upload folder "${uploadsDir}" (${error.message}). ` +
      "Uploading property photos will fail until UPLOAD_DIR points at a writable folder."
  );
}

module.exports = uploadsDir;
