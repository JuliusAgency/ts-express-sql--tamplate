import { Express } from "express";
import session from "express-session";

import { sessionOptions } from "./configuration/session";
import { initPassport } from "./configuration/passport";
import { sessionStorage } from "./configuration/storage";
import { emailClientImpl } from "../email-client";

export const initAuth = (app: Express, User: any)=> {
  
  const store = { store: sessionStorage()}

  app.use(session({...sessionOptions, ...store}));

  initPassport(app, User);
};

// Reexport for usage the client inside the auth package 
export const emailClient = emailClientImpl;