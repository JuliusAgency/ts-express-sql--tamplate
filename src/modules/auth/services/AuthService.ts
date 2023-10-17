import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { Types } from "mongoose";

import { BaseUser } from "../models/baseUser";
import { Token } from "../models/token/Token";
import { AppConfig } from "src/configuration/ApplicationConfig";

const saltWorkFactor = Number(AppConfig.saltWork);

export const resetPasswordRequestService = async (email: string) => {
  const user = await BaseUser.findOne({ email });
  if (!user) throw new Error("the user doesn't exists");
  const resetToken = await createAndStoreResetPasswordToken(user._id);

  const resetRequestParams = {
    email: String(user?.email),
    //@ts-ignore
    name: String(user?.firstName + " " + user?.lastName),
    token: resetToken,
    id: String(user._id),
  };
  return resetRequestParams;
};

const createAndStoreResetPasswordToken = async (id: Types.ObjectId) => {
  // create new reset token
  const token = await Token.findOne({ user: id });
  if (token) await token.deleteOne();
  const resetPasswordToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetPasswordToken, saltWorkFactor);

  // save the token
  const n_t = await new Token({
    user: id,
    token: hash,
    createdAt: Date.now(),
  }).save();
  return resetPasswordToken;
};

export const resetPasswordService = async (
  id: string,
  token: string,
  password: string
) => {
  const passwordResetToken = await validateResetToken(id, token);

  const hash = await bcrypt.hash(password, saltWorkFactor);
  const user = await BaseUser.findOneAndUpdate(
    { _id: id },
    { $set: { password: hash } },
    { new: true }
  );

  await passwordResetToken.deleteOne();
  const resetParams = {
    email: String(user?.email),
    //@ts-ignore
    name: String(user?.firstName + " " + user?.lastName),
  };
  return resetParams;
};

const validateResetToken = async (id: string, token: string) => {
  const passwordResetToken = await Token.findOne({ user: id });
  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }
  const dateNow = Date.now();
  const tokenDate = passwordResetToken.craetedAt.getTime();
  const expired = dateNow - tokenDate > passwordResetToken.expiresSec * 1000;
  if (expired) {
    throw new Error("Invalid or expired password reset token");
  }
  return passwordResetToken;
};
