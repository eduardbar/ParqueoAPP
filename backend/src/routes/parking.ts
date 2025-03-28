import express from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createParkingLotSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(500).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  pricePerHour: Joi.number().min(0).required(),
  totalSpaces: Joi.number().integer().min(1).required(),
  operatingHours: Joi.string().required(),
  amenities: Joi.string().optional()
});

const updateSpacesSchema = Joi.object({
  availableSpaces: Joi.number().integer().min(0).required()
});

// Create parking lot (owners only)
router.post('/', authenticate, authorize(['OWNER']), async (req: AuthRequest, res) => {
  try {
    const { error, value } = createParkingLotSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    const parkingLot = await prisma.parkingLot.create({
      data: {
        ...value,
        availableSpaces: value.totalSpaces,
        ownerId: req.user!.id
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Parking lot created successfully',
      data: { parkingLot }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get parking lots (with optional geolocation filtering)
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 2, page = 1, limit = 10 } = req.query;
    
    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const skip = (pageNumber - 1) * pageSize;

    let whereClause: any = { isActive: true };

    if (lat && lng) {
      // Convert radius from km to degrees (approximate)
      const radiusInDegrees = parseFloat(radius as string) / 111.32;
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);

      // Find parking lots within radius using basic distance calculation
      whereClause = {
        ...whereClause,
        latitude: {
          gte: latitude - radiusInDegrees,
          lte: latitude + radiusInDegrees
        },
        longitude: {
          gte: longitude - radiusInDegrees,
          lte: longitude + radiusInDegrees
        }
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.parkingLot.count({
      where: whereClause
    });

    // Get parking lots with pagination
    const parkingLots = await prisma.parkingLot.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.json({
      status: 'success',
      data: { 
        parkingLots,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          pages: totalPages,
          total: totalCount
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get parking lot by ID
router.get('/:id', async (req, res) => {
  try {
    const parkingLot = await prisma.parkingLot.findUnique({
      where: { 
        id: parseInt(req.params.id),
        isActive: true
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!parkingLot) {
      return res.status(404).json({
        status: 'error',
        message: 'Parking lot not found'
      });
    }

    res.json({
      status: 'success',
      data: { parkingLot }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Update parking lot spaces (owners only)
router.put('/:id/spaces', authenticate, authorize(['OWNER']), async (req: AuthRequest, res) => {
  try {
    const { error, value } = updateSpacesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    const parkingLotId = parseInt(req.params.id);
    const { availableSpaces } = value;

    // Check if parking lot exists and belongs to the user
    const parkingLot = await prisma.parkingLot.findUnique({
      where: { id: parkingLotId }
    });

    if (!parkingLot) {
      return res.status(404).json({
        status: 'error',
        message: 'Parking lot not found'
      });
    }

    if (parkingLot.ownerId !== req.user!.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this parking lot'
      });
    }

    if (availableSpaces > parkingLot.totalSpaces) {
      return res.status(400).json({
        status: 'error',
        message: 'Available spaces cannot exceed total spaces'
      });
    }

    // Update spaces and create audit record
    const [updatedParkingLot] = await prisma.$transaction([
      prisma.parkingLot.update({
        where: { id: parkingLotId },
        data: { availableSpaces },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.parkingUpdate.create({
        data: {
          parkingLotId,
          previousSpaces: parkingLot.availableSpaces,
          newSpaces: availableSpaces
        }
      })
    ]);

    res.json({
      status: 'success',
      message: 'Parking lot spaces updated successfully',
      data: { parkingLot: updatedParkingLot }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get owner's parking lots
router.get('/owner/my-lots', authenticate, authorize(['OWNER']), async (req: AuthRequest, res) => {
  try {
    const parkingLots = await prisma.parkingLot.findMany({
      where: { ownerId: req.user!.id },
      include: {
        parkingUpdates: {
          orderBy: { updatedAt: 'desc' },
          take: 5
        }
      }
    });

    res.json({
      status: 'success',
      data: { parkingLots }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

export default router;
