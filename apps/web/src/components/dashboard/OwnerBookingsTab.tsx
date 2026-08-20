"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsApi, ApiClientError, messageFor } from "@rent-anything/api-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingRow } from "@/components/dashboard/BookingRow";
import { toast } from "@/components/ui/sonner";

export function OwnerBookingsTab() {
  const queryClient = useQueryClient();
  const queryKey = ["bookings", "received"];
  const { data: bookings, isLoading } = useQuery({ queryKey, queryFn: bookingsApi.getReceivedBookings });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => bookingsApi.confirmBooking(id),
    onSuccess: () => {
      toast.success("Booking confirmed.");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? messageFor(err) : "Couldn't confirm booking."),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingsApi.cancelBooking(id),
    onSuccess: () => {
      toast.success("Booking cancelled.");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? messageFor(err) : "Couldn't cancel booking."),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No booking requests yet.</p>;
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <BookingRow
          key={booking.id}
          booking={booking}
          variant="owner"
          actions={
            <div className="flex gap-2">
              {booking.status === "PENDING" && (
                <Button size="sm" disabled={confirmMutation.isPending} onClick={() => confirmMutation.mutate(booking.id)}>
                  Confirm
                </Button>
              )}
              {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate(booking.id)}
                >
                  Cancel
                </Button>
              )}
            </div>
          }
        />
      ))}
    </div>
  );
}
