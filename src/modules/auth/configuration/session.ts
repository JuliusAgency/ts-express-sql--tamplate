/**
 *  Defines the express session config
 *
 *  The session object is associated with all routes
 *   and can be accessed on all requests.
 *   default name is connect.sid.
 *   It's advisable to change the name to avoid fingerprinting.
 *   By default, the cookies are set to:
 *   { path: '/', httpOnly: true, secure: false, maxAge: null }
 *   To harden session cookies:
 *  Recommended option secure: true, howevers it
 *   requires an https-enabled web site.
 *  resave: It basically means that for every request to the server,
 *   it reset the session cookie.
 *   Even if the request was from the same user or browser and the session
 *   was never modified during the request.
 *  saveUninitialized: When an empty session object is created and
 *   no properties are set, it is the uninitialized state.
 *   So, setting saveUninitialized to false will not save
 *   the session if it is not modified.
 *  The default value of both resave and saveUninitialized is true,
 *   but using the default is deprecated.
 *   So, set the appropriate value according to the use case.
 */

import { AppConfig } from "src/configuration/ApplicationConfig";

export const sessionOptions = AppConfig.session;
