import pm2 from "pm2";
import { writeStatus, writeStdErr } from "./helpers";

export = function stop(): void {
  /** STOP PM2 PROCESS */
  pm2.connect((err: Error) => {
    if (err) {
      writeStdErr(err);
      pm2.disconnect();
      return;
    }
    pm2.stop("zebra", (stopError: Error): void => {
      if (stopError) {
        writeStdErr(stopError);
        pm2.disconnect();
        return;
      }
      writeStatus("stopped");
      pm2.disconnect();
    });
  });
};
