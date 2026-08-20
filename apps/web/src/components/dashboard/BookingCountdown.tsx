"use client";

import * as React from "react";
import { AlarmClock } from "lucide-react";

const PENDING_TIMEOUT_MINUTES = 10;

interface BookingCountdownProps {
  createdAt: string;
  /** Renters see a passive note; owners see an "act now" nudge. */
  variant: "renter" | "owner";
}

/**
 * Client-side estimate only — the backend doesn't return an expiresAt
 * field, so this mirrors booking.expiration.timeout-minutes from
 * application.yaml (10 minutes) rather than reading a server value.
 */
export function BookingCountdown({ createdAt, variant }: BookingCountdownProps) {
  const expiresAt = React.useMemo(
    () => new Date(new Date(createdAt).getTime() + PENDING_TIMEOUT_MINUTES * 60_000),
    [createdAt]
  );
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remainingMs = expiresAt.getTime() - now.getTime();
  if (remainingMs <= 0) {
    return <p className="text-xs text-muted-foreground">Awaiting confirmation — may expire any moment.</p>;
  }

  const minutes = Math.floor(remainingMs / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1000);
  const timeLabel = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  if (variant === "owner") {
    return (
      <p className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--status-pending-foreground))]">
        <AlarmClock className="h-3.5 w-3.5" />
        Confirm within {timeLabel} or it auto-expires
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <AlarmClock className="h-3.5 w-3.5" />
      Awaiting owner confirmation — expires in ~{timeLabel} (estimate)
    </p>
  );
}
