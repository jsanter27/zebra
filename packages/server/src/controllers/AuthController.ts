import { Request as ExpressRequest } from "express";
import {
  Controller,
  Middlewares,
  Post,
  Route,
  Response,
  Tags,
  Request,
  Example,
  Get,
  SuccessResponse,
  Body,
} from "tsoa";
import jwt from "jsonwebtoken";
import { authLogin, authRead, authReadWrite } from "../config/passport";
import ZebraInternalServerError from "../errors/ZebraInternalServerError";
import UserModel, { UserAttributes, UserObj } from "../models/UserModel";
import ZebraConfig from "../models/ZebraConfig";
import ZebraRequestError from "../errors/ZebraRequestError";
import getZebraRequestError from "../util/getZebraError";

/**
 * Schema for login request body.
 */
type LoginRequest = Pick<UserAttributes, "username" | "password">;

/**
 * Schema for successful login response body.
 */
type LoginResponse = {
  token: string;
  user: UserObj;
};

/**
 * Schema for successful logout response body.
 */
type LogoutResponse = {
  message: string;
};

/**
 * Schema for successful verify response body.
 */
type VerifyResponse = {
  user: UserObj;
};

type RegisterRequest = Pick<UserAttributes, "username" | "password"> &
  Partial<Pick<UserAttributes, "role" | "changePasswordOnLogin">>;

type RegisterResponse = {
  user: UserObj;
};

@Route("/auth/v1")
@Tags("Authentication")
export class AuthController extends Controller {
  /**
   * Logs the user in and returns their JWT used for authentication.
   * @returns Promise containing the generated JWT after successful login.
   */
  @Post("/login")
  @Middlewares([authLogin])
  @SuccessResponse("201", "Token Created.")
  @Example<LoginResponse>({
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    user: {
      username: "jsanter27",
      role: "read-write",
    },
  })
  @Response("401", "Unauthorized", "Unauthorized")
  @Response(
    "500",
    "Internal Server Error",
    ZebraInternalServerError.RESPONSE_BODY
  )
  public async login(
    @Body() _body: LoginRequest,
    @Request() req: ExpressRequest
  ): Promise<LoginResponse> {
    try {
      const config = await ZebraConfig.findOne();
      if (!config || !req.user) {
        throw new ZebraInternalServerError();
      }
      const token = jwt.sign(
        {
          username: req.user.username,
          role: req.user.role,
        },
        config.jwtSecret,
        {
          expiresIn: config.jwtExpiration,
          issuer: "ZEBRA",
          subject: req.user.username,
        }
      );
      this.setHeader(
        "Set-Cookie",
        `authToken=${token}; SameSite=Strict; HttpOnly`
      );
      return {
        token,
        user: {
          username: req.user.username,
          role: req.user.role,
        },
      };
    } catch (err) {
      throw getZebraRequestError(err);
    }
  }

  /**
   * Logs the user out by destroy `authToken` cookie. Invalid for those using `Authentication` header
   * to store their JWT.
   * @param req Express request object.
   * @returns Promise containing a message after successful logout.
   */
  @Post("/logout")
  @Middlewares([authRead])
  @SuccessResponse("200", "Token Cookie Destroyed")
  @Example<LogoutResponse>({
    message: "Logout successful.",
  })
  @Response("400", "JWT Cookie Not Found", {
    error: "JWT Cookie Not Found",
    message: "Logout only valid for `cookie` authentication, not `header`.",
  })
  @Response("401", "Unauthorized", "Unauthorized")
  @Response(
    "500",
    "Internal Server Error",
    ZebraInternalServerError.RESPONSE_BODY
  )
  public async logout(@Request() req: ExpressRequest): Promise<LogoutResponse> {
    try {
      if (!req.cookies.authToken) {
        throw new ZebraRequestError(
          400,
          "JWT Cookie Not Found",
          "Logout only valid for `cookie` authentication, not `header`."
        );
      }
      this.setHeader(
        "Set-Cookie",
        `authToken=; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
      );
      return {
        message: "Logout successful.",
      };
    } catch (err) {
      throw getZebraRequestError(err);
    }
  }

  /**
   * Verifies that the user is currently logged in.
   * @param req Express request object.
   * @returns Promise containing the user found from authentication.
   */
  @Get("/verify")
  @Middlewares([authRead])
  @SuccessResponse("200", "User Authenticated")
  @Example<VerifyResponse>({
    user: {
      username: "jsanter27",
      role: "read-write",
    },
  })
  @Response("401", "Unauthorized", "Unauthorized")
  @Response(
    "500",
    "Internal Server Error",
    ZebraInternalServerError.RESPONSE_BODY
  )
  public async verify(@Request() req: ExpressRequest): Promise<VerifyResponse> {
    try {
      if (!req.user) {
        throw new ZebraInternalServerError();
      }
      return {
        user: {
          username: req.user.username,
          role: req.user.role,
        },
      };
    } catch (err) {
      throw getZebraRequestError(err);
    }
  }

  /**
   * Creates a new ZEBRA user. Only users with `read-write` permissions can create other users.
   * @returns Promise containing the newly created user, if successful.
   */
  @Post("/register")
  @Middlewares([authReadWrite])
  @SuccessResponse("201", "User Created")
  @Example<VerifyResponse>({
    user: {
      username: "jsanter27",
      role: "read-write",
    },
  })
  @Response("401", "Unauthorized", "Unauthorized")
  @Response(
    "500",
    "Internal Server Error",
    ZebraInternalServerError.RESPONSE_BODY
  )
  public async register(
    @Body() body: RegisterRequest
  ): Promise<RegisterResponse> {
    try {
      const { username, password, role, changePasswordOnLogin } = body;
      const prevUser = await UserModel.findOne({ where: { username } });
      if (prevUser) {
        throw new ZebraRequestError(
          400,
          "Username Already Exists",
          "A user with the provided username already exists. Usernames must be unique."
        );
      }
      let newUser = new UserModel({
        username,
        password,
        role,
        changePasswordOnLogin,
      });
      newUser = await newUser.save();
      return {
        user: {
          username: newUser.username,
          role: newUser.role,
        },
      };
    } catch (err) {
      throw getZebraRequestError(err);
    }
  }
}
