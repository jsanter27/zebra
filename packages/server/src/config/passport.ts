import { Request } from "express";
import passport from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import ZebraRequestError from "../errors/ZebraRequestError";
import UserModel, { UserObj } from "../models/UserModel";
import ZebraConfig from "../models/ZebraConfig";

/** Message that is set when login succeeds. */
const LOGIN_SUCCESS_MESSAGE = "Login successful.";

/** Message that is set when login fails. */
const LOGIN_FAILURE_MESSAGE = "Username or password is incorrect.";

/** Custom JWT extract function to get JWT from cookie */
const cookieExtractor = (req: Request): string | null => {
  if (!req.cookies) {
    return null;
  }
  return req.cookies.authToken;
};

// AUTH METHOD FOR LOGIN USING USERNAME AND PASSWORD TO GET JWT
passport.use(
  "login",
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
      try {
        // CHECK IF USER WITH USERNAME EXISTS
        const user = await UserModel.findOne({ where: { username } });
        // IF NO USER, LOGIN FAILED
        if (!user) {
          return done(null, null, { message: LOGIN_FAILURE_MESSAGE });
        }
        // IF USER, VALIDATE PASSWORD
        const isValidPassword = await user.checkPassword(password);
        // IF PASSWORD IS INCORRECT, LOGIN FAILED
        if (!isValidPassword) {
          return done(null, null, { message: LOGIN_FAILURE_MESSAGE });
        }
        // IF PASSWORD IS CORRECT, LOGIN SUCCEEDS AND PASSES USER ALONG HOOK
        return done(
          null,
          {
            username: user.username,
            role: user.role,
            changePasswordOnLogin: user.changePasswordOnLogin,
          },
          { message: LOGIN_SUCCESS_MESSAGE }
        );
      } catch (err: unknown) {
        // IF ERROR, PASS ALONG
        return done(err);
      }
    }
  )
);
/** Options for JWT authentication. */
const jwtOptions: StrategyOptions = {
  secretOrKeyProvider: (_req, _token, done) => {
    ZebraConfig.findOne().then((config) => {
      if (!config) {
        done(new Error("Could not retrieve ZEBRA configuration"));
      }
      done(null, config?.jwtSecret);
    });
  },
  jwtFromRequest: ExtractJwt.fromExtractors([
    cookieExtractor,
    ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  ]),
};
// AUTHENTICATION FOR ROUTES WITH `read` PERMISSIONS
passport.use(
  "read",
  new JwtStrategy(jwtOptions, async (user: UserObj, done) => {
    try {
      done(null, user);
    } catch (err) {
      done(err);
    }
  })
);
// AUTHENTICATION FOR ROUTES WITH `read-write` PERMISSIONS
passport.use(
  "read-write",
  new JwtStrategy(jwtOptions, async (user: UserObj, done) => {
    try {
      if (user.role !== "read-write") {
        done(
          new ZebraRequestError(
            401,
            "Incorrect Permissions",
            "User does not have `read-write` permissions."
          )
        );
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  })
);
// SERIALZE FUNCTION (DOESN"T REALLY DO ANYTHING BUT STILL NECESSARY)
passport.serializeUser((user, done) => {
  done(null, user);
});
// DESERIALZE FUNCTION (DOESN"T REALLY DO ANYTHING BUT STILL NECESSARY)
passport.deserializeUser((user: UserObj, done) => {
  done(null, user);
});

// EXPORT AUTHENTICATION METHODS
export const authLogin = passport.authenticate("login", {
  session: false,
});
export const authRead = passport.authenticate("read", { session: false });
export const authReadWrite = passport.authenticate("read-write", {
  session: false,
});
