const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectionofDb = require("./config/connect.js");
const uploadsDir = require("./config/uploads.js");

const app = express();

//////dotenv config/////////////////////
dotenv.config();

//////connection to DB/////////////////
connectionofDb();

///////////////port number///////////////////
const PORT = process.env.PORT || 8001;

/////////////////middlewares////////////////
app.use(express.json());
app.use(cors());

/////////////////routes/////////////////////
// Uploaded property photos are served from the same folder multer writes to.
app.use("/uploads", express.static(uploadsDir));

app.use('/api/user', require('./routes/userRoutes.js'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.use('/api/owner', require('./routes/ownerRoutes'))

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