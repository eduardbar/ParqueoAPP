import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createBookingSchema = Joi.object({
  parkingLotId: Joi.number().integer().required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().required(),
  vehicleInfo: Joi.string().max(200).optional(),
  notes: Joi.string().max(500).optional()
});

const updateBookingSchema = Joi.object({
  startTime: Joi.date().iso().optional(),
  endTime: Joi.date().iso().optional(),
  vehicleInfo: Joi.string().max(200).optional(),
  notes: Joi.string().max(500).optional()
});

// POST /api/bookings - Create new booking (DRIVER only)
router.post('/', authenticate, authorize(['DRIVER']), async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { error, value } = createBookingSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    const { parkingLotId, startTime, endTime, vehicleInfo, notes } = value;

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({
        status: 'error',
        message: 'Start time cannot be in the past'
      });
    }

    if (end <= start) {
      return res.status(400).json({
        status: 'error',
        message: 'End time must be after start time'
      });
    }

    // Check if parking lot exists and is active
    const parkingLot = await prisma.parkingLot.findUnique({
      where: { id: parkingLotId }
    });

    if (!parkingLot) {
      return res.status(404).json({
        status: 'error',
        message: 'Parking lot not found'
      });
    }

    if (!parkingLot.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Parking lot is not active'
      });
    }

    // Check if parking lot has available spaces
    if (parkingLot.availableSpaces <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No available spaces in this parking lot'
      });
    }

    // Check for overlapping bookings
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        parkingLotId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'ACTIVE']
        },
        OR: [
          {
            startTime: {
              lt: end
            },
            endTime: {
              gt: start
            }
          }
        ]
      }
    });

    if (overlappingBookings.length >= parkingLot.availableSpaces) {
      return res.status(409).json({
        status: 'error',
        message: 'Parking lot is fully booked for the selected time slot'
      });
    }

    // Calculate duration and price
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60)); // Duration in minutes
    const totalPrice = (duration / 60) * parkingLot.pricePerHour;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        parkingLotId,
        startTime: start,
        endTime: end,
        duration,
        totalPrice,
        vehicleInfo,
        notes,
        status: 'PENDING'
      },
      include: {
        parkingLot: {
          select: {
            id: true,
            name: true,
            address: true,
            pricePerHour: true
          }
        }
      }
    });

    // Send notification if service is available
    // if (global.notificationService) {
    //   await global.notificationService.notifyBookingCreated(booking.id);
    // }

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking'
    });
  }
});

// GET /api/bookings - Get user's bookings with optional filters
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { status, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let whereClause: any = {
      userId: user.id
    };

    if (status) {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        parkingLot: {
          select: {
            id: true,
            name: true,
            address: true,
            pricePerHour: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      skip: offset,
      take: limitNum,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.booking.count({
      where: whereClause
    });

    res.json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
});

// GET /api/bookings/:id - Get booking by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid booking ID'
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        parkingLot: {
          select: {
            id: true,
            name: true,
            address: true,
            pricePerHour: true,
            latitude: true,
            longitude: true,
            operatingHours: true,
            amenities: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is the parking lot owner
    if (booking.userId !== user.id && booking.parkingLot.owner.id !== user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this booking'
      });
    }

    res.json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking'
    });
  }
});

// PUT /api/bookings/:id - Update booking (DRIVER only, before confirmed)
router.put('/:id', authenticate, authorize(['DRIVER']), async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid booking ID'
      });
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        parkingLot: true
      }
    });

    if (!existingBooking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    if (existingBooking.userId !== user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update your own bookings'
      });
    }

    if (existingBooking.status !== 'PENDING') {
      return res.status(400).json({
        status: 'error',
        message: 'You can only update pending bookings'
      });
    }

    const { error, value } = updateBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    const { startTime, endTime, vehicleInfo, notes } = value;

    // Validate dates if provided
    if (startTime || endTime) {
      const start = new Date(startTime || existingBooking.startTime);
      const end = new Date(endTime || existingBooking.endTime);
      const now = new Date();

      if (start < now) {
        return res.status(400).json({
          status: 'error',
          message: 'Start time cannot be in the past'
        });
      }

      if (end <= start) {
        return res.status(400).json({
          status: 'error',
          message: 'End time must be after start time'
        });
      }

      // Recalculate duration and price if times changed
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60));
      const totalPrice = (duration / 60) * existingBooking.parkingLot.pricePerHour;

      value.duration = duration;
      value.totalPrice = totalPrice;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: value,
      include: {
        parkingLot: {
          select: {
            id: true,
            name: true,
            address: true,
            pricePerHour: true
          }
        }
      }
    });

    res.json({
      status: 'success',
      message: 'Booking updated successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking'
    });
  }
});

// PATCH /api/bookings/:id/status - Update booking status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { status } = req.body;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid booking ID'
      });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        parkingLot: {
          include: {
            owner: true
          }
        }
      }
    });

    if (!existingBooking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check permissions based on status change
    const isOwner = existingBooking.parkingLot.owner.id === user.id;
    const isDriver = existingBooking.userId === user.id;

    if (status === 'CONFIRMED' && !isOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'Only parking lot owners can confirm bookings'
      });
    }

    if (status === 'CANCELLED' && !isDriver && !isOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the booking owner or parking lot owner can cancel bookings'
      });
    }

    if (status === 'ACTIVE' && !isOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'Only parking lot owners can activate bookings'
      });
    }

    if (status === 'COMPLETED' && !isOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'Only parking lot owners can complete bookings'
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        parkingLot: {
          select: {
            id: true,
            name: true,
            address: true,
            pricePerHour: true
          }
        }
      }
    });

    res.json({
      status: 'success',
      message: 'Booking status updated successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking status'
    });
  }
});

// DELETE /api/bookings/:id - Delete booking (DRIVER only, before confirmed)
router.delete('/:id', authenticate, authorize(['DRIVER']), async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid booking ID'
      });
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!existingBooking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    if (existingBooking.userId !== user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own bookings'
      });
    }

    if (existingBooking.status !== 'PENDING') {
      return res.status(400).json({
        status: 'error',
        message: 'You can only delete pending bookings'
      });
    }

    await prisma.booking.delete({
      where: { id: bookingId }
    });

    res.json({
      status: 'success',
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete booking'
    });
  }
});

// GET /api/bookings/owner/all - Get all bookings for owner's parking lots
router.get('/owner/all', authenticate, authorize(['OWNER']), async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { status, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let whereClause: any = {
      parkingLot: {
        ownerId: user.id
      }
    };

    if (status) {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        parkingLot: {
          select: {
            id: true,
            name: true,
            address: true,
            pricePerHour: true
          }
        }
      },
      skip: offset,
      take: limitNum,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.booking.count({
      where: whereClause
    });

    res.json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
});

export default router;
