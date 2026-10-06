const path = require("path");

/**
 * Which database the backend talks to.
 *
 * Local development uses MongoDB (`MONGO_DB`, or the mongod on this machine -
 * see config/connect.js). A hosted deployment does not have to run MongoDB at
 * all: unless it is switched off, a deployment (Vercel) uses the built-in
 * "simple database" (backend/db/simpleModel.js), a small JSON-file store that
 * keeps sign up, sign in and the admin pages working with no external service
 * and no connection string. Set `USE_SIMPLE_DB=false` together with `MONGO_DB`
 * to use MongoDB on a deployment instead.
 *
 * The value is read once per process, because the schema modules pick their
 * model at require time (schemas/userModel.js and friends).
 */
const onVercel = () => Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

const useSimpleDb = () => {
  if (process.env.USE_SIMPLE_DB === "true") return true;
  if (process.env.USE_SIMPLE_DB === "false") return false;
  return onVercel();
};

/**
 * Where the simple database keeps its JSON files. Only `/tmp` is writable on
 * Vercel and it is emptied when an instance is recycled (see "Simple database"
 * in README.md); locally the default is the git-ignored `backend/data`.
 */
const simpleDbDir = () =>
  process.env.SIMPLE_DB_DIR
    ? path.resolve(process.env.SIMPLE_DB_DIR)
    : onVercel()
    ? "/tmp/renteasy-db"
    : path.join(__dirname, "..", "data");

module.exports = { useSimpleDb, simpleDbDir, onVercel };
