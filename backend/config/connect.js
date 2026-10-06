const mongoose = require("mongoose");
const { useSimpleDb } = require("./databaseMode");

// A mongod running on this machine. Used only when MONGO_DB is not set and the
// app is not running on Vercel, so a fresh clone works with no .env at all.
const LOCAL_MONGO = "mongodb://127.0.0.1:27017/renteasy";

/**
 * Where the app connects. `MONGO_DB` always wins; otherwise local development
 * falls back to LOCAL_MONGO. On Vercel there is no mongod on localhost, so an
 * unset MONGO_DB stays unset and the app reports that instead of guessing.
 */
const databaseUri = () => {
  if (process.env.MONGO_DB) return process.env.MONGO_DB;
  if (process.env.VERCEL) return "";
  return LOCAL_MONGO;
};

/**
 * Connect to MongoDB. A failure is logged and swallowed on purpose: it used to
 * be re-thrown, which took the whole process down, so every route answered with
 * the platform's own error page instead of a message naming the cause. Now
 * `/api/health` reports the database state and the routes answer 503 with it.
 */
const connectionOfDb = async () => {
  // On a deployment that runs on the built-in simple database there is no
  // MongoDB to reach, so do not wait or warn about one (config/databaseMode.js).
  if (useSimpleDb()) {
    console.log(
      "Using the built-in simple database (no MongoDB). Sign in, sign up and " +
        "the admin pages work with no connection string - see README.md."
    );
    return;
  }

  const uri = databaseUri();

  if (!uri) {
    console.error(
      "MONGO_DB is not set. Add it to the Environment Variables of the Vercel " +
        "project - the local fallback only reaches a mongod on your own machine."
    );
    return;
  }

  if (!process.env.MONGO_DB) {
    console.warn(
      `MONGO_DB is not set - using the local MongoDB at ${LOCAL_MONGO}. ` +
        "Start it with `net start MongoDB`, or point MONGO_DB somewhere else."
    );
  }

  try {
    await mongoose.connect(uri, {
      // Fail fast instead of buffering requests until the platform kills them.
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`Connected to MongoDB database "${mongoose.connection.name}"`);
  } catch (err) {
    console.error(`Could not connect to MongoDB: ${err.message}`);
  }
};

module.exports = connectionOfDb;
module.exports.databaseUri = databaseUri;