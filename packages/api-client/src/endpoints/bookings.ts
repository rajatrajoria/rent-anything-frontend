import type { Booking, CreateBookingInput } from "@rent-anything/types";
import { request } from "../httpClient";

export async function createBooking(input: CreateBookingInput): Promise<number> {
  return (await request<number>("/api/bookings/create", { method: "POST", body: input }))!;
}

export async function confirmBooking(id: number): Promise<void> {
  await request<void>(`/api/bookings/${id}/confirm`, { method: "POST" });
}

export async function cancelBooking(id: number): Promise<void> {
  await request<void>(`/api/bookings/${id}/cancel`, { method: "POST" });
}

export async function getMyBookings(): Promise<Booking[]> {
  return (await request<Booking[]>("/api/bookings/mine")) ?? [];
}

export async function getReceivedBookings(): Promise<Booking[]> {
  return (await request<Booking[]>("/api/bookings/received")) ?? [];
}
