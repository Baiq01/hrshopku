import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function StoreMap() {
  // Koordinat untuk Lapadde, Parepare, Sulawesi Selatan
  const position = [-4.015806, 119.657861];

  return (
    <MapContainer 
      center={position} 
      zoom={15} 
      style={{ height: '400px', width: '100%', borderRadius: '1rem' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          <div className="text-center">
            <strong className="text-rose-600">HRSHOPKU</strong>
            <br />
            Jl. Poros Palopo - Makassar
            <br />
            Lapadde, Kec. Ujung
            <br />
            Kota Parepare, Sulawesi Selatan
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
