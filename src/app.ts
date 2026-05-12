import corsMiddleware from "cors";
import express, { Application, Request, Response } from "express";
import { env } from "./config/env";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import router from "./routes";

const app: Application = express();

app.use(corsMiddleware());

// parser
app.use(express.json());

app.use("/api/v1", router);

app.get("/health", (req: Request, res: Response) => {
  res.send({
    message: "Server is running..",
    environment: env.node_env,
    uptime: process.uptime().toFixed(2) + " sec",
    timeStamp: new Date().toISOString(),
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
