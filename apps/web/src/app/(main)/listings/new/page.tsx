"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CATEGORY_OPTIONS } from "@rent-anything/types";
import { itemsApi, ApiClientError, messageFor } from "@rent-anything/api-client";
import { itemImagesApi } from "@rent-anything/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TrustGateNotice } from "@/components/auth/TrustGateNotice";
import { ImageUploader } from "@/components/item/ImageUploader";
import { MapPin } from "lucide-react";
import { getCurrentPosition } from "@/lib/geolocation";

const MIN_IMAGES_TO_ACTIVATE = 2;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NewListingPage() {
  return (
    <AuthGuard>
      <NewListingWizard />
    </AuthGuard>
  );
}

function NewListingWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const [trustBlocked, setTrustBlocked] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    title: "",
    description: "",
    categoryId: String(CATEGORY_OPTIONS[0]!.id),
    pricePerDay: "",
    depositAmount: "0",
    availableFrom: todayIso(),
    availableTo: "",
    latitude: "",
    longitude: "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleUseLocation() {
    try {
      const { lat, lon } = await getCurrentPosition();
      set("latitude", String(lat));
      set("longitude", String(lon));
    } catch {
      setError("Couldn't get your location. Enter coordinates manually.");
    }
  }

  const createMutation = useMutation({
    mutationFn: () =>
      itemsApi.createItem({
        categoryId: Number(form.categoryId),
        title: form.title,
        description: form.description || undefined,
        pricePerDay: Number(form.pricePerDay),
        depositAmount: Number(form.depositAmount),
        availableFrom: form.availableFrom,
        availableTo: form.availableTo,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      }),
    onSuccess: (newItemId) => {
      setItemId(newItemId);
      setStep(2);
    },
    onError: (err) => {
      if (err instanceof ApiClientError && err.errorCode === "USR_005") {
        setTrustBlocked(true);
        return;
      }
      setError(err instanceof ApiClientError ? messageFor(err) : "Something went wrong. Please try again.");
    },
  });

  const { data: images } = useQuery({
    queryKey: ["items", itemId, "images"],
    queryFn: () => itemImagesApi.getItemImages(itemId!),
    enabled: itemId !== null,
  });

  const activateMutation = useMutation({
    mutationFn: () => itemsApi.activateItem(itemId!),
    onSuccess: () => router.push(`/items/${itemId}`),
    onError: (err) => setError(err instanceof ApiClientError ? messageFor(err) : "Couldn't publish the listing."),
  });

  if (trustBlocked) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <TrustGateNotice action="list items" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{step === 1 ? "List an item" : step === 2 ? "Add photos" : "Publish"}</CardTitle>
          <CardDescription>Step {step} of 3</CardDescription>
        </CardHeader>

        {error && (
          <CardContent className="pb-0">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        )}

        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              createMutation.mutate();
            }}
          >
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" required value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerDay">Price / day ($)</Label>
                  <Input
                    id="pricePerDay"
                    type="number"
                    min={0.01}
                    step="0.01"
                    required
                    value={form.pricePerDay}
                    onChange={(e) => set("pricePerDay", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Deposit ($)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={form.depositAmount}
                    onChange={(e) => set("depositAmount", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availableFrom">Available from</Label>
                  <Input
                    id="availableFrom"
                    type="date"
                    required
                    value={form.availableFrom}
                    onChange={(e) => set("availableFrom", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableTo">Available to</Label>
                  <Input
                    id="availableTo"
                    type="date"
                    required
                    value={form.availableTo}
                    onChange={(e) => set("availableTo", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Location</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleUseLocation}>
                    <MapPin className="h-4 w-4" />
                    Use my location
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Latitude"
                    type="number"
                    step="any"
                    required
                    value={form.latitude}
                    onChange={(e) => set("latitude", e.target.value)}
                  />
                  <Input
                    placeholder="Longitude"
                    type="number"
                    step="any"
                    required
                    value={form.longitude}
                    onChange={(e) => set("longitude", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Continue"}
              </Button>
            </CardFooter>
          </form>
        )}

        {step === 2 && itemId !== null && (
          <>
            <CardContent>
              <ImageUploader itemId={itemId} />
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                className="w-full"
                disabled={(images?.length ?? 0) < MIN_IMAGES_TO_ACTIVATE}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard")}>
                Save as draft, finish later
              </Button>
            </CardFooter>
          </>
        )}

        {step === 3 && itemId !== null && (
          <>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Title:</span> {form.title}
              </p>
              <p>
                <span className="text-muted-foreground">Price:</span> ${Number(form.pricePerDay).toFixed(2)} / day
              </p>
              <p>
                <span className="text-muted-foreground">Photos:</span> {images?.length ?? 0}
              </p>
              <p className="text-muted-foreground">
                Publishing makes this listing visible in search. You can deactivate it any time.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button className="w-full" disabled={activateMutation.isPending} onClick={() => activateMutation.mutate()}>
                {activateMutation.isPending ? "Publishing..." : "Publish listing"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard")}>
                Save as draft, finish later
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
