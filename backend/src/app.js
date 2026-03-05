const express = require("express");
const cors = require("cors");

const routes = require("./routes/index.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api", routes);

// Error middleware (sempre por último)
app.use(errorHandler);

module.exports = app;