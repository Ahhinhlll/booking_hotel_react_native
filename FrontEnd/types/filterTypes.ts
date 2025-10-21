// types/filterTypes.ts

export interface FilterOptions {
  priceRange: [number, number];
  selectedRatings: string[];
  selectedClean: string[];
  selectedTypes: string[];
  selectedFacilities: string[];
}

export interface SortOptions {
  sortBy: 'relevance' | 'distance' | 'rating' | 'price_low' | 'price_high';
  sortOrder: 'asc' | 'desc';
}

export const SORT_OPTIONS = {
  relevance: 'Phù hợp nhất',
  distance: 'Khoảng cách từ gần đến xa',
  rating: 'Điểm đánh giá từ cao đến thấp',
  price_low: 'Giá từ thấp đến cao',
  price_high: 'Giá từ cao đến thấp',
} as const;

export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  priceRange: [20000, 10000000],
  selectedRatings: [],
  selectedClean: [],
  selectedTypes: [],
  selectedFacilities: [],
};

export const DEFAULT_SORT_OPTIONS: SortOptions = {
  sortBy: 'relevance',
  sortOrder: 'asc',
};
