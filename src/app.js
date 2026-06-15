import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import swaggerUi from "swagger-ui-express";

import router from "./routes/index.js";
import { swaggerSpec } from "./docs/swagger.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import { env } from "./config/env.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(mongoSanitize());

if (env.nodeEnv !== "test") {
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
}

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);

app.use(notFound);
app.use(errorHandler);

export default app;
