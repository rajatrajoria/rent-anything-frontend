export type ItemStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export interface ItemImage {
  id: number;
  imageUrl: string;
  thumbnail: boolean;
  displayOrder: number | null;
}

/** Full listing detail, returned by GET /items/{id} and GET /items/mine. */
export interface ItemDetail {
  id: number;
  ownerId: number;
  categoryId: number;
  title: string;
  description: string | null;
  pricePerDay: number;
  depositAmount: number;
  status: ItemStatus;
  availableFrom: string;
  availableTo: string;
  thumbnailUrl: string | null;
  images: ItemImage[];
}

/** A row from GET /items/search — lighter than ItemDetail, ranked. */
export interface ItemSearchResult {
  itemId: number;
  ownerId: number;
  title: string;
  description: string | null;
  pricePerDay: number;
  distance: number;
  textScore: number;
  score: number;
  thumbnailUrl: string | null;
}

export interface CreateItemInput {
  categoryId: number;
  title: string;
  description?: string;
  pricePerDay: number;
  depositAmount: number;
  availableFrom: string;
  availableTo: string;
  longitude: number;
  latitude: number;
}

export interface SearchItemsParams {
  lat: number;
  lon: number;
  radiusKm: number;
  startDate: string;
  endDate: string;
  keyword?: string;
  limit?: number;
  afterScore?: number;
  afterItemId?: number;
}
