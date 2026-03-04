const express = require("express");
const cors = require("cors");

const routes = require("./routes/index.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      // permite requests sem origin (curl/health checks) e os origins permitidos
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0) return cb(null, true); // fallback: não quebrar preview
      return allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error("CORS blocked"));
    },
  })
);
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