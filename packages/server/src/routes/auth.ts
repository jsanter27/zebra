import { Router } from "express";
import passport from "passport";
import { login, logout, verify } from "../controllers/auth";

const router = Router();

/** Login user. */
router.post(
  "/login",
  passport.authenticate("login", { session: false }),
  login
);

/** Logout user. */
router.get("/logout", passport.authenticate("jwt", { session: false }), logout);

/** Verify user is authenticated. */
router.get("/verify", passport.authenticate("jwt", { session: false }), verify);

export default router;
