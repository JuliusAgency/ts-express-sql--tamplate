import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { emailClient } from "../index";
import {
  resetPasswordRequestService,
  resetPasswordService,
} from "../../auth/services/AuthService";

const AUTH_ERROR =
  "Critical Error: No Such User Exists in Database While Still Authenticated";

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local-login",
    (err: any, user: any, info: any, status: any) => {
      if (err) {
        return res.status(403).json(err);
      }
      if (!user) {
        return res.status(404).send(info);
      }
      req.logIn(user, (error) => {
        if (err) {
          return next(err);
        }
        return res.send(user);
      });
    }
  )(req, res, next);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logOut((err: any) => {
    if (err) {
      return res.status(500).send({ message: err, success: false });
    }

    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).send({ message: err, success: false });
      }
    });

    return res.status(200).send({ message: "logged Out", success: true });
  });
};

export const register = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local-register",
    (err: any, user: any, info: any, status: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send(info);
      }

      return res.send(user);
    }
  )(req, res, next);
};

export const resetPasswordRequest = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const emailParams = await resetPasswordRequestService(email);
    const emailOptions = emailClient.buildEmailOptions(
      "resetPasswordRequest",
      emailParams
    );

    await emailClient.sendEmail(emailOptions);
    return res.status(200).send({ params: emailParams, success: true });
  } catch (error: Error | any) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { user, token, password } = req.body;

  try {
    const emailParams = await resetPasswordService(user, token, password);
    const emailOptions = emailClient.buildEmailOptions(
      "resetPassword",
      emailParams
    );
    await emailClient.sendEmail(emailOptions);
    return res.status(200).send({ params: emailParams, success: true });
  } catch (error: Error | any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserByAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await req.user;
  if (!user) {
    return res.status(404).json(AUTH_ERROR);
  }
  return res.status(200).json(user);
};
