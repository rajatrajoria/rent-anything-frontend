"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInCalendarDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { ItemDetail } from "@rent-anything/types";
import { bookingsApi, ApiClientError, messageFor } from "@rent-anything/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrustGateNotice } from "@/components/auth/TrustGateNotice";
import { toast } from "@/components/ui/sonner";
import { CalendarIcon } from "lucide-react";

interface BookingWidgetProps {
  item: ItemDetail;
}

export function BookingWidget({ item }: BookingWidgetProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const availableFrom = new Date(item.availableFrom);
  const availableTo = new Date(item.availableTo);

  const [range, setRange] = React.useState<DateRange | undefined>();
  const [trustBlocked, setTrustBlocked] = React.useState(false);

  const days = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) + 1 : 0;
  const estimate = days > 0 ? days * item.pricePerDay : 0;

  const mutation = useMutation({
    mutationFn: () =>
      bookingsApi.createBooking({
        itemId: item.id,
        startDate: format(range!.from!, "yyyy-MM-dd"),
        endDate: format(range!.to!, "yyyy-MM-dd"),
      }),
    onSuccess: () => {
      toast.success("Booking request sent — awaiting the owner's confirmation.");
      router.push("/dashboard");
    },
    onError: (err) => {
      if (err instanceof ApiClientError) {
        if (err.errorCode === "USR_005") {
          setTrustBlocked(true);
          return;
        }
        if (err.errorCode === "BKG_002") {
          // These dates were just taken — refresh availability instead of
          // just showing a generic error.
          queryClient.invalidateQueries({ queryKey: ["items", "detail", item.id] });
          setRange(undefined);
        }
        toast.error(messageFor(err));
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  const isOwner = user?.id === item.ownerId;

  if (isOwner) {
    return null;
  }

  if (trustBlocked) {
    return (
      <Card>
        <CardContent className="pt-6">
          <TrustGateNotice action="book items" />
        </CardContent>
      </Card>
    );
  }

  if (item.status !== "ACTIVE") {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>This listing isn&apos;t currently accepting bookings.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          ${item.pricePerDay.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ day</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasHydrated ? null : !user ? (
          <Button asChild className="w-full">
            <a href={`/login?next=/items/${item.id}`}>Log in to book</a>
          </Button>
        ) : (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal">
                  <CalendarIcon />
                  {range?.from && range?.to
                    ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`
                    : "Select dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  disabled={[{ before: availableFrom }, { after: availableTo }]}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>

            {days > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {days} night{days > 1 ? "s" : ""} (estimate)
                </span>
                <span className="font-medium">${estimate.toFixed(2)}</span>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!range?.from || !range?.to || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Requesting..." : "Request to book"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Final amount is set by the owner&apos;s confirmed rate. You won&apos;t be charged yet — the owner needs
              to confirm first.
            </p>
          </>
        )}
      </CardContent>
      <CardFooter />
    </Card>
  );
}
