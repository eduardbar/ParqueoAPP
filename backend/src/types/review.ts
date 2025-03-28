export interface ReviewCreateInput {
  rating: number;
  comment?: string;
  userId: number;
  bookingId: number;
}

export interface ReviewUpdateInput {
  rating?: number;
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  rating: number;
  comment: string | null;
  userId: number;
  parkingLotId: number;
  bookingId: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
  };
  parkingLot?: {
    id: number;
    name: string;
    location?: string;
  };
}

export interface ReviewsResponse {
  reviews: ReviewResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
}

export interface CanReviewResponse {
  canReview: boolean;
  reason?: string;
}
