import { TableStatus } from "@prisma/client";

export interface ITableFilterRequest {
  searchTerm?: string;
  status?: TableStatus;
}
