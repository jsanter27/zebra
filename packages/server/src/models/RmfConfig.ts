import {
  Model,
  Table,
  Column,
  PrimaryKey,
  AllowNull,
  Default,
} from "sequelize-typescript";
import logger from "debug";

const debug = logger("zebra:config");

interface RmfLparInfo {
  name: string;
  endpoint: string;
  username?: string;
  password?: string;
  usePostprocessor?: boolean;
  useMonitorThree?: boolean;
}

@Table
class RmfConfig extends Model {
  /**
   * Name of the LPAR that is running the RMF DDS.
   */
  @PrimaryKey
  @AllowNull(false)
  @Column
  public name!: string;

  /**
   * URI or IP address where the RMF DDS is running (should be root level address and can include ports, ex: http://lpar.example.com:8803).
   */
  @AllowNull(false)
  @Column
  public endpoint!: string;

  /**
   * RMF DDS username, if authentication is needed.
   */
  @AllowNull(true)
  @Column
  public username?: string;

  /**
   * RMF DDS username, if authentication is needed.
   */
  @AllowNull(true)
  @Column
  public password?: string;

  /**
   * Flag that indicates if LPAR reports RMF Postprocessor. By default, set to `true`.
   */
  @Default(true)
  @Column
  public usePostprocessor!: boolean;

  /**
   * Flag that indicates if LPAR reports RMF Monitor III. By default, set to `true`.
   */
  @Default(true)
  @Column
  public useMonitorThree!: boolean;

  /**
   * Creates or updates the RMF DDS configuration for the given LPAR.
   * @param lpar RMF DDS config info for the LPAR.
   * @returns The newly created or updated RMF DDS config for the LPAR.
   */
  public static async createOrUpdate(lpar: RmfLparInfo): Promise<RmfConfig> {
    return RmfConfig.findOne({ where: { name: lpar.name } }).then(
      (existing) => {
        if (existing) {
          debug(`Updating RMF DDS configuration for LPAR '${existing.name}'`);
          return existing.update(lpar);
        }
        debug(`Adding RMF DDS configuration for LPAR '${lpar.name}'`);
        return new RmfConfig(lpar).save();
      }
    );
  }
}

export default RmfConfig;
