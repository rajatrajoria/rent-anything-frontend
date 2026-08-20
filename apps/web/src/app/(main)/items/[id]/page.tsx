"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { itemsApi } from "@rent-anything/api-client";
import { ImageGallery } from "@/components/item/ImageGallery";
import { BookingWidget } from "@/components/item/BookingWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const itemId = Number(params.id);

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ["items", "detail", itemId],
    queryFn: () => itemsApi.getItemDetails(itemId),
    enabled: Number.isFinite(itemId),
  });

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">
        This listing couldn&apos;t be found.
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <ImageGallery images={item.images} />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
            {item.status !== "ACTIVE" && <Badge variant="secondary">{item.status}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            Available {item.availableFrom} to {item.availableTo} &middot; ${item.depositAmount.toFixed(2)} deposit
          </p>
        </div>
        {item.description && <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.description}</p>}
      </div>
      <div>
        <BookingWidget item={item} />
      </div>
    </div>
  );
}
