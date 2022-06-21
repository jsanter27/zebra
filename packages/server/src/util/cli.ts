import pm2, { Proc } from "pm2";
import chalk from "chalk";

export function writeStatus(status: string): void {
  let format: string;
  switch (status) {
    case "running":
      format = chalk.green(status);
      break;
    case "stopped":
      format = chalk.red(status);
      break;
    default:
      format = chalk.yellow(status);
      break;
  }
  process.stdout.write(`\nZEBRA server status: ${format}\n\n`);
}

export function writeStdOut(output: string): void {
  process.stdout.write(`${output}\n`);
}

export function writeStdErr(err: Error): void {
  process.stderr.write(`[${chalk.red(err.name)}] ${err.message}\n`);
}

export function finishCommand(err: Error, proc: Proc): void {
  if (err) {
    writeStdErr(err);
    return;
  }
  writeStatus(proc.status || "unknown");
  pm2.disconnect();
}
