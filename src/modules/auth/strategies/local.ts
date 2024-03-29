/***
 * Define passport local strategy
 * 
 * To authenticate, Passport first looks at the user's login details,
 *  then invokes a verified callback (done). 
 * If the user gets properly authenticated, pass the user into the callback. 
 * If the user does not get appropriately authenticated, pass false into the callback. 
 * You also have the option to pass a specific message into the callback.
 * 
 * When you use sessions with Passport, as soon as a user gets appropriately authenticated,
 *  a new session begins. 
 * When this transpires, we serialize the user data to the session
 *  and the user ID is stored in req.session.passport.user. 
 * To access the user data it is deserialized, using the user ID as its key.
 * The user data is queried and attached to req.user
 */

import { Request } from "express";

import { Strategy } from "passport-local";

class LocalStrategy {
  public static init(app: any, User: any): any {
    // configure the register strategy.
    app.use("local-register", new Strategy({
      // by default, local strategy uses username and password, 
      // we will override with email
      usernameField: "email",
      passwordField: 'password',
      // allows to pass the entire request to the callback
      passReqToCallback: true
    }, async (req: Request, email, password, done) => {
      try {
        const user = await User.findOne({"email": email.toLowerCase()});
        if (user) {
          done(null, false, { message: "User already exists"});
        } else {
          const newUser = new User(req.body);
          try {
            const user = await newUser.save();
            done(null, user);
          } catch (e) {
            done(e);
          }
        }
      } catch (e) {
        done(e);
      }
    }));

    // configure the login strategy.
    app.use("local-login", new Strategy({
      usernameField: "email",
      passwordField: 'password'
    }, async (email, password, done) => {
    try {
      const user = await User.findOne({"email": email.toLowerCase()});
      if (!user) { 
        return done(null, false, { message: 'User not found.' });
      }
      if (user.email != email ) {
        done(null, false, { message: "User or password incorrect"});
      }
      await user.comparePassword(password, (err: any, isMatch: boolean) => {
        if (err) { done(null, err); }
        if (!isMatch) {
          done(null, false, { message: "User or password incorrect"});
        } else {
          done(null, user);
        }
      });
    } catch (e) {
      done(e);
    }
    }));
  }
}

export default LocalStrategy