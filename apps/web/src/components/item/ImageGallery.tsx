"use client";

import * as React from "react";
import type { ItemImage } from "@rent-anything/types";
import { cn } from "@/lib/utils";

export function ImageGallery({ images }: { images: ItemImage[] }) {
  const sorted = React.useMemo(
    () => [...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [images]
  );
  const [activeIndex, setActiveIndex] = React.useState(0);
  const active = sorted[activeIndex];

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
        No photos yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={active?.imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-md border-2",
                index === activeIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
