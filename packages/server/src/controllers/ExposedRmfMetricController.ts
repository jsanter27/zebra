import {
  Controller,
  Middlewares,
  Post,
  Route,
  SuccessResponse,
  Tags,
  Example,
  Response,
  Body,
  Path,
} from "tsoa";
import { authReadWrite } from "../config/passport";
import ZebraInternalServerError from "../errors/ZebraInternalServerError";
import ZebraRequestError from "../errors/ZebraRequestError";
import ExposedRmfMetric, {
  ExposedRmfMetricAttributes,
  ExposedRmfMetricCreationAttributes,
} from "../models/ExposedRmfMetric";
import getZebraRequestError from "../util/getZebraError";

export type ExposedRmfMetricCreateRequest = Omit<
  ExposedRmfMetricCreationAttributes,
  "name"
>;

@Route("/api/v1/rmf/metric")
@Tags("RMF Exposed Metrics")
@Middlewares([authReadWrite])
export class ExposedRmfMetricController extends Controller {
  /**
   * Creates an exposed RMF metric with the given name.
   */
  @Post("/{name}")
  @SuccessResponse("201", "Exposed RMF Metric Created")
  @Example<ExposedRmfMetricAttributes>({
    name: "RPRT_ALL_LPAR_PTOU",
    desc: "Physical total utilization of each LPAR in RPRT's CPC report",
    lpar: "RPRT",
    report: "CPC",
    resource: ",RPRT,MVS_IMAGE",
    filter: [
      {
        key: "CPCPPNAM",
        value: "*",
      },
    ],
    field: "CPCPPTOU",
  })
  @Response("400", "Exposed RMF Metric Already Exists")
  @Response("401", "Unauthorized", "Unauthorized")
  @Response(
    "500",
    "Internal Server Error",
    ZebraInternalServerError.RESPONSE_BODY
  )
  public async createRmfMetric(
    @Body() body: ExposedRmfMetricCreateRequest,
    @Path("name") metricName: string
  ): Promise<ExposedRmfMetricAttributes> {
    try {
      if (!metricName || metricName === "") {
        throw new ZebraRequestError(
          400,
          "Metric Name Not Specified",
          "A metric name must be specified in order to create an exposed RMF metric."
        );
      }
      const prev = await ExposedRmfMetric.findOne({
        where: { name: metricName },
      });
      if (prev) {
        throw new ZebraRequestError(
          400,
          "Exposed RMF Metric Already Exists",
          `An exposed RMF metric already exists with the name '${metricName}'.`
        );
      }
      const newRmfMetric = await new ExposedRmfMetric({
        name: metricName,
        ...body,
      }).save();
      return {
        name: newRmfMetric.name,
        desc: newRmfMetric.desc,
        lpar: newRmfMetric.lpar,
        report: newRmfMetric.report,
        resource: newRmfMetric.resource,
        filter: newRmfMetric.filter,
        field: newRmfMetric.field,
      };
    } catch (err) {
      throw getZebraRequestError(err);
    }
  }
}
