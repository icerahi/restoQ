import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { queryOptions } from "../../utils/pagination";
import { pick } from "../../utils/pick";
import { sendResponse } from "../../utils/sendResponse";
import { tableFilterableFields } from "./table.constant";
import { TableService } from "./table.service";

export class TableController {
  private tableService: TableService;

  constructor() {
    this.tableService = new TableService();
  }

  createTable = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;

    const result = await this.tableService.createTable({
      ...req.body,
      restaurantId,
    });

    const protocol = req.protocol;
    const host = req.get("host") as string;
    const originUrl = `${protocol}://${host}`;

    const formattedData = {
      ...result,
      qrCodeUrl: `${originUrl}/api/v1/table/${result.id}/qr`,
    };

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Table created successfully",
      data: formattedData,
    });
  });

  getAllTables = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const filters = pick(req.query, tableFilterableFields);
    const options = pick(req.query, queryOptions);
    
    const protocol = req.protocol;
    const host = req.get("host") as string;
    const originUrl = `${protocol}://${host}`;

    const result = await this.tableService.getAllTables(
      filters,
      options,
      restaurantId,
    );

    const formattedData = result.data.map((table) => ({
      ...table,
      qrCodeUrl: `${originUrl}/api/v1/table/${table.id}/qr`,
    }));

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Tables retrieved successfully",
      data: {
        meta: result.meta,
        data: formattedData,
      },
    });
  });

  getTableById = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const id = req.params.id as string;
    const protocol = req.protocol;
    const host = req.get("host") as string;
    const originUrl = `${protocol}://${host}`;

    const result = await this.tableService.getTableById(id, restaurantId);

    const formattedData = result
      ? {
          ...result,
          qrCodeUrl: `${originUrl}/api/v1/table/${result.id}/qr`,
        }
      : null;

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Table details retrieved successfully",
      data: formattedData,
    });
  });

  updateTable = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const id = req.params.id as string;

    const result = await this.tableService.updateTable(id, restaurantId, req.body);

    const protocol = req.protocol;
    const host = req.get("host") as string;
    const originUrl = `${protocol}://${host}`;

    const formattedData = {
      ...result,
      qrCodeUrl: `${originUrl}/api/v1/table/${result.id}/qr`,
    };

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Table updated successfully",
      data: formattedData,
    });
  });

  deleteTable = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const id = req.params.id as string;

    await this.tableService.deleteTable(id, restaurantId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Table deleted successfully",
      data: null,
    });
  });

  getTableQr = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    
    // We can infer the protocol/host from the incoming request or configure it.
    // If the frontend makes this call, we can point the target URL to the frontend client URL structure.
    const protocol = req.protocol;
    const host = req.get("host") as string;
    const originUrl = `${protocol}://${host}`;

    const qrBuffer = await this.tableService.generateQrCodeBuffer(id, originUrl);

    res.setHeader("Content-Type", "image/png");
    // Cache the image for 1 year (immutable) to prevent regeneration overhead for CDNs & browsers
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(qrBuffer);
  });
}
