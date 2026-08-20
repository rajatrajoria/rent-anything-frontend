"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsApi, ApiClientError, messageFor } from "@rent-anything/api-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingRow } from "@/components/dashboard/BookingRow";
import { toast } from "@/components/ui/sonner";

export function RenterBookingsTab() {
  const queryClient = useQueryClient();
  const queryKey = ["bookings", "mine"];
  const { data: bookings, isLoading } = useQuery({ queryKey, queryFn: bookingsApi.getMyBookings });

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
    return <p className="py-8 text-center text-muted-foreground">You haven&apos;t booked anything yet.</p>;
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <BookingRow
          key={booking.id}
          booking={booking}
          variant="renter"
          actions={
            (booking.status === "PENDING" || booking.status === "CONFIRMED") && (
              <Button
                variant="outline"
                size="sm"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(booking.id)}
              >
                Cancel
              </Button>
            )
          }
        />
      ))}
    </div>
  );
}
