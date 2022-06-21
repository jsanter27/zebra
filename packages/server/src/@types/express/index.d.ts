declare global {
  declare module "express-serve-static-core" {
    interface Request {
      user?: import("../../models/UserModel").User;
    }
    interface Response {
      auth: {
        loginResponse: import("../../util/middleware").ZebraAuthLoginResponse;
        logoutResponse: import("../../util/middleware").ZebraAuthLogoutResponse;
        verifyResponse: import("../../util/middleware").ZebraAuthVerifyResponse;
      };
    }
  }
}
