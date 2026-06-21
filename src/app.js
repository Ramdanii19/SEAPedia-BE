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
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  if (req.query) {
    const clean = mongoSanitize.sanitize({ ...req.query });
    Object.keys(req.query).forEach((k) => delete req.query[k]);
    Object.assign(req.query, clean);
  }
  next();
});

if (env.nodeEnv !== "test") {
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
}

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);

app.use(notFound);
app.use(errorHandler);

export default app;
