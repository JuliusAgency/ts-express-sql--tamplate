import { createWriteStream } from "fs";
import { format, createLogger, transports, http } from "winston";
import "winston-daily-rotate-file";

const { timestamp, combine, errors, json } = format;

const loggerFileLocation =
  process.env.SIMPLE_LOGGER_FILE_LOCATION || "logs/log.json";
const loggerFileMaxSize = process.env.SIMPLE_LOGGER_FILE_MAX_SIZE || "20m";
const loggerDatePattern =
  process.env.SIMPLE_LOGGER_FILE_DATE_PATTERN || "yyyy-MM-dd.";
const loggerMaxFiles = process.env.SIMPLE_LOGGER_MAX_FILES || "14d";
const loggerZippedArchive = Boolean(
  process.env.SIMPLE_LOGGER_ZIPPED_ARCHIVE || "false"
);
const loggerLevel = process.env.SIMPLE_LOGGER_LEVEL || "http";

const logTransports = [
  new transports.Console({
    format: format.combine(
      format.colorize(),
      format.printf(({ timestamp, level, message, metadata }) => {
        return `[${timestamp}] ${level}: ${message}}`;
      })
    ),
  }),
  new transports.DailyRotateFile({
    filename: loggerFileLocation,
    datePattern: loggerDatePattern,
    zippedArchive: loggerZippedArchive,
    maxSize: loggerFileMaxSize,
    maxFiles: loggerMaxFiles,
    format: format.combine(format.json()),
  }),
];

export const logger = createLogger({
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: logTransports,
  level: loggerLevel,
});
