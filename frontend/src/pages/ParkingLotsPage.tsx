import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Clock, DollarSign, Car, Plus, Eye } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import BookingModal from '../components/BookingModal';

interface ParkingLot {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  totalSpaces: number;
  availableSpaces: number;
  operatingHours: string;
  isActive: boolean;
  amenities?: string;
  distance?: number;
  owner: {
    id: number;
    name: string;
    email: string;
  };
}

const ParkingLotsPage: React.FC = () => {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    onlyAvailable: false
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [selectedParkingLot, setSelectedParkingLot] = useState<ParkingLot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const { user } = useAuthStore();

  useEffect(() => {
    // Get user location for distance calculation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const fetchParkingLots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (userLocation) {
        params.append('latitude', userLocation.lat.toString());
        params.append('longitude', userLocation.lng.toString());
        params.append('radius', '10'); // 10km radius
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/parking?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch parking lots');
      }

      const data = await response.json();
      
      // Check if this is a mock response (maintenance mode)
      if (data.message && data.message.includes('Database not configured')) {
        setError('🚧 La aplicación está en modo mantenimiento. Las funcionalidades completas estarán disponibles próximamente.');
        setParkingLots([]);
        setTotalPages(0);
        return;
      }
      
      let filteredLots = data.data.parkingLots;
      
      // Apply client-side filters
      if (filters.search) {
        filteredLots = filteredLots.filter((lot: ParkingLot) =>
          lot.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          lot.address.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.onlyAvailable) {
        filteredLots = filteredLots.filter((lot: ParkingLot) => lot.availableSpaces > 0);
      }

      setParkingLots(filteredLots);
      setTotalPages(data.data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch parking lots');
    } finally {
      setLoading(false);
    }
  }, [page, filters, userLocation]);

  useEffect(() => {
    fetchParkingLots();
  }, [fetchParkingLots]);

  const handleFilterChange = (field: string, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleBookingCreated = () => {
    // Refresh parking lots to update availability
    fetchParkingLots();
  };

  const handleBookNow = (lot: ParkingLot) => {
    setSelectedParkingLot(lot);
    setShowBookingModal(true);
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.7) return 'text-green-600';
    if (ratio > 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAvailabilityBg = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.7) return 'bg-green-100';
    if (ratio > 0.3) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading parking lots...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Error loading parking lots</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <button 
              onClick={fetchParkingLots}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parking Lots</h1>
          <p className="text-gray-600">Find and book parking spaces near you</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name or address..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price ($/hour)
              </label>
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price ($/hour)
              </label>
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.onlyAvailable}
                  onChange={(e) => handleFilterChange('onlyAvailable', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Only available</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parkingLots.map((lot) => (
            <div key={lot.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{lot.name}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityBg(lot.availableSpaces, lot.totalSpaces)}`}>
                    <span className={getAvailabilityColor(lot.availableSpaces, lot.totalSpaces)}>
                      {lot.availableSpaces}/{lot.totalSpaces}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{lot.address}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{lot.operatingHours}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>${lot.pricePerHour.toLocaleString()}/hour</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Car className="w-4 h-4 mr-2" />
                    <span>{lot.availableSpaces} spaces available</span>
                  </div>

                  {lot.distance && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{lot.distance.toFixed(1)} km away</span>
                    </div>
                  )}
                </div>

                {lot.amenities && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Amenities:</strong> {lot.amenities}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    by {lot.owner.name}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    
                    {user?.role === 'DRIVER' && lot.availableSpaces > 0 && (
                      <button 
                        onClick={() => handleBookNow(lot)}
                        className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Book
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {parkingLots.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No parking lots found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md">
                {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedParkingLot && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          parkingLot={selectedParkingLot}
          onBookingCreated={handleBookingCreated}
        />
      )}
    </div>
  );
};

export default ParkingLotsPage;
