import type { ApiResponse, ItemImage } from "@rent-anything/types";
import { request } from "../httpClient";
import { API_BASE_URL } from "../config";
import { getAccessToken } from "../tokenStore";
import { ApiClientError, ApiUnreachableError } from "../errors";

export async function getItemImages(itemId: number): Promise<ItemImage[]> {
  return (await request<ItemImage[]>(`/items/${itemId}/images`, { skipAuth: true })) ?? [];
}

export async function getThumbnail(itemId: number): Promise<ItemImage | null> {
  return (await request<ItemImage | null>(`/items/${itemId}/thumbnail`, { skipAuth: true })) ?? null;
}

export async function deleteImage(imageId: number): Promise<void> {
  await request<void>(`/items/images/${imageId}`, { method: "DELETE" });
}

export interface UploadImagesOptions {
  onProgress?: (percent: number) => void;
}

/**
 * Uses XMLHttpRequest instead of fetch specifically to get upload progress
 * events (fetch's request-body streaming progress isn't reliably available
 * across browsers). Every other endpoint uses fetch via httpClient.
 */
export function uploadImages(
  itemId: number,
  files: File[],
  options: UploadImagesOptions = {}
): Promise<ItemImage[]> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    for (const file of files) formData.append("files", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/items/${itemId}/images`);
    const accessToken = getAccessToken();
    if (accessToken) xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        options.onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let envelope: ApiResponse<ItemImage[]>;
      try {
        envelope = JSON.parse(xhr.responseText);
      } catch (cause) {
        reject(new ApiUnreachableError(cause));
        return;
      }
      if (!envelope.success) {
        reject(envelope.error ? new ApiClientError(envelope.error) : new ApiUnreachableError(new Error("Malformed error response")));
        return;
      }
      resolve(envelope.data ?? []);
    };

    xhr.onerror = () => reject(new ApiUnreachableError(new Error("Network error during upload")));

    xhr.send(formData);
  });
}
