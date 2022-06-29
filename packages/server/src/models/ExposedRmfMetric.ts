import {
  Model,
  Table,
  Column,
  AllowNull,
  ForeignKey,
  Default,
  Is,
  BeforeCreate,
  BeforeUpdate,
  DataType,
  AfterFind,
  BeforeBulkUpdate,
  PrimaryKey,
  AfterSave,
} from "sequelize-typescript";
import { Optional, UpdateOptions } from "sequelize";
import RmfConfig from "./RmfConfig";

/**
 * Structure of a filter used for
 */
export type ExposedRmfMetricFilter = {
  key: string;
  value: string | number | boolean;
  comparison?: "=" | ">" | "<" | ">=" | "<=";
};

/**
 * The attributes of an exposed RMF metric.
 */
export type ExposedRmfMetricAttributes = {
  /**
   * Unique identifying name used for the Exposed Metric configuration.
   */
  name: string;
  /**
   * Description used to identify indicate the purpose
   * of the custom metric.
   */
  desc: string;
  /**
   * Name of the LPAR that is reporting the RMF metrics.
   */
  lpar: string;
  /**
   * Name of the RMF Monitor III report.
   */
  report: string;
  /**
   * The resource parameter that specifies where to pull the metrics.
   */
  resource?: string;
  /**
   * Filter applied to extracting the metric field.
   */
  filter?: ExposedRmfMetricFilter[];
  /**
   * The key whose value will be used for the metric.
   */
  field: string;
};

/** The attributes needed for creating an exposed RMF metric. */
export type ExposedRmfMetricCreationAttributes = Optional<
  ExposedRmfMetricAttributes,
  "resource" | "filter"
>;

/**
 * Model used for custom ZEBRA metrics.
 */
@Table({ tableName: "rmf-metrics" })
class ExposedRmfMetric extends Model<
  ExposedRmfMetricAttributes,
  ExposedRmfMetricCreationAttributes
> {
  /**
   * Identifying name used for the Exposed Metric configuration.
   */
  @PrimaryKey
  @AllowNull(false)
  @Is("nonempty metric name", (val) => val !== "")
  @Column
  public name!: string;

  /**
   * Description used to identify indicate the purpose
   * of the custom metric.
   */
  @AllowNull(false)
  @Is("nonempty metric description", (val) => val !== "")
  @Column
  public desc!: string;

  /**
   * Name of the LPAR that is reporting the RMF metrics.
   */
  @ForeignKey(() => RmfConfig)
  @AllowNull(false)
  @Column
  public lpar!: string;

  /**
   * Name of the RMF Monitor III report.
   */
  @AllowNull(false)
  @Column
  public report!: string;

  /**
   * The resource parameter that specifies where to pull the metrics.
   */
  @AllowNull(true)
  @Column
  public resource?: string;

  /**
   * Filter applied to extracting the metric field.
   */
  @Default("{}")
  @Column(DataType.STRING)
  public filter!: ExposedRmfMetricFilter[];

  /**
   * The key whose value will be used for the metric.
   */
  @AllowNull(false)
  @Column
  public field!: string;

  /**
   * Sets the parameter `individualHooks` to be `true` for all `ExposedRmfMetric` queries. Removes the need
   * for specifying with each query.
   * @param options The options for the UPDATE query being passed through the hook.
   */
  @BeforeBulkUpdate
  public static enableIndividualHooks(options: UpdateOptions): void {
    options.individualHooks = true;
  }

  /**
   * Serializes the `filter` into a string to be stored in the DB.
   * @param metric ExposedRmfMetric instance that is being created or updated.
   */
  @BeforeCreate
  @BeforeUpdate
  public static async serializeFilter(
    metric: Omit<ExposedRmfMetric, "filter"> & {
      filter: string;
    }
  ): Promise<void> {
    if (metric.changed("filter")) {
      metric.filter = JSON.stringify(
        metric.filter as unknown as ExposedRmfMetricFilter
      );
    }
  }

  /**
   * Deserializes the `filter` into an instance of `ExposedRmfMetricFilter` from DB.
   * @param metric ExposedRmfMetric instance that is being created or updated.
   */
  @AfterFind
  @AfterSave
  public static async deserializeFilter(
    metric: ExposedRmfMetric
  ): Promise<void> {
    metric.filter = JSON.parse(
      metric.filter as unknown as string
    ) as ExposedRmfMetricFilter[];
  }
}

export default ExposedRmfMetric;
