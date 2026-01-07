import { Shop, Coordinates, Region, GeolocationFilter } from '../types';

/**
 * @desc Zambian regions and major cities data
 * Real geographic data for Zambia's provinces and cities
 */
export const ZAMBIAN_REGIONS: Region[] = [
  {
    id: 'lusaka',
    name: 'Lusaka Province',
    cities: ['Lusaka', 'Kafue', 'Chongwe'],
    coordinates: { lat: -15.4167, lng: 28.2833 }
  },
  {
    id: 'copperbelt',
    name: 'Copperbelt Province',
    cities: ['Ndola', 'Kitwe', 'Chingola', 'Mufulira', 'Luanshya'],
    coordinates: { lat: -12.8024, lng: 28.2134 }
  },
  {
    id: 'southern',
    name: 'Southern Province',
    cities: ['Livingstone', 'Choma', 'Mazabuka', 'Monze'],
    coordinates: { lat: -17.8419, lng: 25.8544 }
  },
  {
    id: 'central',
    name: 'Central Province',
    cities: ['Kabwe', 'Kapiri Mposhi', 'Serenje', 'Mkushi'],
    coordinates: { lat: -14.4469, lng: 28.4464 }
  },
  {
    id: 'eastern',
    name: 'Eastern Province',
    cities: ['Chipata', 'Lundazi', 'Katete', 'Petauke'],
    coordinates: { lat: -13.6333, lng: 32.6500 }
  },
  {
    id: 'northern',
    name: 'Northern Province',
    cities: ['Kasama', 'Mbala', 'Mpika', 'Luwingu'],
    coordinates: { lat: -10.2167, lng: 31.1833 }
  },
  {
    id: 'northwestern',
    name: 'North-Western Province',
    cities: ['Solwezi', 'Mwinilunga', 'Zambezi', 'Kasempa'],
    coordinates: { lat: -12.1833, lng: 26.4000 }
  },
  {
    id: 'western',
    name: 'Western Province',
    cities: ['Mongu', 'Senanga', 'Kaoma', 'Lukulu'],
    coordinates: { lat: -15.2667, lng: 23.1333 }
  },
  {
    id: 'luapula',
    name: 'Luapula Province',
    cities: ['Mansa', 'Samfya', 'Kawambwa', 'Nchelenge'],
    coordinates: { lat: -11.1989, lng: 28.8921 }
  },
  {
    id: 'muchinga',
    name: 'Muchinga Province',
    cities: ['Chinsali', 'Isoka', 'Nakonde', 'Mpika'],
    coordinates: { lat: -10.5417, lng: 32.0833 }
  }
];

/**
 * @desc Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * @desc Filter shops by geolocation criteria
 * @param shops Array of shops to filter
 * @param filter Geolocation filter criteria
 * @returns Filtered array of shops
 */
export function filterShopsByGeolocation(shops: Shop[], filter: GeolocationFilter): Shop[] {
  let filtered = [...shops];

  // Filter by region
  if (filter.region && filter.region !== 'All') {
    filtered = filtered.filter(shop => shop.region === filter.region);
  }

  // Filter by city
  if (filter.city && filter.city !== 'All') {
    filtered = filtered.filter(shop => shop.city === filter.city);
  }

  // Filter by distance from user's location
  if (filter.maxDistance && filter.userCoordinates) {
    filtered = filtered.filter(shop => {
      if (!shop.coordinates) return false;
      const distance = calculateDistance(filter.userCoordinates!, shop.coordinates);
      return distance <= filter.maxDistance!;
    });
  }

  return filtered;
}

/**
 * @desc Get region by city name
 * @param cityName Name of the city
 * @returns Region object or undefined
 */
export function getRegionByCity(cityName: string): Region | undefined {
  return ZAMBIAN_REGIONS.find(region =>
    region.cities.some(city => city.toLowerCase() === cityName.toLowerCase())
  );
}

/**
 * @desc Get all cities from all regions
 * @returns Array of all city names
 */
export function getAllCities(): string[] {
  const cities = ZAMBIAN_REGIONS.flatMap(region => region.cities);
  return ['All', ...cities.sort()];
}

/**
 * @desc Get region options for dropdown
 * @returns Array of region names
 */
export function getRegionOptions(): string[] {
  return ['All', ...ZAMBIAN_REGIONS.map(r => r.name)];
}

/**
 * @desc Get cities for a specific region
 * @param regionName Name of the region
 * @returns Array of city names in that region
 */
export function getCitiesByRegion(regionName: string): string[] {
  if (regionName === 'All') {
    return getAllCities();
  }

  const region = ZAMBIAN_REGIONS.find(r => r.name === regionName);
  return region ? ['All', ...region.cities] : ['All'];
}

/**
 * @desc Get user's current location (browser geolocation API)
 * @returns Promise with coordinates or null if denied/unavailable
 */
export async function getUserLocation(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  });
}

/**
 * @desc Find nearest shops to given coordinates
 * @param shops Array of shops
 * @param userLocation User's coordinates
 * @param limit Maximum number of results
 * @returns Shops sorted by distance with distance property
 */
export function findNearestShops(
  shops: Shop[],
  userLocation: Coordinates,
  limit: number = 10
): Array<Shop & { distance: number }> {
  const shopsWithDistance = shops
    .filter(shop => shop.coordinates) // Only shops with coordinates
    .map(shop => ({
      ...shop,
      distance: calculateDistance(userLocation, shop.coordinates!)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return shopsWithDistance;
}

/**
 * @desc Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

/**
 * @desc Check if shop delivers to user's location
 * @param shop Shop to check
 * @param userLocation User's coordinates
 * @param maxDeliveryDistance Shop's max delivery radius in km (default 50km)
 * @returns true if shop delivers to location
 */
export function canDeliver(
  shop: Shop,
  userLocation: Coordinates,
  maxDeliveryDistance: number = 50
): boolean {
  if (!shop.coordinates) return false;
  const distance = calculateDistance(shop.coordinates, userLocation);
  return distance <= maxDeliveryDistance;
}
