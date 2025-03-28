import { PrismaClient } from '@prisma/client';
import { SearchFilters, SearchResult } from '../types/search';

const prisma = new PrismaClient();

export class SearchService {
  
  // Búsqueda avanzada de parking lots
  async searchParkingLots(filters: SearchFilters): Promise<SearchResult> {
    try {
      const {
        location,
        minPrice,
        maxPrice,
        minRating,
        maxRating,
        availability,
        features,
        sortBy = 'name',
        sortOrder = 'asc',
        page = 1,
        limit = 10
      } = filters;

      const skip = (page - 1) * limit;

      // Construir filtros dinámicos
      const whereClause: any = {
        isActive: true
      };

      // Filtro por ubicación
      if (location) {
        whereClause.address = {
          contains: location
        };
      }

      // Filtro por precio
      if (minPrice !== undefined || maxPrice !== undefined) {
        whereClause.pricePerHour = {};
        if (minPrice !== undefined) {
          whereClause.pricePerHour.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          whereClause.pricePerHour.lte = maxPrice;
        }
      }

      // Filtro por características (usando amenities)
      if (features && features.length > 0) {
        whereClause.amenities = {
          contains: features.join('|') // Buscar cualquiera de las características
        };
      }

      // Configurar ordenamiento
      const orderBy: any = {};
      switch (sortBy) {
        case 'price':
          orderBy.pricePerHour = sortOrder;
          break;
        case 'name':
          orderBy.name = sortOrder;
          break;
        default:
          orderBy.name = 'asc';
      }

      // Ejecutar búsqueda
      const [parkingLots, total] = await Promise.all([
        prisma.parkingLot.findMany({
          where: whereClause,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            }
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.parkingLot.count({
          where: whereClause
        })
      ]);

      // Obtener rangos de filtros para el frontend
      const filterRanges = await this.getFilterRanges();

      // Formatear resultados con cálculo de rating
      const formattedResults = parkingLots.map(lot => {
        const ratings = lot.reviews.map(r => r.rating);
        const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
        
        return {
          id: lot.id,
          name: lot.name,
          location: lot.address,
          description: lot.amenities || '',
          pricePerHour: lot.pricePerHour,
          features: lot.amenities ? lot.amenities.split(',').map(f => f.trim()) : [],
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: lot.reviews.length,
          owner: lot.owner
        };
      });

      return {
        parkingLots: formattedResults,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        filters: filterRanges
      };

    } catch (error) {
      console.error('Error in advanced search:', error);
      throw error;
    }
  }

  // Obtener rangos de precios y ratings para filtros
  private async getFilterRanges() {
    try {
      const priceStats = await prisma.parkingLot.aggregate({
        _min: { pricePerHour: true },
        _max: { pricePerHour: true }
      });

      // Obtener todas las características disponibles
      const allFeatures = await prisma.parkingLot.findMany({
        select: { amenities: true }
      });

      const uniqueFeatures = [...new Set(
        allFeatures
          .filter(lot => lot.amenities)
          .flatMap(lot => lot.amenities!.split(',').map(f => f.trim()))
      )];

      return {
        priceRange: {
          min: priceStats._min.pricePerHour || 0,
          max: priceStats._max.pricePerHour || 100
        },
        ratingRange: {
          min: 0,
          max: 5
        },
        availableFeatures: uniqueFeatures
      };

    } catch (error) {
      console.error('Error getting filter ranges:', error);
      throw error;
    }
  }

  // Búsqueda por texto completo
  async fullTextSearch(query: string, limit: number = 10): Promise<any[]> {
    try {
      const results = await prisma.parkingLot.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                {
                  name: {
                    contains: query
                  }
                },
                {
                  address: {
                    contains: query
                  }
                },
                {
                  amenities: {
                    contains: query
                  }
                }
              ]
            }
          ]
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        take: limit
      });

      return results.map(lot => {
        const ratings = lot.reviews.map(r => r.rating);
        const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
        
        return {
          id: lot.id,
          name: lot.name,
          location: lot.address,
          description: lot.amenities || '',
          pricePerHour: lot.pricePerHour,
          features: lot.amenities ? lot.amenities.split(',').map(f => f.trim()) : [],
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: lot.reviews.length,
          owner: lot.owner
        };
      });

    } catch (error) {
      console.error('Error in full text search:', error);
      throw error;
    }
  }

  // Obtener sugerencias de búsqueda
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      const suggestions = await prisma.parkingLot.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                {
                  name: {
                    contains: query
                  }
                },
                {
                  address: {
                    contains: query
                  }
                }
              ]
            }
          ]
        },
        select: {
          name: true,
          address: true
        },
        take: limit
      });

      const uniqueSuggestions = new Set<string>();
      
      suggestions.forEach(lot => {
        uniqueSuggestions.add(lot.name);
        uniqueSuggestions.add(lot.address);
      });

      return Array.from(uniqueSuggestions)
        .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting search suggestions:', error);
      throw error;
    }
  }

  // Obtener parking lots populares (más reservas)
  async getPopularParkingLots(limit: number = 10): Promise<any[]> {
    try {
      const popularLots = await prisma.parkingLot.findMany({
        where: {
          isActive: true
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          },
          bookings: {
            select: {
              id: true
            }
          }
        },
        take: limit * 2 // Obtener más para poder ordenar
      });

      const lotsWithStats = popularLots.map(lot => {
        const ratings = lot.reviews.map(r => r.rating);
        const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
        
        return {
          id: lot.id,
          name: lot.name,
          location: lot.address,
          description: lot.amenities || '',
          pricePerHour: lot.pricePerHour,
          features: lot.amenities ? lot.amenities.split(',').map(f => f.trim()) : [],
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: lot.reviews.length,
          totalBookings: lot.bookings.length,
          owner: lot.owner
        };
      });

      // Ordenar por número de reservas y rating
      return lotsWithStats
        .sort((a, b) => {
          if (a.totalBookings !== b.totalBookings) {
            return b.totalBookings - a.totalBookings;
          }
          return b.averageRating - a.averageRating;
        })
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting popular parking lots:', error);
      throw error;
    }
  }

  // Obtener parking lots cercanos (simplificado)
  async getNearbyParkingLots(userLocation: { lat: number; lng: number }, radius: number = 5000): Promise<any[]> {
    try {
      const nearbyLots = await prisma.parkingLot.findMany({
        where: {
          isActive: true
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        take: 20
      });

      return nearbyLots.map(lot => {
        const ratings = lot.reviews.map(r => r.rating);
        const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
        
        // Calcular distancia aproximada (fórmula simple)
        const distance = Math.sqrt(
          Math.pow(lot.latitude - userLocation.lat, 2) + 
          Math.pow(lot.longitude - userLocation.lng, 2)
        ) * 111000; // Conversión aproximada a metros

        return {
          id: lot.id,
          name: lot.name,
          location: lot.address,
          description: lot.amenities || '',
          pricePerHour: lot.pricePerHour,
          features: lot.amenities ? lot.amenities.split(',').map(f => f.trim()) : [],
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: lot.reviews.length,
          owner: lot.owner,
          distance: Math.round(distance)
        };
      })
      .filter(lot => lot.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    } catch (error) {
      console.error('Error getting nearby parking lots:', error);
      throw error;
    }
  }
}

export default new SearchService();
