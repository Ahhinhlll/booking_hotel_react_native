export type Hotel = {
  id: string;
  name: string;
  location: string;
  image: any;
};

export type Room = {
  id: string;
  hotelId: string;
  name: string;
  price: number;
  image: any;
};
