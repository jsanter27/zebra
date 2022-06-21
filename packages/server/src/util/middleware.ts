import { NextFunction, Request, Response } from "express";
import { User } from "../models/UserModel";

export type ZebraAuthLoginResponse = (token?: string) => Response;

export type ZebraAuthVerifyResponse = (user?: User) => Response;

export type ZebraAuthLogoutResponse = (hasToken: boolean) => Response;

/**
 * Middleware function that sets any custom ZEBRA middleware
 */
export default function setZebraMiddleware(
  _: Request,
  res: Response,
  next: NextFunction
) {
  /**
   * Sends the JSON response after login attempt.
   * @param message Message that the user will see explaining the results.
   * @param token JSON web token for authenticating ZEBRA requests.
   */
  function loginResponse(token?: string): Response {
    if (!token) {
      return res.status(500).json({ message: "Something went wrong." });
    }
    return res
      .cookie("authToken", token, { httpOnly: true })
      .status(200)
      .json({ message: "Login successful.", token });
  }
  /**
   * Sends the JSON response after logout attempt.
   * @param hasToken Indicates if `authToken` cookie exists in request.
   */
  function logoutResponse(hasToken: boolean): Response {
    if (!hasToken) {
      return res.status(400).json({
        message: "Logout only valid for `cookie` authentication, not `header`.",
      });
    }
    return res.status(200).json({ message: "Logout successful." });
  }
  /**
   * Sends the JSON response after attempting to verify authentication.
   * @param message Message that the user will see explaining the results.
   * @param user ZEBRA User object.
   */
  function verifyResponse(user?: User): Response {
    if (!user) {
      return res
        .status(401)
        .json({ message: "Could not verify authentication." });
    }
    return res.status(200).json({ message: "Authentication verified.", user });
  }
  // SET REQ.AUTH
  res.auth = {
    loginResponse,
    logoutResponse,
    verifyResponse,
  };
  next();
}
