"use strict";

const express = require("express");
const pinoHttp = require("pino-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const logger = require("./src/utils/logger");

const routes = require("./src/routes");
const urlRoutes = require("./src/routes/route");
const { sequelize } = require("./src/models");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./src/docs/swagger.json");


const app = express();

app.use(
  bodyParser.json({
    limit: "50mb",
    extended: true,
  })
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
sequelize.sync({ force: false }).then(() => {
  console.log("Database synchronized.");
});
app.use(pinoHttp({ logger }));
app.use(cors());
app.use(helmet());

app.use("/api/url", urlRoutes);

app.use("/ping", (req, res) => {
  res.json({ reply: "pongg" });
  res.end();
});

routes(app);

module.exports = app;
