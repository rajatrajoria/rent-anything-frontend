import type { BookingStatus } from "@rent-anything/types";
import { Badge, type BadgeProps } from "@/components/ui/badge";

const VARIANT_BY_STATUS: Record<BookingStatus, BadgeProps["variant"]> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  EXPIRED: "cancelled",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={VARIANT_BY_STATUS[status]}>{status}</Badge>;
}
