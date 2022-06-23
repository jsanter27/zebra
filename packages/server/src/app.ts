import express, { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import logger from "debug";
import swagger from "swagger-ui-express";
import passport from "passport";
import "./config/passport";
import { ValidationError } from "sequelize";
import ZebraRequestError from "./errors/ZebraRequestError";
import ZebraInternalServerError from "./errors/ZebraInternalServerError";
import { RegisterRoutes } from "./tsoa/routes";

/** Express application */
const app: Application = express();

/** Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  morgan("dev", {
    stream: {
      write: (out) => {
        const debug = logger("zebra:req");
        debug(out);
      },
    },
  })
);
app.use(cors());
app.use(passport.initialize());

/** Route for accessing generated SwaggerUI */
app.use(
  "/docs",
  swagger.serve,
  async (_req: Request, res: Response): Promise<void> => {
    res.send(swagger.generateHTML(await import("./tsoa/swagger.json")));
  }
);

/** Register automatically generated routes */
RegisterRoutes(app);

/** Custom request error handler */
app.use("*", (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZebraRequestError) {
    res.status(err.status).json({
      error: err.name,
      message: err.message,
    });
  } else if (err instanceof ValidationError) {
    res.status(400).json({
      error: "Validation Error",
      message: err.message,
    });
  } else if (err instanceof Error) {
    const debug = logger("zebra:error");
    debug(err.message);
    res.status(500).json(ZebraInternalServerError.RESPONSE_BODY);
  }
  next();
});

export = app;
