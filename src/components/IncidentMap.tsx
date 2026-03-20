import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident } from '../types';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface IncidentMapProps {
  incidents: Incident[];
}

export function IncidentMap({ incidents }: IncidentMapProps) {
  // Default center (Finote Selam, West Gojjam)
  const defaultCenter: [number, number] = [10.70, 37.26];

  // Filter incidents that have coordinates
  const mappedIncidents = incidents.filter(i => 
    i.lat !== undefined && i.lng !== undefined && !isNaN(i.lat) && !isNaN(i.lng)
  );

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-brand-border shadow-lg z-0 relative">
      <MapContainer center={defaultCenter} zoom={10} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappedIncidents.map(incident => (
          <Marker key={incident.id} position={[incident.lat!, incident.lng!]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm mb-1">{incident.title}</h3>
                <p className="text-xs text-gray-600 mb-1">{incident.location}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    incident.status === 'Open' ? 'bg-rose-500/20 text-rose-600' :
                    incident.status === 'In Progress' ? 'bg-amber-500/20 text-amber-600' :
                    'bg-emerald-500/20 text-emerald-600'
                  }`}>
                    {incident.status}
                  </span>
                  <span className="text-[10px] text-gray-500">{incident.date}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
