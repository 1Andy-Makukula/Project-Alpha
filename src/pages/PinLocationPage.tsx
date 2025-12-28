import React, { useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Button from '../components/Button';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { View, Order } from '../types';
import { MapPinIcon } from '../components/icons/NavigationIcons';

// Fix icons
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface PinLocationPageProps {
  setView: (view: View) => void;
  orderId?: string | null;
  onUpdateOrder?: (orderId: string, updates: Partial<Order>) => void;
}

const DraggableMarker = ({ position, setPosition }: { position: L.LatLng, setPosition: (pos: L.LatLng) => void }) => {
  const markerRef = useRef<L.Marker>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}>
      <Popup minWidth={90}>
        <span>Drag me to your exact location!</span>
      </Popup>
    </Marker>
  );
}

const PinLocationPage: React.FC<PinLocationPageProps> = ({ setView, orderId, onUpdateOrder }) => {
  const [position, setPosition] = useState<L.LatLng>(new L.LatLng(-15.4167, 28.2833)); // Default Lusaka
  const [confirmed, setConfirmed] = useState(false);
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    setConfirmed(true);
    if (orderId && onUpdateOrder) {
      onUpdateOrder(orderId, {
        deliveryCoordinates: { lat: position.lat, lng: position.lng },
        deliveryNotes: notes
      });
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <MapPinIcon className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-2">Location Pinned!</h1>
        <p className="text-green-600 mb-6">
          Thank you! The driver has received your exact location.
        </p>
        <Button variant="primary" onClick={() => setView('landing')} className="w-full">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="p-4 border-b bg-white shadow-sm z-10">
        <h1 className="text-lg font-bold text-center">Pin Your Delivery Location</h1>
        <p className="text-xs text-center text-gray-500">Drag the marker to your house gate</p>
      </header>

      <div className="flex-grow relative z-0 h-[60vh]">
        <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      <div className="p-4 bg-white border-t shadow-lg z-10">
        <div className="mb-4 text-sm text-gray-600">
          <p><strong>Selected Coordinates:</strong></p>
          <p>{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Add notes for driver</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-kithly-primary focus:border-transparent outline-none"
            rows={2}
            placeholder="e.g., Green Gate, behind the school"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button variant="primary" onClick={handleConfirm} className="w-full py-3 text-lg">
          Confirm Location
        </Button>
      </div>
    </div>
  );
};

export default PinLocationPage;
