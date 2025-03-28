export interface User {
  id: number;
  email: string;
  name: string;
  role: 'DRIVER' | 'OWNER';
  profileImage?: string;
  notificationSettings?: NotificationSettings;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export interface ParkingLot {
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
  ownerId: number;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ParkingUpdate {
  id: number;
  parkingLotId: number;
  previousSpaces: number;
  newSpaces: number;
  updatedAt: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'DRIVER' | 'OWNER';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateParkingLotData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  totalSpaces: number;
  operatingHours: string;
  amenities?: string;
}

export interface UpdateSpacesData {
  availableSpaces: number;
}

export interface SocketEvents {
  authenticate: (userData: { userId: number; userRole: string }) => void;
  join_parking_updates: (data: { parkingLotId: number }) => void;
  leave_parking_updates: (data: { parkingLotId: number }) => void;
  update_parking_spaces: (data: { parkingLotId: number; availableSpaces: number }) => void;
  parking_spaces_updated: (data: {
    parkingLotId: number;
    availableSpaces: number;
    totalSpaces: number;
    updatedAt: string;
  }) => void;
  parking_update_success: (data: { parkingLotId: number; availableSpaces: number }) => void;
  error: (data: { message: string }) => void;
}
