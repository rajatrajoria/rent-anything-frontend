import type { CreateItemInput, ItemDetail, ItemSearchResult, SearchItemsParams } from "@rent-anything/types";
import { request } from "../httpClient";

export async function createItem(input: CreateItemInput): Promise<number> {
  return (await request<number>("/items", { method: "POST", body: input }))!;
}

export async function activateItem(id: number): Promise<void> {
  await request<void>(`/items/${id}/activate`, { method: "PUT" });
}

export async function deactivateItem(id: number): Promise<void> {
  await request<void>(`/items/${id}/deactivate`, { method: "PUT" });
}

export async function updateItemPrice(id: number, price: number): Promise<void> {
  await request<void>(`/items/${id}/updatePrice`, { method: "PUT", query: { price } });
}

export async function updateItemAvailability(id: number, from: string, to: string): Promise<void> {
  await request<void>(`/items/${id}/updateAvailability`, { method: "PUT", query: { from, to } });
}

export async function searchItems(params: SearchItemsParams): Promise<ItemSearchResult[]> {
  return (await request<ItemSearchResult[]>("/items/search", { query: { ...params }, skipAuth: true })) ?? [];
}

export async function getItemDetails(itemId: number): Promise<ItemDetail> {
  return (await request<ItemDetail>(`/items/${itemId}`, { skipAuth: true }))!;
}

export async function getMyItems(): Promise<ItemDetail[]> {
  return (await request<ItemDetail[]>("/items/mine")) ?? [];
}
