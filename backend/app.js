import dotenv from "dotenv";
dotenv.config();
import express from "express";
import logger from "./utils/logger.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import healthRouter from "./routes/health.route.js";
import spotifyRouter from "./routes/spotify.route.js";
import spotifyAuthRouter from "./routes/spotifyAuth.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
const morganFormat = ":method :url :status :response-time ms"; // Log method, URL, status, and response time
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        // Parse morgan log message and transform it into a structured log object
        const parts = message.trim().split(" ");
        const logObject = {
          method: parts[0], // HTTP method (e.g., GET, POST)
          url: parts[1], // Request URL
          status: parts[2], // HTTP status code
          responseTime: parseFloat(parts[3]), // Response time in milliseconds
        };
        logger.info(JSON.stringify(logObject)); // Log the request as JSON
      },
    },
  })
);

// Routes
// server health check
app.use("/api/health", healthRouter);

// spotify routes
app.use("/api/spotify", spotifyRouter);

app.use("/auth/spotify", spotifyAuthRouter);

app.use(errorHandler);
export { app };
