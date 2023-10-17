import mongoose, { Model, Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import { AppConfig } from "src/configuration/ApplicationConfig";

const SALT_WORK_FACTOR = Number(AppConfig.saltWork) || 10;

export interface BaseUserInterface extends Document {
  name?: string;
  email: string;
  password: string;
}

// Put all base user instance methods in this interface:
export interface BaseUserMethodsInterface {
  comparePassword(password: string, cb: any): boolean;
}

// Create a new Model type that knows about BaseUserMethodsInterface...
export type BaseUserModel = Model<
  BaseUserInterface,
  {},
  BaseUserMethodsInterface
>;

const baseOptions = {
  discriminatorKey: "__type",
  collection: "users",
  timestamps: true,
};

export const BaseUserSchema = new Schema<BaseUserInterface>(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  baseOptions
);

BaseUserSchema.pre("save", function (next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();
  // hash the password
  bcrypt.hash(this.password, SALT_WORK_FACTOR, (err, hash) => {
    if (err) return next(err);
    // override the cleartext password with the hashed one
    this.password = hash;
    next();
  });
});

BaseUserSchema.method(
  "comparePassword",
  async function comparePassword(password: string, cb: any) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
    });
  }
);

export const BaseUser = model<BaseUserInterface, BaseUserModel>(
  "BaseUser",
  BaseUserSchema
);
