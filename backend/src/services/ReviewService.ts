import { PrismaClient } from '@prisma/client';
import { ReviewCreateInput, ReviewUpdateInput } from '../types/review';

const prisma = new PrismaClient();

export class ReviewService {
  
  // Crear una nueva review (simplificado)
  async createReview(reviewData: ReviewCreateInput) {
    try {
      // Verificar que el booking existe
      const booking = await prisma.booking.findUnique({
        where: { id: reviewData.bookingId }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Crear la review directamente
      const review = await prisma.review.create({
        data: {
          rating: reviewData.rating,
          comment: reviewData.comment,
          userId: reviewData.userId,
          parkingLotId: booking.parkingLotId,
          bookingId: reviewData.bookingId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Actualizar el rating promedio del parking lot
      await this.updateParkingLotRating(booking.parkingLotId);

      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Obtener reviews de un parking lot
  async getReviewsByParkingLot(parkingLotId: number, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: {
            parkingLotId
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.review.count({
          where: {
            parkingLotId
          }
        })
      ]);

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  }

  // Obtener reviews de un usuario
  async getReviewsByUser(userId: number, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: {
            userId
          },
          include: {
            parkingLot: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.review.count({
          where: {
            userId
          }
        })
      ]);

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw error;
    }
  }

  // Actualizar una review
  async updateReview(reviewId: number, userId: number, updateData: ReviewUpdateInput) {
    try {
      const updatedReview = await prisma.review.update({
        where: {
          id: reviewId
        },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Actualizar el rating promedio del parking lot
      await this.updateParkingLotRating(updatedReview.parkingLotId);

      return updatedReview;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Eliminar una review
  async deleteReview(reviewId: number, userId: number) {
    try {
      const review = await prisma.review.findUnique({
        where: { id: reviewId }
      });

      if (!review) {
        throw new Error('Review not found');
      }

      await prisma.review.delete({
        where: {
          id: reviewId
        }
      });

      // Actualizar el rating promedio del parking lot
      await this.updateParkingLotRating(review.parkingLotId);

      return { message: 'Review deleted successfully' };
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Actualizar el rating promedio de un parking lot
  private async updateParkingLotRating(parkingLotId: number) {
    try {
      // Obtener todas las reviews del parking lot
      const reviews = await prisma.review.findMany({
        where: {
          parkingLotId
        },
        select: {
          rating: true
        }
      });

      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / totalReviews 
        : 0;

      await prisma.parkingLot.update({
        where: {
          id: parkingLotId
        },
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews
        }
      });
    } catch (error) {
      console.error('Error updating parking lot rating:', error);
      throw error;
    }
  }

  // Obtener estadísticas de reviews de un parking lot
  async getReviewStats(parkingLotId: number) {
    try {
      const reviews = await prisma.review.findMany({
        where: {
          parkingLotId
        },
        select: {
          rating: true
        }
      });

      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / totalReviews 
        : 0;

      // Calcular distribución de ratings
      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: reviews.filter(r => r.rating === rating).length
      }));

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      throw error;
    }
  }

  // Verificar si un usuario puede hacer review de un booking
  async canUserReview(userId: number, bookingId: number) {
    try {
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          userId,
          status: 'COMPLETED'
        }
      });

      if (!booking) {
        return { canReview: false, reason: 'Booking not found or not completed' };
      }

      const existingReview = await prisma.review.findUnique({
        where: {
          bookingId
        }
      });

      if (existingReview) {
        return { canReview: false, reason: 'Review already exists for this booking' };
      }

      return { canReview: true };
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      throw error;
    }
  }
}

export default new ReviewService();
