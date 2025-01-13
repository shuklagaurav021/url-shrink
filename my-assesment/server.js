require("dotenv").config();

const logger = require("./src/utils/logger");
const app = require("./app");

const port = process.env.PORT || 8000;

app.listen({ port }, () => {
  logger.info(`Server running on port ${port}`);
});

module.exports = app;