import { NextFunction, Request, Response } from "express";
import { AnyZodObject, z } from "zod";

const validate = async (
  schema: AnyZodObject,
  objectToValidate: object,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await schema.parseAsync(objectToValidate);
    return next();
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const validateBody =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return validate(schema, req.body, req, res, next);
  };

export const validateQuery =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return validate(schema, req.query, req, res, next);
  };

export const validateParams =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return validate(schema, req.params, req, res, next);
  };

export const validateHeaders =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return validate(schema, req.headers, req, res, next);
  };
