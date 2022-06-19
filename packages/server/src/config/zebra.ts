import yaml from "js-yaml";
import fs from "fs";
import User from "../models/User";
import RmfConfig from "../models/RmfConfig";
import ZebraConfig from "../models/ZebraConfig";
import sequelize from "./sequelize";

interface ZebraConfigFile {
  port?: number;
  rmf?: [
    {
      name: string;
      endpoint: string;
      auth?: {
        username: string;
        password: string;
      };
      usePostprocessor?: boolean;
      useMonitorThree?: boolean;
    }
  ];
}

async function configZebra(
  port?: number,
  configFile?: string
): Promise<ZebraConfig> {
  // SYNC SQLITE DB
  await sequelize.sync({ alter: true });
  // GET CONFIG OR CREATE DEFAULT ON FIRST STARTUP
  let config = await ZebraConfig.startup();
  // HANDLE CONFIG FILE FIRST (MANUAL OPTIONS TAKE PRECEDENT OVER CONFIG FILE)
  if (configFile) {
    const parsedConfigFile: ZebraConfigFile = yaml.load(
      fs.readFileSync(configFile, "utf-8")
    );
    if (parsedConfigFile.port) {
      config = await config.setPort(parsedConfigFile.port);
    }
    if (parsedConfigFile.rmf) {
      parsedConfigFile.rmf.forEach((lpar) => {
        RmfConfig.createOrUpdate({
          name: lpar.name,
          endpoint: lpar.endpoint,
          username: lpar.auth?.username,
          password: lpar.auth?.password,
          usePostprocessor: lpar.usePostprocessor,
          useMonitorThree: lpar.useMonitorThree,
        });
      });
    }
  }
  // HANDLE PORT OPTION IF PROVIDED
  if (port) {
    config = await config.setPort(port);
  }
  // HANDLE INITIAL USER IF NO USERS EXIST ALREADY
  await User.startup();
  // RETURN CONFIG OBJECT
  return config;
}

export = configZebra;
