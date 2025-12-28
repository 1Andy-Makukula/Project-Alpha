import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Coordinates } from '../types';

// Fix for default marker icon in React-Leaflet
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ShopMapProps {
  shopCoordinates: Coordinates;
  userCoordinates?: Coordinates | null;
  shopName: string;
}

// Component to update map view when coordinates change
const MapUpdater: React.FC<{ center: Coordinates }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 13);
  }, [center, map]);
  return null;
};

const ShopMap: React.FC<ShopMapProps> = ({ shopCoordinates, userCoordinates, shopName }) => {
  const center = shopCoordinates;

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 z-0 relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[shopCoordinates.lat, shopCoordinates.lng]}>
          <Popup>
            <div className="font-semibold">{shopName}</div>
            <div className="text-xs text-gray-500">Shop Location</div>
          </Popup>
        </Marker>

        {userCoordinates && (
          <>
            <Marker position={[userCoordinates.lat, userCoordinates.lng]}>
              <Popup>
                <div className="font-semibold">Your Location</div>
              </Popup>
            </Marker>
            <Polyline
              positions={[
                [shopCoordinates.lat, shopCoordinates.lng],
                [userCoordinates.lat, userCoordinates.lng]
              ]}
              color="#D97706" // kithly-accent
              dashArray="5, 10"
            />
          </>
        )}

        <MapUpdater center={center} />
      </MapContainer>
    </div>
  );
};

export default ShopMap;
