import ZebraInternalServerError from "../errors/ZebraInternalServerError";
import ZebraRequestError from "../errors/ZebraRequestError";

/**
 * Handles the the throwing of the proper error in a ZebraRequest.
 * These errors will be caught by the custom error handler.
 * @param err
 */
export default function getZebraRequestError(err: unknown): ZebraRequestError {
  if (err instanceof ZebraRequestError) {
    return err;
  }
  if (err instanceof Error) {
    return new ZebraInternalServerError(err.message);
  }
  return new ZebraInternalServerError();
}
