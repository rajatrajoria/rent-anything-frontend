"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { itemImagesApi, ApiClientError, messageFor } from "@rent-anything/api-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 5;
const MIN_IMAGES_TO_ACTIVATE = 2;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ImageUploaderProps {
  itemId: number;
}

export function ImageUploader({ itemId }: ImageUploaderProps) {
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const imagesQueryKey = ["items", itemId, "images"];
  const { data: images, isLoading } = useQuery({
    queryKey: imagesQueryKey,
    queryFn: () => itemImagesApi.getItemImages(itemId),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => itemImagesApi.uploadImages(itemId, files, { onProgress: setProgress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagesQueryKey });
      setProgress(null);
    },
    onError: (err) => {
      setProgress(null);
      toast.error(err instanceof ApiClientError ? messageFor(err) : "Upload failed. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: number) => itemImagesApi.deleteImage(imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: imagesQueryKey }),
    onError: (err) => toast.error(err instanceof ApiClientError ? messageFor(err) : "Couldn't delete that image."),
  });

  const currentCount = images?.length ?? 0;

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setValidationError(null);

    if (currentCount + files.length > MAX_IMAGES) {
      setValidationError(`You can have at most ${MAX_IMAGES} photos (${currentCount} already uploaded).`);
      return;
    }
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setValidationError(`${file.name} isn't a supported image type (JPEG, PNG, or WEBP only).`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setValidationError(`${file.name} is larger than 10MB.`);
        return;
      }
    }

    uploadMutation.mutate(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {currentCount} of {MAX_IMAGES} photos uploaded
          {currentCount < MIN_IMAGES_TO_ACTIVATE && ` — at least ${MIN_IMAGES_TO_ACTIVATE} required to publish`}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending || currentCount >= MAX_IMAGES}
        >
          <Upload className="h-4 w-4" />
          Add photos
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
      </div>

      {validationError && <p className="text-sm text-destructive">{validationError}</p>}
      {progress !== null && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images?.map((image) => (
            <div key={image.id} className="group relative aspect-square overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
              {image.thumbnail && (
                <span className="absolute left-1 top-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => deleteMutation.mutate(image.id)}
                disabled={deleteMutation.isPending}
                className={cn(
                  "absolute right-1 top-1 rounded bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100",
                  "hover:bg-destructive hover:text-destructive-foreground"
                )}
                aria-label="Delete photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Deleting the cover photo automatically promotes the next one.
      </p>
    </div>
  );
}
