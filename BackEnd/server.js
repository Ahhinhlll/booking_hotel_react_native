// server.js
const app = require("./app");
const sequelize = require("./config/config");
const { initializeRoles } = require("./controllers/vaiTroController");
require("dotenv").config();

const PORT = process.env.PORT || 3334;

sequelize
  .sync({ alter: true }) // { force: true } { alter: true }
  .then(async () => {
    console.log("Kết nối database thành công");
    await initializeRoles();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server đang chạy tại: http://localhost:${PORT}/api-docs/`);
    });
  })
  .catch((error) => {
    console.error("Lỗi kết nối database:", error);
  });
