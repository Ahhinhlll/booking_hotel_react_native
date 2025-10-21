const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
  getByHotelId,
  getByRoomId,
} = require("../controllers/tienNghiController");
const router = express.Router();

router.get("/tiennghi/getall", getAll);
router.get("/tiennghi/getbyid/:id", getById);
router.post("/tiennghi/insert", insert);
router.put("/tiennghi/update", update);
router.delete("/tiennghi/delete/:id", remove);
router.get("/tiennghi/search", search);
router.get("/tiennghi/hotel/:hotelId", getByHotelId);
router.get("/tiennghi/room/:roomId", getByRoomId);

module.exports = router;
