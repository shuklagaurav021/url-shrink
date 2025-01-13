const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_Url, {
  dialect: 'postgres',
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.dummyUrl = require("../models/url.db")(sequelize, DataTypes);
db.analytics = require("../models/analytics.db")(sequelize, DataTypes);

// Define associations
db.dummyUrl.hasMany(db.analytics, { foreignKey: "urlId" });
db.analytics.belongsTo(db.dummyUrl, { foreignKey: "urlId" });

// Sync models (ensure the tables are created)
sequelize.sync();

module.exports = db;
