// mockData.ts
import { Hotel, Room } from "./utils/types";

export const hotels: Hotel[] = [
  {
    id: "1",
    name: "Khách sạn Hà Nội",
    location: "Hà Nội",
    image: require("./assets/images/hotel1.jpg"),
  },
  {
    id: "2",
    name: "Khách sạn Sài Gòn",
    location: "TP.HCM",
    image: require("./assets/images/hotel1.jpg"),
  },
];

export const rooms: Room[] = [
  {
    id: "1",
    hotelId: "1",
    name: "Phòng Deluxe",
    price: 1000000,
    image: require("./assets/images/room1.jpg"),
  },
  {
    id: "2",
    hotelId: "1",
    name: "Phòng Standard",
    price: 500000,
    image: require("./assets/images/room1.jpg"),
  },
  {
    id: "3",
    hotelId: "2",
    name: "Phòng VIP",
    price: 1200000,
    image: require("./assets/images/room1.jpg"),
  },
  {
    id: "4",
    hotelId: "2",
    name: "Phòng Family",
    price: 800000,
    image: require("./assets/images/room1.jpg"),
  },
];
