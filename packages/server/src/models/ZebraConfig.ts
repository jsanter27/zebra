import crypto from "crypto";
import {
  Table,
  Column,
  Model,
  Default,
  BeforeCreate,
} from "sequelize-typescript";
import logger from "debug";

const debug = logger("zebra:config");

/**
 * Length of the default and randomly generated JWT secret.
 */
const DEFAULT_JWT_SECRET_LENGTH = 32;

/**
 * Model to store ZEBRA configuration between runtimes.
 */
@Table({ tableName: "config" })
class ZebraConfig extends Model {
  /**
   * The port that the ZEBRA application runs on.
   */
  @Default(3090)
  @Column
  public port!: number;

  /**
   * The secret used to sign the access token JWT. By default, the secret is a randomly generated 32 character string.
   */
  @Column
  public jwtSecret!: string;

  /**
   * The amount of time, in hours, the access token is valid until expiration. By default, the value is one hour.
   */
  @Default("1h")
  @Column
  public jwtExpiration!: string;

  /**
   * Routine that initializes (if necessary) and retrieves ZEBRA's config on startup.
   * @returns The previously existing or newly created ZEBRA config object.
   */
  public static async startup(): Promise<ZebraConfig> {
    const config: ZebraConfig | null = await this.findOne();
    if (!config) {
      debug("No config found, creating initial default one...");
      return new this()
        .save()
        .then((newConfig) => {
          debug(`Default config created with port ${newConfig.port}.`);
          return newConfig;
        })
        .catch((err) => {
          throw err;
        });
    }
    debug(`Previous config found with port ${config.port}.`);
    return config;
  }

  /**
   * Gets the port number from the current ZEBRA config.
   * @returns Port number.
   */
  public getPort(): number {
    return this.port;
  }

  /**
   * Sets the port number for the current ZEBRA config.
   * @param port Port number.
   * @returns Updated ZEBRA config object.
   */
  public async setPort(port: number): Promise<ZebraConfig> {
    return this.update("port", port)
      .then((updatedConfig) => {
        debug(`Updated configuration: port is now ${updatedConfig.port}`);
        return updatedConfig;
      })
      .catch((err) => {
        throw err;
      });
  }

  /**
   * Randomly generates a JWT secret if not manually set.
   * @param config Instance of ZEBRA config about to be created.
   */
  @BeforeCreate
  public static generateDefaultJwtSecret(config: ZebraConfig): void {
    if (!config.jwtSecret) {
      config.jwtSecret = crypto
        .randomBytes(DEFAULT_JWT_SECRET_LENGTH)
        .toString("hex");
    }
  }
}

export default ZebraConfig;
