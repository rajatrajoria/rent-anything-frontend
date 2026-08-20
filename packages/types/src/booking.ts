export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "EXPIRED";

export interface Booking {
  id: number;
  itemId: number;
  renterId: number;
  startDate: string;
  endDate: string;
  amount: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  itemId: number;
  startDate: string;
  endDate: string;
}
