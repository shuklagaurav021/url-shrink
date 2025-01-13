const tasksRoutes = require("./route");
module.exports = (app) => {
  app.use("/tasks", tasksRoutes);

};