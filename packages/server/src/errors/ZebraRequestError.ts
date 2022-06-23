/**
 * Errors occured during ZEBRA API call.
 */
export default class ZebraRequestError extends Error {
  public status: number;

  constructor(status: number, name: string, message: string) {
    super(message);
    this.name = name;
    this.status = status;
  }
}
