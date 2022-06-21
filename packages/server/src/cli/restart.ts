import pm2 from "pm2";
import { writeStatus, writeStdErr } from "../util/cli";

export = function restart(): void {
  /** RESTART PM2 PROCESS */
  pm2.connect((err: Error) => {
    if (err) {
      writeStdErr(err);
      pm2.disconnect();
      return;
    }
    pm2.restart("zebra", (restartError: Error): void => {
      if (restartError) {
        writeStdErr(restartError);
        pm2.disconnect();
        return;
      }
      writeStatus("running");
      pm2.disconnect();
    });
  });
};
