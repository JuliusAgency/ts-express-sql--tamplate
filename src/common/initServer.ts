import dotenv from "dotenv";
import express, { Express } from "express";
import router from "../routes/router";
import cors from "cors";
import { AppConfig } from "../configuration/ApplicationConfig";
import { errorHandler } from "../modules/error-handler/ErrorHandler";

export const initServer = () => {
  dotenv.config();

  const app: Express = express();
  app.use(
    cors({
      credentials: true,
      origin: true,
    })
  );
  app.use(express.json());
  // initAuth(app, User);
  app.use(router);
  app.use(errorHandler);

  const port = AppConfig.application.port;
  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });

  return app;
};
