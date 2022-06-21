import express, {
  Application,
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import logger from "debug";
import createError from "http-errors";
import passport from "passport";
import zebraMiddleware from "./util/middleware";
import authRouter from "./routes/auth";
import "./config/passport";

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
app.use(zebraMiddleware);

/** Add routes */
app.use("/auth/v1", authRouter);

/** Catch 404 and pass it to error handler */
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createError(404));
});

/** Error handler */
const handleError: ErrorRequestHandler = (err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
};
app.use(handleError);

export = app;
