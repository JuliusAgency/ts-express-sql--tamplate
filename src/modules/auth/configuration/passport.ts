/**
 *  Defines the passport config
 */

import passport from "passport";
import { Express, Request, Response, NextFunction } from "express";
import LocalStrategy from "../strategies/local";

export const initPassport = (app: Express, User: any) => {
  // Mount strategies
  LocalStrategy.init(passport, User);

  passport.serializeUser((user: any, done: any) => {
    /***
     * If authentication succeeds, passport.authenticate calls the serializeUser
     * function, passing in the user object.
     * serializeUser creates a unique identifier for the user and stores it in the session.
     * After the done function, it passes to the next middleware in the chain.
     */
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    /***
     * Is called with the user identifier stored in the session.
     * deserializeUser retrieves the user object from the database using the identifier,
     * and passes it to the next middleware in the chain.
     */

    User.findById(id).then((user: any) => {
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  });

  // init passport on every route call
  app.use(passport.initialize());
  // passport.session has to be used after
  // express.session in order to work properly.
  // allow passport to use "express-session"
  app.use(passport.session());
  // passport function that calls the strategy to be executed
  app.use(passport.authenticate("session"));
};

export const checkAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  /**
   * If the user is already authenticated and the browser already has a session id
   * then upon request the deSerializeUser function will be called first,
   * it will retrieve the user from the session and add it to
   * req.user and pass to isAuthenticated function.
   * If the user is already autenticated in isAuthenticated function (req.user exist)
   * then go to next function which will be /api/user route.
   * Otherwise, redirect to homepage.         *
   */
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401);
};
