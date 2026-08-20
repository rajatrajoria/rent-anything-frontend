/**
 * The backend has no Category entity or endpoint yet — categoryId is a bare
 * required number on an item. This local lookup exists only to give users a
 * friendly picker; it still submits a plain id.
 */
export interface CategoryOption {
  id: number;
  label: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 1, label: "Tools & Equipment" },
  { id: 2, label: "Electronics" },
  { id: 3, label: "Vehicles" },
  { id: 4, label: "Outdoor & Camping" },
  { id: 5, label: "Party & Events" },
  { id: 6, label: "Sports & Fitness" },
  { id: 7, label: "Home & Furniture" },
  { id: 8, label: "Other" },
];
