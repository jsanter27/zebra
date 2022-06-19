import { Table, Column, Model, Default } from "sequelize-typescript";
import logger from "debug";

const debug = logger("zebra:config");

/**
 * Model to store ZEBRA configuration between runtimes.
 */
@Table
class ZebraConfig extends Model {
  /**
   * The port that the ZEBRA application runs on.
   */
  @Default(3090)
  @Column
  public port!: number;

  /**
   * Routine that initializes (if necessary) and retrieves ZEBRA's config on startup.
   * @returns The previously existing or newly created ZEBRA config object.
   */
  public static async startup(): Promise<ZebraConfig> {
    const config = this.findOne();
    if (config != null) {
      return new this()
        .save()
        .then((newConfig) => {
          debug(`Initial config created with port ${newConfig.port}.`);
          return newConfig;
        })
        .catch((err) => {
          throw err;
        });
    }
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
}

export default ZebraConfig;
