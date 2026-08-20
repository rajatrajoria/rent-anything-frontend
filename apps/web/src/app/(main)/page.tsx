"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { itemsApi } from "@rent-anything/api-client";
import { SearchFilters, type SearchFilterValues } from "@/components/browse/SearchFilters";
import { ItemGrid } from "@/components/browse/ItemGrid";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultFilters(): SearchFilterValues {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  return {
    // Default to a central, arbitrary location so the browse page isn't
    // empty before a user searches or shares their location.
    lat: 40.7128,
    lon: -74.006,
    radiusKm: 25,
    startDate: toIsoDate(today),
    endDate: toIsoDate(nextWeek),
    keyword: "",
  };
}

export default function BrowsePage() {
  const [filters, setFilters] = React.useState<SearchFilterValues>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = React.useState<SearchFilterValues>(filters);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["items", "search", appliedFilters],
    queryFn: () =>
      itemsApi.searchItems({
        lat: appliedFilters.lat,
        lon: appliedFilters.lon,
        radiusKm: appliedFilters.radiusKm,
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
        keyword: appliedFilters.keyword || undefined,
        limit: 24,
      }),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Find something to rent nearby</h1>
        <p className="text-muted-foreground">Search by location, dates, and keyword.</p>
      </div>
      <SearchFilters values={filters} onChange={setFilters} onSubmit={() => setAppliedFilters(filters)} />
      {isError ? (
        <p className="text-sm text-destructive">Couldn&apos;t load listings. Please try again.</p>
      ) : (
        <ItemGrid items={data ?? []} isLoading={isLoading} />
      )}
    </div>
  );
}
