"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentPosition } from "@/lib/geolocation";

export interface SearchFilterValues {
  lat: number;
  lon: number;
  radiusKm: number;
  startDate: string;
  endDate: string;
  keyword: string;
}

interface SearchFiltersProps {
  values: SearchFilterValues;
  onChange: (values: SearchFilterValues) => void;
  onSubmit: () => void;
}

export function SearchFilters({ values, onChange, onSubmit }: SearchFiltersProps) {
  const [locating, setLocating] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);

  function set<K extends keyof SearchFilterValues>(key: K, value: SearchFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }

  async function handleUseLocation() {
    setLocating(true);
    setLocationError(null);
    try {
      const { lat, lon } = await getCurrentPosition();
      onChange({ ...values, lat, lon });
    } catch {
      setLocationError("Couldn't get your location. Enter coordinates manually.");
    } finally {
      setLocating(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="grid grid-cols-2 gap-4 rounded-lg border bg-card p-4 sm:grid-cols-3 lg:grid-cols-6"
    >
      <div className="col-span-2 space-y-2 sm:col-span-1">
        <Label htmlFor="keyword">Search</Label>
        <Input
          id="keyword"
          placeholder="e.g. drill, tent..."
          value={values.keyword}
          onChange={(e) => set("keyword", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startDate">From</Label>
        <Input
          id="startDate"
          type="date"
          value={values.startDate}
          onChange={(e) => set("startDate", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate">To</Label>
        <Input id="endDate" type="date" value={values.endDate} onChange={(e) => set("endDate", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="radiusKm">Radius (km)</Label>
        <Input
          id="radiusKm"
          type="number"
          min={1}
          value={values.radiusKm}
          onChange={(e) => set("radiusKm", Number(e.target.value))}
        />
      </div>
      <div className="col-span-2 flex items-end gap-2 sm:col-span-1">
        <Button type="button" variant="outline" size="icon" onClick={handleUseLocation} disabled={locating} title="Use my location">
          <MapPin className="h-4 w-4" />
        </Button>
        <Button type="submit" className="flex-1">
          Search
        </Button>
      </div>
      {locationError && <p className="col-span-full text-xs text-destructive">{locationError}</p>}
    </form>
  );
}
