import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

import { AppError, ResponseCode } from "./AppError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    appErrorHandler(err, res);
  } else if (err instanceof ZodError) {
    zodErrorHandler(err, res);
  } else {
    internalErrorHandler(err, res);
  }
};

const appErrorHandler = (err: AppError, res: Response) => {
  res.status(err.code).json({ message: err.message });
};

const zodErrorHandler = (err: ZodError, res: Response) => {
  const paresdError = fromZodError(err);
  res.status(ResponseCode.UNPORCESSABLE_ENTITY).json({ message: paresdError });
};

const internalErrorHandler = (err: Error, res: Response) => {
  res
    .status(ResponseCode.INTERNAL_SERVER_ERROR)
    .send(`Internal server error ${err.message}`);
};
