import Link from "next/link";
import type { ItemSearchResult } from "@rent-anything/types";
import { Card, CardContent } from "@/components/ui/card";

export function ItemCard({ item }: { item: ItemSearchResult }) {
  return (
    <Link href={`/items/${item.itemId}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-[4/3] w-full bg-muted">
          {item.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No photo yet
            </div>
          )}
        </div>
        <CardContent className="space-y-1 p-4">
          <h3 className="truncate font-medium">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.distance.toFixed(1)} km away</p>
          <p className="font-semibold">
            ${item.pricePerDay.toFixed(2)} <span className="font-normal text-muted-foreground">/ day</span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
