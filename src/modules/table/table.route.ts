import { Role } from "@prisma/client";
import { Router } from "express";
import { authTenant } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { TableController } from "./table.controller";
import { createTableSchema, updateTableSchema } from "./table.validation";

const router = Router();
const tableController = new TableController();

router.post(
  "/",
  authTenant([Role.OWNER, Role.MANAGER]),
  validateRequest(createTableSchema),
  tableController.createTable,
);

router.get("/", authTenant([]), tableController.getAllTables);

router.get("/:id", authTenant([]), tableController.getTableById);

router.patch(
  "/:id",
  authTenant([Role.OWNER, Role.MANAGER]),
  validateRequest(updateTableSchema),
  tableController.updateTable,
);

router.delete(
  "/:id",
  authTenant([Role.OWNER, Role.MANAGER]),
  tableController.deleteTable,
);

router.get(
  "/:id/qr",
  tableController.getTableQr,
);

export const tableRoutes = router;
