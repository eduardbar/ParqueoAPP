import express from 'express';
import { authenticate } from '../middleware/auth';
import ReviewService from '../services/ReviewService';
import { ReviewCreateInput, ReviewUpdateInput } from '../types/review';

const router = express.Router();

// Crear una nueva review
router.post('/', authenticate, async (req, res) => {
  try {
    const { rating, comment, bookingId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validar datos
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const reviewData: ReviewCreateInput = {
      rating,
      comment,
      userId,
      bookingId
    };

    const review = await ReviewService.createReview(reviewData);
    res.status(201).json(review);
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(400).json({ error: error.message });
  }
});

// Obtener reviews de un parking lot
router.get('/parking-lot/:parkingLotId', async (req, res) => {
  try {
    const { parkingLotId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await ReviewService.getReviewsByParkingLot(
      parseInt(parkingLotId),
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(reviews);
  } catch (error: any) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Obtener reviews de un usuario
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verificar que el usuario puede ver estas reviews
    if (req.user.id !== parseInt(userId) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const reviews = await ReviewService.getReviewsByUser(
      parseInt(userId),
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(reviews);
  } catch (error: any) {
    console.error('Error getting user reviews:', error);
    res.status(500).json({ error: 'Failed to get user reviews' });
  }
});

// Obtener estadísticas de reviews de un parking lot
router.get('/parking-lot/:parkingLotId/stats', async (req, res) => {
  try {
    const { parkingLotId } = req.params;
    const stats = await ReviewService.getReviewStats(parseInt(parkingLotId));
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting review stats:', error);
    res.status(500).json({ error: 'Failed to get review stats' });
  }
});

// Actualizar una review
router.put('/:reviewId', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validar datos
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const updateData: ReviewUpdateInput = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;

    const review = await ReviewService.updateReview(
      parseInt(reviewId),
      userId,
      updateData
    );

    res.json(review);
  } catch (error: any) {
    console.error('Error updating review:', error);
    res.status(400).json({ error: error.message });
  }
});

// Eliminar una review
router.delete('/:reviewId', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await ReviewService.deleteReview(parseInt(reviewId), userId);
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting review:', error);
    res.status(400).json({ error: error.message });
  }
});

// Verificar si un usuario puede hacer review de un booking
router.get('/can-review/:bookingId', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await ReviewService.canUserReview(userId, parseInt(bookingId));
    res.json(result);
  } catch (error: any) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({ error: 'Failed to check review eligibility' });
  }
});

export default router;
