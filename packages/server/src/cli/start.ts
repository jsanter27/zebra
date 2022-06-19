import pm2 from "pm2";
import path from "path";
import fs from "fs";
import { writeStatus, writeStdErr } from "./helpers";

export = function start(port?: number, configFile?: string): void {
  /** SET PORT IF PROVIDED */
  if (port) {
    process.env.PORT = port.toString();
  }

  /** SET CONFIG FILE IF PROVIDED */
  if (configFile) {
    if (!fs.existsSync(configFile)) {
      writeStdErr(
        new Error(`The provided config file at '${configFile}' does not exist`)
      );
      return;
    }
    process.env.ZEBRA_CONFIG_FILE = configFile;
  }

  /** START PM2 PROCESS */
  pm2.connect((err: Error) => {
    if (err) {
      writeStdErr(err);
      pm2.disconnect();
      return;
    }
    pm2.start(
      {
        script: path.join(__dirname, "..", "..", "bin", "www"),
        name: "zebra",
      },
      (startError: Error): void => {
        if (startError) {
          writeStdErr(startError);
          pm2.disconnect();
          return;
        }
        writeStatus("running");
        pm2.disconnect();
      }
    );
  });
};
