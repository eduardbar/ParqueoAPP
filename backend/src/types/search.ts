export interface SearchFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  availability?: {
    startTime: Date;
    endTime: Date;
  };
  features?: string[];
  sortBy?: 'price' | 'rating' | 'distance' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  parkingLots: Array<{
    id: number;
    name: string;
    location: string;
    description: string;
    pricePerHour: number;
    features: string[];
    averageRating: number;
    totalReviews: number;
    distance?: number;
    isAvailable?: boolean;
    owner: {
      id: number;
      name: string;
      email: string;
      phone?: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    priceRange: {
      min: number;
      max: number;
    };
    ratingRange: {
      min: number;
      max: number;
    };
    availableFeatures: string[];
  };
}
