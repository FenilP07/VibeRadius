import dotenv from "dotenv";
dotenv.config();
import express from "express";
import logger from "./utils/logger.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors"
import authRouter from "./routes/user.route.js";
import healthRoutes from "./routes/health.route.js";
import spotifyRoutes from "./routes/spotify.route.js";
import spotifyAuthRoutes from "./routes/spotifyAuth.route.js";
import sessionRoutes from "./routes/session.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL,
    ],
    credentials: true,
  })
);

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
app.use("/api/health", healthRoutes);

// authentication routes
app.use("/api/auth", authRouter);

// spotify routes
app.use("/api/spotify", spotifyRoutes);
app.use("/api/session", sessionRoutes);
app.use("/auth/spotify", spotifyAuthRoutes);


app.use(errorHandler);
export { app };
