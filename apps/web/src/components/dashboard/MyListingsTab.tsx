"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { itemsApi } from "@rent-anything/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function MyListingsTab() {
  const { data: items, isLoading } = useQuery({ queryKey: ["items", "mine"], queryFn: itemsApi.getMyItems });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-muted-foreground">You haven&apos;t listed anything yet.</p>
        <Button asChild>
          <Link href="/listings/new">List an item</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 space-y-1">
                <p className="truncate font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">${item.pricePerDay.toFixed(2)} / day</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={item.status === "ACTIVE" ? "confirmed" : "secondary"}>{item.status}</Badge>
              <Button asChild variant="outline" size="sm">
                <Link href={`/listings/${item.id}/edit`}>Manage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
