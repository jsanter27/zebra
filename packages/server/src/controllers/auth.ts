import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import logger from "debug";
import ZebraConfig from "../models/ZebraConfig";

const debug = logger("zebra:auth");

/**
 * Controller for User login routine.
 */
export async function login(req: Request, res: Response): Promise<Response> {
  try {
    const config = await ZebraConfig.findOne();
    if (!config) {
      throw new Error(
        "There was a problem trying to load ZEBRA's configuration."
      );
    }
    if (!req.user) {
      throw new Error("There was a problem with retrieving user information.");
    }
    const token = jwt.sign(
      {
        username: req.user.username,
        role: req.user.role,
        changePasswordOnLogin: req.user.changePasswordOnLogin,
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiration,
        issuer: "ZEBRA",
        subject: req.user.username,
      }
    );
    return res.auth.loginResponse(token);
  } catch (err) {
    debug(err);
    return res.auth.loginResponse();
  }
}

/** Controller for logging out User by clearing their `authToken` cookie. */
export async function logout(req: Request, res: Response): Promise<Response> {
  if (!req.cookies.authToken) {
    return res.auth.logoutResponse(false);
  }
  return res.auth.logoutResponse(true);
}

/**
 * Controller for verifying User authentication.
 */
export async function verify(req: Request, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      throw new Error("`req.user` not set.");
    }
    return res.auth.verifyResponse({
      username: req.user.username,
      role: req.user.role,
      changePasswordOnLogin: req.user.changePasswordOnLogin,
    });
  } catch (err) {
    debug(err);
    return res.auth.verifyResponse();
  }
}
