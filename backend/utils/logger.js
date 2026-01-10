import { createLogger, format, transports } from "winston";
const { combine, timestamp, json, printf, colorize } = format;

const consoleLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [
    new transports.Console({
      format: combine(colorize(), timestamp(), consoleLogFormat), // Colorized console logs with timestamp
    }),
    new transports.File({ filename: "backend/app.log" }), // File logs in JSON format
  ],
});

export default logger;