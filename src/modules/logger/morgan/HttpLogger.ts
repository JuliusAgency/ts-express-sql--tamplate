import morgan, { StreamOptions } from "morgan";

import { logger } from "../winston/logger";

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream: StreamOptions = {
  // Use the http severity
  write: (message) => logger.http(message),
};

// Build the morgan middleware
export const httpLogger = morgan(
  // Define message format string (this is the default one).
  // The message format is made from tokens, and each token is
  // defined inside the Morgan library.
  ":method :url :status :res[content-length] - :response-time ms",
  // ":remote-addr :method :url :status :res[content-length] - :response-time ms",
  // ":remote-addr - :remote-user [:date[clf]] ':method :url HTTP/:http-version' :status :res[content-length] ':referrer' ':user-agent",
  // It is possible to create a custom token.
  // Options: overwrite the stream.
  { stream }
);