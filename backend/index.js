const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectionofDb = require("./config/connect.js");
const uploadsDir = require("./config/uploads.js");

const app = express();

//////dotenv config/////////////////////
dotenv.config();

//////////////////////secret/////////////////////
// Login tokens are signed with JWT_KEY. The fallback keeps sign-in working on a
// fresh clone; a deployment must set JWT_KEY, otherwise it signs tokens with a
// value that anybody can read in this repository.
if (!process.env.JWT_KEY) {
  process.env.JWT_KEY = "renteasy-local-development-secret";
  console.warn(
    "JWT_KEY is not set - signing tokens with the built-in development secret. " +
      "Set JWT_KEY in the Vercel project before going live."
  );
}

//////connection to DB/////////////////
connectionofDb();

///////////////port number///////////////////
const PORT = process.env.PORT || 8001;

/////////////////middlewares////////////////
app.use(express.json());
app.use(cors());

// Every /api route below reads or writes MongoDB. With no connection mongoose
// waits 10 seconds per query and then fails with a stack trace, which a browser
// can only ever show as "nothing happened" - answer with something readable
// instead. A request that arrives while the handshake is still running waits
// for it rather than being turned away.
const requireDatabase = async (req, res, next) => {
  const deadline = Date.now() + 5000;
  while (mongoose.connection.readyState === 2 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).send({
    success: false,
    message:
      "The database is not connected. Start MongoDB and set MONGO_DB in " +
      "backend/.env (local), or in the Vercel project's Environment Variables, " +
      "then try again.",
  });
};

/////////////////routes/////////////////////
// Uploaded property photos are served from the same folder multer writes to.
app.use("/uploads", express.static(uploadsDir));

app.use('/api/user', requireDatabase, require('./routes/userRoutes.js'))
app.use('/api/admin', requireDatabase, require('./routes/adminRoutes'))
app.use('/api/owner', requireDatabase, require('./routes/ownerRoutes'))

/////////////////health/////////////////////
// Publicly routable through the /api/* rewrite, so a deployment can be checked
// without a browser: it answers even when MongoDB is unreachable.
app.get("/api/health", (req, res) => {
  res.status(200).send({
    status: "ok",
    service: "house-rent-backend",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});



// Local development (`node index.js`, `npm start`) binds a port. A Vercel
// service instead imports this module and serves the exported app, so only
// listen when this file is the process entry point; `module.exports` is what the
// Vercel Node runtime answers incoming requests with.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;