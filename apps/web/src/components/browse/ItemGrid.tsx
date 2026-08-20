import type { ItemSearchResult } from "@rent-anything/types";
import { ItemCard } from "@/components/browse/ItemCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ItemGridProps {
  items: ItemSearchResult[];
  isLoading: boolean;
}

export function ItemGrid({ items, isLoading }: ItemGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        <p>No items found nearby for these dates. Try a wider radius or different dates.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ItemCard key={item.itemId} item={item} />
      ))}
    </div>
  );
}
