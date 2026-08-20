"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@rent-anything/types";
import { itemsApi } from "@rent-anything/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge";
import { BookingCountdown } from "@/components/dashboard/BookingCountdown";

interface BookingRowProps {
  booking: Booking;
  variant: "renter" | "owner";
  actions?: React.ReactNode;
}

export function BookingRow({ booking, variant, actions }: BookingRowProps) {
  const { data: item, isLoading } = useQuery({
    queryKey: ["items", "detail", booking.itemId],
    queryFn: () => itemsApi.getItemDetails(booking.itemId),
  });

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0 space-y-1">
          {isLoading ? (
            <Skeleton className="h-5 w-40" />
          ) : (
            <Link href={`/items/${booking.itemId}`} className="font-medium hover:underline">
              {item?.title ?? `Item #${booking.itemId}`}
            </Link>
          )}
          <p className="text-sm text-muted-foreground">
            {booking.startDate} &ndash; {booking.endDate} &middot; ${booking.amount.toFixed(2)}
          </p>
          {booking.status === "PENDING" && <BookingCountdown createdAt={booking.createdAt} variant={variant} />}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BookingStatusBadge status={booking.status} />
          {actions}
        </div>
      </CardContent>
    </Card>
  );
}
