import {
  Model,
  Table,
  Column,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  Default,
} from "sequelize-typescript";
import RmfConfig from "./RmfConfig";

/**
 * Model used for custom ZEBRA metrics.
 */
@Table({ tableName: "metrics" })
class ExposedRmfMetric extends Model {
  /**
   * Unique name or key for identifying the custom metric.
   */
  @PrimaryKey
  @AllowNull(false)
  @Column
  public metricName!: string;

  /**
   * Name of the LPAR that is running the RMF DDS.
   */
  @ForeignKey(() => RmfConfig)
  @AllowNull(false)
  @Column
  public lpar!: string;

  /**
   * The name of the RMF report type.
   */
  @AllowNull(false)
  @Column
  public report!: string;

  /**
   * The name of the RMF resource to request to.
   */
  @AllowNull(true)
  @Column
  public resource?: string;

  /**
   * JSON string representing a filter on which data to use.
   */
  @Default("{}")
  @Column
  public filter!: string;

  /**
   * The field that makes up this custom metric's value.
   */
  @AllowNull(false)
  @Column
  public field!: string;

  /**
   * Description to help indicate what the custom metric is used for.
   */
  @Default("")
  @Column
  public desc!: string;
}

export default ExposedRmfMetric;
