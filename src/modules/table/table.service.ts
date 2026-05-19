import { Prisma, Table } from "@prisma/client";
import status from "http-status";
import QRCode from "qrcode";
import sharp from "sharp";
import prisma from "../../config/db";
import ApiError from "../../errors/ApiError";
import { IOptions, calculatePagination } from "../../utils/pagination";
import { tableSearchableFields } from "./table.constant";
import { ITableFilterRequest } from "./table.interface";

export class TableService {
  async createTable(payload: Partial<Table>): Promise<Table> {
    const existing = await prisma.table.findUnique({
      where: {
        number_restaurantId: {
          number: payload.number as string,
          restaurantId: payload.restaurantId as string,
        },
      },
    });

    if (existing) {
      throw new ApiError(
        status.BAD_REQUEST,
        `Table '${payload.number}' already exists in your restaurant.`,
      );
    }

    const result = await prisma.table.create({
      data: {
        number: payload.number as string,
        status: payload.status,
        layoutSettings: payload.layoutSettings as any,
        restaurantId: payload.restaurantId as string,
      },
    });

    return result;
  }

  async getAllTables(
    filters: ITableFilterRequest,
    options: IOptions,
    restaurantId: string,
  ) {
    const { limit, page, skip } = calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions: Prisma.TableWhereInput[] = [];

    andConditions.push({ restaurantId });

    if (searchTerm) {
      andConditions.push({
        OR: tableSearchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive",
          },
        })),
      });
    }

    if (Object.keys(filterData).length > 0) {
      andConditions.push({
        AND: Object.keys(filterData).map((key) => ({
          [key]: {
            equals: (filterData as any)[key],
          },
        })),
      });
    }

    const whereConditions: Prisma.TableWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.table.findMany({
      where: whereConditions,
      skip,
      take: limit,

      include: {
        currentSession: true,
      },
    });

    const total = await prisma.table.count({
      where: whereConditions,
    });

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: result,
    };
  }

  async getTableById(id: string, restaurantId: string): Promise<Table | null> {
    const result = await prisma.table.findUnique({
      where: {
        id_restaurantId: {
          id,
          restaurantId,
        },
      },
      include: {
        currentSession: true,
      },
    });

    if (!result) {
      throw new ApiError(status.NOT_FOUND, "Table not found");
    }

    return result;
  }

  async updateTable(
    id: string,
    restaurantId: string,
    payload: Partial<Table>,
  ): Promise<Table> {
    const isExist = await prisma.table.findUnique({
      where: {
        id_restaurantId: {
          id,
          restaurantId,
        },
      },
    });

    if (!isExist) {
      throw new ApiError(status.NOT_FOUND, "Table not found");
    }

    if (payload.number && payload.number !== isExist.number) {
      const existingName = await prisma.table.findUnique({
        where: {
          number_restaurantId: {
            number: payload.number,
            restaurantId,
          },
        },
      });
      if (existingName) {
        throw new ApiError(
          status.BAD_REQUEST,
          `Table number '${payload.number}' already exists in your restaurant.`,
        );
      }
    }

    const { id: _, restaurantId: __, ...updateData } = payload;

    const result = await prisma.table.update({
      where: { id },
      data: updateData as any,
    });

    return result;
  }

  async deleteTable(id: string, restaurantId: string): Promise<Table> {
    const isExist = await prisma.table.findUnique({
      where: {
        id_restaurantId: {
          id,
          restaurantId,
        },
      },
      include: {
        currentSession: true,
      },
    });

    if (!isExist) {
      throw new ApiError(status.NOT_FOUND, "Table not found");
    }

    if (isExist.currentSession) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Cannot delete table while there is an active session on it.",
      );
    }

    const result = await prisma.table.delete({
      where: { id },
    });

    return result;
  }

  // async generateQrCodeBuffer(id: string, originUrl?: string): Promise<Buffer> {
  //   const table = await prisma.table.findUnique({
  //     where: { id },
  //     include: { restaurant: { select: { name: true } } },
  //   });

  //   if (!table) {
  //     throw new ApiError(status.NOT_FOUND, "Table not found");
  //   }

  //   const baseUrl = originUrl || "https://restoq.app";
  //   const targetUrl = `${baseUrl}/order?restaurantId=${table.restaurantId}&tableId=${table.id}`;

  //   const qrBuffer = await QRCode.toBuffer(targetUrl, {
  //     errorCorrectionLevel: "H",
  //     width: 512,
  //     margin: 2,
  //     color: {
  //       dark: "#1e293b",
  //       light: "#ffffff",
  //     },
  //   });

  //   return qrBuffer

  // }

  async generateQrCodeBuffer(id: string, originUrl?: string): Promise<Buffer> {
    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!table) {
      throw new ApiError(status.NOT_FOUND, "Table not found");
    }

    const baseUrl = originUrl || "https://restoq.app";

    const targetUrl = `${baseUrl}/order?restaurantId=${table.restaurantId}&tableId=${table.id}`;

    /**
     * QR
     */

    const qrBuffer = await QRCode.toBuffer(targetUrl, {
      errorCorrectionLevel: "H",
      width: 620,
      margin: 2,
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    });

    /**
     * ESCAPED TEXT
     */

    const restaurantName = escapeXml(table.restaurant.name);
    const tableNumber = escapeXml(String(table.number));

    /**
     * SVG DESIGN
     */

    const svg = `
  <svg
    width="900"
    height="1200"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100%" height="100%" fill="#f8fafc"/>

    <rect
      x="70"
      y="70"
      width="760"
      height="1060"
      rx="40"
      fill="white"
      stroke="#e2e8f0"
      stroke-width="2"
    />

    <text
      x="450"
      y="150"
      text-anchor="middle"
      font-size="48"
      font-weight="700"
      font-family="sans-serif"
      fill="#11116e"
    >
      ${restaurantName}
    </text>

    <text
      x="450"
      y="205"
      text-anchor="middle"
      font-size="24"
      font-family="sans-serif"
      fill="#64748b"
    >
      Scan to view menu &amp; order
    </text>

    <rect
      x="320"
      y="235"
      width="260"
      height="4"
      rx="2"
      fill="#e2e8f0"
    />

    <circle
      cx="450"
      cy="610"
      r="78"
      fill="white"
      stroke="#e2e8f0"
      stroke-width="8"
    />

    <text
      x="450"
      y="620"
      text-anchor="middle"
      font-size="28"
      font-weight="700"
      font-family="sans-serif"
      fill="#0f172a"
    >
      restoQ
    </text>

    <rect
      x="300"
      y="980"
      width="300"
      height="90"
      rx="45"
      fill="#0f172a"
    />

    <text
      x="450"
      y="1038"
      text-anchor="middle"
      font-size="34"
      font-weight="700"
      font-family="sans-serif"
      fill="white"
    >
       ${tableNumber}
    </text>

    <text
      x="450"
      y="1100"
      text-anchor="middle"
      font-size="20"
      font-family="sans-serif"
      fill="#8000ff"
    >
      Powered by restoQ
    </text>
  </svg>
  `;

    /**
     * FINAL IMAGE
     */

    return await sharp(Buffer.from(svg))
      .composite([
        {
          input: qrBuffer,
          top: 280,
          left: 140,
        },
      ])
      .png()
      .toBuffer();
  }
}
/**
 * ESCAPE XML
 */

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
