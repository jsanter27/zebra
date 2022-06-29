import {
  Body,
  Controller,
  Example,
  Middlewares,
  Path,
  Post,
  Route,
  SuccessResponse,
  Tags,
  Response,
  Get,
  Put,
  Delete,
} from "tsoa";
import { authReadWrite } from "../config/passport";
import ZebraInternalServerError from "../errors/ZebraInternalServerError";
import ZebraRequestError from "../errors/ZebraRequestError";
import RmfConfig, {
  RmfConfigAttributes,
  RmfConfigCreationAttributes,
} from "../models/RmfConfig";
import getZebraRequestError from "../util/getZebraError";

/**
 * Schema for body of RMF config creation request.
 */
type RmfConfigCreateRequest = Omit<RmfConfigCreationAttributes, "name">;

/**
 * Schema for body of RMF config update request.
 */
type RmfConfigUpdateRequest = Partial<RmfConfigCreateRequest>;

/**
 * Schema for RMF config in response body.
 */
type RmfConfigResponse = Omit<RmfConfigAttributes, "username" | "password">;

type RmfConfigDeleteResponse = {
  message: string;
};

@Route("/api/v1/rmf/config")
@Tags("RMF Configuration")
@Middlewares([authReadWrite])
export class RmfConfigController extends Controller {
  /**
   * Creates an RMF DDS configuration for the given LPAR.
   */
  @Post("/{lpar}")
  @SuccessResponse("201", "RMF Configuration Created")
  @Example<RmfConfigResponse>({
    name: "RPRT",
    endpoint: "https://rprt.example.com:8803",
    usePostprocessor: true,
    useMonitorThree: true,
  })
  @Response("400", "RMF Config Already Exists")
  @Response("401", "Unauthorized", "Unauthorized")
  @Response(
    "500",
    "Internal Server Error",
    ZebraInternalServerError.RESPONSE_BODY
  )
  public async createRmfConfig(
    @Body() body: RmfConfigCreateRequest,
    @Path("lpar") lpar: string
  ): Promise<RmfConfigResponse> {
    try {
      if (!lpar || lpar === "") {
        throw new ZebraRequestError(
          400,
          "LPAR Not Specified",
          "An LPAR must be specified in order to create an RMF configuration for it."
        );
      }
      const prev = await RmfConfig.findOne({ where: { name: lpar } });
      if (prev) {
        throw new ZebraRequestError(
          400,
          "RMF Config Already Exists",
          `An RMF DDS configuration already exists for ${lpar}.`
        );
      }
      const newRmfConfig = await new RmfConfig({ name: lpar, ...body }).save();
      return {
        name: newRmfConfig.name,
        endpoint: newRmfConfig.endpoint,
        usePostprocessor: newRmfConfig.usePostprocessor,
        useMonitorThree: newRmfConfig.useMonitorThree,
      };
    } catch (err) {
      throw getZebraRequestError(err);
    }
  }

  /**
   * Retrieves the RMF configuration for the specified LPAR.
   */
  @Get("/{lpar}")
  @SuccessResponse("200", "RMF Configuration Retrieved")
  @Example<RmfConfigResponse>({
    name: "RPRT",
    endpoint: "https://rprt.example.com:8803",
    usePostprocessor: true,
    useMonitorThree: true,
  })
  @Response("404", "RMF Config Not Found")
  @Response("401", "Unauthorized", "Unauthorized")
  @Response(
    "500",
    "Internal Server Error",
    ZebraInternalServerError.RESPONSE_BODY
  )
  public async getRmfConfig(
    @Path("lpar") lpar: string
  ): Promise<RmfConfigResponse> {
    try {
      const rmfConfig = await RmfConfig.findOne({ where: { name: lpar } });
      if (!rmfConfig) {
        throw new ZebraRequestError(
          404,
          "RMF Config Not Found",
          `An RMF configuration does not exist for ${lpar}.`
        );
      }
      return {
        name: rmfConfig.name,
        endpoint: rmfConfig.endpoint,
        usePostprocessor: rmfConfig.usePostprocessor,
        useMonitorThree: rmfConfig.useMonitorThree,
      };
    } catch (err) {
      throw getZebraRequestError(err);
    }
  }

  /**
   * Retrieves the RMF DDS configurations for all LPARs.
   */
  @Get("/")
  @SuccessResponse("200", "RMF Configurations Retrieved")
  @Example<RmfConfigResponse[]>([
    {
      name: "RPRT",
      endpoint: "https://rprt.example.com:8803",
      usePostprocessor: true,
      useMonitorThree: true,
    },
    {
      name: "DVLP",
      endpoint: "http://dvlp.example.com:8803",
      usePostprocessor: false,
      useMonitorThree: true,
    },
  ])
  @Response("401", "Unauthorized", "Unauthorized")
  @Response(
    "500",
    "Internal Server Error",
    ZebraInternalServerError.RESPONSE_BODY
  )
  public async getAllRmfConfig(): Promise<RmfConfigResponse[]> {
    try {
      const rmfConfigs = await RmfConfig.findAll();
      return rmfConfigs.map(
        (rmfConfig): RmfConfigResponse => ({
          name: rmfConfig.name,
          endpoint: rmfConfig.endpoint,
          usePostprocessor: rmfConfig.usePostprocessor,
          useMonitorThree: rmfConfig.useMonitorThree,
        })
      );
    } catch (err) {
      throw getZebraRequestError(err);
    }
  }

  /**
   * Updates the RMF configuration for the given LPAR.
   */
  @Put("/{lpar}")
  @SuccessResponse("201", "RMF Configuration Updated")
  @Example<RmfConfigResponse>({
    name: "RPRT",
    endpoint: "https://rprt.example.com:8803",
    usePostprocessor: false,
    useMonitorThree: true,
  })
  @Response("400", "LPAR Not Specified")
  @Response("401", "Unauthorized", "Unauthorized")
  @Response("404", "RMF Config Not Found")
  @Response(
    "500",
    "Internal Server Error",
    ZebraInternalServerError.RESPONSE_BODY
  )
  public async updateRmfConfig(
    @Body() body: RmfConfigUpdateRequest,
    @Path("lpar") lpar: string
  ): Promise<RmfConfigResponse> {
    try {
      if (!lpar || lpar === "") {
        throw new ZebraRequestError(
          400,
          "LPAR Not Specified",
          "An LPAR must be specified in order to create an RMF configuration for it."
        );
      }
      if (body === {}) {
        throw new ZebraRequestError(
          400,
          "No Updated Properties Given",
          "No properties were found to update in the request."
        );
      }
      const rmfConfig = await RmfConfig.findOne({ where: { name: lpar } });
      if (!rmfConfig) {
        throw new ZebraRequestError(
          404,
          "RMF Config Not Found",
          `An RMF configuration does not exist for ${lpar}.`
        );
      }
      const updatedRmfConfig = await rmfConfig.update(body);
      return {
        name: updatedRmfConfig.name,
        endpoint: updatedRmfConfig.endpoint,
        usePostprocessor: updatedRmfConfig.usePostprocessor,
        useMonitorThree: updatedRmfConfig.useMonitorThree,
      };
    } catch (err) {
      throw getZebraRequestError(err);
    }
  }

  /**
   * Deletes the RMF configuration for the given LPAR.
   */
  @Delete("/{lpar}")
  @SuccessResponse("201", "RMF Configuration Updated")
  @Example<RmfConfigDeleteResponse>({
    message: "The RMF configuration for LPAR 'RPRT' has been deleted.",
  })
  @Response("400", "LPAR Not Specified")
  @Response("401", "Unauthorized", "Unauthorized")
  @Response("404", "RMF Config Not Found")
  @Response(
    "500",
    "Internal Server Error",
    ZebraInternalServerError.RESPONSE_BODY
  )
  public async deleteRmfConfig(
    @Path() lpar: string
  ): Promise<RmfConfigDeleteResponse> {
    try {
      if (!lpar || lpar === "") {
        throw new ZebraRequestError(
          400,
          "LPAR Not Specified",
          "An LPAR must be specified in order to create an RMF configuration for it."
        );
      }
      const rmfConfig = await RmfConfig.findOne({ where: { name: lpar } });
      if (!rmfConfig) {
        throw new ZebraRequestError(
          404,
          "RMF Config Not Found",
          `An RMF configuration does not exist for ${lpar}`
        );
      }
      await RmfConfig.destroy({
        where: { name: lpar },
      });
      return {
        message: `The RMF configuration for LPAR '${lpar}' has been deleted.`,
      };
    } catch (err) {
      throw getZebraRequestError(err);
    }
  }
}
