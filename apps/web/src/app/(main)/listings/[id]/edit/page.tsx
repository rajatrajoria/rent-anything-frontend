"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { itemsApi, ApiClientError, messageFor } from "@rent-anything/api-client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUploader } from "@/components/item/ImageUploader";
import { toast } from "@/components/ui/sonner";

export default function EditListingPage() {
  return (
    <AuthGuard>
      <EditListingContent />
    </AuthGuard>
  );
}

function EditListingContent() {
  const params = useParams<{ id: string }>();
  const itemId = Number(params.id);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const detailQueryKey = ["items", "detail", itemId];
  const { data: item, isLoading } = useQuery({
    queryKey: detailQueryKey,
    queryFn: () => itemsApi.getItemDetails(itemId),
    enabled: Number.isFinite(itemId),
  });

  const [price, setPrice] = React.useState("");
  const [availableFrom, setAvailableFrom] = React.useState("");
  const [availableTo, setAvailableTo] = React.useState("");
  // Tracks which item's data the form fields were last initialized from, so
  // they're seeded once when the item loads without fighting the user's
  // edits on every re-render. This runs during render (React's sanctioned
  // pattern for "adjusting state when a prop changes"), not in an effect.
  const [seededItemId, setSeededItemId] = React.useState<number | null>(null);
  if (item && item.id !== seededItemId) {
    setSeededItemId(item.id);
    setPrice(String(item.pricePerDay));
    setAvailableFrom(item.availableFrom);
    setAvailableTo(item.availableTo);
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: detailQueryKey });

  const priceMutation = useMutation({
    mutationFn: () => itemsApi.updateItemPrice(itemId, Number(price)),
    onSuccess: () => {
      toast.success("Price updated.");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? messageFor(err) : "Couldn't update price."),
  });

  const availabilityMutation = useMutation({
    mutationFn: () => itemsApi.updateItemAvailability(itemId, availableFrom, availableTo),
    onSuccess: () => {
      toast.success("Availability updated.");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? messageFor(err) : "Couldn't update availability."),
  });

  const activateMutation = useMutation({
    mutationFn: () => (item?.status === "ACTIVE" ? itemsApi.deactivateItem(itemId) : itemsApi.activateItem(itemId)),
    onSuccess: () => {
      toast.success(item?.status === "ACTIVE" ? "Listing deactivated." : "Listing activated.");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? messageFor(err) : "Couldn't change listing status."),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-12">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!item) {
    return <div className="mx-auto max-w-2xl px-4 py-12 text-muted-foreground">Listing not found.</div>;
  }

  if (currentUser && item.ownerId !== currentUser.id) {
    return <div className="mx-auto max-w-2xl px-4 py-12 text-muted-foreground">You don&apos;t own this listing.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
        <Badge variant={item.status === "ACTIVE" ? "confirmed" : "secondary"}>{item.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader itemId={itemId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price</CardTitle>
          <CardDescription>Takes effect immediately for new bookings.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="price">Price / day ($)</Label>
            <Input id="price" type="number" min={0.01} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <Button disabled={priceMutation.isPending} onClick={() => priceMutation.mutate()}>
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Narrowing this is rejected if it would strand an existing booking.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="availableFrom">From</Label>
            <Input id="availableFrom" type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availableTo">To</Label>
            <Input id="availableTo" type="date" value={availableTo} onChange={(e) => setAvailableTo(e.target.value)} />
          </div>
          <Button disabled={availabilityMutation.isPending} onClick={() => availabilityMutation.mutate()}>
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listing status</CardTitle>
          <CardDescription>
            {item.status === "ACTIVE"
              ? "Deactivating hides this from search and blocks new bookings."
              : "Activating requires at least 2 photos."}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant={item.status === "ACTIVE" ? "destructive" : "default"}
            disabled={activateMutation.isPending}
            onClick={() => activateMutation.mutate()}
          >
            {item.status === "ACTIVE" ? "Deactivate listing" : "Activate listing"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
