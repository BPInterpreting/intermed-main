import React, {useEffect} from 'react'
import dynamic from 'next/dynamic'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

//dynamically import the components to avoid server side rendering and only render on the client side
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })

interface MapProps {
    latitude: number;
    longitude: number;
    markerText?: string;
    height?: string | number;
}

const Map: React.FC<MapProps> = ({
latitude,
longitude,
markerText = 'Location',
height
}) => {
    const position: [number, number] = [latitude, longitude]

    useEffect(() => {
        // This code now runs only on the client-side after mount
        // @ts-ignore - Leaflet types might not perfectly match dynamic import images
        delete L.Icon.Default.prototype._getIconUrl; // Common fix for icon path issues with bundlers
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: markerIcon2x.src,
            iconUrl: markerIcon.src, // Use iconUrl
            shadowUrl: markerShadow.src,
        });
    }, []);

    return (
        <div className={`w-full h-56`}>
            <MapContainer center={position} zoom={16} className='h-full w-full'>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>{markerText}</Popup>
                </Marker>
            </MapContainer>
        </div>

    )
}

export default Map;