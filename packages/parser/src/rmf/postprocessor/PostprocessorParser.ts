import RmfParser from "../RmfParser";
import {
  IPostprocessor,
  PostprocessorOptionsParams,
  PostprocessorRequestParams,
} from "./types";
import PostprocessorOptions from "./PostprocessorOptions";
import { RmfRequestParams } from "../types";
import {
  ddsFormatDate,
  ddsFormatDuration,
  ddsFormatJobOutDel,
  ddsFormatOverview,
  ddsFormatSmfData,
  ddsFormatSmfSort,
  ddsFormatTimeOfDay,
  ddsFormatTimeout,
} from "./util";
import parsePostprocessorReport from "./parsePostprocessorReport";

export default class PostprocessorParser
  extends RmfParser
  implements IPostprocessor
{
  constructor(dds: string, options: PostprocessorOptionsParams = {}) {
    super(dds, new PostprocessorOptions({ ...options }));
  }

  public buildRequestEndpoint(
    report: string,
    params?: PostprocessorRequestParams
  ): string {
    let reportSuboptions = "";
    let additionalParams = "";
    if (params) {
      // First, add suboptions to report if specified
      if (params.suboptions) {
        if (typeof params.suboptions === "string") {
          reportSuboptions = `(${params.suboptions})`;
        } else {
          reportSuboptions = `(${params.suboptions.join(",")})`;
        }
      }
      // Next, add any additional parameters if specified
      if (params.date) {
        additionalParams += `&date=${encodeURIComponent(
          `${ddsFormatDate(params.date.start)},${ddsFormatDate(
            params.date.end
          )}`
        )}`;
      }
      if (params.duration) {
        additionalParams += `&duration=${encodeURIComponent(
          ddsFormatDuration(params.duration)
        )}`;
      }
      if (params.jobOutDel) {
        additionalParams += `&joboutdel=${encodeURIComponent(
          ddsFormatJobOutDel(params.jobOutDel)
        )}`;
      }
      if (params.overview) {
        additionalParams += `&overview=${encodeURIComponent(
          ddsFormatOverview(params.overview)
        )}`;
      }
      if (params.smf) {
        additionalParams += `&smfdata=${encodeURIComponent(
          ddsFormatSmfData(params.smf.data)
        )}`;
        additionalParams += `&smfsort=${encodeURIComponent(
          ddsFormatSmfSort(params.smf.sort)
        )}`;
      }
      if (params.sysid) {
        additionalParams += `&sysid=${encodeURIComponent(params.sysid)}`;
      }
      if (params.timeOfDay) {
        additionalParams += `&timeofday=${encodeURIComponent(
          `${ddsFormatTimeOfDay(params.timeOfDay.start)},${ddsFormatTimeOfDay(
            params.timeOfDay.end
          )}`
        )}`;
      }
      if (params.timeout) {
        additionalParams += `&timeout=${encodeURIComponent(
          ddsFormatTimeout(params.timeout)
        )}`;
      }
    }
    return `${this.dds}/gpm/${this.options.file}?reports=${report}${reportSuboptions}${additionalParams}`;
  }

  public async getReport(
    report: string,
    params?: RmfRequestParams
  ): Promise<object> {
    const xml = await this.ddsRequest(report, params);
    return parsePostprocessorReport(xml);
  }

  public async cache(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("CACHE", params);
  }

  public async cf(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("CF", params);
  }

  public async chan(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("CHAN", params);
  }

  public async cpu(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("CPU", params);
  }

  public async crypto(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("CRYPTO", params);
  }

  public async device(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("DEVICE", params);
  }

  public async eadm(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("EADM", params);
  }

  public async hfs(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("HFS", params);
  }

  public async ioq(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("IOQ", params);
  }

  public async omvs(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("OMVS", params);
  }

  public async pagesp(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("PAGESP", params);
  }

  public async paging(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("PAGING", params);
  }

  public async sdelay(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("SDELAY", params);
  }

  public async vstor(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("VSTOR", params);
  }

  public async wlmgl(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("WLMGL", params);
  }

  public async xcf(params?: PostprocessorRequestParams): Promise<object> {
    return this.getReport("XCF", params);
  }
}
