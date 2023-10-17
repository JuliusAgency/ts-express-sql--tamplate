import { Router } from "express";
import {
  resetPassword,
  resetPasswordRequest,
  login,
  logout,
  register,
  getUserByAuth,
} from "../contollers/AuthController";
import { checkAuthenticated } from "../configuration/passport";

const authRouter = Router();

authRouter.post("/login", login);

authRouter.get("/logout", logout);

authRouter.post("/register", register);

authRouter.post("/reset-password-request", resetPasswordRequest);

authRouter.post("/reset-password", resetPassword);

authRouter.get("/auth", checkAuthenticated, getUserByAuth);

export default authRouter;
