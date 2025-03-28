import express from 'express';
import { authenticate } from '../middleware/auth';
import searchService from '../services/SearchService';
import { SearchFilters } from '../types/search';

const router = express.Router();

// Búsqueda avanzada de parking lots
router.post('/advanced', async (req, res) => {
  try {
    const filters: SearchFilters = req.body;
    const results = await searchService.searchParkingLots(filters);
    res.json(results);
  } catch (error: any) {
    console.error('Error in advanced search:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// Búsqueda por texto completo
router.get('/text', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await searchService.fullTextSearch(
      q as string,
      parseInt(limit as string)
    );

    res.json(results);
  } catch (error: any) {
    console.error('Error in text search:', error);
    res.status(500).json({ error: 'Failed to perform text search' });
  }
});

// Obtener sugerencias de búsqueda
router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const suggestions = await searchService.getSearchSuggestions(
      q as string,
      parseInt(limit as string)
    );

    res.json(suggestions);
  } catch (error: any) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
});

// Obtener parking lots populares
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const results = await searchService.getPopularParkingLots(
      parseInt(limit as string)
    );

    res.json(results);
  } catch (error: any) {
    console.error('Error getting popular parking lots:', error);
    res.status(500).json({ error: 'Failed to get popular parking lots' });
  }
});

// Obtener parking lots cercanos
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const userLocation = {
      lat: parseFloat(lat as string),
      lng: parseFloat(lng as string)
    };

    const results = await searchService.getNearbyParkingLots(
      userLocation,
      parseInt(radius as string)
    );

    res.json(results);
  } catch (error: any) {
    console.error('Error getting nearby parking lots:', error);
    res.status(500).json({ error: 'Failed to get nearby parking lots' });
  }
});

// Filtros disponibles para búsqueda
router.get('/filters', async (req, res) => {
  try {
    const filters = await (searchService as any).getFilterRanges();
    res.json(filters);
  } catch (error: any) {
    console.error('Error getting filter ranges:', error);
    res.status(500).json({ error: 'Failed to get filter ranges' });
  }
});

export default router;
