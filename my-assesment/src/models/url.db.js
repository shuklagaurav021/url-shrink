module.exports = (sequelize, DataTypes) => {
  const DummyUrl = sequelize.define("dummyUrl", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    longUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customAlias: {
      type: DataTypes.STRING,
    },
    topic: {
      type: DataTypes.STRING,
      defaultValue: "general",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return DummyUrl;
};
