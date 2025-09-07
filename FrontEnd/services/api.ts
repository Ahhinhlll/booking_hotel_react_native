import { hotels as mockHotels, rooms as mockRooms } from "../mockData";
import { Hotel, Room } from "../utils/types";

export const getHotels = async (): Promise<Hotel[]> =>
  new Promise((resolve) => setTimeout(() => resolve(mockHotels), 500));

export const getRooms = async (): Promise<Room[]> =>
  new Promise((resolve) => setTimeout(() => resolve(mockRooms), 500));
