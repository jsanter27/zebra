import ZebraRequestError from "./ZebraRequestError";

/**
 * Generalized ZEBRA request error. Returns HTTP status code `500`.
 */
export default class ZebraInternalServerError extends ZebraRequestError {
  /**
   * Example of the response body returned after this error is thrown.
   */
  static RESPONSE_BODY = {
    name: "Internal Server Error",
    message: "Something went wrong on the server.",
  };

  constructor(
    message: string = ZebraInternalServerError.RESPONSE_BODY.message
  ) {
    super(500, ZebraInternalServerError.RESPONSE_BODY.name, message);
  }
}
