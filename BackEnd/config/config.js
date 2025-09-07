const { Sequelize } = require("sequelize");
require("dotenv").config();

module.exports = new Sequelize(
  process.env.db_name,
  process.env.db_user,
  process.env.db_pass,
  {
    host: process.env.db_host,
    dialect: "mysql",
    logging: false,
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      timestamps: true,
    },
  }
);
