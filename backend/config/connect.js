const mongoose = require("mongoose");

/**
 * Connect to MongoDB using `MONGO_DB`.
 *
 * A failure is logged and swallowed on purpose. It used to be re-thrown, which
 * took the whole process down: every route then answered with the platform's
 * own error page instead of a message naming the cause, so nothing on the site
 * could explain what was wrong. Now `/api/health` reports the database state and
 * the individual routes fail with a JSON message.
 */
const connectionOfDb = async () => {
  if (!process.env.MONGO_DB) {
    console.error(
      "MONGO_DB is not set. Add it to backend/.env for local development, or " +
        "to the Environment Variables of the Vercel project."
    );
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_DB, {
      // Fail fast instead of buffering requests until the platform kills them.
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(`Could not connect to MongoDB: ${err.message}`);
  }
};

module.exports = connectionOfDb;