import { RmfOptions } from "../types";

export default class PostprocessorOptions implements RmfOptions {
  public file: string;

  public interval: number;

  constructor({ file = "rmfpp.xml", interval = 1800 }: Partial<RmfOptions>) {
    this.file = file;
    this.interval = interval;
  }
}
